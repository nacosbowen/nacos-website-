import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

type Student = { fullName: string; matricNumber: string; level: number };

// The student list lives in a gitignored file so real names never reach the public repo
const { students } = require('./students.private') as { students: Student[] };

const departments = [
  { name: 'Computer Science', code: 'CSC' },
  { name: 'Software Engineering', code: 'SEN' },
  { name: 'Cyber Security', code: 'CYB' },
  { name: 'Information Technology', code: 'IFT' },
];

const roles = ['student', 'course_rep', 'executive', 'admin'] as const;

/// BU23 = 400 level | BU24 = 300 level | BU25 = 200 level


const adminUser = {
  email: 'admin@nacos.bowen.edu.ng',
  fullName: 'NACOS Admin',
  matricNumber: 'ADMIN001',
};

async function main() {
  console.log('Seeding database...');
    const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || adminPassword.length < 12) {
    throw new Error('Set ADMIN_PASSWORD (at least 12 characters) before running the seed');
  }

  // Departments
  console.log('Creating departments...');
  for (const dept of departments) {
    await prisma.department.upsert({
      where: { code: dept.code },
      create: dept,
      update: { name: dept.name },
    });
  }

  // Roles
  console.log('Creating roles...');
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role },
      create: { name: role },
      update: {},
    });
  }

// Student registry
console.log(`Seeding ${students.length} students into registry...`);
const rows = students.map((s) => ({
  fullName: s.fullName,
  matricNumber: s.matricNumber.toUpperCase().trim(),
  level: s.level,
}));

const CHUNK = 200;
let inserted = 0;
for (let i = 0; i < rows.length; i += CHUNK) {
  const result = await prisma.studentRegistry.createMany({
    data: rows.slice(i, i + CHUNK),
    skipDuplicates: true,
  });
  inserted += result.count;
}
console.log(`Inserted ${inserted} new students (${rows.length - inserted} already existed or were duplicates).`);

  // Admin account
  console.log('Creating admin account...');
  const cscDept = await prisma.department.findUnique({ where: { code: 'CSC' } });
  const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
  if (cscDept && adminRole) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    const admin = await prisma.user.upsert({
      where: { email: adminUser.email },
      create: {
        email: adminUser.email,
        fullName: adminUser.fullName,
        matricNumber: adminUser.matricNumber,
        password: hashedPassword,
        level: 400,
        departmentId: cscDept.id,
        roles: { create: { roleId: adminRole.id } },
      },
      update: { password: hashedPassword },
    });
    console.log(`Admin account ready: ${admin.email}`);
  }

  console.log(`Done. ${students.length} students loaded into registry.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
