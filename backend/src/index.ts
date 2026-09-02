import cors from "cors";
import express from "express";
import fs from "fs";
import path from "path";
import configRoutes from "./routes/configRoutes";
import idpRoutes from "./routes/idpRoutes";
import quoteRoutes from "./routes/quoteRoutes";

const app = express();
const PORT = Number(process.env.PORT) || 3100;
const STATIC_DIR = path.resolve(__dirname, "../../frontend/dist");

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", services: ["config", "idp", "quotes"] });
});

app.use("/api/config", configRoutes);
app.use("/api/idp", idpRoutes);
app.use("/api/quotes", quoteRoutes);

if (fs.existsSync(STATIC_DIR)) {
  app.use(express.static(STATIC_DIR));
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      next();
      return;
    }
    if (req.path.startsWith("/api") || req.path === "/health") {
      next();
      return;
    }
    res.sendFile(path.join(STATIC_DIR, "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("  Config API:  /api/config");
  console.log("  IDP API:     /api/idp");
  console.log("  Quotes API:  /api/quotes");
  if (fs.existsSync(STATIC_DIR)) {
    console.log(`  UI:          ${STATIC_DIR}`);
  }
});
