import { Request, Response } from "express";
import { TicketStatus } from "@prisma/client";
import { z } from "zod";

import { AppError } from "@/utils/app-error";
import { prisma } from "@/database/prisma";

const { emAtendimento, encerrado } = TicketStatus;

export class TicketsController {
  async index(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError("Usuário não autenticado!", 401);
    }

    if (req.user.role === "admin") {
      const tickets = await prisma.ticket.findMany({
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          technician: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          ticketServices: {
            select: {
              service: {
                select: {
                  id: true,
                  title: true,
                  price: true,
                },
              },
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
      res.json(tickets);
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
    });

    if (!user) {
      throw new AppError("Usuário não encontrado!", 404);
    }

    if (req.user.role === "customer") {
      const tickets = await prisma.ticket.findMany({
        where: {
          createdBy: user.id,
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
          technician: {
            select: {
              id: true,
              name: true,
            },
          },
          ticketServices: {
            select: {
              service: {
                select: {
                  id: true,
                  title: true,
                  price: true,
                },
              },
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
      res.json(tickets);
      return;
    }

    if (req.user.role === "technician") {
      const tickets = await prisma.ticket.findMany({
        where: {
          assignedTo: user.id,
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
          technician: {
            select: {
              id: true,
              name: true,
            },
          },
          ticketServices: {
            select: {
              service: {
                select: {
                  id: true,
                  title: true,
                  price: true,
                },
              },
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
      res.json(tickets);
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

    const ticketDetails = await prisma.ticket.findUnique({
      where: {
        id,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        technician: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ticketServices: {          
          select: {
            service: {
              select: {
                id: true,
                title: true,
                price: true,
              },
            },
            isAdditional: true
          },
        },
      },
    });

    if (!ticketDetails) {
      throw new AppError("Chamado não encontrado!", 404);
    }

    if (
      req.user.role === "technician" &&
      req.user.id !== ticketDetails.assignedTo
    ) {
      throw new AppError("Técnico não autorizado a acessar esse chamado!", 403);
    }

    if (
      req.user.role === "customer" &&
      req.user.id !== ticketDetails.createdBy
    ) {
      throw new AppError("Cliente não autorizado a acessar esse chamado!", 403);
    }

    res.json(ticketDetails);
    return;
  }

  async create(req: Request, res: Response) {
    const bodySchema = z.object({
      title: z
        .string("Título do chamado é obrigatório")
        .trim()
        .min(2, "Título do chamado deve conter pelo menos 2 caracteres!"),
      description: z
        .string("Descrição do chamado é obrigatória")
        .trim()
        .min(10, "Descrição do chamado deve conter pelo menos 10 caracteres!"),
      serviceId: z.uuid("Id inválido!"),
    });

    const { title, description, serviceId } = bodySchema.parse(req.body);

    if (!req.user) {
      throw new AppError("Usuário não autenticado!", 401);
    }

    const createdBy = req.user.id;

    const service = await prisma.service.findUnique({
      where: {
        id: serviceId,
        status: "ativo",
      },
    });

    if (!service) {
      throw new AppError("Serviço não encontrado!", 404);
    }

    const hoursTicket = new Date().getHours();
    const minutesTicket = hoursTicket * 60;

    const technician = await prisma.user.findFirst({
      where: {
        role: "technician",
        technicianTimes: {
          some: {
            time: {
              minutes: {
                equals: minutesTicket,
              },
            },
          },
        },
      },
      orderBy: {
        lastAssignedAt: "asc",
      },
    });

    if (!technician) {
      throw new AppError("Nenhum técnico disponível no momento!", 404);
    }

    await prisma.$transaction(async (tx) => {
      await tx.ticket.create({
        data: {
          title,
          description,
          createdBy,
          assignedTo: technician.id,
          ticketServices: {
            create: {
              serviceId: serviceId,
            },
          },
        },
      });

      await tx.user.update({
        where: {
          id: technician.id,
        },
        data: {
          lastAssignedAt: new Date(),
        },
      });
    });

    res.status(201).json();
    return;
  }

  async updateStatus(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError("Usuário não autenticado!", 401);
    }

    const paramsSchema = z.object({
      id: z.uuid("Id inválido!"),
    });

    const bodySchema = z.object({
      status: z.enum(
        [emAtendimento, encerrado],
        "Opções disponíveis: emAtendimento e encerrado."
      ),
    });

    const { id } = paramsSchema.parse(req.params);
    const { status } = bodySchema.parse(req.body);

    let ticket;

    if (req.user.role === "admin") {
      ticket = await prisma.ticket.findUnique({
        where: {
          id,
        },
      });
    } else if (req.user.role === "technician") {
      ticket = await prisma.ticket.findFirst({
        where: {
          id,
          assignedTo: req.user.id,
        },
      });
    } else {
      throw new AppError(
        "Apenas administradores e técnicos podem alterar o status do chamado!"
      );
    }

    if (!ticket) {
      throw new AppError("Chamado não encontrado!", 404);
    }

    if (status === ticket.status) {
      throw new AppError(
        `O chamado já está ${
          status === "emAtendimento" ? "em atendimento" : "encerrado"
        }!`
      );
    }

    await prisma.ticket.update({
      where: {
        id: ticket.id,
      },
      data: {
        status,
      },
    });

    res.json();
    return;
  }
}
