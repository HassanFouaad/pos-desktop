import { useLiveIncrementalQuery } from "@electric-sql/pglite-react";
import type { Query } from "drizzle-orm";

export const useSubscription = (query: Query, key?: string) => {
  const res = useLiveIncrementalQuery(query.sql, query.params, key ?? "");

  if (!res) {
    return {
      status: "loading",
    };
  }

  return {
    status: "success",
    data: res.rows,
  };
};
