import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler'
import { sendVerificationEmail, sendPasswordResetEmail } from '../lib/email';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_EXPIRES = '15m';
const REFRESH_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000;

function generateCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

function hashToken(raw: string) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

function signAccess(userId: string) {
  return jwt.sign({ sub: userId }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
}

function signRefresh(userId: string) {
  return jwt.sign({ sub: userId, jti: crypto.randomBytes(16).toString('hex') }, REFRESH_SECRET, { expiresIn: '7d' });
}

function setRefreshCookie(res: Response, token: string) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: REFRESH_EXPIRES_MS,
    path: '/',
  });
}

// Extract department code from matric number
function extractDeptCode(matric: string): string {
  if (matric.includes('CSC') || matric.includes('CIT')) return 'CSC';
  if (matric.includes('SEN')) return 'SEN';
  if (matric.includes('CYB')) return 'CYB';
  if (matric.includes('IFT')) return 'IFT';
  if (matric.includes('MIS')) return 'MIS';
  return 'CSC';
}

async function buildUserPayload(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      department: true,
      roles: { include: { role: true } },
      courseRepAssigns: true,
    },
  });
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    matricNumber: user.matricNumber,
    level: user.level,
    profilePictureUrl: user.profilePictureUrl,
    department: {
      id: user.department.id,
      name: user.department.name,
      code: user.department.code,
    },
    roles: user.roles.map((ur) => ur.role.name as string),
    courseRepLevel: user.courseRepAssigns[0]?.level ?? null,
  };
}


// POST /auth/login
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, selectedRole } = req.body as {
    email: string; password: string; selectedRole?: string;
  };

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const cleanEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: cleanEmail },
    include: { roles: { include: { role: true } } },
  });

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  if (!user.emailVerified) {
    return res.status(403).json({ message: 'Please verify your email before logging in.' });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Validate selected role, same as before
  if (selectedRole === 'executive' || selectedRole === 'course_rep') {
    const userRoles = user.roles.map((ur) => ur.role.name);
    if (!userRoles.includes(selectedRole as any)) {
      return res.status(403).json({ message: `You are not registered as a ${selectedRole.replace('_', ' ')}` });
    }
  }

  const accessToken = signAccess(user.id);
  const rawRefresh = signRefresh(user.id);
  const tokenHash = hashToken(rawRefresh);

  await prisma.refreshToken.create({
    data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + REFRESH_EXPIRES_MS) },
  });

  setRefreshCookie(res, rawRefresh);

  const payload = await buildUserPayload(user.id);
  return res.json({ accessToken, user: payload });
});

// POST /auth/signup
export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { email, matricNumber, password } = req.body as {
    email: string; matricNumber: string; password: string;
  };

  if (!email || !matricNumber || !password) {
    return res.status(400).json({ message: 'Email, matric number, and password are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const cleanMatric = matricNumber.toUpperCase().trim();

  // 1. Confirm matric number is a real NACOS student
  const registry = await prisma.studentRegistry.findUnique({ where: { matricNumber: cleanMatric } });
  if (!registry) {
    return res.status(403).json({ message: 'Matric number not found in the NACOS registry. Contact an executive.' });
  }

  // 2. Check for existing accounts
  const existingByMatric = await prisma.user.findUnique({ where: { matricNumber: cleanMatric } });
  if (existingByMatric) {
    if (existingByMatric.emailVerified) {
      return res.status(409).json({ message: 'This matric number is already registered. Please log in instead.' });
    }
    // Unverified leftover signup — clean it up and let them restart
    await prisma.user.delete({ where: { id: existingByMatric.id } });
  }

  const existingByEmail = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (existingByEmail) {
    return res.status(409).json({ message: 'This email is already associated with another account.' });
  }

  // 3. Create the (unverified) account
  const deptCode = extractDeptCode(cleanMatric);
  let dept = await prisma.department.findUnique({ where: { code: deptCode } });
  if (!dept) dept = await prisma.department.findFirst();

  const studentRole = await prisma.role.upsert({
    where: { name: 'student' },
    create: { name: 'student' },
    update: {},
  });

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email: cleanEmail,
      fullName: registry.fullName,
      matricNumber: cleanMatric,
      password: hashedPassword,
      level: registry.level,
      departmentId: dept!.id,
      emailVerified: false,
      roles: { create: { roleId: studentRole.id } },
    },
  });

  // 4. Generate and send verification code
  const code = generateCode();
  await prisma.emailVerificationCode.upsert({
    where: { userId: user.id },
    create: { userId: user.id, code, expiresAt: new Date(Date.now() + 15 * 60 * 1000) },
    update: { code, expiresAt: new Date(Date.now() + 15 * 60 * 1000) },
  });

  await sendVerificationEmail(cleanEmail, code);

  return res.status(201).json({ message: 'Account created. Check your email for a verification code.' });
});


