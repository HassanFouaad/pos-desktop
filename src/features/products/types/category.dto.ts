import { categories } from "../../../db/schemas";

export type CategoryDTO = typeof categories.$inferSelect;
