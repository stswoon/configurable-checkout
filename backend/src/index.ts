import cors from "cors";
import express from "express";
import configRoutes from "./routes/configRoutes";
import idpRoutes from "./routes/idpRoutes";
import quoteRoutes from "./routes/quoteRoutes";

const app = express();
const PORT = process.env.PORT ?? 3100;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", services: ["config", "idp", "quotes"] });
});

app.use("/api/config", configRoutes);
app.use("/api/idp", idpRoutes);
app.use("/api/quotes", quoteRoutes);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log("  Config API:  /api/config");
  console.log("  IDP API:     /api/idp");
  console.log("  Quotes API:  /api/quotes");
});
