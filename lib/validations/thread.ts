import * as z from "zod";

export const ThreadValidation = z.object({
  thread: z.string().nonempty("Should not be empty"),
  accountId: z.string(),
});
export const CommentValidation = z.object({
  thread: z.string().nonempty(),
});
