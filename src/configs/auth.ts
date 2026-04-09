import { env } from "@/env";
import { SignOptions } from "jsonwebtoken";

type AuthConfig = {
  jwt: Pick<SignOptions, "expiresIn"> & {
    secret: string;
  };
};

export const authConfig: AuthConfig = {
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: "1d",
  },
};
