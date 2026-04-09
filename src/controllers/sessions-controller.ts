import { Request, Response } from "express";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/app-error";
import { authConfig } from "@/configs/auth";

export class SessionsController {
  async create(req: Request, res: Response) {
    const bodySchema = z.object({
      email: z
        .email("E-mail inválido, siga o modelo: email@example.com")
        .toLowerCase(),
      password: z
        .string().nonempty("Senha é obrigatória"),
    });

    const { email, password } = bodySchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      throw new AppError("E-mail e/ou senha inválida");
    }

    const passwordMatched = await compare(password, user.password);

    if (!passwordMatched) {
      throw new AppError("E-mail e/ou senha inválida");
    }

    const { secret, expiresIn } = authConfig.jwt;

    const token = jwt.sign({}, secret, {
      subject: user.id,
      expiresIn,
    });

    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({ user: userWithoutPassword, token });
    return;
  }
}
