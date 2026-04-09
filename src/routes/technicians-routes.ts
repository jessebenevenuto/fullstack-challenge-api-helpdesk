import { Router } from "express";

import { TechniciansController } from "@/controllers/technicians-controller";
import { verifyUserAuthorization } from "@/middlewares/verify-user-authorization";

const techniciansRoutes = Router();
const techniciansController = new TechniciansController();

techniciansRoutes.use(verifyUserAuthorization(["admin"]));

techniciansRoutes.get("/", techniciansController.index);
techniciansRoutes.get("/:id", techniciansController.show);
techniciansRoutes.post("/", techniciansController.create);
techniciansRoutes.put("/:id", techniciansController.update);

export { techniciansRoutes };
