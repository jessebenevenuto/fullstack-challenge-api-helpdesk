import { Request, Response } from "express";
import { z } from "zod";

import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/app-error";

export class AdditionalsServicesController {
  async create(req: Request, res: Response) {
    if (!req.user || req.user.role !== "technician") {
      throw new AppError("Não autorizado", 401);
    }

    const paramsSchema = z.object({
      ticketId: z.uuid("Id inválido!"),
    });

    const { ticketId } = paramsSchema.parse(req.params);

    const ticket = await prisma.ticket.findUnique({
      where: {
        id: ticketId,
        assignedTo: req.user.id,
      },
    });

    if (!ticket) {
      throw new AppError("Chamado não encontrado!", 404);
    }

    const bodySchema = z.object({
      serviceId: z.uuid("Id inválido!"),
    });

    const { serviceId } = bodySchema.parse(req.body);

    const service = await prisma.service.findUnique({
      where: {
        id: serviceId,
      },
    });

    if (!service) {
      throw new AppError("Serviço não encontrado!", 404);
    }

    const existingService = await prisma.ticketService.findFirst({
      where: {
        ticketId,
        serviceId,
      },
    });

    if (existingService) {
      throw new AppError("Serviço já adicionado ao chamado!", 400);
    }

    await prisma.ticketService.create({
      data: {
        ticketId,
        serviceId,
        isAdditional: true,
      },
    });

    res.status(201).json();
    return;
  }

  async remove(req: Request, res: Response) {
    if (!req.user || req.user.role !== "technician") {
      throw new AppError("Não autorizado", 401);
    }

    const paramsSchema = z.object({
      ticketId: z.uuid("Id inválido!"),
      serviceId: z.uuid("Id inválido!"),
    });

    const { ticketId, serviceId } = paramsSchema.parse(req.params);

    const ticket = await prisma.ticket.findUnique({
      where: {
        id: ticketId,
        assignedTo: req.user.id,
      },
    });

    if (!ticket) {
      throw new AppError("Chamado não encontrado!", 404);
    }

    const service = await prisma.service.findUnique({
      where: {
        id: serviceId,
        serviceTickets: {
          some: {
            isAdditional: true,
          },
        },
      },
    });

    if (!service) {
      throw new AppError("Serviço não encontrado!", 404);
    }

    const existingService = await prisma.ticketService.findFirst({
      where: {
        ticketId,
        serviceId,
      },
    });

    if (!existingService) {
      throw new AppError("Serviço não adicionado ao chamado!");
    }

    await prisma.ticketService.delete({
      where: {
        ticketId_serviceId: {
          ticketId,
          serviceId,
        },
      },
    });

    res.json();
    return;
  }
}
