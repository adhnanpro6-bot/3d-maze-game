require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || "";

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

async function forwardToAppsScript(payload) {
  if (!APPS_SCRIPT_URL) {
    return { valid: false, ok: false, reason: "MISSING_APPS_SCRIPT_URL" };
  }
  const res = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}

app.post("/api/verify-code", async (req, res) => {
  try {
    const data = await forwardToAppsScript({
      action: "CLAIM",
      code: req.body.code,
      playerName: req.body.playerName
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ valid: false, reason: "SERVER_ERROR" });
  }
});

app.post("/api/continue-code", async (req, res) => {
  try {
    const data = await forwardToAppsScript({
      action: "CONTINUE_CODE",
      code: req.body.code
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ valid: false, reason: "SERVER_ERROR" });
  }
});

app.post("/api/resume-session", async (req, res) => {
  try {
    const data = await forwardToAppsScript({
      action: "RESUME",
      sessionId: req.body.sessionId
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ valid: false, reason: "SERVER_ERROR" });
  }
});

app.post("/api/save-progress", async (req, res) => {
  try {
    const data = await forwardToAppsScript({
      action: "SAVE_PROGRESS",
      sessionId: req.body.sessionId,
      doorIndex: req.body.doorIndex,
      elapsedSeconds: req.body.elapsedSeconds,
      finished: req.body.finished,
      score: req.body.score,
      submitTime: req.body.submitTime,
      savedAnswersJson: req.body.savedAnswersJson
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ ok: false, reason: "SERVER_ERROR" });
  }
});

app.get("/api/leaderboard", async (_req, res) => {
  try {
    const data = await forwardToAppsScript({ action: "LEADERBOARD" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ ok: false, entries: [] });
  }
});

app.listen(PORT, () => {
  console.log(`Quiz server running on port ${PORT}`);
});