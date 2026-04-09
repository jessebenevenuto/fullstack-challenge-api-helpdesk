import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

import { AppError } from "@/utils/app-error";

export function errorHandling(error: any, req: Request, res: Response, next: NextFunction) {
  if(error instanceof AppError) {
    res.status(error.statusCode).json({ message: error.message })
    return
  }

  if(error instanceof ZodError) {
    res.status(400).json({
      message: "Erro de validação",
      issues: z.treeifyError(error)
    })
    return
  }
  
  res.status(500).json({ message: error.message })
  return
}
