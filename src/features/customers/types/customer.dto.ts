import { customers } from "../../../db/schemas";

export type CustomerDTO = typeof customers.$inferSelect;
