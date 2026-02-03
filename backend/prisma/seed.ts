import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const saltRounds = 10;

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', saltRounds);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: {
      email: 'admin@company.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
      isActive: true,
    },
  });
  console.log('Created admin user:', admin.email);

  // Create HR user
  const hrPassword = await bcrypt.hash('hr123', saltRounds);
  const hr = await prisma.user.upsert({
    where: { email: 'hr@company.com' },
    update: {},
    create: {
      email: 'hr@company.com',
      passwordHash: hrPassword,
      firstName: 'HR',
      lastName: 'Manager',
      role: Role.HR,
      isActive: true,
    },
  });
  console.log('Created HR user:', hr.email);

  // Create employee user
  const employeePassword = await bcrypt.hash('employee123', saltRounds);
  const employee = await prisma.user.upsert({
    where: { email: 'employee@company.com' },
    update: {},
    create: {
      email: 'employee@company.com',
      passwordHash: employeePassword,
      firstName: 'John',
      lastName: 'Doe',
      role: Role.EMPLOYEE,
      isActive: true,
    },
  });
  console.log('Created employee user:', employee.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
