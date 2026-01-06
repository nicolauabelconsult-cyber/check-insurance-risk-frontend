import { z } from "zod";

export const userCreateSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  username: z.string().min(1, "Username is required"),
  role: z.string().min(1, "Role is required"),
  password: z.string().min(8, "Minimum 8 characters"),
  confirm: z.string().min(1, "Confirm password"),
}).refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords do not match" });

export type UserCreateForm = z.infer<typeof userCreateSchema>;

export const userUpdateSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  username: z.string().min(1, "Username is required"),
  role: z.string().min(1, "Role is required"),
  is_active: z.boolean(),
});

export type UserUpdateForm = z.infer<typeof userUpdateSchema>;
