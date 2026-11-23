const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const APPS_SCRIPT_URL = (process.env.APPS_SCRIPT_URL || "").trim();

app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

async function callAppsScript(payload) {
  if (!APPS_SCRIPT_URL) {
    return { ok: false, valid: false, reason: "MISSING_APPS_SCRIPT_URL" };
  }

  const response = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    redirect: "follow",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {})
  });

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (_) {
    return {
      ok: false,
      valid: false,
      reason: "INVALID_SCRIPT_RESPONSE",
      rawPreview: text.slice(0, 180)
    };
  }
}

app.post("/api/verify-code", async (req, res) => {
  try {
    const data = await callAppsScript({
      action: "CLAIM",
      code: req.body && req.body.code ? String(req.body.code) : "",
      playerName: req.body && req.body.playerName ? String(req.body.playerName) : ""
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ ok: false, valid: false, reason: "SERVER_ERROR" });
  }
});

app.post("/api/continue-code", async (req, res) => {
  try {
    const data = await callAppsScript({
      action: "CONTINUE_CODE",
      code: req.body && req.body.code ? String(req.body.code) : ""
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ ok: false, valid: false, reason: "SERVER_ERROR" });
  }
});

app.post("/api/resume-session", async (req, res) => {
  try {
    const data = await callAppsScript({
      action: "RESUME",
      sessionId: req.body && req.body.sessionId ? String(req.body.sessionId) : ""
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ ok: false, valid: false, reason: "SERVER_ERROR" });
  }
});

app.post("/api/save-progress", async (req, res) => {
  try {
    const b = req.body || {};
    const data = await callAppsScript({
      action: "SAVE_PROGRESS",
      sessionId: b.sessionId || "",
      doorIndex: Number(b.doorIndex || 0),
      elapsedSeconds: Number(b.elapsedSeconds || 0),
      finished: Boolean(b.finished),
      score: Number(b.score || 0),
      submitTime: b.submitTime || "",
      savedAnswersJson: b.savedAnswersJson !== undefined ? String(b.savedAnswersJson) : "{}"
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ ok: false, reason: "SERVER_ERROR" });
  }
});

app.get("/api/leaderboard", async (_req, res) => {
  try {
    const data = await callAppsScript({ action: "LEADERBOARD" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ ok: false, entries: [] });
  }
});

app.listen(PORT, () => {
  console.log(`Quiz server running on port ${PORT}`);
});