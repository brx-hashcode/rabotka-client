import { env } from "@/env";

export const config = {
  apiUrl: `http://${env.VITE_HOST}:${env.VITE_PORT}/api/v1`,
};
