import { Router } from "express";

import { CustomersController } from "@/controllers/customers-controller";
import { verifyUserAuthorization } from "@/middlewares/verify-user-authorization";

const customersRoutes = Router();
const customersController = new CustomersController();

customersRoutes.get(
  "/",
  verifyUserAuthorization(["admin"]),
  customersController.index
);

customersRoutes.get(
  "/:id",
  verifyUserAuthorization(["admin"]),
  customersController.show
)

customersRoutes.put(
  "/:id",
  verifyUserAuthorization(["admin"]),
  customersController.update
);

customersRoutes.delete(
  "/:id",
  verifyUserAuthorization(["admin", "customer"]),
  customersController.remove
);

export { customersRoutes };
