import prisma from '@/lib/prisma'
import {
  fitTyre,
  removeTyre,
  scrapTyre,
  listTyres,
  getTyre,
} from '@/server/actions/tyres'

export class TyreService {
  static async create(data: Parameters<typeof fitTyre>[0]) {
    return fitTyre(data)
  }

  static async remove(id: string, removalOdometer: number) {
    return removeTyre(id, removalOdometer)
  }

  static async scrap(id: string) {
    return scrapTyre(id)
  }

  static async findAll(filters: Parameters<typeof listTyres>[0]) {
    return listTyres(filters)
  }

  static async findById(id: string) {
    return getTyre(id)
  }
}
