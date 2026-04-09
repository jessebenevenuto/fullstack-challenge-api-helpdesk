import { Router } from "express";

import { ProfilesController } from "@/controllers/profiles-controller";
import { verifyUserAuthorization } from "@/middlewares/verify-user-authorization";

const profilesRoutes = Router();
const profilesController = new ProfilesController();

profilesRoutes.get("/:id", verifyUserAuthorization(["technician"]), profilesController.show);

profilesRoutes.use(verifyUserAuthorization(["technician", "customer"]));

profilesRoutes.put("/:id", profilesController.update);
profilesRoutes.patch("/:id", profilesController.updatePassword);

export { profilesRoutes };