import { Request, Response } from "express";
import { z } from "zod";

import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/app-error";

export class CustomersController {
  async index(req: Request, res: Response) {
    const customers = await prisma.user.findMany({
      where: {
        role: "customer",
      },
      orderBy: {
        updatedAt: "desc",
      },
      omit: {
        password: true,
      },
    });

    res.json(customers);
    return;
  }

  async show(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError("Usuário não autenticado!", 401);
    }

    const paramsSchema = z.object({
      id: z.uuid("Id inválido!"),
    });

    const { id } = paramsSchema.parse(req.params);

    const customer = await prisma.user.findUnique({
      where: {
        id,
        role: "customer",
      },
      omit: {
        password: true,
        createdAt: true,
        updatedAt: true,
        lastAssignedAt: true,
        role: true,
      }
    });

    if (!customer) {
      throw new AppError("Cliente não encontrado!", 404);
    }
    
    res.json(customer);
    return;
  }

  async update(req: Request, res: Response) {
    const paramsSchema = z.object({
      id: z.uuid("Id inválido!"),
    });

    const { id } = paramsSchema.parse(req.params);

    const customer = await prisma.user.findUnique({
      where: {
        id,
        role: "customer",
      },
    });

    if (!customer) {
      throw new AppError("Cliente não encontrado!", 404);
    }

    const bodySchema = z.object({
      name: z
        .string("Nome é obrigatório!")
        .trim()
        .min(2, "Nome deve conter no mínimo 2 caracteres!"),
      email: z
        .email("E-mail inválido, siga o modelo: email@example.com")
        .toLowerCase(),
    });

    const { name, email } = bodySchema.parse(req.body);

    await prisma.user.update({
      where: {
        id,
      },
      data: {
        name,
        email,
      },
    });

    res.json();
    return;
  }

  async remove(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError("Usuário não autenticado!", 401);
    }

    const paramsSchema = z.object({
      id: z.uuid("Id inválido!"),
    });

    const { id } = paramsSchema.parse(req.params);

    const customer = await prisma.user.findUnique({
      where: {
        id,
        role: "customer",
      },
    });

    if (!customer) {
      throw new AppError("Cliente não encontrado!", 404);
    }

    if (req.user.role === "customer" && req.user.id !== id) {
      throw new AppError(
        "Você não tem permissão para excluir esta conta!",
        403
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.ticketService.deleteMany({
        where: {
          ticket: {
            createdBy: id,
          },
        },
      });

      await tx.ticket.deleteMany({
        where: {
          createdBy: id,
        },
      });

      await tx.user.delete({
        where: {
          id,
        },
      });
    });

    res.json();
    return;
  }
}
