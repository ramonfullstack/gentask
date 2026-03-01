import { z } from "zod";

export const authSchema = z.object({
  email: z.string().email("Informe um email válido"),
  password: z.string().min(8, "A senha precisa ter ao menos 8 caracteres")
});

export type AuthInput = z.infer<typeof authSchema>;
