import { Request, Response } from "express";
import { z, ZodError } from "zod";

import uploadConfig from "@/configs/upload";
import { DiskStorage } from "@/providers/disk-storage";
import { AppError } from "@/utils/app-error";
import { prisma } from "@/database/prisma";

export class UploadsController {
  async create(req: Request, res: Response) {
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

    const diskStorage = new DiskStorage();

    try {
      const fileSchema = z
        .object({
          filename: z.string().min(1, "Arquivo é obrigatório"),
          mimetype: z
            .string()
            .refine(
              (type) => uploadConfig.ACCEPTED_IMAGE_TYPES.includes(type),
              `Formato de arquivo inválido. Formatos aceitos: ${uploadConfig.ACCEPTED_IMAGE_TYPES}`
            ),
          size: z
            .number()
            .positive()
            .refine(
              (size) => size <= uploadConfig.MAX_FILE_SIZE,
              `Arquivo excede o tamanho máximo de ${uploadConfig.MAX_SIZE}MB`
            ),
        })
        .loose();

      const file = fileSchema.parse(req.file);
      const filename = await diskStorage.saveFile(file.filename);

      const updatedUser = await prisma.user.update({
        where: {
          id,
        },
        data: {
          avatar: filename,
        },
      });

      res.json({ updatedUser });
      return;

    } catch (error) {
      if (error instanceof ZodError) {
        if (req.file) {
          await diskStorage.deleteFile(req.file.filename, "tmp");
        }

        throw new AppError(error.issues[0].message);
      }

      throw error;
    }
  }
}
