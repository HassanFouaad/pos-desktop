import { electricSync, PGliteWithSync } from "@electric-sql/pglite-sync";
import { btree_gin } from "@electric-sql/pglite/contrib/btree_gin";
import { tcn } from "@electric-sql/pglite/contrib/tcn";
import { live } from "@electric-sql/pglite/live";
import { PGliteWorker } from "@electric-sql/pglite/worker";
import { startElectricSync } from "./electric-sync";
const database = await PGliteWorker.create(
  new Worker(new URL("./my-pglite-worker.js", import.meta.url), {
    type: "module",
  }),
  {
    relaxedDurability: true,
    extensions: {
      electric: electricSync({ debug: true }),
      live,
      btree_gin,
      tcn,
    },
  }
);

await database.waitReady;

const startSync = async (token: string, persistanceId: string = "default") => {
  await startElectricSync(
    database as unknown as PGliteWithSync,
    token,
    persistanceId
  );
};

export { database, startSync };
