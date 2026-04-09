import { Router } from "express";
import multer from "multer";

import { UploadsController } from "@/controllers/uploads-controller";
import { verifyUserAuthorization } from "@/middlewares/verify-user-authorization";
import uploadConfig from "@/configs/upload";

const uploadsRoutes = Router();
const uploadsController = new UploadsController();

const upload = multer(uploadConfig.MULTER);

uploadsRoutes.use(verifyUserAuthorization(["technician", "customer"]));
uploadsRoutes.post("/:id", upload.single("file"), uploadsController.create);

export { uploadsRoutes };
