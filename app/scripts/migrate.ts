import { openDb } from "./lib/common";

openDb()
  .then(({ client }) => {
    client.close();
    console.log("Migraciones aplicadas");
  })
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });