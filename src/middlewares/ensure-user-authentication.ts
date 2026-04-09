import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { authConfig } from "@/configs/auth";
import { AppError } from "@/utils/app-error";
import { prisma } from "@/database/prisma";

interface TokenPayload {
  sub: string
}

export async function ensureUserAuthentication(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if(!authHeader) {
      throw new AppError("Token não encontrado! Por favor, faça seu login!", 401)
    }

    const [, token] = authHeader.split(" ");
    const { sub: user_id } = jwt.verify(token, authConfig.jwt.secret) as TokenPayload

    const user = await prisma.user.findFirst({
      where: { id: user_id }
    })

    if(!user) {
      throw new AppError("Usuário não encontrado", 404)
    }

    const { role } = user

    req.user = {
      id: user_id,
      role
    }

    return next()

  } catch (error) {
    throw new AppError("Token inválido", 401)
  }
}
