import { resolve } from "node:path";
import { z } from "zod";
import { createHttpServer } from "./http.js";
import { ArcCircleSettlementGateway } from "./settlement.js";
import { SetulaService } from "./service.js";
import { JsonFileStore } from "./store.js";

const runtimeSchema = z.object({
  PORT: z.coerce.number().int().positive().max(65_535).default(4_000),
  DATA_FILE: z.string().min(1).default(".setula-data.json"),
  PAYOUT_CALLBACK_SECRET: z.string().min(12, "PAYOUT_CALLBACK_SECRET must be at least 12 characters"),
});

const runtime = runtimeSchema.parse(process.env);
const store = new JsonFileStore(resolve(runtime.DATA_FILE));
const service = new SetulaService(
  store,
  new ArcCircleSettlementGateway(),
  runtime.PAYOUT_CALLBACK_SECRET,
);
const server = createHttpServer(service);

server.listen(runtime.PORT, "127.0.0.1", () => {
  console.log(`Setula backend listening on http://127.0.0.1:${runtime.PORT}`);
});