// POST /auth/verify-email
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { email, code } = req.body as { email: string; code: string };

  if (!email || !code) {
    return res.status(400).json({ message: 'Email and code are required' });
  }

  const cleanEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (!user) return res.status(404).json({ message: 'Account not found' });

  if (user.emailVerified) {
    return res.status(400).json({ message: 'Email is already verified. Please log in.' });
  }

  const record = await prisma.emailVerificationCode.findUnique({ where: { userId: user.id } });
  if (!record || record.code !== code.trim()) {
    return res.status(400).json({ message: 'Invalid verification code' });
  }
  if (record.expiresAt < new Date()) {
    return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
  }

  await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } });
  await prisma.emailVerificationCode.delete({ where: { userId: user.id } });

  return res.json({ message: 'Email verified successfully. You can now log in.' });
});

// POST /auth/resend-code
export const resendCode = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as { email: string };
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const cleanEmail = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

  // Always return a generic success message, whether or not the account exists —
  // avoids leaking which emails are registered
  if (!user || user.emailVerified) {
    return res.json({ message: 'If an unverified account exists for this email, a new code has been sent.' });
  }

  const code = generateCode();
  await prisma.emailVerificationCode.upsert({
    where: { userId: user.id },
    create: { userId: user.id, code, expiresAt: new Date(Date.now() + 15 * 60 * 1000) },
    update: { code, expiresAt: new Date(Date.now() + 15 * 60 * 1000) },
  });

  await sendVerificationEmail(cleanEmail, code);

  return res.json({ message: 'If an unverified account exists for this email, a new code has been sent.' });
});

// POST /auth/forgot-password
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as { email: string };
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const cleanEmail = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

  // Generic response regardless of whether the account exists, to avoid leaking registered emails
  const genericMessage = { message: 'If an account exists for this email, a reset link has been sent.' };

  if (!user || !user.emailVerified) {
    return res.json(genericMessage);
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  });

  const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}&email=${encodeURIComponent(cleanEmail)}`;
  await sendPasswordResetEmail(cleanEmail, resetLink);

  return res.json(genericMessage);
});

// POST /auth/reset-password
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email, token, newPassword } = req.body as { email: string; token: string; newPassword: string };

  if (!email || !token || !newPassword) {
    return res.status(400).json({ message: 'Email, token, and new password are required' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (!user) return res.status(400).json({ message: 'Invalid or expired reset link' });

  const tokenHash = hashToken(token);
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!record || record.userId !== user.id || record.used || record.expiresAt < new Date()) {
    return res.status(400).json({ message: 'Invalid or expired reset link' });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { used: true } }),
    // Revoke all existing refresh tokens, forcing re-login everywhere after a password reset
    prisma.refreshToken.updateMany({ where: { userId: user.id, revoked: false }, data: { revoked: true } }),
  ]);

  return res.json({ message: 'Password reset successfully. You can now log in with your new password.' });
});

// POST /auth/admin-login
export const adminLogin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const cleanEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: cleanEmail },
    include: { roles: { include: { role: true } } },
  });

  const isAdmin = user?.roles.some((ur) => ur.role.name === 'admin');

  if (!user || !isAdmin || !user.password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const accessToken = signAccess(user.id);
  const rawRefresh = signRefresh(user.id);
  const tokenHash = hashToken(rawRefresh);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + REFRESH_EXPIRES_MS),
    },
  });

  setRefreshCookie(res, rawRefresh);

  const payload = await buildUserPayload(user.id);
  return res.json({ accessToken, user: payload });
});

// POST /auth/refresh
export const refresh = asyncHandler( async (req: Request, res: Response) => {
  const raw = req.cookies?.refreshToken;
  if (!raw) return res.status(401).json({ message: 'No refresh token' });

  let decoded: { sub: string };
  try {
    decoded = jwt.verify(raw, REFRESH_SECRET) as { sub: string };
  } catch {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }

  const tokenHash = hashToken(raw);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    return res.status(401).json({ message: 'Refresh token expired or revoked' });
  }

  await prisma.refreshToken.update({ where: { tokenHash }, data: { revoked: true } });

  const newRefresh = signRefresh(decoded.sub);
  const newHash = hashToken(newRefresh);

  await prisma.refreshToken.create({
    data: {
      userId: decoded.sub,
      tokenHash: newHash,
      expiresAt: new Date(Date.now() + REFRESH_EXPIRES_MS),
    },
  });

  setRefreshCookie(res, newRefresh);
  return res.json({ accessToken: signAccess(decoded.sub) });
});

// POST /auth/logout
export const logout = asyncHandler( async (req: Request, res: Response) => {
  const raw = req.cookies?.refreshToken;
  if (raw) {
    const tokenHash = hashToken(raw);
    await prisma.refreshToken.updateMany({ where: { tokenHash }, data: { revoked: true } });
  }
  res.clearCookie('refreshToken', { path: '/' });
  return res.json({ message: 'Logged out' });
});

// GET /auth/me
export const getMe = asyncHandler( async (req: Request, res: Response) => {
  const userId = (req as Request & { userId: string }).userId;
  const payload = await buildUserPayload(userId);
  if (!payload) return res.status(404).json({ message: 'User not found' });
  return res.json(payload);
});

// Keep register for admin use (optional)
export const register = async (_req: Request, res: Response) => {
  return res.status(410).json({ message: 'Use the login page — accounts are created automatically.' });
};
