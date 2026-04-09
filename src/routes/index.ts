import { Router } from "express";

import { usersRoutes } from "./users-routes";
import { sessionsRoutes } from "./sessions-routes";
import { timesRoutes } from "./times-routes";
import { techniciansRoutes } from "./technicians-routes";
import { servicesRoutes } from "./services-routes";
import { customersRoutes } from "./customers-routes";
import { ticketsRoutes } from "./tickets-routes";
import { profilesRoutes } from "./profiles-routes";
import { uploadsRoutes } from "./uploads-routes";

import { ensureUserAuthentication } from "@/middlewares/ensure-user-authentication";

const routes = Router();

routes.use("/users", usersRoutes);
routes.use("/sessions", sessionsRoutes);

routes.use(ensureUserAuthentication);

routes.use("/times", timesRoutes);
routes.use("/technicians", techniciansRoutes);
routes.use("/services", servicesRoutes);
routes.use("/customers", customersRoutes);
routes.use("/tickets", ticketsRoutes);
routes.use("/profiles", profilesRoutes);

routes.use("/uploads", uploadsRoutes);

export { routes };
