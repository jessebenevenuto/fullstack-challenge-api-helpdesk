import { Request, Response } from "express";

import { prisma } from "@/database/prisma";

export class TimesController {
  async index(req: Request, res: Response) {
    const times = await prisma.time.findMany();

    res.json(times);
  }
}
