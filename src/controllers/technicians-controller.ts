import { Request, Response } from "express";
import { hash } from "bcrypt";
import { z } from "zod";

import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/app-error";

const COMERCIAL_TIME = [2, 3, 4, 5, 6, 8, 9, 10, 11, 12];

export class TechniciansController {
  async index(req: Request, res: Response) {
    const technicians = await prisma.user.findMany({
      omit: {
        password: true,
      },
      where: {
        role: "technician",
      },
      include: {
        technicianTimes: {
          select: {
            time: {
              select: {
                time: true,
                minutes: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    res.json(technicians);
    return;
  }

  async show(req: Request, res: Response) {
    const paramsSchema = z.object({
      id: z.uuid("Id inválido"),
    });

    const { id } = paramsSchema.parse(req.params);

    const technician = await prisma.user.findFirst({
      omit: {
        password: true,
      },
      where: {
        id,
        role: "technician",
      },
      include: {
        technicianTimes: {
          select: {
            time: {
              select: {
                id: true,
                time: true,
                minutes: true,
              },
            },
          },
        },
      }    
    });

    if (!technician) throw new AppError("Técnico não encontrado!", 404);

    res.json(technician);
    return;
  }

  async create(req: Request, res: Response) {
    const bodySchema = z.object({
      name: z
        .string("Nome é obrigatório")
        .trim()
        .min(2, "Nome deve conter pelo menos 2 caracteres!"),
      email: z
        .email("E-mail inválido, siga o modelo: email@example.com")
        .toLowerCase(),
      password: z
        .string("Senha é obrigatória")
        .min(6, "Senha deve conter pelo menos 6 caracteres"),
      timeIds: z.array(
        z
          .int("Horário inválido! Horários disponíveis: 07:00 até 23:00")
          .positive("Horário inválido! Horários disponíveis: 07:00 até 23:00")
      ),
    });

    const { name, email, password, timeIds } = bodySchema.parse(req.body);

    if (timeIds.find((time) => time > 17)) {
      throw new AppError(
        "Horário inválido! Horários disponíveis: 07:00 até 23:00"
      );
    }

    const setTimeIds = new Set(timeIds);
    const newTimeIds = [...setTimeIds];

    const userWithSameEmail = await prisma.user.findFirst({
      where: { email },
    });

    if (userWithSameEmail) {
      throw new AppError(
        "E-mail inválido! Já existe um usuário com este e-mail!",
        409
      );
    }

    const hashedPassword = await hash(password, 10);

    if (!newTimeIds.length) {
      newTimeIds.push(...COMERCIAL_TIME);
    }

    const tech = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "technician",
        technicianTimes: {
          createMany: {
            data: newTimeIds.map((id) => ({
              timeId: id,              
            })),
          },
        },
      },
    });

    const { password: _, ...techWithoutPassword } = tech;

    res.status(201).json(techWithoutPassword);
    return;
  }

  async update(req: Request, res: Response) {
    const paramsSchema = z.object({
      id: z.uuid("Id inválido"),
    });

    const { id } = paramsSchema.parse(req.params);

    const user = await prisma.user.findUnique({
      where: {
        id,
        role: "technician",
      },
    });

    if (!user) {
      throw new AppError("Técnico não encontrado!", 404);
    }

    const bodySchema = z.object({
      name: z
        .string("Nome é obrigatório!")
        .trim()
        .min(2, "Nome deve conter no mínimo 2 caracteres!"),
      email: z
        .email("E-mail inválido, siga o modelo: email@example.com")
        .toLowerCase(),
      timeIds: z
        .array(
          z
            .int("Horário inválido! Horários disponíveis: 07:00 até 23:00")
            .positive("Horário inválido! Horários disponíveis: 07:00 até 23:00")
        )
    });

    const { name, email, timeIds } = bodySchema.parse(req.body);

    if(timeIds.length === 0) {
      throw new AppError("Informe ao menos um horário!");
    }

    if (timeIds.find((time) => time > 17)) {
      throw new AppError(
        "Horário inválido! Horários disponíveis: 07:00 até 23:00"
      );
    }

    const setTimeIds = new Set(timeIds);
    const newTimeIds = [...setTimeIds];

    await prisma.user.update({
      where: {
        id,
      },
      data: {
        name,
        email,
      },
    });

    await prisma.$transaction(async (tx) => {
      await tx.technicianTime.deleteMany({
        where: {
          technicianId: id,
        },
      });

      await tx.technicianTime.createMany({
        data: newTimeIds.map((timeId) => ({
          technicianId: id,
          timeId,
        })),
      });
    });

    res.json();
    return;
  }
}
