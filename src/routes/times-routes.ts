import { Router } from "express";

import { TimesController } from "@/controllers/times-controller";
import { verifyUserAuthorization } from "@/middlewares/verify-user-authorization";

const timesRoutes = Router();
const timesController = new TimesController();

timesRoutes.use(verifyUserAuthorization(["admin"]));
timesRoutes.get("/", timesController.index);

export { timesRoutes };
