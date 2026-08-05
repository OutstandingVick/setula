import { resolve } from "node:path";
import { z } from "zod";
import { createHttpServer } from "./http.js";
import { ArcCircleSettlementGateway } from "./settlement.js";
import { SetulaService } from "./service.js";
import { JsonFileStore } from "./store.js";

const runtimeSchema = z.object({
  HOST: z.string().trim().min(1).default("0.0.0.0"),
  PORT: z.coerce.number().int().positive().max(65_535).default(4_000),
  DATA_FILE: z.string().min(1).default(".setula-data.json"),
  PAYOUT_CALLBACK_SECRET: z.string().min(12, "PAYOUT_CALLBACK_SECRET must be at least 12 characters"),
  CORS_ORIGIN: z.string().trim().min(1).default("http://localhost:3001,http://localhost:4000"),
});

const runtime = runtimeSchema.parse(process.env);
const allowedOrigins = runtime.CORS_ORIGIN.split(",").map((s) => s.trim()).filter(Boolean);
const store = new JsonFileStore(resolve(runtime.DATA_FILE));
const service = new SetulaService(
  store,
  new ArcCircleSettlementGateway(),
  runtime.PAYOUT_CALLBACK_SECRET,
);
const server = createHttpServer(service, allowedOrigins);

server.listen(runtime.PORT, runtime.HOST, () => {
  console.log(`Setula backend listening on http://${runtime.HOST}:${runtime.PORT}`);
});
