import { Request, Response } from "express-serve-static-core";
import { compare, hash } from "bcrypt";
import { z } from "zod";

import { AppError } from "@/utils/app-error";
import { prisma } from "@/database/prisma";

export class ProfilesController {
  async show(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError("Usuário não autenticado!", 401);
    }

    const paramsSchema = z.object({
      id: z.uuid("Id inválido!"),
    });

    const { id } = paramsSchema.parse(req.params);

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      omit: {
        password: true,
        createdAt: true,
        updatedAt: true,
      },
      include: {
        technicianTimes: {
          select: {
            time: {
              select: {
                id: true,
                time: true,
                minutes: true,
              }
            }
          }
        }        
      }
    });

    if (!user) {
      throw new AppError("Usuário não encontrado!", 404);
    }

    if (req.user.id !== user.id) {
      throw new AppError("Não autorizado a acessar esse perfil!", 403);
    }

    res.json(user);
    return;
  }

  async update(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError("Usuário não autenticado!", 401);
    }

    const paramsSchema = z.object({
      id: z.uuid("Id inválido!"),
    });

    const { id } = paramsSchema.parse(req.params);

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new AppError("Usuário não encontrado!", 404);
    }

    if (req.user.id !== user.id) {
      throw new AppError("Não autorizado a acessar esse perfil!", 403);
    }

    const bodySchema = z.object({
      name: z
        .string("Nome é obrigatório")
        .min(3, "Nome deve conter pelo menos 3 caracteres"),
      email: z.email("E-mail inválido").toLowerCase(),
    });

    const { email, name } = bodySchema.parse(req.body);

    const userWithSameEmail = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (req.user.id !== userWithSameEmail?.id && userWithSameEmail) {
      throw new AppError("Já existe um usuário com este E-mail!");
    }

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

  async updatePassword(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError("Usuário não autenticado!", 401);
    }

    const paramsSchema = z.object({
      id: z.uuid("Id inválido!"),
    });

    const { id } = paramsSchema.parse(req.params);

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new AppError("Usuário não encontrado!", 404);
    }

    if (req.user.id !== user.id) {
      throw new AppError("Não autorizado a acessar esse perfil!", 403);
    }

    const bodySchema = z.object({
      password: z.string("Senha atual é obrigatória"),
      newPassword: z
        .string("Nova senha é obrigatória")
        .min(6, "Senha deve conter pelo menos 6 caracteres"),
    });

    const { password, newPassword } = bodySchema.parse(req.body);

    const passwordMatched = await compare(password, user.password);

    if (!passwordMatched) {
      throw new AppError("Sua senha atual está incorreta!", 403);
    }

    const hashedNewPassword = await hash(newPassword, 10);

    await prisma.user.update({
      where: {
        id,
      },
      data: {
        password: hashedNewPassword,
      },
    });

    res.json();
    return;
  }
}
