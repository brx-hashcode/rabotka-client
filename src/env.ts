import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "VITE_",

  client: {
    VITE_SITE_URL: z.string().url().optional(),
    VITE_GA_MEASUREMENT_ID: z.string().optional(),
  },

  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
});
