import path from "path";
import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import {
  jsonFilePath,
  listJsonFiles,
  readJsonFile,
  writeJsonFile,
} from "../lib/jsonStore";

const DATA_DIR = path.join(__dirname, "../../data/quotes");

export interface QuoteLineItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Quote {
  id: string;
  customerName: string;
  status: "draft" | "sent" | "accepted" | "expired";
  currency: string;
  lineItems: QuoteLineItem[];
  total: number;
  validUntil: string;
  updatedAt: string;
}

const router = Router();

router.get("/", async (_req, res) => {
  const ids = await listJsonFiles(DATA_DIR);
  res.json({ ids });
});

router.get("/:id", async (req, res) => {
  const quote = await readJsonFile<Quote | null>(
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
  const body = req.body as Partial<Quote>;
  const lineItems = body.lineItems ?? [];
  const total = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
  const quote: Quote = {
    id: body.id ?? uuidv4(),
    customerName: body.customerName ?? "Unknown",
    status: body.status ?? "draft",
    currency: body.currency ?? "USD",
    lineItems,
    total,
    validUntil: body.validUntil ?? new Date(Date.now() + 7 * 86400_000).toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await writeJsonFile(jsonFilePath(DATA_DIR, quote.id), quote);
  res.status(201).json(quote);
});

router.put("/:id", async (req, res) => {
  const existing = await readJsonFile<Quote | null>(
    jsonFilePath(DATA_DIR, req.params.id),
    null,
  );
  if (!existing) {
    res.status(404).json({ error: "Quote not found" });
    return;
  }
  const body = req.body as Partial<Quote>;
  const lineItems = body.lineItems ?? existing.lineItems;
  const quote: Quote = {
    ...existing,
    ...body,
    id: req.params.id,
    lineItems,
    total: lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    updatedAt: new Date().toISOString(),
  };
  await writeJsonFile(jsonFilePath(DATA_DIR, quote.id), quote);
  res.json(quote);
});

export default router;
