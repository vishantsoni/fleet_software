import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcryptjs.hash('admin123', 10)

  const adminRole = await prisma.role.upsert({
    where: { name: 'Administrator' },
    update: {
      permissions: ['*'],
      isSystem: true,
    },
    create: {
      name: 'Administrator',
      description: 'Full system access',
      permissions: ['*'],
      isSystem: true,
    },
  })

  const admin = await prisma.user.upsert({
    where: { email: 'admin@fleet.com' },
    update: { roleId: adminRole.id, role: 'ADMIN', isActive: true },
    create: {
      email: 'admin@fleet.com',
      name: 'Admin User',
      role: 'ADMIN',
      roleId: adminRole.id,
      passwordHash: hashedPassword,
    },
  })

  console.log({ admin })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
