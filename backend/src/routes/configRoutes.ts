import path from "path";
import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import {
  jsonFilePath,
  listJsonFiles,
  readJsonFile,
  readTextFile,
  writeJsonFile,
} from "../lib/jsonStore";

const DATA_DIR = path.join(__dirname, "../../data/config");

export interface CheckoutConfig {
  id: string;
  quoteId: string;
  widgets: WidgetDefinition[];
  updatedAt: string;
}

export interface WidgetDefinition {
  id: string;
  type: string;
  props?: Record<string, unknown>;
}

const router = Router();

router.get("/", async (_req, res) => {
  const ids = await listJsonFiles(DATA_DIR);
  res.json({ ids });
});

router.get("/example", async (_req, res) => {
  const source = await readTextFile(path.join(DATA_DIR, "default.json5"), null);
  if (!source) {
    res.status(404).json({ error: "Example config not found" });
    return;
  }
  res.type("application/json5").send(source);
});

router.get("/:id", async (req, res) => {
  const config = await readJsonFile<CheckoutConfig | null>(
    jsonFilePath(DATA_DIR, req.params.id),
    null,
  );
  if (!config) {
    res.status(404).json({ error: "Config not found" });
    return;
  }
  res.json(config);
});

router.put("/:id", async (req, res) => {
  const body = req.body as Partial<CheckoutConfig>;
  const config: CheckoutConfig = {
    id: req.params.id,
    quoteId: body.quoteId ?? "",
    widgets: body.widgets ?? [],
    updatedAt: new Date().toISOString(),
  };
  await writeJsonFile(jsonFilePath(DATA_DIR, req.params.id), config);
  res.json(config);
});

router.post("/", async (req, res) => {
  const id = (req.body as { id?: string }).id ?? uuidv4();
  const config: CheckoutConfig = {
    id,
    quoteId: (req.body as CheckoutConfig).quoteId ?? "quote-001",
    widgets: (req.body as CheckoutConfig).widgets ?? [],
    updatedAt: new Date().toISOString(),
  };
  await writeJsonFile(jsonFilePath(DATA_DIR, id), config);
  res.status(201).json(config);
});

export default router;
