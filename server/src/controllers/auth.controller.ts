import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler'

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_EXPIRES = '15m';
const REFRESH_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000;

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
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
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

// POST /auth/login  — single page: email + matric number only
export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, matricNumber, selectedRole } = req.body as {
      email: string;
      matricNumber: string;
      selectedRole?: string;
    };

    if (!email || !matricNumber) {
      return res.status(400).json({ message: 'Email and matric number are required' });
    }

    const cleanMatric = matricNumber.toUpperCase().trim();
    const cleanEmail = email.toLowerCase().trim();

    // 1. Check the student registry
    const registry = await prisma.studentRegistry.findUnique({
      where: { matricNumber: cleanMatric },
    });

    if (!registry) {
      return res.status(403).json({
        message: 'Matric number not found in the NACOS registry. Contact an executive.',
      });
    }

       // 2. Find or auto-create user account
    let user = await prisma.user.findUnique({ where: { matricNumber: cleanMatric } });

    if (user) {
      if (user.email !== cleanEmail) {
        return res.status(403).json({
          message: 'This matric number is already registered with a different email. Please use the email you originally signed up with.',
        });
      }
    } else {
      const deptCode = extractDeptCode(cleanMatric);
      let dept = await prisma.department.findUnique({ where: { code: deptCode } });
  if (!dept) dept = await prisma.department.findFirst();

  const studentRole = await prisma.role.upsert({
    where: { name: 'student' },
    create: { name: 'student' },
    update: {},
  });

  const hashedPassword = await bcrypt.hash(cleanMatric, 12);

  const existingEmail = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (existingEmail) {
    return res.status(409).json({
      message: 'This email is already associated with another account. Please use a different email.',
    });
  }

  user = await prisma.user.create({
    data: {
      email: cleanEmail,
      fullName: registry.fullName,
      matricNumber: cleanMatric,
      password: hashedPassword,
      level: registry.level,
      departmentId: dept!.id,
      roles: { create: { roleId: studentRole.id } },
    },
  });

  await prisma.studentRegistry.update({
    where: { matricNumber: cleanMatric },
    data: { isRegistered: true },
  });
}

    // 3. Validate selected role
    if (selectedRole === 'executive' || selectedRole === 'course_rep') {
      const userWithRoles = await prisma.user.findUnique({
        where: { id: user.id },
        include: { roles: { include: { role: true } } },
      });
      const userRoles = userWithRoles?.roles.map((ur) => ur.role.name) ?? [];
      if (!userRoles.includes(selectedRole as any)) {
        return res.status(403).json({ message: `You are not registered as a ${selectedRole.replace('_', ' ')}` });
      }
    }

    // 4. Issue tokens
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
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ message: err.message || 'Login failed' });
  }
};

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
