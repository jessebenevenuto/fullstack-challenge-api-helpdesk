import express from "express";
import cors from "cors";

import { routes } from "./routes";
import { errorHandling } from "./middlewares/error-handling";
import { ensureUserAuthentication } from "./middlewares/ensure-user-authentication";
import uploadConfig from "@/configs/upload";

const app = express();
app.use(express.json());
app.use(cors());

app.use("/uploads", ensureUserAuthentication, express.static(uploadConfig.UPLOADS_FOLDER));

app.use(routes);
app.use(errorHandling);

export { app };
