import { Router } from "express";

import { ServicesController } from "@/controllers/services-controller";
import { AdditionalsServicesController } from "@/controllers/additionals-services-controller";
import { verifyUserAuthorization } from "@/middlewares/verify-user-authorization";

const servicesRoutes = Router();
const servicesController = new ServicesController();
const additionalsServicesController = new AdditionalsServicesController();

servicesRoutes.post(
  "/additional/:ticketId",
  verifyUserAuthorization(["technician"]),
  additionalsServicesController.create
);

servicesRoutes.delete(
  "/additional/delete/:ticketId/:serviceId",
  verifyUserAuthorization(["technician"]),
  additionalsServicesController.remove
);

servicesRoutes.get(
  "/",
  servicesController.index
);

servicesRoutes.use(verifyUserAuthorization(["admin"]));

servicesRoutes.get("/:id", servicesController.show);
servicesRoutes.post("/", servicesController.create);
servicesRoutes.put("/:id", servicesController.update);
servicesRoutes.patch("/:id/status", servicesController.updateStatus);

export { servicesRoutes };
