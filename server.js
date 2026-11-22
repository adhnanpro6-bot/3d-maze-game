const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const APPS_SCRIPT_URL =
  process.env.APPS_SCRIPT_URL ||
  "https://script.google.com/macros/s/AKfycbw9dyzCaYMswM9o3NkPnutidjcSNopuF6_ylUnR_wlgspl7RA2ePa4vJU7r_uGnD97HDw/exec";

const RAW_CODES_STRING =
  "KKMQZN01-7842|KKMQZN02-9153|KKMQZN03-6204|KKMQZN04-5012|KKMQZN05-4657|KKMQZN06-3286|KKMQZN07-2679|KKMQZN08-9935|KKMQZN09-2424|KKMQZN10-7912|KKMQZN11-1520|KKMQZN12-1488|KKMQZN13-2535|KKMQZN14-4582|KKMQZN15-4811|KKMQZN16-9279|KKMQZN17-1434|KKMQZN18-4257|KKMQZN19-9928|KKMQZN20-7873|KKMQZN21-4611|KKMQZN22-8359|KKMQZN23-5557|KKMQZN24-1106|KKMQZN25-3615|KKMQZN26-7924|KKMQZN27-6574|KKMQZN28-5552|KKMQZN29-3547|KKMQZN30-4527|KKMQZN31-6514|KKMQZN32-2674|KKMQZN33-2519|KKMQZN34-7224|KKMQZN35-2584|KKMQZN36-6881|KKMQZN37-6635|KKMQZN38-5333|KKMQZN39-1711|KKMQZN40-8527|KKMQZN41-9785|KKMQZN42-3045|KKMQZN43-7201|KKMQZN44-2291|KKMQZN45-5803|KKMQZN46-6925|KKMQZN47-4150|KKMQZN48-2139|KKMQZN49-1750|KKMQZN50-4733|KKMQZN51-5741|KKMQZN52-2307|KKMQZN53-4814|KKMQZN54-2654|KKMQZN55-7227|KKMQZN56-5554|KKMQZN57-8428|KKMQZN58-6977|KKMQZN59-3664|KKMQZN60-7065|KKMQZN61-6820|KKMQZN62-4432|KKMQZN63-5374|KKMQZN64-2169|KKMQZN65-3803|KKMQZN66-9751|KKMQZN67-5010|KKMQZN68-3677|KKMQZN69-8573|KKMQZN70-7216|KKMQZN71-5422|KKMQZN72-4598|KKMQZN73-6313|KKMQZN74-1916|KKMQZN75-4752|KKMQZN76-1525|KKMQZN77-6168|KKMQZN78-7572|KKMQZN79-5386|KKMQZN80-2084|KKMQZN81-4456|KKMQZN82-6155|KKMQZN83-4483|KKMQZN84-9179|KKMQZN85-7482|KKMQZN86-8517|KKMQZN87-3340|KKMQZN88-5339|KKMQZN89-3287|KKMQZN90-5040|KKMQZN91-9830|KKMQZN92-5304|KKMQZN93-8019|KKMQZN94-7543|KKMQZN95-6930|KKMQZN96-4593|KKMQZN97-3266|KKMQZN98-9348|KKMQZN99-9085|KKMQZN100-4410";
const VALID_CODES = new Set(RAW_CODES_STRING.split("|"));

async function postToScript(payload) {
  const response = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const text = await response.text();
  return JSON.parse(text);
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", storage: "Google Sheets" });
});

app.post("/api/verify-code", async (req, res) => {
  const code = String(req.body?.code || "").trim().toUpperCase();
  const playerName = String(req.body?.playerName || "").trim();

  if (!VALID_CODES.has(code)) {
    return res.json({ valid: false, reason: "INVALID_CODE" });
  }

  try {
    const data = await postToScript({ action: "CLAIM", code, playerName });
    return res.json(data);
  } catch (err) {
    console.error("Google Sheet Verification Error:", err);
    return res.status(502).json({ valid: false, reason: "SHEET_CONNECTION_ERROR" });
  }
});

app.post("/api/resume-session", async (req, res) => {
  const sessionId = String(req.body?.sessionId || "").trim();
  if (!sessionId) {
    return res.json({ valid: false, reason: "NO_SESSION" });
  }

  try {
    const data = await postToScript({ action: "RESUME", sessionId });
    return res.json(data);
  } catch (err) {
    console.error("Resume Session Error:", err);
    return res.status(502).json({ valid: false, reason: "SHEET_CONNECTION_ERROR" });
  }
});

app.post("/api/save-progress", async (req, res) => {
  const sessionId = String(req.body?.sessionId || "").trim();
  const doorIndex = Number(req.body?.doorIndex || 0);
  const elapsedSeconds = Number(req.body?.elapsedSeconds || 0);
  const finished = Boolean(req.body?.finished);

  if (!sessionId) {
    return res.status(400).json({ ok: false, reason: "NO_SESSION" });
  }

  try {
    const data = await postToScript({
      action: "SAVE_PROGRESS",
      sessionId,
      doorIndex,
      elapsedSeconds,
      finished
    });
    return res.json(data);
  } catch (err) {
    console.error("Save Progress Error:", err);
    return res.status(502).json({ ok: false, reason: "SHEET_CONNECTION_ERROR" });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`3D Maze Server running on port ${PORT}`);
});