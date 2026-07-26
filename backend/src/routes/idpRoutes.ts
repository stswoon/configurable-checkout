import path from "path";
import { Router } from "express";
import { jsonFilePath, readJsonFile, writeJsonFile } from "../lib/jsonStore";

const DATA_DIR = path.join(__dirname, "../../data/idp");

export interface IdpUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

export interface IdpSession {
  token: string;
  userId: string;
  expiresAt: string;
}

const router = Router();

router.get("/users", async (_req, res) => {
  const users = await readJsonFile<IdpUser[]>(jsonFilePath(DATA_DIR, "users"), []);
  res.json(users);
});

router.get("/users/:id", async (req, res) => {
  const users = await readJsonFile<IdpUser[]>(jsonFilePath(DATA_DIR, "users"), []);
  const user = users.find((u) => u.id === req.params.id);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

router.post("/login", async (req, res) => {
  const { email } = req.body as { email?: string };
  const users = await readJsonFile<IdpUser[]>(jsonFilePath(DATA_DIR, "users"), []);
  const user = users.find((u) => u.email === email) ?? users[0];
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const session: IdpSession = {
    token: `session-${user.id}-${Date.now()}`,
    userId: user.id,
    expiresAt: new Date(Date.now() + 3600_000).toISOString(),
  };
  await writeJsonFile(jsonFilePath(DATA_DIR, "sessions"), [
    ...(await readJsonFile<IdpSession[]>(jsonFilePath(DATA_DIR, "sessions"), [])),
    session,
  ]);
  res.json({ user, session });
});

router.get("/session/:token", async (req, res) => {
  const sessions = await readJsonFile<IdpSession[]>(
    jsonFilePath(DATA_DIR, "sessions"),
    [],
  );
  const session = sessions.find((s) => s.token === req.params.token);
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  const users = await readJsonFile<IdpUser[]>(jsonFilePath(DATA_DIR, "users"), []);
  const user = users.find((u) => u.id === session.userId);
  res.json({ session, user });
});

export default router;
