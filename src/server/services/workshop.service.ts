import prisma from '@/lib/prisma'
import { WorkshopSchema } from '@/types/workshop'

export class WorkshopService {
  static async create(input: { name: string; address?: string | null; phone?: string | null; contactPerson?: string | null; email?: string | null }) {
    const validated = WorkshopSchema.parse(input)

    const workshop = await prisma.workshop.create({
      data: validated,
    })

    return workshop
  }

  static async findAll() {
    const workshops = await prisma.workshop.findMany({
      orderBy: { name: 'asc' },
    })

    return workshops
  }

  static async findById(id: string) {
    const workshop = await prisma.workshop.findUnique({
      where: { id },
    })

    return workshop
  }

  static async findOptions() {
    const workshops = await prisma.workshop.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    })

    return workshops
  }
}