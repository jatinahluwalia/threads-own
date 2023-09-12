import * as z from "zod";

export const UserValidation = z.object({
  profile_photo: z.string().url().nonempty(),
  name: z
    .string()
    .min(3, { message: "Minimum 3 characters" })
    .max(30, { message: "Maximum 3 characters" }),
  username: z
    .string()
    .min(3, { message: "Minimum 3 characters" })
    .max(30, { message: "Maximum 3 characters" }),
  bio: z.string().max(100, { message: "Maximum 100 characters" }),
});
