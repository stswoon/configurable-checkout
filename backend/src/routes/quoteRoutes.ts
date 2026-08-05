import path from "path";
import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import type { QuoteType } from "../../../shared/QuoteType";
import {
  jsonFilePath,
  listJsonFiles,
  readJsonFile,
  writeJsonFile,
} from "../lib/jsonStore";
import { recalculateOrderPrices } from "../lib/quotePricing";

const DATA_DIR = path.join(__dirname, "../../data/quotes");

const router = Router();

router.get("/", async (_req, res) => {
  const ids = await listJsonFiles(DATA_DIR);
  res.json({ ids });
});

router.get("/:id", async (req, res) => {
  const quote = await readJsonFile<QuoteType | null>(
    jsonFilePath(DATA_DIR, req.params.id),
    null,
  );
  if (!quote) {
    res.status(404).json({ error: "Quote not found" });
    return;
  }
  res.json(quote);
});

router.post("/", async (req, res) => {
  const body = req.body as Partial<QuoteType>;
  const quote: QuoteType = {
    id: body.id ?? uuidv4(),
    status: body.status ?? "OPEN",
    order: recalculateOrderPrices(body.order ?? []),
    userInfo: body.userInfo ?? { documentType: "passport", documentId: "" },
    delivery: body.delivery ?? { address: "", date: "" },
  };
  await writeJsonFile(jsonFilePath(DATA_DIR, quote.id), quote);
  res.status(201).json(quote);
});

router.put("/:id", async (req, res) => {
  const existing = await readJsonFile<QuoteType | null>(
    jsonFilePath(DATA_DIR, req.params.id),
    null,
  );
  if (!existing) {
    res.status(404).json({ error: "Quote not found" });
    return;
  }
  const body = req.body as Partial<QuoteType>;
  const quote: QuoteType = {
    ...existing,
    ...body,
    id: req.params.id,
    order: recalculateOrderPrices(body.order ?? existing.order),
    userInfo: body.userInfo ?? existing.userInfo,
    delivery: body.delivery ?? existing.delivery,
  };
  await writeJsonFile(jsonFilePath(DATA_DIR, quote.id), quote);
  res.json(quote);
});

export default router;
