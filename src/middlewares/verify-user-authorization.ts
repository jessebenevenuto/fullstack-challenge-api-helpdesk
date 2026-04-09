import { Request, Response, NextFunction } from "express";

import { AppError } from "@/utils/app-error";

export function verifyUserAuthorization(role: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !role.includes(req.user.role)) {
      throw new AppError("Não autorizado!", 403);
    }

    return next();
  };
}
