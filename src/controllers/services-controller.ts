import { Request, Response } from "express";
import { z } from "zod";

import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/app-error";
import { ServiceStatus } from "@prisma/client";

const { ativo, inativo } = ServiceStatus;

export class ServicesController {
  async index(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError("Não autorizado!", 401);
    }

    if (req.user.role === "admin") {
      const services = await prisma.service.findMany({
        orderBy: {
          title: "asc"
        },
      });

      res.json(services);
      return;
    }

    if (req.user.role === "customer" || req.user.role === "technician") {
      const services = await prisma.service.findMany({
        where: {
          status: ativo,
        },
        select: {
          id: true,
          title: true,
          price: true,
        },
        orderBy: {
          title: "asc"
        },
      });

      res.json(services);
      return;
    }
  }

  async show(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError("Usuário não autenticado!", 401);
    }

    const paramsSchema = z.object({
      id: z.uuid("Id inválido!"),
    });

    const { id } = paramsSchema.parse(req.params);

    const service = await prisma.service.findUnique({
      where: {
        id,
      },
    });

    if (!service) {
      throw new AppError("Serviço não encontrado!", 404);
    }
    
    res.json(service);
    return;
  }

  async create(req: Request, res: Response) {
    const bodySchema = z.object({
      title: z
        .string("Título do serviço é obrigatório!")
        .trim()
        .min(2, "O título do serviço deve ter pelo menos 2 caracteres!"),
      price: z
        .number("Preço do produto é obrigatório!")
        .positive("O preço precisa ser maior do que zero!"),
    });

    const { title, price } = bodySchema.parse(req.body);

    if (!req.user) {
      throw new AppError("Não autorizado!", 401);
    }

    const service = await prisma.service.create({
      data: {
        title,
        price,
        createdBy: req.user.id,
      },
    });

    res.status(201).json(service);
    return;
  }

  async update(req: Request, res: Response) {
    const paramsSchema = z.object({
      id: z.uuid("Id inválido"),
    });

    const { id } = paramsSchema.parse(req.params);

    const service = await prisma.service.findUnique({
      where: {
        id,
      },
    });

    if (!service) {
      throw new AppError("Serviço não encontrado!", 404);
    }

    const bodySchema = z.object({
      title: z
        .string("Título do serviço é obrigatório!")
        .trim()
        .min(2, "O título do serviço deve ter pelo menos 2 caracteres!"),
      price: z
        .number("Preço do produto é obrigatório!")
        .positive("O preço precisa ser maior do que zero!"),
    });

    const { title, price } = bodySchema.parse(req.body);

    await prisma.service.update({
      where: {
        id,
      },
      data: {
        title,
        price,
      },
    });

    res.json();
    return;
  }

  async updateStatus(req: Request, res: Response) {
    const paramsSchema = z.object({
      id: z.uuid("Id inválido"),
    });

    const { id } = paramsSchema.parse(req.params);

    const service = await prisma.service.findUnique({
      where: {
        id,
      },
    });

    if (!service) {
      throw new AppError("Serviço não encontrado!", 404);
    }

    const bodySchema = z.object({
      status: z.enum([ativo, inativo], "Opções disponíveis: ativo e inativo"),
    });

    const { status } = bodySchema.parse(req.body);
    const oldStatus = service.status;

    if (status === oldStatus) {
      throw new AppError(`O serviço já está ${status}!`);
    }

    await prisma.service.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });

    res.json();
    return;
  }
}
