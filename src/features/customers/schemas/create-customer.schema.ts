import { isValidPhoneNumber } from "libphonenumber-js";
import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().optional(),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .refine(
      (value) => {
        return isValidPhoneNumber(value, "EG");
      },
      {
        message: "Invalid phone number format for Egypt.",
      }
    )
    .refine((value) => value.length >= 13, {
      message: "Phone number must be at least 11 digits plus country code.",
    }),
});

export type CreateCustomerDTO = z.infer<typeof createCustomerSchema>;
