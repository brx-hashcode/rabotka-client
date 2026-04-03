import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "VITE_",

  client: {
    VITE_HOST: z.string().min(1),
    VITE_PORT: z.string().min(1),
    VITE_BACKEND_URL: z.string().url(),
    VITE_SITE_URL: z.string().url().optional(),
  },

  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
});
