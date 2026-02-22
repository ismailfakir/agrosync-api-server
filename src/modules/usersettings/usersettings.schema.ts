import { z } from "zod";

export const UserSettingsSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  settings: z.string().optional()
});

export type UserSettingsDTO = z.infer<typeof UserSettingsSchema>;