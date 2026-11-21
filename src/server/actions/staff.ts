'use server'

import bcryptjs from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/server/auth/options'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || session.user.role !== 'ADMIN') {
    return null
  }
  return session
}

export async function listRolesAction() {
  if (!(await requireAdmin())) return { success: false, error: 'Admin access required' }
  const roles = await prisma.role.findMany({ orderBy: { name: 'asc' } })
  return { success: true, roles }
}

export async function saveRoleAction(input: {
  id?: string
  name: string
  description?: string
  permissions: string[]
}) {
  if (!(await requireAdmin())) return { success: false, error: 'Admin access required' }
  const name = input.name.trim()
  if (!name) return { success: false, error: 'Role name is required' }

  const role = input.id
    ? await prisma.role.update({
        where: { id: input.id },
        data: { name, description: input.description?.trim() || null, permissions: input.permissions },
      })
    : await prisma.role.create({
        data: { name, description: input.description?.trim() || null, permissions: input.permissions },
      })

  revalidatePath('/roles')
  revalidatePath('/staff')
  return { success: true, role }
}

export async function deleteRoleAction(id: string) {
  if (!(await requireAdmin())) return { success: false, error: 'Admin access required' }
  const role = await prisma.role.findUnique({ where: { id }, include: { _count: { select: { users: true } } } })
  if (!role) return { success: false, error: 'Role not found' }
  if (role.isSystem) return { success: false, error: 'System roles cannot be deleted' }
  if (role._count.users > 0) return { success: false, error: 'Role is assigned to staff members' }
  await prisma.role.delete({ where: { id } })
  revalidatePath('/roles')
  return { success: true }
}

export async function listStaffAction() {
  if (!(await requireAdmin())) return { success: false, error: 'Admin access required' }
  const users = await prisma.user.findMany({
    include: { assignedRole: true },
    orderBy: { name: 'asc' },
  })
  return { success: true, users }
}

export async function saveStaffAction(input: {
  id?: string
  name: string
  email: string
  password?: string
  role: 'ADMIN' | 'MANAGER' | 'DRIVER' | 'ACCOUNTANT' | 'OPERATIONS'
  roleId?: string
  isActive: boolean
  baseSalary?: number
}) {
  if (!(await requireAdmin())) return { success: false, error: 'Admin access required' }
  const name = input.name.trim()
  const email = input.email.trim().toLowerCase()
  if (!name || !email) return { success: false, error: 'Name and email are required' }

  if (input.roleId) {
    const customRole = await prisma.role.findUnique({ where: { id: input.roleId } })
    if (!customRole) return { success: false, error: 'Invalid role' }
  }

  if (input.id) {
    const data: any = {
      name,
      email,
      role: input.role,
       roleId: input.roleId || null,
       isActive: input.isActive,
       baseSalary: input.baseSalary ?? 0,
    }
    if (input.password?.trim()) data.passwordHash = await bcryptjs.hash(input.password.trim(), 10)
    await prisma.user.update({ where: { id: input.id }, data })
  } else {
    if (!input.password?.trim()) return { success: false, error: 'Password is required for new staff' }
    await prisma.user.create({
      data: {
        name,
        email,
        role: input.role,
        roleId: input.roleId || null,
        isActive: input.isActive,
        passwordHash: await bcryptjs.hash(input.password.trim(), 10),
      },
    })
  }

  revalidatePath('/staff')
  return { success: true }
}

export async function setStaffActiveAction(id: string, isActive: boolean) {
  if (!(await requireAdmin())) return { success: false, error: 'Admin access required' }
  await prisma.user.update({ where: { id }, data: { isActive } })
  revalidatePath('/staff')
  return { success: true }
}
