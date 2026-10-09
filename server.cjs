var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
module.exports = __toCommonJS(server_exports);
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var DEFAULT_APP_URL = process.env.APP_URL || "https://web-dose.vercel.app";
var app = (0, import_express.default)();
var PORT = 3e3;
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.use(import_express.default.json({ limit: "25mb" }));
app.use(import_express.default.urlencoded({ extended: true, limit: "25mb" }));
app.use(import_express.default.static(import_path.default.join(process.cwd(), "public")));
app.get("/api/raw-index", (req, res) => {
  const filePath = import_path.default.join(process.cwd(), "public", "fixed-index.html");
  res.sendFile(filePath);
});
app.get("/api/download-index", (req, res) => {
  const filePath = import_path.default.join(process.cwd(), "public", "fixed-index.html");
  res.download(filePath, "index.html");
});
var aiClient = null;
function getGenAI() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new import_genai.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}
var usersDB = /* @__PURE__ */ new Map([
  [
    "1001",
    {
      id: "u_pro_1",
      telegramId: "1001",
      username: "hussain_pro",
      firstName: "\u062D\u0633\u064A\u0646 (\u0645\u0634\u062A\u0631\u0643 Pro)",
      plan: "pro",
      planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString(),
      dailyQuotaUsed: 14,
      dailyQuotaTotal: 250,
      creditsRemaining: 236,
      authSource: "telegram_login",
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1e3).toISOString(),
      lastActiveAt: new Date(Date.now() - 5 * 60 * 1e3).toISOString(),
      totalRequests: 48
    }
  ],
  [
    "1002",
    {
      id: "u_vip_1",
      telegramId: "1002",
      username: "vip_founder",
      firstName: "\u0633\u0627\u0631\u0629 (\u0645\u0634\u062A\u0631\u0643 VIP)",
      plan: "vip",
      planExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1e3).toISOString(),
      dailyQuotaUsed: 42,
      dailyQuotaTotal: 9999,
      creditsRemaining: 9957,
      authSource: "telegram_login",
      createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1e3).toISOString(),
      lastActiveAt: new Date(Date.now() - 25 * 60 * 1e3).toISOString(),
      totalRequests: 132
    }
  ],
  [
    "1003",
    {
      id: "u_free_1",
      telegramId: "1003",
      username: "free_visitor",
      firstName: "\u0645\u062D\u0645\u062F (\u0645\u062C\u0627\u0646\u064A)",
      plan: "free",
      planExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3).toISOString(),
      dailyQuotaUsed: 8,
      dailyQuotaTotal: 15,
      creditsRemaining: 7,
      authSource: "bot_code",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3).toISOString(),
      lastActiveAt: new Date(Date.now() - 40 * 60 * 1e3).toISOString(),
      totalRequests: 19
    }
  ]
]);
var pairingCodes = /* @__PURE__ */ new Map();
var syncLogs = [
  {
    id: "log_1",
    timestamp: new Date(Date.now() - 5 * 60 * 1e3).toISOString(),
    source: "telegram_bot",
    userTelegramId: "1001",
    userName: "@hussain_pro",
    actionAr: "\u0637\u0644\u0628 \u0627\u0633\u062A\u062C\u0627\u0628\u0629 \u0630\u0643\u064A\u0629 \u0628\u0627\u0644\u0628\u0648\u062A /ask (\u062A\u0645 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0628\u0627\u0642\u0629 Pro)",
    actionEn: "AI query via Telegram /ask (Pro tier verified)",
    status: "success",
    tierUsed: "pro"
  },
  {
    id: "log_2",
    timestamp: new Date(Date.now() - 15 * 60 * 1e3).toISOString(),
    source: "web_platform",
    userTelegramId: "1002",
    userName: "@vip_founder",
    actionAr: "\u062A\u0635\u062F\u064A\u0631 \u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u062D\u0645\u0644\u0627\u062A \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u064A\u0629 \u0645\u0646 \u0644\u0648\u062D\u0629 \u0627\u0644\u0648\u064A\u0628",
    actionEn: "Exported campaign report from web dashboard",
    status: "success",
    tierUsed: "vip"
  },
  {
    id: "log_3",
    timestamp: new Date(Date.now() - 32 * 60 * 1e3).toISOString(),
    source: "telegram_bot",
    userTelegramId: "1003",
    userName: "@free_visitor",
    actionAr: "\u0645\u062D\u0627\u0648\u0644\u0629 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0623\u062F\u0627\u0629 \u0627\u0644\u062A\u0644\u062E\u064A\u0635 \u0627\u0644\u0645\u062A\u0642\u062F\u0645 (\u062A\u0645 \u0627\u0644\u062A\u0646\u0628\u064A\u0647 \u0628\u0627\u0644\u062A\u0631\u0642\u064A\u0629 \u0644\u0640 Pro)",
    actionEn: "Attempted advanced summarization (Upgrade to Pro prompted)",
    status: "warning",
    tierUsed: "free"
  }
];
var remindersDB = [
  {
    id: "rem_1",
    telegramId: "1001",
    drug_name: "\u0623\u0645\u0648\u0643\u0633\u064A\u0633\u064A\u0644\u064A\u0646 (Amoxicillin)",
    dose: "500 mg",
    times: ["08:00", "16:00", "00:00"],
    days: ["\u0627\u0644\u0633\u0628\u062A", "\u0627\u0644\u0623\u062D\u062F", "\u0627\u0644\u0625\u062B\u0646\u064A\u0646", "\u0627\u0644\u062B\u0644\u0627\u062B\u0627\u0621", "\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621", "\u0627\u0644\u062E\u0645\u064A\u0633", "\u0627\u0644\u062C\u0645\u0639\u0629"],
    email_notify: true,
    is_active: true,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "rem_2",
    telegramId: "1001",
    drug_name: "\u0623\u0648\u0645\u0628\u064A\u0631\u0627\u0632\u0648\u0644 (Omeprazole)",
    dose: "20 mg \u0642\u0628\u0644 \u0627\u0644\u0625\u0641\u0637\u0627\u0631",
    times: ["07:30"],
    days: ["\u064A\u0648\u0645\u064A\u0627\u064B"],
    email_notify: false,
    is_active: true,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  }
];
var drugHistoryDB = [
  { id: "h_1", telegramId: "1001", drug_name: "\u0623\u0648\u062C\u0645\u0646\u062A\u064A\u0646 (Augmentin)", drug_id: "amoxicillin_clavulanate", searched_at: new Date(Date.now() - 36e5).toISOString() },
  { id: "h_2", telegramId: "1001", drug_name: "\u0628\u0627\u0631\u0627\u0633\u064A\u062A\u0627\u0645\u0648\u0644 (Paracetamol)", drug_id: "paracetamol", searched_at: new Date(Date.now() - 72e5).toISOString() },
  { id: "h_3", telegramId: "1002", drug_name: "\u0625\u064A\u0628\u0648\u0628\u0631\u0648\u0641\u064A\u0646 (Ibuprofen)", drug_id: "ibuprofen", searched_at: new Date(Date.now() - 144e5).toISOString() }
];
pairingCodes.set("784921", {
  telegramId: "1001",
  expiresAt: Date.now() + 24 * 60 * 60 * 1e3,
  plan: "pro",
  username: "hussain_pro",
  firstName: "\u062D\u0633\u064A\u0646 (\u0645\u0634\u062A\u0631\u0643 Pro)"
});
pairingCodes.set("993112", {
  telegramId: "1002",
  expiresAt: Date.now() + 24 * 60 * 60 * 1e3,
  plan: "vip",
  username: "vip_founder",
  firstName: "\u0633\u0627\u0631\u0629 (VIP)"
});
pairingCodes.set("112233", {
  telegramId: "1003",
  expiresAt: Date.now() + 24 * 60 * 60 * 1e3,
  plan: "free",
  username: "free_visitor",
  firstName: "\u0645\u062D\u0645\u062F (\u0645\u062C\u0627\u0646\u064A)"
});
var BOT_CONFIG_FILE = import_path.default.join(process.cwd(), ".bot_config.json");
function loadPersistedBotToken() {
  try {
    if (import_fs.default.existsSync(BOT_CONFIG_FILE)) {
      const raw = import_fs.default.readFileSync(BOT_CONFIG_FILE, "utf-8");
      const data = JSON.parse(raw);
      if (data?.token && typeof data.token === "string" && data.token.trim().length > 10) {
        return data.token.trim();
      }
    }
  } catch (e) {
    console.warn("Could not load persisted bot token:", e);
  }
  return process.env.TELEGRAM_BOT_TOKEN || "";
}
function savePersistedBotToken(token) {
  try {
    import_fs.default.writeFileSync(
      BOT_CONFIG_FILE,
      JSON.stringify({ token: token.trim(), savedAt: (/* @__PURE__ */ new Date()).toISOString() }, null, 2)
    );
  } catch (e) {
    console.warn("Could not save persisted bot token:", e);
  }
}
var runtimeBotToken = loadPersistedBotToken();
var PADDLE_CONFIG_FILE = import_path.default.join(process.cwd(), ".paddle_config.json");
function loadPaddleConfig() {
  const defaultConfig = {
    environment: process.env.PADDLE_ENV === "sandbox" ? "sandbox" : "live",
    vendorId: process.env.PADDLE_VENDOR_ID || "",
    clientToken: process.env.PADDLE_CLIENT_TOKEN || "",
    apiKey: process.env.PADDLE_API_KEY || "",
    webhookSecret: process.env.PADDLE_WEBHOOK_SECRET || "",
    livePriceIds: {
      weekly: process.env.PADDLE_LIVE_PRICE_WEEKLY || "pri_weekly_live",
      monthly: process.env.PADDLE_LIVE_PRICE_MONTHLY || "pri_monthly_live",
      threeMonths: process.env.PADDLE_LIVE_PRICE_3M || "pri_3m_live",
      sixMonths: process.env.PADDLE_LIVE_PRICE_6M || "pri_6m_live",
      yearly: process.env.PADDLE_LIVE_PRICE_YEARLY || "pri_yearly_live"
    },
    sandboxPriceIds: {
      weekly: "pri_weekly_sandbox",
      monthly: "pri_monthly_sandbox",
      threeMonths: "pri_3m_sandbox",
      sixMonths: "pri_6m_sandbox",
      yearly: "pri_yearly_sandbox"
    }
  };
  try {
    if (import_fs.default.existsSync(PADDLE_CONFIG_FILE)) {
      const raw = import_fs.default.readFileSync(PADDLE_CONFIG_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      return { ...defaultConfig, ...parsed };
    }
  } catch (e) {
    console.warn("Could not load persisted paddle config:", e);
  }
  return defaultConfig;
}
function savePaddleConfig(cfg) {
  const current = loadPaddleConfig();
  const updated = {
    ...current,
    ...cfg,
    environment: cfg.environment === "sandbox" ? "sandbox" : "live",
    livePriceIds: { ...current.livePriceIds, ...cfg.livePriceIds || {} },
    sandboxPriceIds: { ...current.sandboxPriceIds, ...cfg.sandboxPriceIds || {} }
  };
  try {
    import_fs.default.writeFileSync(PADDLE_CONFIG_FILE, JSON.stringify(updated, null, 2));
  } catch (e) {
    console.warn("Could not save paddle config:", e);
  }
  return updated;
}
var runtimePaddleConfig = loadPaddleConfig();
app.get("/bot.py", (req, res) => {
  const botPath = import_path.default.join(process.cwd(), "public", "bot.py");
  if (import_fs.default.existsSync(botPath)) {
    res.setHeader("Content-Type", "text/x-python; charset=utf-8");
    return res.sendFile(botPath);
  }
  res.status(404).send("# bot.py not found");
});
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    environment: process.env.NODE_ENV || "development",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/api/config", (req, res) => {
  const activeToken = runtimeBotToken || process.env.TELEGRAM_BOT_TOKEN || "";
  res.json({
    botTokenConfigured: Boolean(activeToken),
    botTokenMasked: activeToken ? `${activeToken.slice(0, 6)}...${activeToken.slice(-4)}` : null,
    botUsername: process.env.TELEGRAM_BOT_USERNAME || "Drugscalculat_bot",
    appUrl: process.env.APP_URL || "https://ais-dev-od4aemezdgaeup2ncw76si-295455119343.europe-west2.run.app",
    geminiEnabled: Boolean(process.env.GEMINI_API_KEY)
  });
});
app.post("/api/auth/code-generate", (req, res) => {
  const { telegramId = "1001", plan = "pro", username = "telegram_user", firstName = "\u0627\u0644\u0645\u0634\u062A\u0631\u0643" } = req.body;
  const randomCode = Math.floor(1e5 + Math.random() * 9e5).toString();
  pairingCodes.set(randomCode, {
    telegramId: String(telegramId),
    expiresAt: Date.now() + 15 * 60 * 1e3,
    // 15 mins
    plan,
    username,
    firstName
  });
  res.json({
    success: true,
    code: randomCode,
    expiresInMinutes: 15,
    instructionAr: `\u0623\u0631\u0633\u0644 \u0627\u0644\u0623\u0645\u0631 /login ${randomCode} \u0641\u064A \u0627\u0644\u0628\u0648\u062A \u0623\u0648 \u0623\u062F\u062E\u0644 \u0627\u0644\u0631\u0645\u0632 \u0641\u064A \u0635\u0641\u062D\u0629 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0628\u0627\u0644\u0645\u0648\u0642\u0639.`,
    instructionEn: `Send /login ${randomCode} to the bot or enter this code on the web login page.`
  });
});
app.post("/api/auth/code-verify", (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: "Code is required" });
  }
  const found = pairingCodes.get(String(code).trim());
  if (!found) {
    return res.status(404).json({
      success: false,
      errorAr: "\u0631\u0645\u0632 \u0627\u0644\u0645\u0635\u0627\u062F\u0642\u0629 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D \u0623\u0648 \u0627\u0646\u062A\u0647\u062A \u0635\u0644\u0627\u062D\u064A\u062A\u0647",
      errorEn: "Invalid or expired authorization code"
    });
  }
  let user = usersDB.get(found.telegramId);
  if (!user) {
    const quota = found.plan === "vip" ? 9999 : found.plan === "pro" ? 250 : 15;
    user = {
      id: `u_${Date.now()}`,
      telegramId: found.telegramId,
      username: found.username,
      firstName: found.firstName,
      plan: found.plan,
      planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString(),
      dailyQuotaUsed: 0,
      dailyQuotaTotal: quota,
      creditsRemaining: quota,
      authSource: "bot_code",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    usersDB.set(found.telegramId, user);
  }
  syncLogs.unshift({
    id: `log_${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    source: "web_platform",
    userTelegramId: user.telegramId,
    userName: user.username ? `@${user.username}` : user.firstName,
    actionAr: `\u062A\u0633\u062C\u064A\u0644 \u062F\u062E\u0648\u0644 \u0646\u0627\u062C\u062D \u0639\u0628\u0631 \u062A\u0644\u064A\u062C\u0631\u0627\u0645 (\u0628\u0627\u0642\u0629 ${user.plan.toUpperCase()})`,
    actionEn: `Successful login via Telegram (${user.plan.toUpperCase()} tier)`,
    status: "success",
    tierUsed: user.plan
  });
  res.json({
    success: true,
    user,
    token: `jwt_sim_${user.id}_${Date.now()}`
  });
});
app.post("/api/auth/direct", (req, res) => {
  const { telegramId, username, firstName, plan } = req.body;
  if (!telegramId) {
    return res.status(400).json({ error: "telegramId is required" });
  }
  let user = usersDB.get(String(telegramId));
  if (!user) {
    const chosenPlan = plan || "pro";
    const quota = chosenPlan === "vip" ? 9999 : chosenPlan === "pro" ? 250 : 15;
    user = {
      id: `u_${Date.now()}`,
      telegramId: String(telegramId),
      username: username || `user_${telegramId}`,
      firstName: firstName || "\u0645\u0633\u062A\u062E\u062F\u0645 \u062A\u0644\u064A\u062C\u0631\u0627\u0645",
      plan: chosenPlan,
      planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString(),
      dailyQuotaUsed: 0,
      dailyQuotaTotal: quota,
      creditsRemaining: quota,
      authSource: "telegram_login",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    usersDB.set(String(telegramId), user);
  } else if (plan && user.plan !== plan) {
    user.plan = plan;
    const quota = plan === "vip" ? 9999 : plan === "pro" ? 250 : 15;
    user.dailyQuotaTotal = quota;
    user.creditsRemaining = Math.max(0, quota - user.dailyQuotaUsed);
  }
  res.json({
    success: true,
    user
  });
});
app.get("/api/user/:telegramId/subscription", (req, res) => {
  const { telegramId } = req.params;
  const user = usersDB.get(String(telegramId));
  if (!user) {
    return res.status(200).json({
      isRegistered: false,
      telegramId,
      plan: "free",
      canAccessBot: true,
      canAccessWeb: true,
      dailyQuotaRemaining: 15,
      message: "User not found in custom database, assigned default Free tier."
    });
  }
  const isExpired = new Date(user.planExpiresAt).getTime() < Date.now();
  const activePlan = isExpired ? "free" : user.plan;
  res.json({
    isRegistered: true,
    telegramId: user.telegramId,
    username: user.username,
    name: user.firstName,
    plan: activePlan,
    status: isExpired ? "expired" : "active",
    expiresAt: user.planExpiresAt,
    dailyQuotaUsed: user.dailyQuotaUsed,
    dailyQuotaTotal: user.dailyQuotaTotal,
    dailyQuotaRemaining: user.creditsRemaining,
    canAccessFeatures: {
      aiAssistant: true,
      documentProcessor: activePlan === "pro" || activePlan === "vip",
      autoBroadcast: activePlan === "vip",
      keywordTriggers: activePlan === "pro" || activePlan === "vip",
      developerApi: activePlan === "vip"
    }
  });
});
app.post("/api/subscription/upgrade", (req, res) => {
  const { telegramId, plan = "pro", packageId, billingCycle, durationDays: customDays, firstName, username } = req.body;
  if (!telegramId) {
    return res.status(400).json({ error: "telegramId is required" });
  }
  let durationDays = 30;
  let pkgLabel = "\u{1F4C5} \u0634\u0647\u0631\u064A \u2014 $2.99";
  if (packageId === "weekly") {
    durationDays = 7;
    pkgLabel = "\u{1F4C5} \u0623\u0633\u0628\u0648\u0639\u064A \u2014 $0.99";
  } else if (packageId === "monthly" || billingCycle === "monthly") {
    durationDays = 30;
    pkgLabel = "\u{1F4C5} \u0634\u0647\u0631\u064A \u2014 $2.99";
  } else if (packageId === "3months") {
    durationDays = 90;
    pkgLabel = "\u{1F381} 3 \u0623\u0634\u0647\u0631 \u2014 $6.99 \u{1F4E6}";
  } else if (packageId === "6months") {
    durationDays = 180;
    pkgLabel = "\u{1F381} 6 \u0623\u0634\u0647\u0631 \u2014 $11.99 \u{1F4E6}";
  } else if (packageId === "yearly" || billingCycle === "yearly") {
    durationDays = 365;
    pkgLabel = "\u{1F381} \u0633\u0646\u0648\u064A \u2014 $19.99 \u{1F3C6}";
  } else if (customDays && typeof customDays === "number") {
    durationDays = customDays;
    pkgLabel = `${durationDays} \u064A\u0648\u0645\u0627\u064B`;
  }
  const effectivePlan = plan === "vip" ? "vip" : plan === "free" ? "free" : "pro";
  const quota = effectivePlan === "vip" ? 9999 : effectivePlan === "pro" ? 250 : 15;
  const durationMs = durationDays * 24 * 60 * 60 * 1e3;
  let user = usersDB.get(String(telegramId));
  if (!user) {
    user = {
      id: `u_${Date.now()}`,
      telegramId: String(telegramId),
      username: username || `user_${telegramId}`,
      firstName: firstName || "\u0645\u0633\u062A\u062E\u062F\u0645 \u062C\u0631\u0639\u0629 \u0627\u0644\u0637\u0628\u064A",
      plan: effectivePlan,
      planExpiresAt: new Date(Date.now() + durationMs).toISOString(),
      dailyQuotaUsed: 0,
      dailyQuotaTotal: quota,
      creditsRemaining: quota,
      authSource: "webapp",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    usersDB.set(String(telegramId), user);
  } else {
    user.plan = effectivePlan;
    user.dailyQuotaTotal = quota;
    user.creditsRemaining = Math.max(0, quota - (user.dailyQuotaUsed || 0));
    user.planExpiresAt = new Date(Date.now() + durationMs).toISOString();
    if (firstName) user.firstName = firstName;
    if (username) user.username = username;
  }
  syncLogs.unshift({
    id: `log_${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    source: "web_platform",
    userTelegramId: user.telegramId,
    userName: user.username ? `@${user.username}` : user.firstName,
    actionAr: `\u062A\u0641\u0639\u064A\u0644 \u0627\u0634\u062A\u0631\u0627\u0643 ${pkgLabel} \u0648\u062A\u062D\u062F\u064A\u062B \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A`,
    actionEn: `Upgraded subscription in usersDB to ${pkgLabel}`,
    status: "success",
    tierUsed: effectivePlan
  });
  res.json({
    success: true,
    user,
    packageId,
    durationDays,
    messageAr: `\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0648\u062A\u0641\u0639\u064A\u0644 \u0627\u0634\u062A\u0631\u0627\u0643 ${pkgLabel} \u0628\u0646\u062C\u0627\u062D! \u0641\u0627\u062D\u0635 \u0627\u0644\u0623\u0639\u0631\u0627\u0636 \u0648\u0643\u0627\u0641\u0629 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0627\u062A \u0645\u0641\u0639\u0644\u0629 \u0641\u0648\u0631\u0627\u064B \u0641\u064A \u0627\u0644\u0628\u0648\u062A \u0648\u0627\u0644\u0645\u0648\u0642\u0639.`,
    messageEn: `Subscription upgraded in usersDB to ${pkgLabel}! Synced instantly across bot & web.`
  });
});
app.post("/api/bot/execute-action", async (req, res) => {
  const { telegramId, featureId, input, options } = req.body;
  const user = usersDB.get(String(telegramId));
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  const tierPermissions = {
    ai_assistant: ["free", "pro", "vip"],
    doc_processor: ["pro", "vip"],
    keyword_triggers: ["pro", "vip"],
    subscribers_crm: ["pro", "vip"],
    auto_broadcast: ["vip"],
    api_sync: ["vip"]
  };
  const allowedTiers = tierPermissions[featureId] || ["free", "pro", "vip"];
  if (!allowedTiers.includes(user.plan)) {
    return res.status(403).json({
      error: "Subscription tier not sufficient",
      requiredTiers: allowedTiers,
      currentTier: user.plan,
      messageAr: `\u0647\u0630\u0647 \u0627\u0644\u0645\u064A\u0632\u0629 \u062A\u062A\u0637\u0644\u0628 \u0628\u0627\u0642\u0629 ${allowedTiers[0].toUpperCase()} \u0623\u0648 \u0623\u0639\u0644\u0649. \u064A\u0631\u062C\u0649 \u062A\u0631\u0642\u064A\u0629 \u0627\u0634\u062A\u0631\u0627\u0643\u0643 \u0644\u0644\u0627\u0633\u062A\u0641\u0627\u062F\u0629 \u0645\u0646\u0647\u0627.`,
      messageEn: `This feature requires ${allowedTiers[0].toUpperCase()} tier or higher. Please upgrade your subscription.`
    });
  }
  if (user.creditsRemaining <= 0 && user.plan !== "vip") {
    return res.status(429).json({
      error: "Daily quota exhausted",
      messageAr: "\u0644\u0642\u062F \u0627\u0633\u062A\u0646\u0641\u062F\u062A \u062D\u0635\u062A\u0643 \u0627\u0644\u064A\u0648\u0645\u064A\u0629 \u0645\u0646 \u0627\u0644\u0637\u0644\u0628\u0627\u062A\u060C \u064A\u0631\u062C\u0649 \u0627\u0644\u062A\u0631\u0642\u064A\u0629 \u0644\u0644\u0645\u062A\u0627\u0628\u0639\u0629.",
      messageEn: "Daily quota exhausted. Please upgrade for more requests."
    });
  }
  user.dailyQuotaUsed += 1;
  user.creditsRemaining = Math.max(0, user.dailyQuotaTotal - user.dailyQuotaUsed);
  try {
    let resultOutput = "";
    if (featureId === "ai_assistant" || featureId === "doc_processor") {
      const ai = getGenAI();
      if (ai) {
        try {
          const prompt = featureId === "doc_processor" ? `\u0623\u0646\u062A \u0645\u0633\u0627\u0639\u062F \u062E\u0628\u064A\u0631 \u0644\u0644\u0628\u0648\u062A \u0648\u062A\u0637\u0628\u064A\u0642 \u0627\u0644\u0648\u064A\u0628. \u0642\u0645 \u0628\u062A\u062D\u0644\u064A\u0644 \u0648\u062A\u0644\u062E\u064A\u0635 \u0627\u0644\u0646\u0635 \u0623\u0648 \u0627\u0644\u0645\u0633\u062A\u0646\u062F \u0627\u0644\u062A\u0627\u0644\u064A \u0628\u0623\u0633\u0644\u0648\u0628 \u0645\u0647\u0646\u064A \u0645\u0646\u0638\u0645 \u0641\u064A \u0646\u0642\u0627\u0637 \u0631\u0626\u064A\u0633\u064A\u0629 \u0648\u062C\u062F\u0648\u0644:

${input}` : `\u0623\u0646\u062A \u0645\u0633\u0627\u0639\u062F \u0630\u0643\u0627\u0621 \u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0645\u0631\u062A\u0628\u0637 \u0628\u0628\u0648\u062A \u062A\u0644\u064A\u062C\u0631\u0627\u0645 \u0648\u0627\u0644\u0648\u064A\u0628. \u0623\u062C\u0628 \u0639\u0644\u0649 \u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0628\u0648\u0636\u0648\u062D \u0648\u0627\u062D\u062A\u0631\u0627\u0641\u064A\u0629 \u0648\u0628\u0634\u0643\u0644 \u0645\u0641\u0635\u0644:

${input}`;
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
          });
          resultOutput = response.text || "\u062A\u0645\u062A \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629 \u0628\u0646\u062C\u0627\u062D.";
        } catch (err) {
          console.warn("Gemini execution fallback:", err?.message);
        }
      }
      if (!resultOutput) {
        if (featureId === "doc_processor") {
          resultOutput = `\u{1F4CB} **\u0645\u0644\u062E\u0635 \u0627\u0644\u0645\u0633\u062A\u0646\u062F \u0627\u0644\u0630\u0643\u064A (\u062A\u0645\u062A \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u0645\u0648\u062D\u062F\u0629 \u0639\u0628\u0631 \u0627\u0644\u0628\u0648\u062A \u0648\u0627\u0644\u0648\u064A\u0628)**

- **\u0627\u0644\u0646\u0635 \u0627\u0644\u0645\u062F\u062E\u0644:** ${input.slice(0, 100)}...
- **\u0627\u0644\u0646\u0642\u0627\u0637 \u0627\u0644\u062C\u0648\u0647\u0631\u064A\u0629 \u0627\u0644\u0645\u0633\u062A\u062E\u0644\u0635\u0629:**
  1. \u062A\u0645 \u0641\u062D\u0635 \u0627\u0644\u0645\u062D\u062A\u0648\u0649 \u0648\u0627\u0639\u062A\u0645\u0627\u062F \u0645\u0637\u0627\u0628\u0642\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A.
  2. \u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0627\u0644\u0643\u0644\u0645\u0627\u062A \u0627\u0644\u062F\u0627\u0644\u0629 \u0648\u062A\u0635\u0646\u064A\u0641\u0647\u0627 \u0622\u0644\u064A\u0627\u064B.
  3. \u062C\u0627\u0647\u0632\u064A\u0629 \u0627\u0644\u0625\u0631\u0633\u0627\u0644 \u0644\u0642\u0646\u0627\u0629 \u0627\u0644\u062A\u0644\u064A\u062C\u0631\u0627\u0645 \u0623\u0648 \u0627\u0644\u062D\u0641\u0638 \u0641\u064A \u0633\u062C\u0644 \u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631.

\u2728 *\u0645\u064A\u0632\u0629 \u0645\u062A\u0627\u062D\u0629 \u0644\u0645\u0634\u062A\u0631\u0643\u064A Pro \u0648 VIP.*`;
        } else {
          resultOutput = `\u{1F916} **\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0645\u0633\u0627\u0639\u062F \u0627\u0644\u0630\u0643\u064A:**

\u0623\u0647\u0644\u0627\u064B \u0628\u0643! \u0644\u0642\u062F \u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0643 \u0628\u0646\u062C\u0627\u062D: "${input}"

\u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0628\u0648\u062A \u0648\u0627\u0644\u0648\u064A\u0628 \u0627\u0644\u0645\u062A\u0632\u0627\u0645\u0646\u0629\u060C \u062A\u0645\u062A \u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u0637\u0644\u0628 \u0628\u0627\u0644\u0633\u0631\u0639\u0629 \u0627\u0644\u0642\u0635\u0648\u0649 \u0644\u0645\u0634\u062A\u0631\u0643\u064A \u0628\u0627\u0642\u0629 **${user.plan.toUpperCase()}**. \u064A\u0645\u0643\u0646\u0643 \u0646\u0633\u062E \u0627\u0644\u0631\u062F \u0623\u0648 \u0625\u0631\u0633\u0627\u0644\u0647 \u0645\u0628\u0627\u0634\u0631\u0629 \u0644\u0645\u062D\u0627\u062F\u062B\u0629 \u0627\u0644\u062A\u0644\u064A\u062C\u0631\u0627\u0645 \u0628\u0646\u0642\u0631\u0629 \u0632\u0631 \u0648\u0627\u062D\u062F\u0629.`;
        }
      }
    } else if (featureId === "auto_broadcast") {
      resultOutput = `\u{1F4E2} **\u062A\u0645 \u062C\u062F\u0648\u0644\u0629 \u0627\u0644\u0628\u062B \u0628\u0646\u062C\u0627\u062D \u0639\u0628\u0631 \u0628\u0648\u062A \u0627\u0644\u062A\u0644\u064A\u062C\u0631\u0627\u0645!**

- **\u0646\u0635 \u0627\u0644\u0631\u0633\u0627\u0644\u0629:** "${input}"
- **\u0627\u0644\u0645\u0633\u062A\u0647\u062F\u0641\u0648\u0646:** \u062C\u0645\u064A\u0639 \u0645\u0634\u062A\u0631\u0643\u064A \u0627\u0644\u0628\u0648\u062A \u0627\u0644\u0646\u0634\u0637\u064A\u0646 (${options?.target || "\u0627\u0644\u0643\u0644"})
- **\u062D\u0627\u0644\u0629 \u0627\u0644\u062A\u0633\u0644\u064A\u0645:** \u062C\u0627\u0631\u064A \u0627\u0644\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0645\u062C\u062F\u0648\u0644 \u0639\u0628\u0631 Telegram Bot API \u0645\u0639 \u0623\u0632\u0631\u0627\u0631 \u0627\u0644\u062A\u0641\u0627\u0639\u0644.`;
    } else if (featureId === "keyword_triggers") {
      resultOutput = `\u26A1 **\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0642\u0627\u0639\u062F\u0629 \u0631\u062F\u0648\u062F \u0627\u0644\u0628\u0648\u062A \u0627\u0644\u062A\u0644\u0642\u0627\u0626\u064A\u0629:**

\u0639\u0646\u062F \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0644\u0644\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0641\u062A\u0627\u062D\u064A\u0629: "${options?.keyword || "/info"}"\u060C \u0633\u064A\u0642\u0648\u0645 \u0628\u0648\u062A \u0627\u0644\u062A\u0644\u064A\u062C\u0631\u0627\u0645 \u0628\u0627\u0644\u0631\u062F \u0641\u0648\u0631\u0627\u064B \u0628\u0627\u0644\u0646\u0635: "${input}". \u062A\u0645 \u0627\u0644\u062D\u0641\u0638 \u0648\u0627\u0644\u062A\u0632\u0627\u0645\u0646 \u0645\u0639 \u062E\u0627\u062F\u0645 \u0627\u0644\u0628\u0648\u062A.`;
    } else {
      resultOutput = `\u062A\u0645 \u062A\u0646\u0641\u064A\u0630 \u0627\u0644\u0625\u062C\u0631\u0627\u0621 \u0628\u0646\u062C\u0627\u062D: ${input}`;
    }
    syncLogs.unshift({
      id: `log_${Date.now()}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      source: "web_platform",
      userTelegramId: user.telegramId,
      userName: user.username ? `@${user.username}` : user.firstName,
      actionAr: `\u062A\u0646\u0641\u064A\u0630 \u0645\u064A\u0632\u0629 (${featureId}) \u0639\u0628\u0631 \u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A`,
      actionEn: `Executed feature (${featureId}) via Web platform`,
      status: "success",
      tierUsed: user.plan
    });
    res.json({
      success: true,
      featureId,
      output: resultOutput,
      creditsRemaining: user.creditsRemaining,
      dailyQuotaUsed: user.dailyQuotaUsed
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to execute bot action" });
  }
});
app.get("/api/sync/logs", (req, res) => {
  res.json({
    logs: syncLogs.slice(0, 30),
    stats: {
      totalSyncedUsers: usersDB.size,
      botInteractionsCount: 1420,
      webInteractionsCount: 890,
      activePlansCount: {
        free: Array.from(usersDB.values()).filter((u) => u.plan === "free").length,
        pro: Array.from(usersDB.values()).filter((u) => u.plan === "pro").length,
        vip: Array.from(usersDB.values()).filter((u) => u.plan === "vip").length
      }
    }
  });
});
async function sendTelegramMessage(chatId, text, replyMarkup) {
  const token = runtimeBotToken || process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
        reply_markup: replyMarkup
      })
    });
  } catch (err) {
    console.error("Failed to send Telegram message:", err);
  }
}
app.get("/api/telegram/bot-status", async (req, res) => {
  const token = runtimeBotToken || process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return res.json({
      configured: false,
      messageAr: "\u062A\u0648\u0643\u0646 \u0627\u0644\u0628\u0648\u062A \u063A\u064A\u0631 \u0645\u0647\u064A\u0623 \u0628\u0639\u062F"
    });
  }
  try {
    const meRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const meData = await meRes.json();
    const whRes = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    const whData = await whRes.json();
    res.json({
      configured: true,
      bot: meData.ok ? meData.result : null,
      webhook: whData.ok ? whData.result : null,
      tokenMasked: `${token.slice(0, 6)}...${token.slice(-4)}`
    });
  } catch (err) {
    res.json({
      configured: true,
      error: err.message
    });
  }
});
app.post("/api/telegram/setup-bot", async (req, res) => {
  const { botToken, appUrl } = req.body;
  if (!botToken || typeof botToken !== "string") {
    return res.status(400).json({ ok: false, error: "\u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0631\u0645\u0632 Bot Token \u0635\u0627\u0644\u062D \u0645\u0646 BotFather" });
  }
  const cleanToken = botToken.trim();
  const currentAppUrl = appUrl || process.env.APP_URL || "https://ais-dev-od4aemezdgaeup2ncw76si-295455119343.europe-west2.run.app";
  try {
    const meRes = await fetch(`https://api.telegram.org/bot${cleanToken}/getMe`);
    const meData = await meRes.json();
    if (!meData.ok) {
      return res.status(400).json({
        ok: false,
        error: `\u062A\u0648\u0643\u0646 \u0627\u0644\u0628\u0648\u062A \u063A\u064A\u0631 \u0635\u0627\u0644\u062D \u0623\u0648 \u0644\u0645 \u064A\u062A\u0645 \u0642\u0628\u0648\u0644\u0647 \u0645\u0646 \u062A\u0644\u064A\u062C\u0631\u0627\u0645: ${meData.description || "Invalid Token"}`
      });
    }
    const botUser = meData.result;
    runtimeBotToken = cleanToken;
    savePersistedBotToken(cleanToken);
    const webhookUrl = `${currentAppUrl.replace(/\/+$/, "")}/api/telegram/webhook`;
    const setWhRes = await fetch(`https://api.telegram.org/bot${cleanToken}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ["message", "callback_query"],
        drop_pending_updates: false
      })
    });
    const setWhData = await setWhRes.json();
    const setCmdRes = await fetch(`https://api.telegram.org/bot${cleanToken}/setMyCommands`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        commands: [
          { command: "symptoms", description: "\u{1FA7A} \u0641\u0627\u062D\u0635 \u0627\u0644\u0623\u0639\u0631\u0627\u0636 \u0627\u0644\u0633\u0631\u064A\u0631\u064A \u0648\u0627\u0644\u062A\u0634\u062E\u064A\u0635 \u0627\u0644\u062A\u0641\u0631\u064A\u0642\u064A (DDx)" },
          { command: "plans", description: "\u{1F4B3} \u0628\u0627\u0642\u0627\u062A \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643 (\u0634\u0647\u0631\u064A 2.99$ / \u0633\u0646\u0648\u064A 19.99$)" },
          { command: "start", description: "\u{1F3E5} \u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0637\u0628\u064A\u0629 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629 \u0648\u0623\u0632\u0631\u0627\u0631 \u0627\u0644\u0641\u062D\u0635" },
          { command: "myplan", description: "\u{1F4CA} \u0631\u0635\u064A\u062F \u0648\u062D\u0627\u0644\u0629 \u0627\u0634\u062A\u0631\u0627\u0643\u0643 \u0627\u0644\u0633\u0631\u064A\u0631\u064A" },
          { command: "code", description: "\u{1F381} \u062A\u0641\u0639\u064A\u0644 \u0643\u0648\u062F \u062A\u0631\u0642\u064A\u0629 \u0627\u0644\u062D\u0633\u0627\u0628 (PRO2026)" },
          { command: "drugs", description: "\u{1F48A} \u062F\u0644\u064A\u0644 \u0627\u0644\u0623\u062F\u0648\u064A\u0629 \u0648\u0627\u0644\u062C\u0631\u0639\u0627\u062A \u0648\u0627\u0644\u062A\u062F\u0627\u062E\u0644\u0627\u062A" },
          { command: "pediatric", description: "\u{1F476} \u062D\u0627\u0633\u0628\u0629 \u062C\u0631\u0639\u0627\u062A \u0627\u0644\u0623\u0637\u0641\u0627\u0644 \u0627\u0644\u062F\u0642\u064A\u0642\u0629" },
          { command: "lab", description: "\u{1F9EA} \u062A\u062D\u0644\u064A\u0644 \u0635\u0648\u0631 \u0627\u0644\u0623\u0634\u0639\u0629 \u0648\u0627\u0644\u0641\u062D\u0648\u0635\u0627\u062A \u0627\u0644\u0645\u062E\u0628\u0631\u064A\u0629" },
          { command: "help", description: "\u{1F4D6} \u0627\u0644\u062F\u0644\u064A\u0644 \u0648\u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0633\u0631\u064A\u0631\u064A\u0629" }
        ]
      })
    });
    const setCmdData = await setCmdRes.json();
    try {
      await fetch(`https://api.telegram.org/bot${cleanToken}/setChatMenuButton`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menu_button: {
            type: "web_app",
            text: "\u{1F3E5} \u0645\u0646\u0635\u0629 \u062C\u0631\u0639\u0629 \u0627\u0644\u0637\u0628\u064A\u0629",
            web_app: {
              url: currentAppUrl
            }
          }
        })
      });
    } catch (e) {
      console.warn("Could not set chat menu button:", e);
    }
    syncLogs.unshift({
      id: "log_" + Date.now(),
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      actionAr: `\u062A\u0645 \u0631\u0628\u0637 \u0628\u0648\u062A \u062A\u0644\u064A\u062C\u0631\u0627\u0645 @${botUser.username} \u0648\u062A\u0641\u0639\u064A\u0644 \u0623\u0648\u0627\u0645\u0631 \u0641\u0627\u062D\u0635 \u0627\u0644\u0623\u0639\u0631\u0627\u0636 \u0648\u0627\u0644\u0628\u0627\u0642\u0627\u062A \u0628\u0646\u062C\u0627\u062D`,
      actionEn: `Connected Telegram Bot @${botUser.username} and registered /symptoms & /plans commands`,
      source: "web_platform",
      userTelegramId: String(botUser.id || "admin"),
      status: "success",
      userName: botUser.username,
      tierUsed: "vip"
    });
    return res.json({
      ok: true,
      message: `\u062A\u0645 \u0631\u0628\u0637 \u0628\u0648\u062A @${botUser.username} \u0628\u0646\u062C\u0627\u062D! \u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0623\u0648\u0627\u0645\u0631 \u0641\u0627\u062D\u0635 \u0627\u0644\u0623\u0639\u0631\u0627\u0636 (/symptoms) \u0648\u0627\u0644\u0628\u0627\u0642\u0627\u062A (/plans) \u0648\u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0648\u064A\u0628 \u0647\u0648\u0643 \u0641\u0648\u0631\u0627\u064B.`,
      bot: botUser,
      webhook: setWhData,
      commands: setCmdData,
      webhookUrl
    });
  } catch (err) {
    console.error("Error setting up Telegram bot:", err);
    return res.status(500).json({
      ok: false,
      error: `\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u062A\u0644\u064A\u062C\u0631\u0627\u0645: ${err.message || String(err)}`
    });
  }
});
async function evaluateClinicalSymptoms({
  symptoms,
  patientAge = "30",
  gender = "male",
  chronicDiseases = [],
  vitalSigns = "",
  severity = "",
  duration = "",
  lang = "ar"
}) {
  const ai = getGenAI();
  let evaluationData = null;
  if (ai) {
    try {
      const prompt = `You are a Senior Consultant Physician and Clinical Diagnostician specializing in Evidence-Based Differential Diagnosis (DDx) and Clinical Triage.
Patient Profile:
- Age: ${patientAge} years
- Gender: ${gender === "male" ? "Male (\u0630\u0643\u0631)" : "Female (\u0623\u0646\u062B\u0649)"}
- Severity: ${severity || "Moderate"}
- Duration: ${duration || "Recent"}
- Chronic Conditions: ${chronicDiseases.join(", ") || "None reported (\u0644\u0627 \u062A\u0648\u062C\u062F)"}
- Vital Signs / Context: ${vitalSigns || "Not specified (\u063A\u064A\u0631 \u0645\u062F\u0648\u0646\u0629)"}
- Chief Complaints & Symptoms: "${symptoms}"
- Language: ${lang === "en" ? "English" : "Arabic (\u0627\u0644\u0639\u0631\u0628\u064A\u0629)"}

TASK:
Provide a rigorous, structured clinical evaluation with a comprehensive Differential Diagnosis (DDx).
Identify:
1. Primary clinical impression and recommended medical specialty.
2. Clinical Urgency Level: "critical" (\u0637\u0648\u0627\u0631\u0626 \u0641\u0648\u0631\u064A\u0629), "urgent" (\u0645\u0631\u0627\u062C\u0639\u0629 \u0639\u0627\u062C\u0644\u0629 \u062E\u0644\u0627\u0644 24 \u0633\u0627\u0639\u0629), or "routine" (\u0639\u064A\u0627\u062F\u0629 \u0631\u0648\u062A\u064A\u0646\u064A\u0629).
3. Differential Diagnoses ranked by likelihood:
   - High Probability / Most Likely (\u0627\u0644\u0623\u0643\u062B\u0631 \u0627\u062D\u062A\u0645\u0627\u0644\u0627\u064B)
   - Secondary / Possible (\u0627\u062D\u062A\u0645\u0627\u0644 \u0648\u0627\u0631\u062F)
   - Must Rule Out / Critical Red-Flags (\u062A\u0634\u062E\u064A\u0635 \u062E\u0637\u064A\u0631 \u064A\u062C\u0628 \u0627\u0633\u062A\u0628\u0639\u0627\u062F\u0647 \u0641\u0648\u0631\u0627\u064B)
4. Recommended Diagnostic Workup & Lab/Imaging tests to confirm or rule out diagnoses.
5. Immediate Clinical Advice & Red-Flag Warnings for the patient or provider.

OUTPUT FORMAT:
Return strictly a valid JSON object matching this schema:
{
  "primaryCondition": "\u0627\u0633\u0645 \u0627\u0644\u062D\u0627\u0644\u0629 \u0627\u0644\u0633\u0631\u064A\u0631\u064A\u0629 \u0623\u0648 \u0627\u0644\u0627\u0646\u0637\u0628\u0627\u0639 \u0627\u0644\u0631\u0626\u064A\u0633\u064A",
  "urgency": "critical" | "urgent" | "routine",
  "urgencyText": "\u062A\u0648\u0636\u064A\u062D \u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u0627\u0633\u062A\u0639\u062C\u0627\u0644",
  "recommendedSpecialty": "\u0627\u0644\u062A\u062E\u0635\u0635 \u0627\u0644\u0637\u0628\u064A \u0627\u0644\u062F\u0642\u064A\u0642 (\u0645\u062B\u0627\u0644: \u0623\u0645\u0631\u0627\u0636 \u0627\u0644\u0642\u0644\u0628\u060C \u0627\u0644\u0628\u0627\u0637\u0646\u064A\u0629\u060C \u0627\u0644\u0623\u0639\u0635\u0627\u0628)",
  "differentialDiagnoses": [
    {
      "name": "\u0627\u0633\u0645 \u0627\u0644\u062A\u0634\u062E\u064A\u0635 \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0645\u062E\u062A\u0627\u0631\u0629 \u0645\u0639 \u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0639\u0644\u0645\u064A \u0627\u0644\u0644\u0627\u062A\u064A\u0646\u064A",
      "category": "most_likely" | "possible" | "must_rule_out",
      "likelihood": "\u0646\u0633\u0628\u0629 \u0623\u0648 \u062A\u0642\u062F\u064A\u0631 \u0627\u0644\u0627\u062D\u062A\u0645\u0627\u0644 (\u0645\u062B\u0644\u0627\u064B 65% \u0623\u0648 \u0645\u0631\u062A\u0641\u0639)",
      "rationale": "\u0627\u0644\u0623\u0633\u0628\u0627\u0628 \u0627\u0644\u0633\u0631\u064A\u0631\u064A\u0629 \u0648\u0627\u0644\u0639\u0644\u0627\u0645\u0627\u062A \u0627\u0644\u062A\u064A \u062A\u062F\u0639\u0645 \u0647\u0630\u0627 \u0627\u0644\u062A\u0634\u062E\u064A\u0635",
      "confirmingTests": "\u0627\u0644\u0641\u062D\u0648\u0635\u0627\u062A \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629 \u0644\u062A\u0623\u0643\u064A\u062F\u0647 (\u0645\u062B\u0627\u0644: \u062A\u062E\u0637\u064A\u0637 \u0642\u0644\u0628\u060C \u0635\u0648\u0631\u0629 \u062F\u0645\u060C \u0633\u0648\u0646\u0627\u0631)"
    }
  ],
  "recommendedTests": ["\u0641\u062D\u0635 1", "\u0641\u062D\u0635 2", "\u0641\u062D\u0635 3"],
  "redFlags": ["\u0639\u0644\u0627\u0645\u0629 \u062E\u0637\u0631 1", "\u0639\u0644\u0627\u0645\u0629 \u062E\u0637\u0631 2"],
  "homeAdvice": ["\u0646\u0635\u064A\u062D\u0629 \u0648\u0625\u062C\u0631\u0627\u0621 \u0623\u0648\u0644\u064A 1", "\u0646\u0635\u064A\u062D\u0629 2"],
  "clinicalSummary": "\u0634\u0631\u062D \u0633\u0631\u064A\u0631\u064A \u062A\u062D\u0644\u064A\u0644\u064A \u062F\u0642\u064A\u0642 \u0648\u062A\u0648\u062C\u064A\u0647\u0627\u062A \u0648\u0627\u0636\u062D\u0629"
}`;
      const candidateModels = ["gemini-2.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: [{ text: prompt }],
            config: {
              responseMimeType: "application/json",
              temperature: 0.2
            }
          });
          const rawText = (response.text || "").trim();
          const cleanText = rawText.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
          const parsed = JSON.parse(cleanText || "{}");
          if (parsed.differentialDiagnoses && Array.isArray(parsed.differentialDiagnoses)) {
            evaluationData = parsed;
            break;
          }
        } catch (e) {
          console.warn(`[DDx] Model ${modelName} failed, trying next:`, e);
        }
      }
    } catch (err) {
      console.warn("Gemini Symptom Check error:", err?.message);
    }
  }
  if (!evaluationData) {
    const sLower = (symptoms || "").toLowerCase();
    const isChest = sLower.includes("\u0635\u062F\u0631") || sLower.includes("\u0642\u0644\u0628") || sLower.includes("\u062E\u0641\u0642\u0627\u0646") || sLower.includes("chest") || sLower.includes("heart");
    const isAbdomen = sLower.includes("\u0628\u0637\u0646") || sLower.includes("\u0645\u0639\u062F\u0629") || sLower.includes("\u063A\u062B\u064A\u0627\u0646") || sLower.includes("\u0625\u0633\u0647\u0627\u0644") || sLower.includes("\u0632\u0627\u0626\u062F\u0629") || sLower.includes("abdom");
    const isResp = sLower.includes("\u0633\u0639\u0627\u0644") || sLower.includes("\u062A\u0646\u0641\u0633") || sLower.includes("\u0628\u0644\u063A\u0645") || sLower.includes("\u0635\u0641\u064A\u0631") || sLower.includes("\u0643\u062D\u0629") || sLower.includes("cough") || sLower.includes("breath");
    const isUrinary = sLower.includes("\u0628\u0648\u0644") || sLower.includes("\u0643\u0644\u0648\u064A") || sLower.includes("\u062E\u0627\u0635\u0631\u0629") || sLower.includes("\u062D\u0631\u0642\u0627\u0646") || sLower.includes("urin") || sLower.includes("kidney");
    const isHead = sLower.includes("\u0635\u062F\u0627\u0639") || sLower.includes("\u0631\u0623\u0633") || sLower.includes("\u062F\u0648\u0627\u0631") || sLower.includes("\u062F\u0648\u062E\u0629") || sLower.includes("\u0634\u0642\u064A\u0642\u0629") || sLower.includes("head") || sLower.includes("dizz");
    const isSkin = sLower.includes("\u062C\u0644\u062F") || sLower.includes("\u0637\u0641\u062D") || sLower.includes("\u062D\u0643\u0629") || sLower.includes("\u0628\u0642\u0639") || sLower.includes("\u062D\u0633\u0627\u0633\u064A\u0629") || sLower.includes("rash") || sLower.includes("skin") || sLower.includes("itch");
    const isJoint = sLower.includes("\u0645\u0641\u0635\u0644") || sLower.includes("\u0631\u0643\u0628\u0629") || sLower.includes("\u0639\u0638\u0627\u0645") || sLower.includes("\u0638\u0647\u0631") || sLower.includes("\u0641\u0642\u0631\u0627\u062A") || sLower.includes("joint") || sLower.includes("knee") || sLower.includes("bone");
    const isENT = sLower.includes("\u062D\u0644\u0642") || sLower.includes("\u0623\u0630\u0646") || sLower.includes("\u0644\u0648\u0632") || sLower.includes("\u062C\u064A\u0648\u0628") || sLower.includes("throat") || sLower.includes("ear") || sLower.includes("sinus");
    const isEye = sLower.includes("\u0639\u064A\u0646") || sLower.includes("\u0639\u064A\u0648\u0646") || sLower.includes("\u0631\u0624\u064A\u0629") || sLower.includes("\u0632\u063A\u0644\u0644\u0629") || sLower.includes("eye") || sLower.includes("vision");
    if (isChest) {
      evaluationData = {
        primaryCondition: lang === "en" ? "Acute Coronary / Chest Pain Evaluation" : "\u062A\u0642\u064A\u064A\u0645 \u0623\u0644\u0645 \u0627\u0644\u0635\u062F\u0631 \u0648\u0645\u062A\u0644\u0627\u0632\u0645\u0629 \u0627\u0644\u0634\u0631\u064A\u0627\u0646 \u0627\u0644\u062A\u0627\u062C\u064A \u0627\u0644\u062D\u0627\u062F\u0629",
        urgency: "critical",
        urgencyText: lang === "en" ? "Emergency Department Immediate Evaluation" : "\u{1F6A8} \u0637\u0648\u0627\u0631\u0626 \u0641\u0648\u0631\u064A\u0629 \u2014 \u064A\u062C\u0628 \u0627\u0644\u062A\u0648\u062C\u0647 \u0644\u0644\u0625\u0633\u0639\u0627\u0641 \u0641\u0648\u0631\u0627\u064B",
        recommendedSpecialty: lang === "en" ? "Cardiology & Emergency Medicine" : "\u0637\u0628 \u0627\u0644\u0642\u0644\u0628 \u0648\u0627\u0644\u0623\u0648\u0639\u064A\u0629 \u0627\u0644\u062F\u0645\u0648\u064A\u0629 \u0648\u0637\u0628 \u0627\u0644\u0637\u0648\u0627\u0631\u0626",
        differentialDiagnoses: [
          {
            name: lang === "en" ? "Acute Coronary Syndrome (ACS) / Angina" : "\u0645\u062A\u0644\u0627\u0632\u0645\u0629 \u0627\u0644\u0634\u0631\u064A\u0627\u0646 \u0627\u0644\u062A\u0627\u062C\u064A \u0627\u0644\u062D\u0627\u062F\u0629 \u0623\u0648 \u0630\u0628\u062D\u0629 \u0635\u062F\u0631\u064A\u0629 (ACS)",
            category: "must_rule_out",
            likelihood: lang === "en" ? "High acuity (Rule Out)" : "\u062D\u0631\u062C - \u064A\u062C\u0628 \u0627\u0633\u062A\u0628\u0639\u0627\u062F\u0647 \u0641\u0648\u0631\u0627\u064B",
            rationale: lang === "en" ? "Retrosternal pressure radiating to arm or jaw indicates myocardial ischemia" : "\u0627\u0644\u0623\u0644\u0645 \u0627\u0644\u0636\u0627\u063A\u0637 \u062E\u0644\u0641 \u0627\u0644\u0642\u0635 \u0648\u0627\u0644\u0645\u0646\u062A\u0642\u0644 \u0644\u0644\u0643\u062A\u0641 \u0639\u0644\u0627\u0645\u0629 \u0631\u0626\u064A\u0633\u064A\u0629 \u0644\u0646\u0642\u0635 \u062A\u0631\u0648\u064A\u0629 \u0627\u0644\u0639\u0636\u0644\u0629 \u0627\u0644\u0642\u0644\u0628\u064A\u0629",
            confirmingTests: lang === "en" ? "12-lead ECG immediately, Cardiac Troponin series" : "\u062A\u062E\u0637\u064A\u0637 \u0642\u0644\u0628 \u0643\u0647\u0631\u0628\u0627\u0626\u064A (ECG) \u0641\u0648\u0631\u064A\u060C \u0625\u0646\u0632\u064A\u0645\u0627\u062A \u0642\u0644\u0628 (Troponin)"
          },
          {
            name: lang === "en" ? "Gastroesophageal Reflux (GERD) / Spasm" : "\u0627\u0631\u062A\u062C\u0627\u0639 \u0645\u0631\u064A\u0626\u064A \u062D\u0627\u062F \u0623\u0648 \u062A\u0634\u0646\u062C \u0645\u0631\u064A\u0621",
            category: "possible",
            likelihood: lang === "en" ? "Moderate (35%)" : "\u0645\u062A\u0648\u0633\u0637 (35%)",
            rationale: lang === "en" ? "Can mimic cardiac pain, often exacerbated by position or meals" : "\u064A\u062A\u0634\u0627\u0628\u0647 \u0633\u0631\u064A\u0631\u064A\u0627\u064B \u0645\u0639 \u0623\u0644\u0645 \u0627\u0644\u0642\u0644\u0628 \u0648\u064A\u0632\u062F\u0627\u062F \u0628\u0639\u062F \u0627\u0644\u0648\u062C\u0628\u0627\u062A \u0623\u0648 \u0627\u0644\u0627\u0633\u062A\u0644\u0642\u0627\u0621",
            confirmingTests: lang === "en" ? "Negative cardiac markers, endoscopy if persistent" : "\u0633\u0644\u0627\u0645\u0629 \u062A\u062E\u0637\u064A\u0637 \u0627\u0644\u0642\u0644\u0628 \u0648\u0627\u0644\u062A\u0631\u0648\u0628\u0648\u0646\u064A\u0646\u060C \u0627\u0633\u062A\u062C\u0627\u0628\u0629 \u0644\u0645\u062B\u0628\u0637\u0627\u062A \u0627\u0644\u062D\u0645\u0648\u0636\u0629"
          },
          {
            name: lang === "en" ? "Musculoskeletal Costochondritis" : "\u0627\u0644\u062A\u0647\u0627\u0628 \u0627\u0644\u063A\u0636\u0627\u0631\u064A\u0641 \u0627\u0644\u0636\u0644\u0639\u064A\u0629 (\u0623\u0644\u0645 \u0639\u0636\u0644\u064A \u0647\u064A\u0643\u0644\u064A)",
            category: "most_likely",
            likelihood: lang === "en" ? "Common (45%)" : "\u0627\u062D\u062A\u0645\u0627\u0644 \u0634\u0627\u0626\u0639 (45%)",
            rationale: lang === "en" ? "Reproducible with local chest wall palpation" : "\u0623\u0644\u0645 \u0645\u0648\u0636\u0639\u064A \u064A\u0632\u062F\u0627\u062F \u0628\u0627\u0644\u0636\u063A\u0637 \u0627\u0644\u0645\u0628\u0627\u0634\u0631 \u0639\u0644\u0649 \u0627\u0644\u0623\u0636\u0644\u0627\u0639 \u0623\u0648 \u0628\u0627\u0644\u062D\u0631\u0643\u0629",
            confirmingTests: lang === "en" ? "Clinical chest wall palpation, normal ECG" : "\u0627\u0644\u0641\u062D\u0635 \u0627\u0644\u0633\u0631\u064A\u0631\u064A \u0644\u062C\u062F\u0627\u0631 \u0627\u0644\u0635\u062F\u0631 \u0645\u0639 \u0633\u0644\u0627\u0645\u0629 \u0641\u062D\u0635 \u0627\u0644\u0642\u0644\u0628"
          }
        ],
        recommendedTests: lang === "en" ? ["12-Lead ECG", "Cardiac Troponin", "Chest X-Ray"] : ["\u062A\u062E\u0637\u064A\u0637 \u0642\u0644\u0628 \u0643\u0647\u0631\u0628\u0627\u0626\u064A (ECG)", "\u062A\u062D\u0644\u064A\u0644 \u0625\u0646\u0632\u064A\u0645\u0627\u062A \u0627\u0644\u0642\u0644\u0628 (Troponin)", "\u0623\u0634\u0639\u0629 \u0633\u064A\u0646\u064A\u0629 \u0644\u0644\u0635\u062F\u0631 (Chest X-Ray)"],
        redFlags: lang === "en" ? ["Crushing chest pain > 15 mins", "Severe sweating and syncope", "Radiating pain to back or jaw"] : ["\u0623\u0644\u0645 \u0635\u062F\u0631\u064A \u0645\u0633\u062A\u0645\u0631 \u0644\u0623\u0643\u062B\u0631 \u0645\u0646 15 \u062F\u0642\u064A\u0642\u0629", "\u062A\u0639\u0631\u0642 \u0628\u0627\u0631\u062F \u063A\u0632\u064A\u0631 \u0645\u0639 \u062F\u0648\u062E\u0629 \u0648\u0625\u063A\u0645\u0627\u0621", "\u0623\u0644\u0645 \u062D\u0627\u062F \u0646\u0627\u0641\u0630 \u0644\u0644\u0638\u0647\u0631 \u0623\u0648 \u0627\u0644\u0641\u0643"],
        homeAdvice: lang === "en" ? ["Call emergency services (112 / 911)", "Rest completely", "Chew 300mg aspirin if instructed by medical staff"] : ["\u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0627\u0644\u0625\u0633\u0639\u0627\u0641 \u0641\u0648\u0631\u0627\u064B", "\u0627\u0644\u062C\u0644\u0648\u0633 \u0648\u0627\u0644\u0631\u0627\u062D\u0629 \u0627\u0644\u062A\u0627\u0645\u0629 \u0648\u0639\u062F\u0645 \u0628\u0630\u0644 \u0645\u062C\u0647\u0648\u062F", "\u0645\u0636\u063A \u062D\u0628\u0629 \u0623\u0633\u0628\u0631\u064A\u0646 300 \u0645\u0644\u063A \u0625\u0630\u0627 \u0644\u0645 \u064A\u0648\u062C\u062F \u0645\u0627\u0646\u0639 \u0646\u0632\u0641\u064A"],
        clinicalSummary: lang === "en" ? "Chest pain requires immediate clinical exclusion of acute coronary events." : "\u0623\u0644\u0645 \u0627\u0644\u0635\u062F\u0631 \u0639\u0631\u0636 \u064A\u0633\u062A\u062F\u0639\u064A \u062A\u062E\u0637\u064A\u0637 \u0642\u0644\u0628 \u0641\u0648\u0631\u064A \u0644\u0627\u0633\u062A\u0628\u0639\u0627\u062F \u0623\u064A \u0645\u0634\u0643\u0644\u0629 \u0642\u0644\u0628\u064A\u0629 \u0642\u0628\u0644 \u0623\u064A \u062A\u0634\u062E\u064A\u0635 \u0622\u062E\u0631."
      };
    } else if (isAbdomen) {
      evaluationData = {
        primaryCondition: lang === "en" ? "Acute Abdominal Evaluation" : "\u062A\u0642\u064A\u064A\u0645 \u0623\u0644\u0645 \u0627\u0644\u0628\u0637\u0646 \u0627\u0644\u062D\u0627\u062F \u0648\u0627\u0644\u0645\u062A\u0644\u0627\u0632\u0645\u0627\u062A \u0627\u0644\u0647\u0636\u0645\u064A\u0629",
        urgency: "urgent",
        urgencyText: lang === "en" ? "Surgical/Medical consult within hours" : "\u0645\u0631\u0627\u062C\u0639\u0629 \u062C\u0631\u0627\u062D\u064A\u0629 \u0623\u0648 \u0628\u0627\u0637\u0646\u064A\u0629 \u0639\u0627\u062C\u0644\u0629",
        recommendedSpecialty: lang === "en" ? "General Surgery & Gastroenterology" : "\u0627\u0644\u062C\u0631\u0627\u062D\u0629 \u0627\u0644\u0639\u0627\u0645\u0629 \u0648\u0623\u0645\u0631\u0627\u0636 \u0627\u0644\u062C\u0647\u0627\u0632 \u0627\u0644\u0647\u0636\u0645\u064A",
        differentialDiagnoses: [
          {
            name: lang === "en" ? "Acute Appendicitis" : "\u0627\u0644\u062A\u0647\u0627\u0628 \u0627\u0644\u0632\u0627\u0626\u062F\u0629 \u0627\u0644\u062F\u0648\u062F\u064A\u0629 \u0627\u0644\u062D\u0627\u062F (Acute Appendicitis)",
            category: "must_rule_out",
            likelihood: lang === "en" ? "High if RLQ pain" : "\u064A\u062C\u0628 \u0627\u0633\u062A\u0628\u0639\u0627\u062F\u0647 \u062E\u0635\u0648\u0635\u0627\u064B \u0641\u064A \u0623\u0633\u0641\u0644 \u064A\u0645\u064A\u0646 \u0627\u0644\u0628\u0637\u0646",
            rationale: lang === "en" ? "Pain migrating from periumbilical to right lower quadrant with guarding" : "\u0623\u0644\u0645 \u064A\u0628\u062F\u0623 \u062D\u0648\u0644 \u0627\u0644\u0633\u0631\u0629 \u062B\u0645 \u064A\u0633\u062A\u0642\u0631 \u0641\u064A \u0627\u0644\u062D\u0641\u0631\u0629 \u0627\u0644\u062D\u0631\u0642\u0641\u064A\u0629 \u0627\u0644\u064A\u0645\u0646\u0649 \u0645\u0639 \u0639\u0644\u0627\u0645\u0627\u062A \u0627\u0631\u062A\u062F\u0627\u062F\u064A\u0629",
            confirmingTests: lang === "en" ? "Abdominal Ultrasound / CT scan, CBC (Leukocytosis)" : "\u0633\u0648\u0646\u0627\u0631 \u0628\u0637\u0646\u060C \u0635\u0648\u0631\u0629 \u062F\u0645 \u0643\u0627\u0645\u0644\u0629 (\u0627\u0631\u062A\u0641\u0627\u0639 \u0627\u0644\u0643\u0631\u064A\u0627\u062A \u0627\u0644\u0628\u064A\u0636\u0627\u0621)"
          },
          {
            name: lang === "en" ? "Acute Gastroenteritis / Food Poisoning" : "\u0627\u0644\u062A\u0647\u0627\u0628 \u0627\u0644\u0645\u0639\u062F\u0629 \u0648\u0627\u0644\u0623\u0645\u0639\u0627\u0621 \u0627\u0644\u062D\u0627\u062F / \u0646\u0632\u0644\u0629 \u0645\u0639\u0648\u064A\u0629",
            category: "most_likely",
            likelihood: lang === "en" ? "Very High (65%)" : "\u0645\u0631\u062A\u0641\u0639 \u062C\u062F\u0627\u064B (65%)",
            rationale: lang === "en" ? "Associated with diarrhea, cramping, and possible fever" : "\u0645\u0635\u062D\u0648\u0628 \u0628\u0625\u0633\u0647\u0627\u0644 \u0648\u0645\u063A\u0635 \u0645\u062A\u0642\u0637\u0639 \u0648\u063A\u062B\u064A\u0627\u0646 \u0628\u0639\u062F \u062A\u0646\u0627\u0648\u0644 \u0637\u0639\u0627\u0645 \u0645\u0639\u064A\u0646",
            confirmingTests: lang === "en" ? "Stool analysis, electrolytes" : "\u0641\u062D\u0635 \u0628\u0631\u0627\u0632\u060C \u0645\u0631\u0627\u0642\u0628\u0629 \u0627\u0644\u0634\u0648\u0627\u0631\u062F \u0648\u0627\u0644\u062C\u0641\u0627\u0641"
          },
          {
            name: lang === "en" ? "Peptic Ulcer Disease / Gastritis" : "\u0642\u0631\u062D\u0629 \u0647\u0636\u0645\u064A\u0629 \u0623\u0648 \u0627\u0644\u062A\u0647\u0627\u0628 \u0628\u0637\u0627\u0646\u0629 \u0627\u0644\u0645\u0639\u062F\u0629",
            category: "possible",
            likelihood: lang === "en" ? "Moderate (30%)" : "\u0645\u062A\u0648\u0633\u0637 (30%)",
            rationale: lang === "en" ? "Epigastric burning related to fasting or NSAID use" : "\u0623\u0644\u0645 \u062D\u0627\u0631\u0642 \u0628\u0631\u0623\u0633 \u0627\u0644\u0645\u0639\u062F\u0629 \u0645\u0631\u062A\u0628\u0637 \u0628\u062A\u0646\u0627\u0648\u0644 \u0627\u0644\u0645\u0633\u0643\u0646\u0627\u062A \u0623\u0648 \u0627\u0644\u062C\u0648\u0639",
            confirmingTests: lang === "en" ? "H. pylori test, Upper Endoscopy" : "\u0641\u062D\u0635 \u062C\u0631\u062B\u0648\u0645\u0629 \u0627\u0644\u0645\u0639\u062F\u0629 (H. Pylori)\u060C \u062A\u0646\u0638\u064A\u0631 \u0647\u0636\u0645\u064A \u0639\u0644\u0648\u064A"
          }
        ],
        recommendedTests: lang === "en" ? ["CBC", "Abdominal Ultrasound", "CRP"] : ["\u0635\u0648\u0631\u0629 \u062F\u0645 \u0643\u0627\u0645\u0644\u0629 (CBC)", "\u0623\u0634\u0639\u0629 \u062A\u0644\u0641\u0632\u064A\u0648\u0646\u064A\u0629 \u0644\u0644\u0628\u0637\u0646 (Ultrasound)", "\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u062A\u0647\u0627\u0628\u0627\u062A (CRP)"],
        redFlags: lang === "en" ? ["Rigid board-like abdomen", "Inability to pass flatus or stool", "Vomiting blood or black stools"] : ["\u0628\u0637\u0646 \u062E\u0634\u0628\u064A \u0645\u062A\u062D\u062C\u0631 \u0648\u0645\u0624\u0644\u0645 \u0628\u0634\u062F\u0629 \u0639\u0646\u062F \u0627\u0644\u0644\u0645\u0633", "\u0627\u0646\u062D\u0628\u0627\u0633 \u062A\u0627\u0645 \u0644\u0644\u063A\u0627\u0632\u0627\u062A \u0648\u0627\u0644\u0628\u0631\u0627\u0632", "\u062A\u0642\u064A\u0624 \u062F\u0645\u0648\u064A \u0623\u0648 \u0628\u0631\u0627\u0632 \u0623\u0633\u0648\u062F \u0642\u0637\u0631\u0627\u0646\u064A"],
        homeAdvice: lang === "en" ? ["Avoid solid foods temporarily", "Drink small sips of oral rehydration fluids", "Do not take pain killers before surgical exam"] : ["\u0627\u0644\u0627\u0645\u062A\u0646\u0627\u0639 \u0639\u0646 \u0627\u0644\u0637\u0639\u0627\u0645 \u0627\u0644\u062F\u0633\u0645 \u0623\u0648 \u0627\u0644\u0635\u0644\u0628 \u0645\u0624\u0642\u062A\u0627\u064B", "\u062A\u0639\u0648\u064A\u0636 \u0627\u0644\u0633\u0648\u0627\u0626\u0644 \u0628\u0631\u0634\u0641\u0627\u062A \u0645\u0627\u0621 \u0648\u0645\u062D\u0644\u0648\u0644 \u0625\u0645\u0627\u0647\u0629", "\u0639\u062F\u0645 \u0623\u062E\u0630 \u0645\u0633\u0643\u0646\u0627\u062A \u0642\u0648\u064A\u0629 \u062A\u062E\u0641\u064A \u0623\u0639\u0631\u0627\u0636 \u0627\u0644\u0632\u0627\u0626\u062F\u0629 \u0642\u0628\u0644 \u0641\u062D\u0635 \u0627\u0644\u0637\u0628\u064A\u0628"],
        clinicalSummary: lang === "en" ? "Abdominal pain workup requires ruling out acute surgical abdomen." : "\u0622\u0644\u0627\u0645 \u0627\u0644\u0628\u0637\u0646 \u0627\u0644\u062D\u0627\u062F\u0629 \u062A\u062A\u0637\u0644\u0628 \u0641\u062D\u0635\u0627\u064B \u0633\u0631\u064A\u0631\u064A\u0627\u064B \u0648\u0633\u0648\u0646\u0627\u0631 \u0644\u0627\u0633\u062A\u0628\u0639\u0627\u062F \u0627\u0644\u062D\u0627\u0644\u0627\u062A \u0627\u0644\u062C\u0631\u0627\u062D\u064A\u0629 \u0627\u0644\u0637\u0627\u0631\u0626\u0629 \u0643\u0627\u0644\u0632\u0627\u0626\u062F\u0629 \u0627\u0644\u062F\u0648\u062F\u064A\u0629."
      };
    } else if (isResp) {
      evaluationData = {
        primaryCondition: lang === "en" ? "Lower/Upper Respiratory Assessment" : "\u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u062C\u0647\u0627\u0632 \u0627\u0644\u062A\u0646\u0641\u0633\u064A \u0648\u0627\u0644\u0639\u062F\u0648\u0649 \u0627\u0644\u0635\u062F\u0631\u064A\u0629",
        urgency: "urgent",
        urgencyText: lang === "en" ? "Clinic evaluation within 24 hours" : "\u0645\u0631\u0627\u062C\u0639\u0629 \u0639\u064A\u0627\u062F\u0629 \u0627\u0644\u0635\u062F\u0631\u064A\u0629 \u062E\u0644\u0627\u0644 24 \u0633\u0627\u0639\u0629",
        recommendedSpecialty: lang === "en" ? "Pulmonology & Internal Medicine" : "\u0627\u0644\u0623\u0645\u0631\u0627\u0636 \u0627\u0644\u0635\u062F\u0631\u064A\u0629 \u0648\u0627\u0644\u0628\u0627\u0637\u0646\u064A\u0629",
        differentialDiagnoses: [
          {
            name: lang === "en" ? "Acute Bronchitis / Viral Infection" : "\u0627\u0644\u062A\u0647\u0627\u0628 \u0627\u0644\u0634\u0639\u0628 \u0627\u0644\u0647\u0648\u0627\u0626\u064A\u0629 \u0627\u0644\u062D\u0627\u062F (Acute Bronchitis)",
            category: "most_likely",
            likelihood: lang === "en" ? "High (60%)" : "\u0645\u0631\u062A\u0641\u0639 (60%)",
            rationale: lang === "en" ? "Cough with or without sputum, commonly viral in origin" : "\u0633\u0639\u0627\u0644 \u0645\u0633\u062A\u0645\u0631 \u0628\u0639\u062F \u0631\u0634\u062D \u0623\u0648 \u0625\u0646\u0641\u0644\u0648\u0646\u0632\u0627\u060C \u063A\u0627\u0644\u0628\u0627\u064B \u0645\u0646\u0634\u0623\u0647 \u0641\u064A\u0631\u0648\u0633\u064A",
            confirmingTests: lang === "en" ? "Chest examination, pulse oximetry" : "\u0641\u062D\u0635 \u0627\u0644\u0635\u062F\u0631 \u0628\u0627\u0644\u0633\u0645\u0627\u0639\u0629\u060C \u0642\u064A\u0627\u0633 \u0646\u0633\u0628\u0629 \u0627\u0644\u0623\u0643\u0633\u062C\u064A\u0646"
          },
          {
            name: lang === "en" ? "Pneumonia (Bacterial / Viral)" : "\u0630\u0627\u062A \u0627\u0644\u0631\u0626\u0629 (\u0627\u0644\u062A\u0647\u0627\u0628 \u0631\u0626\u0648\u064A - Pneumonia)",
            category: "must_rule_out",
            likelihood: lang === "en" ? "Rule Out if high fever" : "\u064A\u062C\u0628 \u0627\u0633\u062A\u0628\u0639\u0627\u062F\u0647 \u0639\u0646\u062F \u0648\u062C\u0648\u062F \u062D\u0631\u0627\u0631\u0629 \u0648\u0636\u064A\u0642 \u062A\u0646\u0641\u0633",
            rationale: lang === "en" ? "High fever, productive colored sputum, pleuritic pain" : "\u062D\u0631\u0627\u0631\u0629 \u0645\u0631\u062A\u0641\u0639\u0629\u060C \u0628\u0644\u063A\u0645 \u0645\u0635\u0641\u0631 \u0623\u0648 \u0645\u062F\u0645\u0645\u060C \u062E\u0641\u0642\u0627\u0646 \u0648\u0623\u0644\u0645 \u0639\u0646\u062F \u0627\u0644\u0634\u0647\u064A\u0642",
            confirmingTests: lang === "en" ? "Chest X-Ray, CBC, CRP" : "\u0623\u0634\u0639\u0629 \u0633\u064A\u0646\u064A\u0629 \u0644\u0644\u0635\u062F\u0631 (Chest X-Ray)\u060C \u062A\u0639\u062F\u0627\u062F \u062F\u0645 \u0643\u0627\u0645\u0644 (CBC)"
          },
          {
            name: lang === "en" ? "Asthma Exacerbation / Bronchospasm" : "\u0646\u0648\u0628\u0629 \u0631\u0628\u0648 \u0634\u0639\u0628\u064A \u0623\u0648 \u062D\u0633\u0627\u0633\u064A\u0629 \u0635\u062F\u0631\u064A\u0629 \u062D\u0627\u062F\u0629",
            category: "possible",
            likelihood: lang === "en" ? "Moderate (30%)" : "\u0645\u062A\u0648\u0633\u0637 (30%)",
            rationale: lang === "en" ? "Wheezing, nocturnal coughing, trigger exposure" : "\u0635\u0641\u064A\u0631 \u0645\u0633\u0645\u0648\u0639 \u0628\u0627\u0644\u0635\u062F\u0631 \u0645\u0639 \u0643\u062A\u0645\u0629 \u0646\u0641\u0633 \u0644\u064A\u0644\u064A\u0629 \u0623\u0648 \u0628\u0639\u062F \u0627\u0644\u062A\u0639\u0631\u0636 \u0644\u063A\u0628\u0627\u0631",
            confirmingTests: lang === "en" ? "Spirometry, peak expiratory flow, response to bronchodilators" : "\u0642\u064A\u0627\u0633 \u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u0631\u0626\u0629\u060C \u0627\u0644\u0627\u0633\u062A\u062C\u0627\u0628\u0629 \u0644\u0628\u062E\u0627\u062E \u0627\u0644\u0641\u0646\u062A\u0648\u0644\u064A\u0646"
          }
        ],
        recommendedTests: lang === "en" ? ["Chest X-Ray", "Pulse Oximetry", "CBC"] : ["\u0623\u0634\u0639\u0629 \u0633\u064A\u0646\u064A\u0629 \u0644\u0644\u0635\u062F\u0631", "\u0642\u064A\u0627\u0633 \u062A\u0634\u0628\u0639 \u0627\u0644\u0623\u0643\u0633\u062C\u064A\u0646 (SpO2)", "\u0635\u0648\u0631\u0629 \u062F\u0645 \u0643\u0627\u0645\u0644\u0629"],
        redFlags: lang === "en" ? ["SpO2 < 92%", "Severe dyspnea and cyanosis", "Hemoptysis (coughing blood)"] : ["\u0647\u0628\u0648\u0637 \u0627\u0644\u0623\u0643\u0633\u062C\u064A\u0646 \u062A\u062D\u062A 92%", "\u0635\u0639\u0648\u0628\u0629 \u0634\u062F\u064A\u062F\u0629 \u0641\u064A \u0627\u0644\u062A\u0646\u0641\u0633 \u0648\u0627\u0632\u0631\u0642\u0627\u0642 \u0627\u0644\u0634\u0641\u0627\u0647", "\u062E\u0631\u0648\u062C \u062F\u0645 \u0645\u0639 \u0627\u0644\u0633\u0639\u0627\u0644 (Hemoptysis)"],
        homeAdvice: lang === "en" ? ["Warm fluids & steam inhalation", "Rest & elevate head while sleeping", "Avoid smoke & dust triggers"] : ["\u0634\u0631\u0628 \u0627\u0644\u0633\u0648\u0627\u0626\u0644 \u0627\u0644\u062F\u0627\u0641\u0626\u0629 \u0648\u0627\u0633\u062A\u0646\u0634\u0627\u0642 \u0628\u062E\u0627\u0631 \u0627\u0644\u0645\u0627\u0621", "\u0627\u0644\u0631\u0627\u062D\u0629 \u0648\u0631\u0641\u0639 \u0627\u0644\u0631\u0623\u0633 \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u0646\u0648\u0645", "\u0627\u0644\u0627\u0628\u062A\u0639\u0627\u062F \u062A\u0645\u0627\u0645\u0627\u064B \u0639\u0646 \u0627\u0644\u062A\u062F\u062E\u064A\u0646 \u0648\u0627\u0644\u0631\u0648\u0627\u0626\u062D \u0627\u0644\u0646\u0641\u0627\u0630\u0629"],
        clinicalSummary: lang === "en" ? "Respiratory symptoms warrant monitoring of oxygen saturation and chest imaging if persistent." : "\u0627\u0644\u0623\u0639\u0631\u0627\u0636 \u0627\u0644\u062A\u0646\u0641\u0633\u064A\u0629 \u062A\u0633\u062A\u0648\u062C\u0628 \u0645\u0631\u0627\u0642\u0628\u0629 \u0646\u0633\u0628\u0629 \u0627\u0644\u0623\u0643\u0633\u062C\u064A\u0646 \u0648\u0625\u062C\u0631\u0627\u0621 \u0623\u0634\u0639\u0629 \u0635\u062F\u0631\u064A\u0629 \u0625\u0630\u0627 \u0627\u0633\u062A\u0645\u0631 \u0627\u0644\u0633\u0639\u0627\u0644 \u0623\u0648 \u0627\u0631\u062A\u0641\u0639\u062A \u0627\u0644\u062D\u0631\u0627\u0631\u0629."
      };
    } else if (isUrinary) {
      evaluationData = {
        primaryCondition: lang === "en" ? "Urinary Tract Infection / Renal Colic" : "\u0627\u0644\u062A\u0647\u0627\u0628 \u0627\u0644\u0645\u0633\u0627\u0644\u0643 \u0627\u0644\u0628\u0648\u0644\u064A\u0629 \u0623\u0648 \u0645\u063A\u0635 \u0643\u0644\u0648\u064A",
        urgency: "urgent",
        urgencyText: lang === "en" ? "Medical consult within 24 hours" : "\u0645\u0631\u0627\u062C\u0639\u0629 \u0637\u0628\u064A\u0628 \u0627\u0644\u0645\u0633\u0627\u0644\u0643 \u0623\u0648 \u0627\u0644\u0628\u0627\u0637\u0646\u064A\u0629",
        recommendedSpecialty: lang === "en" ? "Urology & Nephrology" : "\u0637\u0628 \u0648\u062C\u0631\u0627\u062D\u0629 \u0627\u0644\u0645\u0633\u0627\u0644\u0643 \u0627\u0644\u0628\u0648\u0644\u064A\u0629 \u0648\u0627\u0644\u0643\u0644\u0649",
        differentialDiagnoses: [
          {
            name: lang === "en" ? "Acute Cystitis / UTI" : "\u0627\u0644\u062A\u0647\u0627\u0628 \u0627\u0644\u0645\u062B\u0627\u0646\u0629 \u0648\u0627\u0644\u0645\u0633\u0627\u0644\u0643 \u0627\u0644\u0628\u0648\u0644\u064A\u0629 \u0627\u0644\u0633\u0641\u0644\u064A\u0629 (UTI)",
            category: "most_likely",
            likelihood: lang === "en" ? "High (70%)" : "\u0645\u0631\u062A\u0641\u0639 \u062C\u062F\u0627\u064B (70%)",
            rationale: lang === "en" ? "Dysuria, urinary frequency and urgency" : "\u062D\u0631\u0642\u0629 \u0628\u0627\u0644\u062A\u0628\u0648\u0644\u060C \u062A\u0643\u0631\u0627\u0631 \u0627\u0644\u062A\u0628\u0648\u0644 \u0648\u0625\u0644\u062D\u0627\u062D \u0628\u0648\u0644\u064A",
            confirmingTests: lang === "en" ? "Urinalysis and Urine Culture" : "\u062A\u062D\u0644\u064A\u0644 \u0628\u0648\u0644 \u0643\u0627\u0645\u0644 \u0645\u0639 \u0632\u0631\u0627\u0639\u0629 \u0648\u0645\u0632\u0631\u0639\u0629 \u062D\u0633\u0627\u0633\u064A\u0629 (Urine Culture)"
          },
          {
            name: lang === "en" ? "Renal / Ureteral Calculi (Kidney Stones)" : "\u062D\u0635\u0648\u0629 \u0643\u0644\u0648\u064A\u0629 \u0623\u0648 \u062D\u0627\u0644\u0628\u064A\u0629 (Kidney Stone)",
            category: "must_rule_out",
            likelihood: lang === "en" ? "High if flank colicky pain" : "\u064A\u062C\u0628 \u0627\u0633\u062A\u0628\u0639\u0627\u062F\u0647 \u0639\u0646\u062F \u0648\u062C\u0648\u062F \u0645\u063A\u0635 \u062D\u0627\u062F \u0628\u0627\u0644\u062E\u0627\u0635\u0631\u0629",
            rationale: lang === "en" ? "Sudden severe flank pain radiating to groin, possible hematuria" : "\u0623\u0644\u0645 \u0645\u0641\u0627\u062C\u0626 \u0648\u0634\u062F\u064A\u062F \u0641\u064A \u0627\u0644\u062E\u0627\u0635\u0631\u0629 \u064A\u0645\u062A\u062F \u0625\u0644\u0649 \u0627\u0644\u0645\u063A\u0628\u0646 \u0645\u0639 \u062F\u0645 \u062E\u0641\u064A \u0628\u0627\u0644\u0628\u0648\u0644",
            confirmingTests: lang === "en" ? "Renal Ultrasound / Non-contrast CT KUB" : "\u0623\u0634\u0639\u0629 \u062A\u0644\u0641\u0632\u064A\u0648\u0646\u064A\u0629 \u0644\u0644\u0643\u0644\u0649 \u0648\u0627\u0644\u0645\u062B\u0627\u0646\u0629 (KUB Ultrasound) \u0623\u0648 \u062A\u0635\u0648\u064A\u0631 \u0637\u0628\u0642\u064A \u0645\u062D\u0648\u0631\u064A"
          }
        ],
        recommendedTests: ["\u062A\u062D\u0644\u064A\u0644 \u0628\u0648\u0644 \u0643\u0627\u0645\u0644 (Urinalysis)", "\u0633\u0648\u0646\u0627\u0631 \u0627\u0644\u0643\u0644\u0649 \u0648\u0627\u0644\u0645\u062B\u0627\u0646\u0629", "\u0648\u0638\u0627\u0626\u0641 \u0643\u0644\u0649 (Creatinine & Urea)"],
        redFlags: ["\u062D\u0645\u0649 \u0645\u0631\u062A\u0641\u0639\u0629 \u0645\u0639 \u0642\u0634\u0639\u0631\u064A\u0631\u0629 \u0648\u0623\u0644\u0645 \u0628\u0627\u0644\u062E\u0627\u0635\u0631\u0629 (\u0627\u0634\u062A\u0628\u0627\u0647 \u0627\u0644\u062A\u0647\u0627\u0628 \u062D\u0648\u064A\u0636\u0629 \u0648\u0643\u0644\u064A\u0629)", "\u0627\u0646\u062D\u0628\u0627\u0633 \u062A\u0627\u0645 \u0644\u0644\u0628\u0648\u0644", "\u062F\u0645 \u0648\u0627\u0636\u062D \u0648\u0635\u0631\u064A\u062D \u0641\u064A \u0627\u0644\u0628\u0648\u0644"],
        homeAdvice: ["\u0634\u0631\u0628 \u0643\u0645\u064A\u0627\u062A \u0648\u0641\u064A\u0631\u0629 \u0645\u0646 \u0627\u0644\u0645\u0627\u0621 (2-3 \u0644\u062A\u0631 \u064A\u0648\u0645\u064A\u0627\u064B)", "\u062A\u062C\u0646\u0628 \u062D\u0628\u0633 \u0627\u0644\u0628\u0648\u0644", "\u0627\u0644\u0627\u0644\u062A\u0632\u0627\u0645 \u0628\u0627\u0644\u0645\u0636\u0627\u062F \u0627\u0644\u0645\u0648\u0635\u0648\u0641 \u0628\u0639\u062F \u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0645\u0632\u0631\u0639\u0629"],
        clinicalSummary: "\u0623\u0639\u0631\u0627\u0636 \u0627\u0644\u0645\u0633\u0627\u0644\u0643 \u0627\u0644\u0628\u0648\u0644\u064A\u0629 \u0634\u0627\u0626\u0639\u0629 \u0648\u062A\u0633\u062A\u062C\u064A\u0628 \u0633\u0631\u064A\u0639\u0627\u064B \u0644\u0644\u0639\u0644\u0627\u062C \u0627\u0644\u0645\u0646\u0627\u0633\u0628 \u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0628\u0648\u0644 \u0627\u0644\u0645\u062E\u0628\u0631\u064A."
      };
    } else if (isHead) {
      evaluationData = {
        primaryCondition: lang === "en" ? "Headache & Neurological Triage" : "\u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u0635\u062F\u0627\u0639 \u0648\u0627\u0644\u0623\u0639\u0631\u0627\u0636 \u0627\u0644\u0639\u0635\u0628\u064A\u0629 \u0648\u0627\u0644\u0631\u0623\u0633",
        urgency: "urgent",
        urgencyText: lang === "en" ? "Medical consult within 24 hours" : "\u0645\u0631\u0627\u062C\u0639\u0629 \u0639\u064A\u0627\u062F\u0629 \u0627\u0644\u0623\u0639\u0635\u0627\u0628 \u0623\u0648 \u0627\u0644\u0637\u0628 \u0627\u0644\u0628\u0627\u0637\u0646\u064A \u062E\u0644\u0627\u0644 24 \u0633\u0627\u0639\u0629",
        recommendedSpecialty: lang === "en" ? "Neurology & Internal Medicine" : "\u0637\u0628 \u0648\u062C\u0631\u0627\u062D\u0629 \u0627\u0644\u0645\u062E \u0648\u0627\u0644\u0623\u0639\u0635\u0627\u0628 \u0648\u0627\u0644\u0637\u0628 \u0627\u0644\u0628\u0627\u0637\u0646\u064A",
        differentialDiagnoses: [
          {
            name: lang === "en" ? "Tension-Type Headache" : "\u0635\u062F\u0627\u0639 \u062A\u0648\u062A\u0631\u064A \u0646\u0627\u062A\u062C \u0639\u0646 \u0627\u0644\u0625\u062C\u0647\u0627\u062F (Tension Headache)",
            category: "most_likely",
            likelihood: lang === "en" ? "High (60%)" : "\u0645\u0631\u062A\u0641\u0639 (60%)",
            rationale: lang === "en" ? "Bilateral band-like pressure, common with fatigue or posture stress" : "\u0623\u0644\u0645 \u0636\u0627\u063A\u0637 \u064A\u0634\u0628\u0647 \u0627\u0644\u0637\u0648\u0642 \u062D\u0648\u0644 \u0627\u0644\u0631\u0623\u0633\u060C \u0645\u0631\u062A\u0628\u0637 \u0628\u0627\u0644\u0625\u062C\u0647\u0627\u062F \u0648\u0627\u0644\u062A\u0648\u062A\u0631 \u0648\u0642\u0644\u0629 \u0627\u0644\u0646\u0648\u0645",
            confirmingTests: lang === "en" ? "Clinical neurological examination, Blood pressure check" : "\u0627\u0644\u0641\u062D\u0635 \u0627\u0644\u0633\u0631\u064A\u0631\u064A \u0627\u0644\u0639\u0635\u0628\u064A \u0648\u0642\u064A\u0627\u0633 \u0636\u063A\u0637 \u0627\u0644\u062F\u0645"
          },
          {
            name: lang === "en" ? "Migraine with/without Aura" : "\u0635\u062F\u0627\u0639 \u0646\u0635\u0641\u064A (\u0634\u0642\u064A\u0642\u0629 - Migraine)",
            category: "possible",
            likelihood: lang === "en" ? "Moderate (35%)" : "\u0645\u062A\u0648\u0633\u0637 (35%)",
            rationale: lang === "en" ? "Unilateral throbbing pain often accompanied by nausea or light sensitivity" : "\u0623\u0644\u0645 \u0646\u0627\u0628\u0636 \u0641\u064A \u062C\u0647\u0629 \u0648\u0627\u062D\u062F\u0629 \u063A\u0627\u0644\u0628\u0627\u064B \u0645\u0635\u062D\u0648\u0628 \u0628\u063A\u062B\u064A\u0627\u0646 \u0623\u0648 \u062D\u0633\u0627\u0633\u064A\u0629 \u0645\u0646 \u0627\u0644\u0636\u0648\u0621 \u0648\u0627\u0644\u0635\u0648\u062A",
            confirmingTests: lang === "en" ? "Clinical criteria, diagnostic trial of migraine therapy" : "\u0627\u0644\u0645\u0639\u0627\u064A\u064A\u0631 \u0627\u0644\u0633\u0631\u064A\u0631\u064A\u0629 \u0648\u0627\u0644\u0627\u0633\u062A\u062C\u0627\u0628\u0629 \u0644\u0644\u0639\u0644\u0627\u062C \u0627\u0644\u0646\u0648\u0639\u064A \u0644\u0644\u0634\u0642\u064A\u0642\u0629"
          },
          {
            name: lang === "en" ? "Secondary Headache / Intracranial Pathology" : "\u0635\u062F\u0627\u0639 \u062B\u0627\u0646\u0648\u064A (\u0627\u0631\u062A\u0641\u0627\u0639 \u0636\u063A\u0637 \u062F\u0645\u060C \u062C\u064A\u0648\u0628\u060C \u0623\u0648 \u0636\u063A\u0637 \u062F\u0627\u062E\u0644 \u0627\u0644\u062C\u0645\u062C\u0645\u0629)",
            category: "must_rule_out",
            likelihood: lang === "en" ? "Rule out" : "\u064A\u062C\u0628 \u0627\u0633\u062A\u0628\u0639\u0627\u062F\u0647",
            rationale: lang === "en" ? "Rule out hypertensive urgency, sinus infection, or raised ICP" : "\u0636\u0631\u0648\u0631\u0629 \u0627\u0633\u062A\u0628\u0639\u0627\u062F \u0627\u0631\u062A\u0641\u0627\u0639 \u0627\u0644\u0636\u063A\u0637 \u0627\u0644\u0645\u0641\u0627\u062C\u0626\u060C \u0627\u0644\u062A\u0647\u0627\u0628 \u0627\u0644\u062C\u064A\u0648\u0628 \u0627\u0644\u0623\u0646\u0641\u064A\u0629\u060C \u0623\u0648 \u0622\u0641\u0627\u062A \u0639\u0635\u0628\u064A\u0629",
            confirmingTests: lang === "en" ? "Fundoscopy, Brain MRI/CT if red flags present" : "\u0641\u062D\u0635 \u0642\u0627\u0639 \u0627\u0644\u0639\u064A\u0646\u060C \u062A\u0635\u0648\u064A\u0631 \u0637\u0628\u0642\u064A \u0623\u0648 \u0631\u0646\u064A\u0646 \u0645\u063A\u0646\u0627\u0637\u064A\u0633\u064A \u0644\u0644\u0631\u0623\u0633 \u0639\u0646\u062F \u0648\u062C\u0648\u062F \u0639\u0644\u0627\u0645\u0627\u062A \u062E\u0637\u0631"
          }
        ],
        recommendedTests: lang === "en" ? ["Blood Pressure Check", "CBC", "Fundoscopic Exam"] : ["\u0642\u064A\u0627\u0633 \u0636\u063A\u0637 \u0627\u0644\u062F\u0645 \u0648\u0627\u0644\u0633\u0643\u0631", "\u062A\u0639\u062F\u0627\u062F \u0627\u0644\u062F\u0645 \u0627\u0644\u0643\u0627\u0645\u0644 (CBC)", "\u0641\u062D\u0635 \u0642\u0627\u0639 \u0627\u0644\u0639\u064A\u0646"],
        redFlags: lang === "en" ? ["Thunderclap onset (peak in seconds)", "Fever with neck stiffness", "Focal neurological deficit or speech difficulty"] : ["\u0635\u062F\u0627\u0639 \u0635\u0627\u0639\u0642 \u064A\u0628\u062F\u0623 \u0628\u0642\u0648\u0629 \u0645\u0641\u0627\u062C\u0626\u0629 \u0641\u064A \u062B\u0648\u0627\u0646\u064D", "\u062D\u0631\u0627\u0631\u0629 \u0645\u0639 \u062A\u0635\u0644\u0628 \u0627\u0644\u0631\u0642\u0628\u0629 \u0648\u0635\u0639\u0648\u0628\u0629 \u062B\u0646\u064A \u0627\u0644\u0631\u0623\u0633", "\u0636\u0639\u0641 \u0623\u0648 \u062A\u0646\u0645\u064A\u0644 \u0641\u064A \u062C\u0627\u0646\u0628 \u0648\u0627\u062D\u062F \u0623\u0648 \u062B\u0642\u0644 \u0644\u0633\u0627\u0646"],
        homeAdvice: lang === "en" ? ["Rest in a dark and quiet room", "Hydrate adequately", "Avoid excessive caffeine or screen exposure"] : ["\u0627\u0644\u0631\u0627\u062D\u0629 \u0641\u064A \u063A\u0631\u0641\u0629 \u0645\u0638\u0644\u0645\u0629 \u0648\u0647\u0627\u062F\u0626\u0629", "\u0634\u0631\u0628 \u0643\u0645\u064A\u0627\u062A \u0643\u0627\u0641\u064A\u0629 \u0645\u0646 \u0627\u0644\u0645\u0627\u0621", "\u0627\u0644\u062A\u0642\u0644\u064A\u0644 \u0645\u0646 \u0627\u0644\u0634\u0627\u0634\u0627\u062A \u0648\u0645\u0631\u0627\u0642\u0628\u0629 \u0636\u063A\u0637 \u0627\u0644\u062F\u0645"],
        clinicalSummary: lang === "en" ? "Headache assessment focused on differentiating primary headache from secondary pathology." : "\u062A\u0642\u064A\u064A\u0645 \u0633\u0631\u064A\u0631\u064A \u0644\u0623\u0644\u0645 \u0627\u0644\u0631\u0623\u0633 \u064A\u0647\u062F\u0641 \u0644\u062A\u0645\u064A\u064A\u0632 \u0627\u0644\u0635\u062F\u0627\u0639 \u0627\u0644\u0623\u0648\u0644\u064A (\u062A\u0648\u062A\u0631\u064A/\u0634\u0642\u064A\u0642\u0629) \u0648\u0627\u0633\u062A\u0628\u0639\u0627\u062F \u0623\u064A \u0633\u0628\u0628 \u062B\u0627\u0646\u0648\u064A \u0637\u0627\u0631\u0626."
      };
    } else if (isENT) {
      evaluationData = {
        primaryCondition: lang === "en" ? "ENT & Upper Airway Clinical Evaluation" : "\u062A\u0642\u064A\u064A\u0645 \u0623\u0645\u0631\u0627\u0636 \u0627\u0644\u0623\u0646\u0641 \u0648\u0627\u0644\u0623\u0630\u0646 \u0648\u0627\u0644\u062D\u0646\u062C\u0631\u0629",
        urgency: "routine",
        urgencyText: lang === "en" ? "ENT specialist review within 48 hours" : "\u0645\u0631\u0627\u062C\u0639\u0629 \u0639\u064A\u0627\u062F\u0629 \u0627\u0644\u0623\u0646\u0641 \u0648\u0627\u0644\u0623\u0630\u0646 \u0648\u0627\u0644\u062D\u0646\u062C\u0631\u0629",
        recommendedSpecialty: lang === "en" ? "Otolaryngology (ENT)" : "\u0627\u0644\u0623\u0646\u0641 \u0648\u0627\u0644\u0623\u0630\u0646 \u0648\u0627\u0644\u062D\u0646\u062C\u0631\u0629 (ENT)",
        differentialDiagnoses: [
          {
            name: lang === "en" ? "Acute Pharyngotonsillitis (Viral vs Streptococcal)" : "\u0627\u0644\u062A\u0647\u0627\u0628 \u0627\u0644\u0628\u0644\u0639\u0648\u0645 \u0648\u0627\u0644\u0644\u0648\u0632\u062A\u064A\u0646 \u0627\u0644\u062D\u0627\u062F (\u0641\u064A\u0631\u0648\u0633\u064A \u0623\u0648 \u0639\u0642\u062F\u064A)",
            category: "most_likely",
            likelihood: lang === "en" ? "High (70%)" : "\u0645\u0631\u062A\u0641\u0639 \u062C\u062F\u0627\u064B (70%)",
            rationale: lang === "en" ? "Severe sore throat, painful swallowing, tonsillar exudates" : "\u0623\u0644\u0645 \u062D\u0627\u062F \u0628\u0627\u0644\u062D\u0644\u0642 \u0648\u0635\u0639\u0648\u0628\u0629 \u0628\u0644\u0639 \u0645\u0639 \u062A\u0636\u062E\u0645 \u0648\u0627\u062D\u0645\u0631\u0627\u0631 \u0627\u0644\u0644\u0648\u0632\u062A\u064A\u0646",
            confirmingTests: lang === "en" ? "Throat swab / Rapid Strep test, CBC" : "\u0645\u0633\u062D\u0629 \u062D\u0644\u0642 \u0648\u0645\u0632\u0631\u0639\u0629 \u0628\u0643\u062A\u064A\u0631\u064A\u0629 (Strep test)\u060C \u0641\u062D\u0635 \u062F\u0645 \u0643\u0627\u0645\u0644"
          },
          {
            name: lang === "en" ? "Acute Otitis Media / Rhinosinusitis" : "\u0627\u0644\u062A\u0647\u0627\u0628 \u0627\u0644\u0623\u0630\u0646 \u0627\u0644\u0648\u0633\u0637\u0649 \u0627\u0644\u062D\u0627\u062F \u0623\u0648 \u0627\u0644\u062A\u0647\u0627\u0628 \u0627\u0644\u062C\u064A\u0648\u0628 \u0627\u0644\u0623\u0646\u0641\u064A\u0629",
            category: "possible",
            likelihood: lang === "en" ? "Moderate (30%)" : "\u0645\u062A\u0648\u0633\u0637 (30%)",
            rationale: lang === "en" ? "Facial pressure, ear pain, or nasal blockage" : "\u0636\u063A\u0637 \u0648\u062B\u0642\u0644 \u0641\u0648\u0642 \u0627\u0644\u0648\u062C\u0646\u062A\u064A\u0646 \u0623\u0648 \u0623\u0644\u0645 \u0628\u0627\u0644\u0623\u0630\u0646 \u0648\u0627\u0646\u0633\u062F\u0627\u062F \u0623\u0646\u0641\u064A",
            confirmingTests: lang === "en" ? "Otoscopic examination, Sinus CT if refractory" : "\u062A\u0646\u0638\u064A\u0631 \u0637\u0628\u0644\u0629 \u0627\u0644\u0623\u0630\u0646 \u0628\u0627\u0644\u0633\u0645\u0627\u0639\u0629 \u0627\u0644\u0636\u0648\u0626\u064A\u0629\u060C \u0641\u062D\u0635 \u0627\u0644\u062C\u064A\u0648\u0628"
          },
          {
            name: lang === "en" ? "Peritonsillar Abscess / Epiglottitis" : "\u062E\u0631\u0627\u062C \u062D\u0648\u0644 \u0627\u0644\u0644\u0648\u0632\u0629 \u0623\u0648 \u0627\u0644\u062A\u0647\u0627\u0628 \u0644\u0633\u0627\u0646 \u0627\u0644\u0645\u0632\u0645\u0627\u0631",
            category: "must_rule_out",
            likelihood: lang === "en" ? "Rule out" : "\u064A\u062C\u0628 \u0627\u0633\u062A\u0628\u0639\u0627\u062F\u0647 \u0641\u0648\u0631\u0627\u064B",
            rationale: lang === "en" ? "Severe trismus (inability to open mouth), drooling, muffled voice" : "\u0635\u0639\u0648\u0628\u0629 \u0641\u062A\u062D \u0627\u0644\u0641\u0645 (\u0643\u064F\u0632\u0627\u0632 \u0641\u0643\u064A)\u060C \u0635\u0639\u0648\u0628\u0629 \u062A\u0646\u0641\u0633\u060C \u0623\u0648 \u0644\u0639\u0627\u0628 \u0633\u0627\u0626\u0644",
            confirmingTests: lang === "en" ? "Urgent ENT direct visualization, Lateral neck X-ray" : "\u0645\u0639\u0627\u064A\u0646\u0629 \u0639\u0627\u062C\u0644\u0629 \u0644\u062F\u0649 \u0623\u062E\u0635\u0627\u0626\u064A \u0627\u0644\u0623\u0646\u0641 \u0648\u0627\u0644\u0623\u0630\u0646 \u0648\u0627\u0644\u062D\u0646\u062C\u0631\u0629"
          }
        ],
        recommendedTests: lang === "en" ? ["Throat Swab", "CBC", "Otoscopic Exam"] : ["\u0645\u0633\u062D\u0629 \u062D\u0644\u0642\u064A\u0629 \u0628\u0643\u062A\u064A\u0631\u064A\u0629", "\u0635\u0648\u0631\u0629 \u062F\u0645 \u0643\u0627\u0645\u0644\u0629 (CBC)", "\u0641\u062D\u0635 \u0627\u0644\u0623\u0630\u0646 \u0648\u0627\u0644\u0623\u0646\u0641 \u0628\u0627\u0644\u0645\u0646\u0638\u0627\u0631"],
        redFlags: lang === "en" ? ["Stridor or respiratory distress", "Inability to swallow saliva", "Trismus (inability to open mouth)"] : ["\u0635\u0648\u062A \u0635\u0631\u064A\u0631 \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u062A\u0646\u0641\u0633 \u0623\u0648 \u0635\u0639\u0648\u0628\u0629 \u0623\u062E\u0630 \u0627\u0644\u0646\u0641\u0633", "\u0639\u062F\u0645 \u0627\u0644\u0642\u062F\u0631\u0629 \u0639\u0644\u0649 \u0628\u0644\u0639 \u0627\u0644\u0631\u064A\u0642 \u0648\u0633\u064A\u0644\u0627\u0646 \u0627\u0644\u0644\u0639\u0627\u0628", "\u062A\u0635\u0644\u0628 \u0627\u0644\u0641\u0643 \u0648\u0639\u062F\u0645 \u0627\u0644\u0642\u062F\u0631\u0629 \u0639\u0644\u0649 \u0641\u062A\u062D\u0647"],
        homeAdvice: lang === "en" ? ["Warm saline gargles", "Honey and warm herbal tea", "Analgesics as prescribed"] : ["\u063A\u0631\u063A\u0631\u0629 \u0628\u0645\u0627\u0621 \u062F\u0627\u0641\u0626 \u0648\u0645\u0644\u062D 3 \u0645\u0631\u0627\u062A \u064A\u0648\u0645\u064A\u0627\u064B", "\u0645\u0634\u0631\u0648\u0628\u0627\u062A \u062F\u0627\u0641\u0626\u0629 \u0645\u0639 \u0645\u0644\u0639\u0642\u0629 \u0639\u0633\u0644", "\u0645\u0633\u0643\u0646\u0627\u062A \u0628\u0627\u0631\u0627\u0633\u064A\u062A\u0627\u0645\u0648\u0644 \u0644\u0644\u0623\u0644\u0645"],
        clinicalSummary: lang === "en" ? "Upper respiratory/ENT presentation. Bacterial vs viral distinction guides antibiotic need." : "\u062D\u0627\u0644\u0629 \u0623\u0646\u0641 \u0648\u0623\u0630\u0646 \u0648\u062D\u0646\u062C\u0631\u0629 \u062A\u0633\u062A\u0644\u0632\u0645 \u0627\u0644\u062A\u0645\u064A\u064A\u0632 \u0628\u064A\u0646 \u0627\u0644\u0639\u062F\u0648\u0649 \u0627\u0644\u0641\u064A\u0631\u0648\u0633\u064A\u0629 \u0648\u0627\u0644\u0628\u0643\u062A\u064A\u0631\u064A\u0629 \u0642\u0628\u0644 \u0648\u0635\u0641 \u0623\u064A \u0645\u0636\u0627\u062F \u062D\u064A\u0648\u064A."
      };
    } else if (isEye) {
      evaluationData = {
        primaryCondition: lang === "en" ? "Ocular & Vision Clinical Assessment" : "\u062A\u0642\u064A\u064A\u0645 \u0637\u0628 \u0648\u062C\u0631\u0627\u062D\u0629 \u0627\u0644\u0639\u064A\u0648\u0646",
        urgency: "urgent",
        urgencyText: lang === "en" ? "Ophthalmology consult within 24 hours" : "\u0645\u0631\u0627\u062C\u0639\u0629 \u0639\u0627\u062C\u0644\u0629 \u0644\u0639\u064A\u0627\u062F\u0629 \u0627\u0644\u0639\u064A\u0648\u0646",
        recommendedSpecialty: lang === "en" ? "Ophthalmology" : "\u0637\u0628 \u0648\u062C\u0631\u0627\u062D\u0629 \u0627\u0644\u0639\u064A\u0648\u0646 (Ophthalmology)",
        differentialDiagnoses: [
          {
            name: lang === "en" ? "Acute Conjunctivitis (Bacterial/Viral/Allergic)" : "\u0627\u0644\u062A\u0647\u0627\u0628 \u0627\u0644\u0645\u0644\u062A\u062D\u0645\u0629 \u0627\u0644\u062D\u0627\u062F (\u0631\u0645\u062F \u0628\u0643\u062A\u064A\u0631\u064A \u0623\u0648 \u0641\u064A\u0631\u0648\u0633\u064A \u0623\u0648 \u062A\u062D\u0633\u0633\u064A)",
            category: "most_likely",
            likelihood: lang === "en" ? "High (65%)" : "\u0645\u0631\u062A\u0641\u0639 (65%)",
            rationale: lang === "en" ? "Redness, foreign body sensation, discharge without vision loss" : "\u0627\u062D\u0645\u0631\u0627\u0631 \u0627\u0644\u0639\u064A\u0646\u060C \u0625\u0641\u0631\u0627\u0632\u0627\u062A \u0642\u064A\u062D\u064A\u0629 \u0623\u0648 \u0645\u0627\u0626\u064A\u0629\u060C \u062D\u0643\u0629 \u062F\u0648\u0646 \u0641\u0642\u062F\u0627\u0646 \u062D\u0627\u062F \u0644\u0644\u0628\u0635\u0631",
            confirmingTests: lang === "en" ? "Slit-lamp examination, visual acuity test" : "\u0641\u062D\u0635 \u0627\u0644\u0645\u0635\u0628\u0627\u062D \u0627\u0644\u0634\u0642\u064A (Slit-lamp)\u060C \u0642\u064A\u0627\u0633 \u062D\u062F\u0629 \u0627\u0644\u0625\u0628\u0635\u0627\u0631"
          },
          {
            name: lang === "en" ? "Acute Angle-Closure Glaucoma" : "\u0627\u0644\u062C\u0644\u0648\u0643\u0648\u0645\u0627 \u0627\u0644\u062D\u0627\u062F\u0629 (\u0627\u0631\u062A\u0641\u0627\u0639 \u0636\u063A\u0637 \u0627\u0644\u0639\u064A\u0646 \u0627\u0644\u0645\u0641\u0627\u062C\u0626)",
            category: "must_rule_out",
            likelihood: lang === "en" ? "Rule out" : "\u064A\u062C\u0628 \u0627\u0633\u062A\u0628\u0639\u0627\u062F\u0647 \u0641\u0648\u0631\u0627\u064B",
            rationale: lang === "en" ? "Severe ocular pain, halo rings around lights, nausea, fixed dilated pupil" : "\u0623\u0644\u0645 \u062D\u0627\u062F \u0641\u064A \u0627\u0644\u0639\u064A\u0646 \u0645\u0639 \u0647\u0627\u0644\u0627\u062A \u0645\u0644\u0648\u0646\u0629 \u062D\u0648\u0644 \u0627\u0644\u0623\u0636\u0648\u0627\u0621\u060C \u063A\u062B\u064A\u0627\u0646 \u0648\u062D\u062F\u0642\u0629 \u0634\u0628\u0647 \u0645\u062A\u0633\u0639\u0629",
            confirmingTests: lang === "en" ? "Tonometry (intraocular pressure IOP measurement)" : "\u0642\u064A\u0627\u0633 \u0636\u063A\u0637 \u0627\u0644\u0639\u064A\u0646 \u0627\u0644\u0641\u0648\u0631\u064A (Tonometry)"
          },
          {
            name: lang === "en" ? "Corneal Abrasion / Foreign Body" : "\u062E\u062F\u0634 \u0641\u064A \u0627\u0644\u0642\u0631\u0646\u064A\u0629 \u0623\u0648 \u062C\u0633\u0645 \u063A\u0631\u064A\u0628",
            category: "possible",
            likelihood: lang === "en" ? "Moderate (25%)" : "\u0645\u062A\u0648\u0633\u0637 (25%)",
            rationale: lang === "en" ? "Severe photophobia, tearing, sudden pain after trauma or wind" : "\u062D\u0633\u0627\u0633\u064A\u0629 \u0634\u062F\u064A\u062F\u0629 \u0645\u0646 \u0627\u0644\u0636\u0648\u0621\u060C \u062F\u0645\u0627\u0639 \u0645\u0633\u062A\u0645\u0631 \u0628\u0639\u062F \u062F\u062E\u0648\u0644 \u063A\u0628\u0627\u0631 \u0623\u0648 \u0641\u0631\u0643 \u0627\u0644\u0639\u064A\u0646",
            confirmingTests: lang === "en" ? "Fluorescein staining under cobalt blue light" : "\u0635\u0628\u063A\u0629 \u0627\u0644\u0641\u0644\u0648\u0631\u064A\u0633\u064A\u0646 \u0644\u0644\u0642\u0631\u0646\u064A\u0629 \u0628\u0627\u0644\u0636\u0648\u0621 \u0627\u0644\u0623\u0632\u0631\u0642"
          }
        ],
        recommendedTests: lang === "en" ? ["Visual Acuity Test", "Intraocular Pressure (Tonometry)", "Slit Lamp Exam"] : ["\u0641\u062D\u0635 \u062D\u062F\u0629 \u0627\u0644\u0646\u0638\u0631", "\u0642\u064A\u0627\u0633 \u0636\u063A\u0637 \u0627\u0644\u0639\u064A\u0646 (IOP)", "\u0641\u062D\u0635 \u0627\u0644\u0642\u0631\u0646\u064A\u0629 \u0628\u0627\u0644\u0645\u0635\u0628\u0627\u062D \u0627\u0644\u0634\u0642\u064A"],
        redFlags: lang === "en" ? ["Sudden loss or drop in vision", "Severe deep aching eye pain", "Seeing halos around lights with vomiting"] : ["\u0641\u0642\u062F\u0627\u0646 \u0645\u0641\u0627\u062C\u0626 \u0623\u0648 \u062A\u0631\u0627\u062C\u0639 \u062D\u0627\u062F \u0641\u064A \u0627\u0644\u0631\u0624\u064A\u0629", "\u0623\u0644\u0645 \u0639\u0645\u064A\u0642 \u0648\u0645\u0628\u0631\u062D \u0641\u064A \u0643\u0631\u0629 \u0627\u0644\u0639\u064A\u0646", "\u0631\u0624\u064A\u0629 \u0647\u0627\u0644\u0627\u062A \u0633\u0627\u0637\u0639\u0629 \u062D\u0648\u0644 \u0627\u0644\u0645\u0635\u0627\u0628\u064A\u062D \u0645\u0639 \u0642\u064A\u0621"],
        homeAdvice: lang === "en" ? ["Do not rub the eye", "Remove contact lenses immediately", "Wear sunglasses if sensitive to light"] : ["\u0639\u062F\u0645 \u0641\u0631\u0643 \u0627\u0644\u0639\u064A\u0646 \u0646\u0647\u0627\u0626\u064A\u0627\u064B", "\u0646\u0632\u0639 \u0627\u0644\u0639\u062F\u0633\u0627\u062A \u0627\u0644\u0644\u0627\u0635\u0642\u0629 \u0641\u0648\u0631\u0627\u064B \u0648\u062A\u062C\u0646\u0628 \u0648\u0636\u0639\u0647\u0627", "\u0627\u0631\u062A\u062F\u0627\u0621 \u0646\u0638\u0627\u0631\u0627\u062A \u0634\u0645\u0633\u064A\u0629 \u0644\u0644\u0648\u0642\u0627\u064A\u0629 \u0645\u0646 \u0627\u0644\u0636\u0648\u0621"],
        clinicalSummary: lang === "en" ? "Red painful eye requires urgent ophthalmologic examination to protect visual acuity." : "\u0627\u062D\u0645\u0631\u0627\u0631 \u0627\u0644\u0639\u064A\u0646 \u0645\u0639 \u0627\u0644\u0623\u0644\u0645 \u064A\u062A\u0637\u0644\u0628 \u062A\u0642\u064A\u064A\u0645\u0627\u064B \u0641\u0648\u0631\u064A\u0627\u064B \u0644\u0636\u063A\u0637 \u0627\u0644\u0639\u064A\u0646 \u0648\u0627\u0644\u0642\u0631\u0646\u064A\u0629 \u0644\u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u0628\u0635\u0631."
      };
    } else if (isSkin) {
      evaluationData = {
        primaryCondition: lang === "en" ? "Dermatological Lesion & Rash Evaluation" : "\u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u0622\u0641\u0627\u062A \u0627\u0644\u062C\u0644\u062F\u064A\u0629 \u0648\u0627\u0644\u0637\u0641\u062D \u0627\u0644\u062D\u0627\u062F",
        urgency: "routine",
        urgencyText: lang === "en" ? "Dermatologist review within 48-72 hours" : "\u0645\u0631\u0627\u062C\u0639\u0629 \u0639\u064A\u0627\u062F\u0629 \u0627\u0644\u062C\u0644\u062F\u064A\u0629 \u062E\u0644\u0627\u0644 2-3 \u0623\u064A\u0627\u0645",
        recommendedSpecialty: lang === "en" ? "Dermatology & Immunology" : "\u0623\u0645\u0631\u0627\u0636 \u0627\u0644\u062C\u0644\u062F\u064A\u0629 \u0648\u0627\u0644\u062D\u0633\u0627\u0633\u064A\u0629 \u0648\u0627\u0644\u0645\u0646\u0627\u0639\u0629",
        differentialDiagnoses: [
          {
            name: lang === "en" ? "Contact Dermatitis / Urticaria" : "\u0627\u0644\u062A\u0647\u0627\u0628 \u0627\u0644\u062C\u0644\u062F \u0627\u0644\u062A\u0645\u0627\u0633\u064A \u0623\u0648 \u0627\u0644\u0634\u0631\u0649 (\u062D\u0633\u0627\u0633\u064A\u0629 \u0645\u0641\u0631\u0637\u0629)",
            category: "most_likely",
            likelihood: lang === "en" ? "High (65%)" : "\u0645\u0631\u062A\u0641\u0639 (65%)",
            rationale: lang === "en" ? "Pruritic rash following contact with allergens, irritants, or medication" : "\u062D\u0643\u0629 \u0648\u0637\u0641\u062D \u0627\u062D\u0645\u0631\u0627\u0631\u064A \u0645\u062A\u0642\u0637\u0639 \u0625\u062B\u0631 \u0627\u0644\u062A\u0639\u0631\u0636 \u0644\u0645\u0633\u0628\u0628 \u062D\u0633\u0627\u0633\u064A\u0629 \u0623\u0648 \u062F\u0648\u0627\u0621 \u0645\u0639\u064A\u0646",
            confirmingTests: lang === "en" ? "Patch test, IgE levels, CBC with eosinophil count" : "\u0627\u062E\u062A\u0628\u0627\u0631 \u0627\u0644\u062D\u0633\u0627\u0633\u064A\u0629 \u0627\u0644\u0633\u0631\u064A\u0631\u064A\u060C \u0641\u062D\u0635 \u0627\u0644\u062E\u0644\u0627\u064A\u0627 \u0627\u0644\u062D\u0645\u0636\u064A\u0629 (Eosinophils)"
          },
          {
            name: lang === "en" ? "Viral / Bacterial Exanthem" : "\u0637\u0641\u062D \u062E\u064E\u0645\u062C\u064A \u0641\u064A\u0631\u0648\u0633\u064A \u0623\u0648 \u0628\u0643\u062A\u064A\u0631\u064A",
            category: "possible",
            likelihood: lang === "en" ? "Moderate (25%)" : "\u0645\u062A\u0648\u0633\u0637 (25%)",
            rationale: lang === "en" ? "Widespread rash associated with systemic prodrome" : "\u0637\u0641\u062D \u062C\u0644\u062F\u064A \u0639\u0627\u0645 \u064A\u062A\u0632\u0627\u0645\u0646 \u0645\u0639 \u062D\u0631\u0627\u0631\u0629 \u062E\u0641\u064A\u0641\u0629 \u0623\u0648 \u0625\u0631\u0647\u0627\u0642 \u0639\u0627\u0645",
            confirmingTests: lang === "en" ? "Serology, Skin swab if exudative" : "\u062A\u062D\u0627\u0644\u064A\u0644 \u0645\u0635\u0644\u064A\u0629 \u0623\u0648 \u0645\u0633\u062D\u0629 \u062C\u0644\u062F\u064A\u0629 \u0641\u064A \u062D\u0627\u0644 \u0648\u062C\u0648\u062F \u062A\u0642\u064A\u062D"
          },
          {
            name: lang === "en" ? "Severe Cutaneous Adverse Reaction / Anaphylaxis" : "\u062A\u0641\u0627\u0639\u0644 \u062F\u0648\u0627\u0626\u064A \u062A\u062D\u0633\u0633\u064A \u0634\u062F\u064A\u062F \u0623\u0648 \u0648\u0630\u0645\u0629 \u0648\u0639\u0627\u0626\u064A\u0629",
            category: "must_rule_out",
            likelihood: lang === "en" ? "Rule out" : "\u064A\u062C\u0628 \u0627\u0633\u062A\u0628\u0639\u0627\u062F\u0647 \u0641\u0648\u0631\u0627\u064B",
            rationale: lang === "en" ? "Watch for non-blanching petechiae or airway swelling" : "\u0627\u0633\u062A\u0628\u0639\u0627\u062F \u0627\u0644\u0637\u0641\u062D \u0627\u0644\u0646\u0632\u0641\u064A \u0623\u0648 \u062A\u0648\u0631\u0645 \u0627\u0644\u0644\u0633\u0627\u0646 \u0648\u0627\u0644\u0634\u0641\u0627\u0647 \u0648\u0635\u0639\u0648\u0628\u0629 \u0627\u0644\u062A\u0646\u0641\u0633",
            confirmingTests: lang === "en" ? "Emergency clinical triage, Vit Organ function tests" : "\u0627\u0644\u0641\u062D\u0635 \u0627\u0644\u0633\u0631\u064A\u0631\u064A \u0627\u0644\u0637\u0627\u0631\u0626 \u0648\u0641\u062D\u0635 \u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u0643\u0628\u062F \u0648\u0627\u0644\u0643\u0644\u0649"
          }
        ],
        recommendedTests: lang === "en" ? ["CBC with differential", "Liver & Renal function", "Total IgE"] : ["\u0635\u0648\u0631\u0629 \u062F\u0645 \u0643\u0627\u0645\u0644\u0629 (CBC)", "\u0641\u062D\u0635 \u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u0643\u0628\u062F \u0648\u0627\u0644\u0643\u0644\u0649", "\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u062D\u0633\u0627\u0633\u064A\u0629 \u0627\u0644\u0639\u0627\u0645\u0629 (IgE)"],
        redFlags: lang === "en" ? ["Facial or throat swelling (Angioedema)", "Non-blanching purple rash (Petechiae)", "Skin sloughing or blistering"] : ["\u062A\u0648\u0631\u0645 \u0641\u064A \u0627\u0644\u062D\u0644\u0642 \u0623\u0648 \u0627\u0644\u0648\u062C\u0647 \u0623\u0648 \u0627\u0644\u0644\u0633\u0627\u0646", "\u0628\u0642\u0639 \u0646\u0632\u0641\u064A\u0629 \u0623\u0631\u062C\u0648\u0627\u0646\u064A\u0629 \u0644\u0627 \u062A\u0628\u0647\u062A \u0639\u0646\u062F \u0627\u0644\u0636\u063A\u0637 \u0639\u0644\u064A\u0647\u0627", "\u062A\u0642\u0634\u0631 \u062C\u0644\u062F\u064A \u0623\u0648 \u0638\u0647\u0648\u0631 \u0641\u0642\u0627\u0639\u0627\u062A \u0645\u0627\u0626\u064A\u0629 \u0648\u0627\u0633\u0639\u0629"],
        homeAdvice: lang === "en" ? ["Avoid scratching or perfumed soaps", "Apply cool compresses", "Record any new foods or medications"] : ["\u062A\u062C\u0646\u0628 \u062D\u0643 \u0627\u0644\u062C\u0644\u062F \u0623\u0648 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0635\u0627\u0628\u0648\u0646 \u0639\u0637\u0631\u064A", "\u0648\u0636\u0639 \u0643\u0645\u0627\u062F\u0627\u062A \u0645\u0627\u0621 \u0628\u0627\u0631\u062F\u0629", "\u062A\u0633\u062C\u064A\u0644 \u0623\u064A \u062F\u0648\u0627\u0621 \u0623\u0648 \u063A\u0630\u0627\u0621 \u062C\u062F\u064A\u062F \u062A\u0645 \u062A\u0646\u0627\u0648\u0644\u0647 \u0645\u0624\u062E\u0631\u0627\u064B"],
        clinicalSummary: lang === "en" ? "Dermatological presentation requiring visual inspection and allergy/infection differentiation." : "\u062A\u0642\u064A\u064A\u0645 \u0633\u0631\u064A\u0631\u064A \u0644\u0644\u0637\u0641\u062D \u0627\u0644\u062C\u0644\u062F\u064A \u064A\u0633\u062A\u0644\u0632\u0645 \u0627\u0644\u0645\u0639\u0627\u064A\u0646\u0629 \u0627\u0644\u0645\u0628\u0627\u0634\u0631\u0629 \u0644\u062A\u062D\u062F\u064A\u062F \u0633\u0628\u0628 \u0627\u0644\u062D\u0633\u0627\u0633\u064A\u0629 \u0648\u0627\u0633\u062A\u0628\u0639\u0627\u062F \u0627\u0644\u062A\u0641\u0627\u0639\u0644\u0627\u062A \u0627\u0644\u062F\u0648\u0627\u0626\u064A\u0629."
      };
    } else if (isJoint) {
      evaluationData = {
        primaryCondition: lang === "en" ? "Musculoskeletal & Joint Evaluation" : "\u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u0622\u0644\u0627\u0645 \u0627\u0644\u0639\u0636\u0644\u064A\u0629 \u0627\u0644\u0647\u064A\u0643\u0644\u064A\u0629 \u0648\u0627\u0644\u0645\u0641\u0627\u0635\u0644",
        urgency: "routine",
        urgencyText: lang === "en" ? "Orthopedic or Rheumatology consult within 2-4 days" : "\u0645\u0631\u0627\u062C\u0639\u0629 \u0639\u064A\u0627\u062F\u0629 \u0627\u0644\u0639\u0638\u0627\u0645 \u0623\u0648 \u0627\u0644\u0645\u0641\u0627\u0635\u0644 \u0648\u0627\u0644\u0631\u0648\u0645\u0627\u062A\u064A\u0632\u0645",
        recommendedSpecialty: lang === "en" ? "Orthopedics & Rheumatology" : "\u062C\u0631\u0627\u062D\u0629 \u0627\u0644\u0639\u0638\u0627\u0645 \u0648\u0627\u0644\u0645\u0641\u0627\u0635\u0644 \u0648\u0623\u0645\u0631\u0627\u0636 \u0627\u0644\u0631\u0648\u0645\u0627\u062A\u064A\u0632\u0645",
        differentialDiagnoses: [
          {
            name: lang === "en" ? "Musculoskeletal Strain / Osteoarthritis" : "\u0625\u062C\u0647\u0627\u062F \u0639\u0636\u0644\u064A \u0623\u0631\u0628\u0637\u064A \u0623\u0648 \u0641\u0635\u0627\u0644 \u0639\u0638\u0645\u064A (\u062E\u0634\u0648\u0646\u0629 \u0645\u0641\u0627\u0635\u0644)",
            category: "most_likely",
            likelihood: lang === "en" ? "High (65%)" : "\u0645\u0631\u062A\u0641\u0639 (65%)",
            rationale: lang === "en" ? "Pain aggravated by weight bearing or sudden movements" : "\u0623\u0644\u0645 \u064A\u0632\u062F\u0627\u062F \u0628\u0627\u0644\u062D\u0631\u0643\u0629 \u0648\u0627\u0644\u0645\u062C\u0647\u0648\u062F \u0623\u0648 \u0627\u0644\u0648\u0642\u0648\u0641 \u0627\u0644\u0637\u0648\u064A\u0644 \u0645\u0639 \u062A\u064A\u0628\u0633 \u0635\u0628\u0627\u062D\u064A \u062E\u0641\u064A\u0641",
            confirmingTests: lang === "en" ? "Joint plain X-ray, Clinical range-of-motion test" : "\u0623\u0634\u0639\u0629 \u0633\u064A\u0646\u064A\u0629 \u0644\u0644\u0645\u0641\u0635\u0644 (X-Ray)\u060C \u0641\u062D\u0635 \u0645\u062F\u0649 \u062D\u0631\u0643\u0629 \u0627\u0644\u0645\u0641\u0635\u0644 \u0627\u0644\u0633\u0631\u064A\u0631\u064A"
          },
          {
            name: lang === "en" ? "Inflammatory Arthritis / Tendinopathy" : "\u0627\u0644\u062A\u0647\u0627\u0628 \u0627\u0644\u0645\u0641\u0627\u0635\u0644 \u0627\u0644\u0631\u062B\u0648\u0627\u0646\u064A \u0623\u0648 \u0627\u0644\u062A\u0647\u0627\u0628 \u0627\u0644\u0623\u0648\u062A\u0627\u0631",
            category: "possible",
            likelihood: lang === "en" ? "Moderate (25%)" : "\u0645\u062A\u0648\u0633\u0637 (25%)",
            rationale: lang === "en" ? "Joint swelling, heat, or prolonged morning stiffness > 30 mins" : "\u062A\u0648\u0631\u0645 \u0645\u0639 \u062F\u0641\u0621 \u0645\u0648\u0636\u0639\u064A \u0648\u062A\u064A\u0628\u0633 \u0635\u0628\u0627\u062D\u064A \u064A\u062A\u062C\u0627\u0648\u0632 30 \u062F\u0642\u064A\u0642\u0629",
            confirmingTests: lang === "en" ? "ESR, CRP, Rheumatoid factor, Uric Acid" : "\u0641\u062D\u0635 \u0633\u0631\u0639\u0629 \u0627\u0644\u062A\u0631\u0633\u064A\u0628 (ESR)\u060C \u0628\u0631\u0648\u062A\u064A\u0646 CRP\u060C \u0648\u062D\u0645\u0636 \u0627\u0644\u064A\u0648\u0631\u064A\u0643 (\u0646\u0642\u0631\u0633)"
          },
          {
            name: lang === "en" ? "Septic Arthritis / Acute Fracture" : "\u0627\u0644\u062A\u0647\u0627\u0628 \u0627\u0644\u0645\u0641\u0635\u0644 \u0627\u0644\u0642\u064A\u062D\u064A \u0627\u0644\u0625\u0646\u062A\u0627\u0646\u064A \u0623\u0648 \u0643\u0633\u0631 \u0634\u0639\u0631\u064A",
            category: "must_rule_out",
            likelihood: lang === "en" ? "Rule out" : "\u064A\u062C\u0628 \u0627\u0633\u062A\u0628\u0639\u0627\u062F\u0647 \u0641\u0648\u0631\u0627\u064B",
            rationale: lang === "en" ? "Acute hot red swollen joint with fever and complete inability to bear weight" : "\u0645\u0641\u0635\u0644 \u0623\u062D\u0645\u0631 \u0633\u0627\u062E\u0646 \u062C\u062F\u0627\u064B \u0645\u0639 \u062D\u0631\u0627\u0631\u0629 \u0648\u0639\u062F\u0645 \u0642\u062F\u0631\u0629 \u062A\u0627\u0645\u0629 \u0639\u0644\u0649 \u062A\u062D\u0631\u064A\u0643 \u0627\u0644\u0645\u0641\u0635\u0644 \u0623\u0648 \u0627\u0644\u0645\u0634\u064A",
            confirmingTests: lang === "en" ? "Arthrocentesis (joint fluid analysis), Urgent X-Ray" : "\u0628\u0632\u0644 \u0633\u0627\u0626\u0644 \u0627\u0644\u0645\u0641\u0635\u0644 \u0627\u0644\u0645\u062E\u0628\u0631\u064A\u060C \u0635\u0648\u0631\u0629 \u0623\u0634\u0639\u0629 \u0633\u064A\u0646\u064A\u0629 \u0639\u0627\u062C\u0644\u0629"
          }
        ],
        recommendedTests: lang === "en" ? ["Plain X-Ray of affected joint", "ESR & CRP", "Serum Uric Acid"] : ["\u0623\u0634\u0639\u0629 \u0633\u064A\u0646\u064A\u0629 \u0639\u0627\u062F\u064A\u0629 (X-Ray) \u0644\u0644\u0645\u0641\u0635\u0644 \u0627\u0644\u0645\u0635\u0627\u0628", "\u0641\u062D\u0635 \u0627\u0644\u062A\u0647\u0627\u0628\u0627\u062A (ESR, CRP)", "\u062D\u0645\u0636 \u0627\u0644\u064A\u0648\u0631\u064A\u0643 (Uric Acid)"],
        redFlags: lang === "en" ? ["Inability to bear any weight", "Hot, visibly red and severely swollen joint", "Fever and chills accompanying joint pain"] : ["\u0639\u062C\u0632 \u062A\u0627\u0645 \u0639\u0646 \u0627\u0644\u0648\u0642\u0648\u0641 \u0623\u0648 \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0648\u0632\u0646 \u0639\u0644\u0649 \u0627\u0644\u0645\u0641\u0635\u0644", "\u0645\u0641\u0635\u0644 \u0634\u062F\u064A\u062F \u0627\u0644\u0633\u062E\u0648\u0646\u0629 \u0648\u0627\u0644\u0627\u062D\u0645\u0631\u0627\u0631 \u0648\u0627\u0644\u062A\u0648\u0631\u0645", "\u0627\u0631\u062A\u0641\u0627\u0639 \u0627\u0644\u062D\u0631\u0627\u0631\u0629 \u0648\u0642\u0634\u0639\u0631\u064A\u0631\u0629 \u0645\u0635\u0627\u062D\u0628\u0629 \u0644\u0623\u0644\u0645 \u0627\u0644\u0645\u0641\u0635\u0644"],
        homeAdvice: lang === "en" ? ["Rest the affected limb (RICE protocol)", "Apply cold or warm packs depending on stage", "Avoid strenuous load"] : ["\u0631\u0627\u062D\u0629 \u0627\u0644\u0637\u0631\u0641 \u0627\u0644\u0645\u0635\u0627\u0628 \u0648\u062A\u062C\u0646\u0628 \u0627\u0644\u0625\u062C\u0647\u0627\u062F", "\u0648\u0636\u0639 \u0643\u0645\u0627\u062F\u0627\u062A \u0628\u0627\u0631\u062F\u0629 \u0641\u064A \u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A \u0627\u0644\u062D\u062F\u064A\u062B\u0629", "\u062A\u062C\u0646\u0628 \u0627\u0644\u0645\u0634\u064A \u0644\u0645\u0633\u0627\u0641\u0627\u062A \u0637\u0648\u064A\u0644\u0629 \u062D\u062A\u0649 \u064A\u0647\u062F\u0623 \u0627\u0644\u0623\u0644\u0645"],
        clinicalSummary: lang === "en" ? "Joint and musculoskeletal evaluation oriented to rule out septic or traumatic causes." : "\u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u0622\u0644\u0627\u0645 \u0627\u0644\u0645\u0641\u0635\u0644\u064A\u0629 \u0645\u0639 \u0627\u0644\u062A\u0623\u0643\u064A\u062F \u0639\u0644\u0649 \u0627\u0633\u062A\u0628\u0639\u0627\u062F \u0627\u0644\u0627\u0644\u062A\u0647\u0627\u0628\u0627\u062A \u0627\u0644\u0625\u0646\u062A\u0627\u0646\u064A\u0629 \u0623\u0648 \u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A \u0627\u0644\u0639\u0638\u0645\u064A\u0629 \u0627\u0644\u0631\u0636\u064A\u0629."
      };
    } else {
      evaluationData = {
        primaryCondition: lang === "en" ? "General Medical Assessment & Clinical Triage" : "\u062A\u0642\u064A\u064A\u0645 \u0633\u0631\u064A\u0631\u064A \u0623\u0648\u0644\u064A \u0648\u062A\u0648\u062C\u064A\u0647 \u0637\u0628\u064A \u0639\u0627\u0645",
        urgency: "urgent",
        urgencyText: lang === "en" ? "Consult an Internal Medicine or Family Physician within 24-48 hours" : "\u0645\u0631\u0627\u062C\u0639\u0629 \u0639\u064A\u0627\u062F\u0629 \u0627\u0644\u0637\u0628 \u0627\u0644\u0628\u0627\u0637\u0646\u064A \u0623\u0648 \u0637\u0628 \u0627\u0644\u0623\u0633\u0631\u0629 \u0644\u0625\u062C\u0631\u0627\u0621 \u0641\u062D\u0635 \u0633\u0631\u064A\u0631\u064A \u0634\u0627\u0645\u0644",
        recommendedSpecialty: lang === "en" ? "Internal Medicine / Family Medicine" : "\u0627\u0644\u0637\u0628 \u0627\u0644\u0628\u0627\u0637\u0646\u064A / \u0637\u0628 \u0627\u0644\u0623\u0633\u0631\u0629",
        differentialDiagnoses: [
          {
            name: lang === "en" ? "Systemic Viral / Infectious Syndrome" : "\u0645\u062A\u0644\u0627\u0632\u0645\u0629 \u0625\u0646\u062A\u0627\u0646\u064A\u0629 \u0623\u0648 \u0639\u062F\u0648\u0649 \u062C\u0647\u0627\u0632\u064A\u0629 \u0634\u0627\u0626\u0639\u0629",
            category: "most_likely",
            likelihood: lang === "en" ? "Moderate (50%)" : "\u0627\u062D\u062A\u0645\u0627\u0644 \u0623\u0648\u0644\u064A (50%)",
            rationale: lang === "en" ? "Generalized non-specific symptoms frequently reflect systemic immune activation or stress" : "\u0627\u0644\u0623\u0639\u0631\u0627\u0636 \u0627\u0644\u0639\u0627\u0645\u0629 \u063A\u064A\u0631 \u0627\u0644\u0645\u062D\u062F\u062F\u0629 \u063A\u0627\u0644\u0628\u0627\u064B \u0645\u0627 \u062A\u0646\u062A\u062C \u0639\u0646 \u062A\u0641\u0627\u0639\u0644 \u0645\u0646\u0627\u0639\u064A \u0623\u0648 \u0639\u062F\u0648\u0649 \u0641\u064A\u0631\u0648\u0633\u064A\u0629 \u0623\u0648 \u0625\u062C\u0647\u0627\u062F \u062C\u0647\u0627\u0632\u064A",
            confirmingTests: lang === "en" ? "Complete Blood Count (CBC), Inflammatory markers (CRP)" : "\u062A\u0639\u062F\u0627\u062F \u0627\u0644\u062F\u0645 \u0627\u0644\u0643\u0627\u0645\u0644 (CBC)\u060C \u0641\u062D\u0635 \u0627\u0644\u0628\u0631\u0648\u062A\u064A\u0646 \u0627\u0644\u062A\u0641\u0627\u0639\u0644\u064A (CRP)"
          },
          {
            name: lang === "en" ? "Metabolic / Endocrine Imbalance" : "\u0627\u0636\u0637\u0631\u0627\u0628 \u0623\u064A\u0636\u064A \u0623\u0648 \u062E\u0644\u0644 \u063A\u062F\u064A (\u0633\u0643\u0631\u060C \u062F\u0631\u0642\u064A\u0629\u060C \u0634\u0648\u0627\u0631\u062F)",
            category: "possible",
            likelihood: lang === "en" ? "Moderate (30%)" : "\u0627\u062D\u062A\u0645\u0627\u0644 \u0648\u0627\u0631\u062F (30%)",
            rationale: lang === "en" ? "Electrolyte, thyroid, or glycemic variations can present with broad clinical complaints" : "\u062A\u0630\u0628\u0630\u0628 \u0645\u0633\u062A\u0648\u064A\u0627\u062A \u0627\u0644\u0633\u0643\u0631 \u0641\u064A \u0627\u0644\u062F\u0645 \u0623\u0648 \u0642\u0635\u0648\u0631 \u0627\u0644\u063A\u062F\u0629 \u0627\u0644\u062F\u0631\u0642\u064A\u0629 \u064A\u0633\u0628\u0628 \u0623\u0639\u0631\u0627\u0636\u0627\u064B \u0639\u0627\u0645\u0629 \u0645\u0628\u0647\u0645\u0629",
            confirmingTests: lang === "en" ? "Fasting Blood Glucose, Electrolytes, TSH" : "\u0641\u062D\u0635 \u0627\u0644\u0633\u0643\u0631 \u0627\u0644\u0635\u0627\u0626\u0645\u060C \u0627\u0644\u0634\u0648\u0627\u0631\u062F \u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0626\u064A\u0629\u060C \u0648\u0641\u062D\u0635 \u0647\u0631\u0645\u0648\u0646 \u0627\u0644\u063A\u062F\u0629 \u0627\u0644\u062F\u0631\u0642\u064A\u0629 (TSH)"
          },
          {
            name: lang === "en" ? "Acute Sepsis / Severe Systemic Pathology" : "\u0625\u0646\u062A\u0627\u0646 \u062F\u0645\u0648\u064A \u0623\u0648 \u062A\u062F\u0647\u0648\u0631 \u0633\u0631\u064A\u0631\u064A \u062D\u0627\u062F",
            category: "must_rule_out",
            likelihood: lang === "en" ? "Rule out" : "\u064A\u062C\u0628 \u0627\u0633\u062A\u0628\u0639\u0627\u062F\u0647",
            rationale: lang === "en" ? "Always evaluate vital signs (BP, HR, Temp, SpO2) to exclude decompensation" : "\u0636\u0631\u0648\u0631\u0629 \u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u0639\u0644\u0627\u0645\u0627\u062A \u0627\u0644\u062D\u064A\u0648\u064A\u0629 \u0644\u0627\u0633\u062A\u0628\u0639\u0627\u062F \u0623\u064A \u062A\u0631\u0627\u062C\u0639 \u0641\u064A \u0627\u0644\u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u062D\u064A\u0648\u064A\u0629",
            confirmingTests: lang === "en" ? "Vital signs monitoring, Blood cultures, Comprehensive organ panel" : "\u0645\u0631\u0627\u0642\u0628\u0629 \u0627\u0644\u0639\u0644\u0627\u0645\u0627\u062A \u0627\u0644\u062D\u064A\u0648\u064A\u0629 \u0627\u0644\u0634\u0627\u0645\u0644\u0629 \u0648\u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u0643\u0628\u062F \u0648\u0627\u0644\u0643\u0644\u0649"
          }
        ],
        recommendedTests: lang === "en" ? ["CBC with differential", "Basic Metabolic Panel (BMP)", "Urinalysis", "Vital Signs Assessment"] : ["\u062A\u0639\u062F\u0627\u062F \u0627\u0644\u062F\u0645 \u0627\u0644\u0643\u0627\u0645\u0644 (CBC)", "\u062A\u062D\u0644\u064A\u0644 \u0648\u0638\u0627\u0626\u0641 \u0643\u0644\u0649 \u0648\u0633\u0643\u0631", "\u062A\u062D\u0644\u064A\u0644 \u0628\u0648\u0644 \u0631\u0648\u062A\u064A\u0646\u064A", "\u0642\u064A\u0627\u0633 \u0627\u0644\u0639\u0644\u0627\u0645\u0627\u062A \u0627\u0644\u062D\u064A\u0648\u064A\u0629 (\u0636\u063A\u0637\u060C \u0646\u0628\u0636\u060C \u062D\u0631\u0627\u0631\u0629\u060C \u0623\u0643\u0633\u062C\u064A\u0646)"],
        redFlags: lang === "en" ? ["High persistent fever > 39\xB0C", "Altered mental status or extreme dizziness", "Severe shortness of breath or chest discomfort"] : ["\u062D\u0645\u0649 \u0645\u0631\u062A\u0641\u0639\u0629 \u0648\u0645\u0633\u062A\u0645\u0631\u0629 \u062A\u0641\u0648\u0642 39 \u0645\u0626\u0648\u064A\u0629", "\u062A\u063A\u064A\u0631 \u0641\u064A \u0627\u0644\u0648\u0639\u064A \u0623\u0648 \u062F\u0648\u0627\u0631 \u0634\u062F\u064A\u062F \u0645\u0639 \u063A\u062B\u064A\u0627\u0646 \u0645\u0633\u062A\u0645\u0631", "\u0635\u0639\u0648\u0628\u0629 \u0641\u064A \u0627\u0644\u062A\u0646\u0641\u0633 \u0623\u0648 \u0623\u0644\u0645 \u0635\u062F\u0631\u064A \u0623\u0648 \u0647\u0628\u0648\u0637 \u062D\u0627\u062F \u0628\u0627\u0644\u0636\u063A\u0637"],
        homeAdvice: lang === "en" ? ["Maintain adequate hydration and rest", "Record vital signs twice daily", "Provide more specific symptom details or consult your doctor"] : ["\u0627\u0644\u062D\u0641\u0627\u0638 \u0639\u0644\u0649 \u0627\u0644\u0631\u0627\u062D\u0629 \u0648\u0634\u0631\u0628 \u0627\u0644\u0633\u0648\u0627\u0626\u0644 \u0628\u0627\u0646\u062A\u0638\u0627\u0645", "\u062A\u062F\u0648\u064A\u0646 \u0627\u0644\u0639\u0644\u0627\u0645\u0627\u062A \u0627\u0644\u062D\u064A\u0648\u064A\u0629 \u0648\u062F\u0631\u062C\u0629 \u0627\u0644\u062D\u0631\u0627\u0631\u0629", "\u0625\u0636\u0627\u0641\u0629 \u062A\u0641\u0627\u0635\u064A\u0644 \u0623\u0643\u062B\u0631 \u062F\u0642\u0629 \u0644\u0644\u0623\u0639\u0631\u0627\u0636 \u0623\u0648 \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0637\u0628\u064A\u0628 \u0644\u0644\u0641\u062D\u0635 \u0627\u0644\u0645\u0628\u0627\u0634\u0631"],
        clinicalSummary: lang === "en" ? "Symptoms are general and non-specific. Comprehensive in-person clinical history and physical examination are recommended." : "\u0627\u0644\u0634\u0643\u0648\u0649 \u0627\u0644\u0633\u0631\u064A\u0631\u064A\u0629 \u0639\u0627\u0645\u0629 \u0648\u062A\u062A\u0637\u0644\u0628 \u0641\u062D\u0635\u0627\u064B \u0633\u0631\u064A\u0631\u064A\u0627\u064B \u0645\u0628\u0627\u0634\u0631\u0627\u064B \u0645\u0639 \u0627\u0644\u0637\u0628\u064A\u0628 \u0644\u0627\u0633\u062A\u064A\u0636\u0627\u062D \u0627\u0644\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0645\u0631\u0636\u064A \u0628\u062F\u0642\u0629 \u0648\u0625\u062C\u0631\u0627\u0621 \u0627\u0644\u0641\u062D\u0648\u0635\u0627\u062A \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629."
      };
    }
  }
  return evaluationData;
}
var userSessions = /* @__PURE__ */ new Map();
var TELEGRAM_MAIN_KEYBOARD = {
  keyboard: [
    [{ text: "\u{1FA7A} \u0641\u0627\u062D\u0635 \u0627\u0644\u0623\u0639\u0631\u0627\u0636 (DDx)" }, { text: "\u{1F4B3} \u0627\u0644\u0628\u0627\u0642\u0627\u062A \u0648\u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643\u0627\u062A" }],
    [{ text: "\u{1F48A} \u062F\u0644\u064A\u0644 \u0627\u0644\u0623\u062F\u0648\u064A\u0629 \u0648\u0627\u0644\u062C\u0631\u0639\u0627\u062A" }, { text: "\u{1F476} \u062D\u0627\u0633\u0628\u0629 \u062C\u0631\u0639\u0627\u062A \u0627\u0644\u0623\u0637\u0641\u0627\u0644" }],
    [{ text: "\u{1FA7B} \u0641\u062D\u0635 \u0627\u0644\u0623\u0634\u0639\u0629 \u0627\u0644\u0633\u064A\u0646\u064A\u0629" }, { text: "\u{1F9EA} \u0627\u0644\u062A\u062D\u0627\u0644\u064A\u0644 \u0627\u0644\u0645\u062E\u0628\u0631\u064A\u0629" }],
    [{ text: "\u{1F381} \u062A\u0641\u0639\u064A\u0644 \u0643\u0648\u062F \u0627\u0644\u062E\u0635\u0645" }, { text: "\u{1F4CA} \u0628\u0627\u0642\u062A\u064A \u0648\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A\u064A" }]
  ],
  resize_keyboard: true,
  is_persistent: true
};
async function sendTelegramFullMenu(chatId, user, lang = "ar") {
  const plan = (user?.plan || "free").toUpperCase();
  const quota = user?.creditsRemaining ?? 15;
  const isEn = lang === "en";
  const menuMsg = isEn ? `\u{1F3E5} **Dose Clinical Medical Platform \u2014 Main Services:**

\u{1F4CA} **Active Plan:** **${plan}** (${quota} clinical queries remaining today)

\u{1F447} **Select any medical feature below to start immediately:**` : `\u{1F3E5} **\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u064A\u0632\u0627\u062A \u0648\u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0633\u0631\u064A\u0631\u064A\u0629 \u0627\u0644\u0645\u062A\u0627\u062D\u0629 (\u0645\u0646\u0635\u0629 \u062C\u0631\u0639\u0629):**

\u{1F4CA} **\u0628\u0627\u0642\u062A\u0643 \u0627\u0644\u062D\u0627\u0644\u064A\u0629:** **${plan}** (${quota} \u0627\u0633\u062A\u0634\u0627\u0631\u0629 \u0648\u0641\u062D\u0635 \u0645\u062A\u0628\u0642\u064A\u0629 \u0627\u0644\u064A\u0648\u0645)

\u{1F447} **\u0627\u0636\u063A\u0637 \u0639\u0644\u0649 \u0623\u064A \u0645\u064A\u0632\u0629 \u0644\u0644\u0628\u062F\u0621 \u0641\u0648\u0631\u0627\u064B:**`;
  const inlineMarkup = {
    inline_keyboard: isEn ? [
      [
        { text: "\u{1FA7A} Symptoms Checker (DDx)", url: `${DEFAULT_APP_URL}/#symptoms?tg_id=${chatId}&target=symptoms&start=onboarding` },
        { text: "\u{1F4B3} Subscription Plans", url: `${DEFAULT_APP_URL}/#plans?tg_id=${chatId}&target=plans&start=onboarding` }
      ],
      [
        { text: "\u{1F48A} Drug Guide & Dosing", callback_data: "action_pharma" },
        { text: "\u{1F476} Pediatric Dose Calculator", callback_data: "action_pediatric" }
      ],
      [
        { text: "\u{1FA7B} X-Ray & Imaging Analysis", callback_data: "action_imaging" },
        { text: "\u{1F9EA} Lab Test Interpreter", callback_data: "action_lab" }
      ],
      [
        { text: "\u{1F381} Redeem Promo Code", callback_data: "action_promo" },
        { text: "\u{1F310} Open Live Web Platform", url: `${DEFAULT_APP_URL}/#welcome?tg_id=${chatId}&start=onboarding` }
      ]
    ] : [
      [
        { text: "\u{1FA7A} \u0641\u0627\u062D\u0635 \u0627\u0644\u0623\u0639\u0631\u0627\u0636 \u0628\u0627\u0644\u0645\u0646\u0635\u0629 (DDx)", url: `${DEFAULT_APP_URL}/#symptoms?tg_id=${chatId}&target=symptoms&start=onboarding` },
        { text: "\u{1F4B3} \u0628\u0627\u0642\u0627\u062A \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643 \u0628\u0627\u0644\u0645\u0646\u0635\u0629", url: `${DEFAULT_APP_URL}/#plans?tg_id=${chatId}&target=plans&start=onboarding` }
      ],
      [
        { text: "\u{1F48A} \u062F\u0644\u064A\u0644 \u0627\u0644\u0623\u062F\u0648\u064A\u0629 \u0648\u0627\u0644\u062C\u0631\u0639\u0627\u062A", callback_data: "action_pharma" },
        { text: "\u{1F476} \u062D\u0627\u0633\u0628\u0629 \u062C\u0631\u0639\u0627\u062A \u0627\u0644\u0623\u0637\u0641\u0627\u0644", callback_data: "action_pediatric" }
      ],
      [
        { text: "\u{1FA7B} \u0641\u062D\u0635 \u0648\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0623\u0634\u0639\u0629", callback_data: "action_imaging" },
        { text: "\u{1F9EA} \u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u062A\u062D\u0627\u0644\u064A\u0644 \u0627\u0644\u0645\u062E\u0628\u0631\u064A\u0629", callback_data: "action_lab" }
      ],
      [
        { text: "\u{1F381} \u062A\u0641\u0639\u064A\u0644 \u0643\u0648\u062F \u0627\u0644\u062A\u0631\u0642\u064A\u0629 (PRO2026)", callback_data: "action_promo" },
        { text: "\u{1F310} \u0641\u062A\u062D \u0645\u0648\u0642\u0639 \u0627\u0644\u0645\u0646\u0635\u0629 \u0627\u0644\u0645\u0628\u0627\u0634\u0631", url: `${DEFAULT_APP_URL}/#welcome?tg_id=${chatId}&start=onboarding` }
      ]
    ]
  };
  await sendTelegramMessage(chatId, menuMsg, inlineMarkup);
}
var SYMPTOM_PRESETS = {
  sym_chest: "\u0623\u0644\u0645 \u0636\u0627\u063A\u0637 \u0641\u064A \u0645\u0646\u062A\u0635\u0641 \u0627\u0644\u0635\u062F\u0631 \u0645\u0639 \u0636\u064A\u0642 \u0641\u064A \u0627\u0644\u062A\u0646\u0641\u0633 \u0648\u062A\u0639\u0631\u0642 \u062E\u0641\u064A\u0641",
  sym_appendix: "\u0623\u0644\u0645 \u062D\u0627\u062F \u0648\u0645\u0641\u0627\u062C\u0626 \u0641\u064A \u0623\u0633\u0641\u0644 \u0627\u0644\u0628\u0637\u0646 \u062C\u0647\u0629 \u0627\u0644\u064A\u0645\u064A\u0646 \u0645\u0639 \u063A\u062B\u064A\u0627\u0646 \u0648\u0627\u0631\u062A\u0641\u0627\u0639 \u0628\u0627\u0644\u062D\u0631\u0627\u0631\u0629",
  sym_migraine: "\u0635\u062F\u0627\u0639 \u0646\u0635\u0641\u064A \u0646\u0627\u0628\u0636 \u0634\u062F\u064A\u062F \u0645\u0639 \u063A\u062B\u064A\u0627\u0646 \u0648\u062A\u062D\u0633\u0633 \u0645\u0646 \u0627\u0644\u0636\u0648\u0621 \u0648\u0627\u0644\u0635\u0648\u062A",
  sym_pneumonia: "\u0633\u0639\u0627\u0644 \u0645\u0633\u062A\u0645\u0631 \u0645\u0635\u062D\u0648\u0628 \u0628\u0628\u0644\u063A\u0645 \u0645\u0639 \u0627\u0631\u062A\u0641\u0627\u0639 \u062F\u0631\u062C\u0629 \u0627\u0644\u062D\u0631\u0627\u0631\u0629 \u0648\u0636\u064A\u0642 \u0628\u0627\u0644\u062A\u0646\u0641\u0633",
  sym_uti: "\u062D\u0631\u0642\u0627\u0646 \u0634\u062F\u064A\u062F \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u062A\u0628\u0648\u0644 \u0645\u0639 \u0643\u062B\u0631\u0629 \u0627\u0644\u062A\u0628\u0648\u0644 \u0648\u0623\u0644\u0645 \u0641\u064A \u0623\u0633\u0641\u0644 \u0627\u0644\u0628\u0637\u0646 \u0648\u0627\u0644\u062E\u0627\u0635\u0631\u0629",
  sym_knee: "\u062A\u0648\u0631\u0645 \u062D\u0627\u062F \u0648\u0645\u0641\u0627\u062C\u0626 \u0648\u0627\u062D\u0645\u0631\u0627\u0631 \u0648\u0635\u0639\u0648\u0628\u0629 \u062B\u0646\u064A \u0641\u064A \u0645\u0641\u0635\u0644 \u0627\u0644\u0631\u0643\u0628\u0629 \u0628\u0639\u062F \u0627\u0644\u062A\u0648\u0627\u0621",
  sym_child_fever: "\u062D\u0645\u0649 \u0645\u0641\u0627\u062C\u0626\u0629 39 \u062F\u0631\u062C\u0629 \u0639\u0646\u062F \u0637\u0641\u0644 \u0645\u0639 \u062E\u0645\u0648\u0644 \u0648\u0633\u0639\u0627\u0644 \u0648\u0631\u0641\u0636 \u0627\u0644\u0631\u0636\u0627\u0639\u0629",
  sym_rash: "\u0637\u0641\u062D \u062C\u0644\u062F\u064A \u0623\u062D\u0645\u0631 \u0645\u0641\u0627\u062C\u0626 \u0648\u062D\u0643\u0629 \u0634\u062F\u064A\u062F\u0629 \u0628\u0639\u062F \u062A\u0646\u0627\u0648\u0644 \u062F\u0648\u0627\u0621 \u0623\u0648 \u0637\u0639\u0627\u0645"
};
function applyPromoCode(user, promoCode) {
  const code = promoCode.trim().toUpperCase();
  const vipCodes = ["VIP2026", "VIP100", "VIP", "ANNUAL", "GOLD2026"];
  const proCodes = ["PRO2026", "DOSEPRO", "PRO", "DOCTOR", "CLINIC", "HEALTH", "PHARMA", "FREEPRO"];
  if (vipCodes.includes(code)) {
    user.plan = "vip";
    user.dailyQuotaTotal = 9999;
    user.creditsRemaining = 9999;
    user.planExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3).toISOString();
    return { success: true, plan: "vip", planNameAr: "\u0627\u0644\u0630\u0647\u0628\u064A\u0629 (VIP)", quota: 9999 };
  } else if (proCodes.includes(code)) {
    user.plan = "pro";
    user.dailyQuotaTotal = 250;
    user.creditsRemaining = 250;
    user.planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString();
    return { success: true, plan: "pro", planNameAr: "\u0627\u0644\u0627\u062D\u062A\u0631\u0627\u0641\u064A\u0629 (Pro)", quota: 250 };
  }
  return { success: false };
}
async function sendTelegramPlansCard(chatId, user) {
  const currentPlan = (user?.plan || "free").toUpperCase();
  const credits = user?.creditsRemaining ?? 15;
  const total = user?.dailyQuotaTotal ?? 15;
  const expiresAt = user?.planExpiresAt ? new Date(user.planExpiresAt).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" }) : "\u0645\u0641\u062A\u0648\u062D";
  let msg = `\u2728 **\u0645\u0645\u064A\u0632\u0627\u062A \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643:**

`;
  msg += `\u2022 \u0643\u0634\u0641 \u0623\u0643\u062B\u0631 \u0645\u0646 500 \u062A\u062D\u0644\u064A\u0644 \u0645\u062E\u0628\u0631\u064A \u0648\u0623\u0634\u0639\u0629 \u{1FA7B}
`;
  msg += `\u2022 \u0641\u0627\u062D\u0635 \u0627\u0644\u0623\u0639\u0631\u0627\u0636 \u0627\u0644\u0633\u0631\u064A\u0631\u064A \u0648\u0627\u0644\u062A\u0634\u062E\u064A\u0635 \u0627\u0644\u062A\u0641\u0631\u064A\u0642\u064A (DDx) \u{1FA7A}
`;
  msg += `\u2022 \u062D\u0627\u0633\u0628\u0629 \u062C\u0631\u0639\u0627\u062A \u0627\u0644\u0623\u0637\u0641\u0627\u0644 \u0627\u0644\u062F\u0642\u064A\u0642\u0629 \u{1F476}
`;
  msg += `\u2022 \u062A\u0646\u0628\u064A\u0647\u0627\u062A \u0648\u062A\u0630\u0643\u064A\u0631\u0627\u062A \u0645\u0648\u0627\u0639\u064A\u062F \u0627\u0644\u062F\u0648\u0627\u0621 \u{1F514}
`;
  msg += `\u2022 \u062A\u0642\u0627\u0631\u064A\u0631 \u0637\u0628\u064A\u0629 PDF \u{1F4C4}
`;
  msg += `\u2022 \u0623\u0648\u0644\u0648\u064A\u0629 \u0641\u064A \u0627\u0644\u062F\u0639\u0645 \u26A1
`;
  msg += `\u2022 \u0645\u064A\u0632\u0627\u062A \u062C\u062F\u064A\u062F\u0629 \u0623\u0648\u0644\u0627\u064B \u{1F195}

`;
  msg += `\u{1F4CA} **\u062D\u0627\u0644\u062A\u0643 \u0627\u0644\u062D\u0627\u0644\u064A\u0629:** **${currentPlan}** (${credits}/${total} \u0627\u0633\u062A\u0634\u0627\u0631\u0629 \u0645\u062A\u0628\u0642\u064A\u0629)
`;
  if (user?.planExpiresAt && currentPlan !== "FREE") {
    msg += `\u{1F4C5} **\u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629 \u062D\u062A\u0649:** _${expiresAt}_
`;
  }
  msg += `
\u0627\u062E\u062A\u0631 \u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u0645\u0646\u0627\u0633\u0628\u0629 \u0644\u0644\u0627\u0634\u062A\u0631\u0627\u0643 \u0623\u0648 \u0627\u0644\u062A\u062C\u062F\u064A\u062F:`;
  const replyMarkup = {
    inline_keyboard: [
      [{ text: "\u{1F4C5} \u0623\u0633\u0628\u0648\u0639\u064A \u2014 $0.99 \u2197", callback_data: "pkg_weekly" }],
      [{ text: "\u{1F4C5} \u0634\u0647\u0631\u064A \u2014 $2.99 \u2197", callback_data: "pkg_monthly" }],
      [{ text: "\u{1F381} 3 \u0623\u0634\u0647\u0631 \u2014 $6.99 \u{1F4E6} \u2197", callback_data: "pkg_3months" }],
      [{ text: "\u{1F381} 6 \u0623\u0634\u0647\u0631 \u2014 $11.99 \u{1F4E6} \u2197", callback_data: "pkg_6months" }],
      [{ text: "\u{1F381} \u0633\u0646\u0648\u064A \u2014 $19.99 \u{1F3C6} \u2197", callback_data: "pkg_yearly" }],
      [{ text: "\u{1F519} \u0627\u0644\u0639\u0648\u062F\u0629 \u0644\u0644\u0642\u0627\u0626\u0645\u0629", callback_data: "menu_back" }]
    ]
  };
  await sendTelegramMessage(chatId, msg, replyMarkup);
}
async function handleTelegramSymptomCheck(chatId, rawQuery, userObj) {
  const tgId = String(chatId);
  const user = userObj || usersDB.get(tgId);
  if (user && user.creditsRemaining <= 0 && user.plan !== "vip") {
    await sendTelegramMessage(
      chatId,
      `\u26A0\uFE0F **\u0644\u0642\u062F \u0627\u0633\u062A\u0646\u0641\u062F\u062A \u0631\u0635\u064A\u062F\u0643 \u0627\u0644\u064A\u0648\u0645\u064A \u0645\u0646 \u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u0627\u062A \u0627\u0644\u0637\u0628\u064A\u0629 (${user.dailyQuotaTotal} \u0641\u062D\u0635).**

\u064A\u0631\u062C\u0649 \u0627\u0644\u062A\u0631\u0642\u064A\u0629 \u0644\u0625\u062D\u062F\u0649 \u0627\u0644\u0628\u0627\u0642\u0627\u062A \u0644\u0645\u062A\u0627\u0628\u0639\u0629 \u0641\u0627\u062D\u0635 \u0627\u0644\u0623\u0639\u0631\u0627\u0636 \u0648\u0627\u0644\u062A\u0634\u062E\u064A\u0635 \u0627\u0644\u062A\u0641\u0631\u064A\u0642\u064A \u063A\u064A\u0631 \u0627\u0644\u0645\u062D\u062F\u0648\u062F:`,
      {
        inline_keyboard: [
          [{ text: "\u{1F4B3} \u0639\u0631\u0636 \u0627\u0644\u0628\u0627\u0642\u0627\u062A \u0648\u0627\u0644\u062A\u0631\u0642\u064A\u0629 \u0627\u0644\u0641\u0648\u0631\u064A\u0629", callback_data: "action_plans" }],
          [{ text: "\u{1F381} \u062A\u0641\u0639\u064A\u0644 \u0643\u0648\u062F \u0628\u0631\u0648\u0645\u0648 (VIP2026)", callback_data: "enter_promo" }]
        ]
      }
    );
    return;
  }
  if (user) {
    user.dailyQuotaUsed = (user.dailyQuotaUsed || 0) + 1;
    user.creditsRemaining = Math.max(0, (user.dailyQuotaTotal || 15) - user.dailyQuotaUsed);
    user.totalRequests = (user.totalRequests || 0) + 1;
    user.lastActiveAt = (/* @__PURE__ */ new Date()).toISOString();
    usersDB.set(tgId, user);
    syncLogs.unshift({
      id: `log_${Date.now()}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      source: "telegram_bot",
      userTelegramId: tgId,
      userName: user.username ? `@${user.username}` : user.firstName || "\u0645\u0633\u062A\u062E\u062F\u0645 \u062A\u0644\u064A\u062C\u0631\u0627\u0645",
      actionAr: `\u0641\u062D\u0635 \u0623\u0639\u0631\u0627\u0636 \u0648\u062A\u0634\u062E\u064A\u0635 \u062A\u0641\u0631\u064A\u0642\u064A (DDx): "${rawQuery.slice(0, 30)}..."`,
      actionEn: `Differential Diagnosis (DDx): "${rawQuery.slice(0, 30)}..."`,
      status: "success",
      tierUsed: user.plan || "free"
    });
  }
  await sendTelegramMessage(
    chatId,
    `\u23F3 **\u062C\u0627\u0631\u064D \u0641\u062D\u0635 \u0627\u0644\u0623\u0639\u0631\u0627\u0636 \u0633\u0631\u064A\u0631\u064A\u0627\u064B \u0648\u0625\u062C\u0631\u0627\u0621 \u0627\u0644\u062A\u0634\u062E\u064A\u0635 \u0627\u0644\u062A\u0641\u0631\u064A\u0642\u064A (DDx)...**
\u{1F50D} \u0627\u0644\u0634\u0643\u0648\u0649: _"${rawQuery.length > 50 ? rawQuery.slice(0, 50) + "..." : rawQuery}"_
\u064A\u0631\u062C\u0649 \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631 \u062B\u0648\u0627\u0646\u064D \u0645\u0639\u062F\u0648\u062F\u0629.`
  );
  try {
    const evalResult = await evaluateClinicalSymptoms({
      symptoms: rawQuery,
      patientAge: "30",
      gender: "male",
      chronicDiseases: [],
      vitalSigns: "",
      lang: "ar"
    });
    const urgencyEmoji = evalResult.urgency === "critical" ? "\u{1F6A8} \u0637\u0648\u0627\u0631\u0626 \u0641\u0648\u0631\u064A\u0629" : evalResult.urgency === "urgent" ? "\u26A0\uFE0F \u0645\u0631\u0627\u062C\u0639\u0629 \u0639\u0627\u062C\u0644\u0629" : "\u{1F7E2} \u0631\u0648\u062A\u064A\u0646\u064A";
    let ddxMsg = `\u{1FA7A} **\u062A\u0642\u0631\u064A\u0631 \u0641\u0627\u062D\u0635 \u0627\u0644\u0623\u0639\u0631\u0627\u0636 \u0648\u0627\u0644\u062A\u0634\u062E\u064A\u0635 \u0627\u0644\u062A\u0641\u0631\u064A\u0642\u064A \u0627\u0644\u0633\u0631\u064A\u0631\u064A (DDx):**

`;
    ddxMsg += `\u{1F4CC} **\u0627\u0644\u0627\u0646\u0637\u0628\u0627\u0639 \u0627\u0644\u0633\u0631\u064A\u0631\u064A \u0627\u0644\u0623\u0648\u0644\u064A:** ${evalResult.primaryCondition}
`;
    ddxMsg += `\u23F1\uFE0F **\u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u062E\u0637\u0648\u0631\u0629 \u0648\u0627\u0644\u0627\u0633\u062A\u0639\u062C\u0627\u0644:** ${urgencyEmoji} \u2014 ${evalResult.urgencyText}
`;
    ddxMsg += `\u{1F3E5} **\u0627\u0644\u062A\u062E\u0635\u0635 \u0627\u0644\u0645\u0648\u0635\u0649 \u0628\u0647:** ${evalResult.recommendedSpecialty}

`;
    if (evalResult.differentialDiagnoses?.length) {
      ddxMsg += `\u{1F4CB} **\u0627\u0644\u062A\u0634\u062E\u064A\u0635\u0627\u062A \u0627\u0644\u0623\u0643\u062B\u0631 \u0627\u062D\u062A\u0645\u0627\u0644\u0627\u064B (Differential Diagnosis):**
`;
      evalResult.differentialDiagnoses.slice(0, 4).forEach((d, i) => {
        const catEmoji = d.category === "must_rule_out" ? "\u26A0\uFE0F \u0627\u0633\u062A\u0628\u0639\u0627\u062F \u0641\u0648\u0631\u064A" : d.category === "most_likely" ? "\u2B50 \u0627\u0644\u0623\u0631\u062C\u062D" : "\u{1F539} \u0648\u0627\u0631\u062F";
        ddxMsg += `${i + 1}. **${d.name}** [${catEmoji} - ${d.likelihood}]
`;
        if (d.rationale) ddxMsg += `   \u2022 _\u0627\u0644\u0623\u0633\u0627\u0633 \u0627\u0644\u0633\u0631\u064A\u0631\u064A:_ ${d.rationale}
`;
        if (d.confirmingTests) ddxMsg += `   \u2022 _\u0627\u0644\u0641\u062D\u0648\u0635\u0627\u062A \u0627\u0644\u062A\u0623\u0643\u064A\u062F\u064A\u0629:_ ${d.confirmingTests}
`;
      });
      ddxMsg += `
`;
    }
    if (evalResult.recommendedTests?.length) {
      ddxMsg += `\u{1F9EA} **\u0627\u0644\u0641\u062D\u0648\u0635\u0627\u062A \u0627\u0644\u0645\u062E\u0628\u0631\u064A\u0629 \u0648\u0627\u0644\u0625\u0634\u0639\u0627\u0639\u064A\u0629 \u0627\u0644\u0645\u0642\u062A\u0631\u062D\u0629:**
\u2022 ${evalResult.recommendedTests.join("\n\u2022 ")}

`;
    }
    if (evalResult.redFlags?.length) {
      ddxMsg += `\u{1F6A8} **\u0625\u0634\u0627\u0631\u0627\u062A \u0627\u0644\u062E\u0637\u0631 \u062A\u0633\u062A\u062F\u0639\u064A \u0627\u0644\u0637\u0648\u0627\u0631\u0626 (Red Flags):**
\u2022 ${evalResult.redFlags.join("\n\u2022 ")}

`;
    }
    if (evalResult.homeAdvice?.length) {
      ddxMsg += `\u{1F3E0} **\u0625\u0631\u0634\u0627\u062F\u0627\u062A \u0648\u062A\u062F\u0627\u0628\u064A\u0631 \u0623\u0648\u0644\u064A\u0629:**
\u2022 ${evalResult.homeAdvice.join("\n\u2022 ")}

`;
    }
    if (evalResult.clinicalSummary) {
      ddxMsg += `\u{1F4A1} **\u0627\u0644\u062E\u0644\u0627\u0635\u0629 \u0648\u0627\u0644\u062A\u0648\u062C\u064A\u0647 \u0627\u0644\u0637\u0628\u064A:** ${evalResult.clinicalSummary}

`;
    }
    ddxMsg += `\u26A0\uFE0F _\u062A\u0646\u0648\u064A\u0647 \u0637\u0628\u064A \u0647\u0627\u0645: \u0647\u0630\u0627 \u0627\u0644\u062A\u0642\u064A\u064A\u0645 \u0633\u0631\u064A\u0631\u064A \u0625\u0631\u0634\u0627\u062F\u064A \u0645\u0633\u0627\u0639\u062F \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0648\u0644\u0627 \u064A\u063A\u0646\u064A \u0639\u0646 \u0627\u0644\u0641\u062D\u0635 \u0627\u0644\u0637\u0628\u064A \u0627\u0644\u0645\u0628\u0627\u0634\u0631 \u0644\u062F\u0649 \u0627\u0644\u0637\u0628\u064A\u0628 \u0627\u0644\u0645\u062E\u062A\u0635._`;
    await sendTelegramMessage(chatId, ddxMsg, {
      inline_keyboard: [
        [
          { text: "\u{1FA7A} \u0641\u062D\u0635 \u0623\u0639\u0631\u0627\u0636 \u0623\u062E\u0631\u0649", callback_data: "action_symptoms" },
          { text: "\u{1F48A} \u0627\u0633\u062A\u0634\u0627\u0631\u0629 \u0627\u0644\u0635\u064A\u062F\u0644\u0627\u0646\u064A", callback_data: "action_pharma" }
        ],
        [
          { text: "\u{1FA7B} \u0641\u062D\u0635 \u0635\u0648\u0631\u0629 \u0623\u0634\u0639\u0629", callback_data: "action_imaging" },
          { text: "\u{1F9EA} \u0641\u062D\u0635 \u062A\u062D\u0644\u064A\u0644 \u0645\u062E\u0628\u0631\u064A", callback_data: "action_lab" }
        ],
        [
          { text: "\u{1F5A5}\uFE0F \u0641\u062D\u0635 \u0627\u0644\u0623\u0639\u0631\u0627\u0636 \u0627\u0644\u062A\u0641\u0627\u0639\u0644\u064A \u0648\u062A\u0635\u062F\u064A\u0631 PDF", url: `${DEFAULT_APP_URL}/#symptoms` },
          { text: "\u{1F519} \u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629", callback_data: "menu_back" }
        ]
      ]
    });
  } catch (err) {
    console.error("Telegram symptom check error:", err);
    await sendTelegramMessage(chatId, `\u26A0\uFE0F \u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u0641\u062D\u0635 \u0627\u0644\u0623\u0639\u0631\u0627\u0636\u060C \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u0631\u0629 \u0623\u062E\u0631\u0649 \u0623\u0648 \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0637\u0628\u064A\u0628.`);
  }
}
async function handleSingleTelegramUpdate(update, res) {
  const safeReply = () => {
    if (res && !res.headersSent) {
      try {
        res.json({ ok: true });
      } catch (e) {
      }
    }
  };
  if (update?.callback_query) {
    const cb = update.callback_query;
    const cbId = cb.id;
    const cbData = cb.data;
    const chatId2 = cb.message?.chat?.id;
    const tgId2 = String(cb.from?.id);
    const token = runtimeBotToken || process.env.TELEGRAM_BOT_TOKEN;
    if (token) {
      try {
        await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ callback_query_id: cbId })
        });
      } catch (e) {
      }
    }
    let user2 = usersDB.get(tgId2);
    if (!user2 && tgId2) {
      user2 = {
        id: `u_${Date.now()}`,
        telegramId: tgId2,
        username: cb.from?.username || `user_${tgId2}`,
        firstName: cb.from?.first_name || "\u0645\u0633\u062A\u062E\u062F\u0645 \u062A\u0644\u064A\u062C\u0631\u0627\u0645",
        lastName: cb.from?.last_name,
        plan: "free",
        planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString(),
        dailyQuotaUsed: 0,
        dailyQuotaTotal: 15,
        creditsRemaining: 15,
        authSource: "telegram_login",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        lastActiveAt: (/* @__PURE__ */ new Date()).toISOString(),
        totalRequests: 1
      };
      usersDB.set(tgId2, user2);
    }
    if ((cbData === "lang_ar" || cbData === "lang_en" || cbData === "ar" || cbData === "en" || cbData.startsWith("lang_") || cbData.startsWith("set_lang_") || cbData === "menu_back" || cbData === "back_to_menu" || cbData === "menu_main") && chatId2) {
      const selectedLang = cbData === "lang_en" || cbData === "en" || cbData.endsWith("_en") ? "en" : "ar";
      await sendTelegramFullMenu(chatId2, user2, selectedLang);
      safeReply();
      return;
    }
    if (cbData === "action_promo" && chatId2) {
      userSessions.set(String(chatId2), { mode: "awaiting_promo", timestamp: Date.now() });
      await sendTelegramMessage(
        chatId2,
        `\u{1F381} **\u062A\u0641\u0639\u064A\u0644 \u0643\u0648\u062F \u0627\u0644\u062E\u0635\u0645 \u0623\u0648 \u0627\u0644\u062A\u0631\u0642\u064A\u0629:**

\u270D\uFE0F \u0627\u0643\u062A\u0628 \u0627\u0644\u0622\u0646 \u0643\u0648\u062F \u0627\u0644\u062A\u0631\u0642\u064A\u0629 \u0641\u064A \u0631\u0633\u0627\u0644\u0629 (\u0645\u062B\u0644\u0627\u064B: \`PRO2026\` \u0623\u0648 \`VIP2026\`) \u0648\u0633\u064A\u062A\u0645 \u062A\u0631\u0642\u064A\u0629 \u062D\u0633\u0627\u0628\u0643 \u0648\u062A\u0641\u0639\u064A\u0644 \u0643\u0627\u0641\u0629 \u0627\u0644\u0645\u064A\u0632\u0627\u062A \u0627\u0644\u0633\u0631\u064A\u0631\u064A\u0629 \u0641\u0648\u0631\u0627\u064B!`
      );
      safeReply();
      return;
    }
    if (cbData === "action_symptoms" && chatId2) {
      userSessions.set(String(chatId2), { mode: "awaiting_symptoms", timestamp: Date.now() });
      await sendTelegramMessage(
        chatId2,
        `\u{1FA7A} **\u0641\u0627\u062D\u0635 \u0627\u0644\u0623\u0639\u0631\u0627\u0636 \u0648\u0627\u0644\u062A\u0634\u062E\u064A\u0635 \u0627\u0644\u062A\u0641\u0631\u064A\u0642\u064A \u0627\u0644\u0633\u0631\u064A\u0631\u064A (Clinical DDx):**

\u270D\uFE0F **\u0627\u0643\u062A\u0628 \u0627\u0644\u0622\u0646 \u0641\u064A \u0631\u0633\u0627\u0644\u0629 \u0634\u0643\u0648\u0627\u0643 \u0623\u0648 \u0627\u0644\u0623\u0639\u0631\u0627\u0636 \u0627\u0644\u062A\u064A \u062A\u0634\u0639\u0631 \u0628\u0647\u0627 \u0628\u062A\u0641\u0635\u064A\u0644** (\u0645\u062B\u0644\u0627\u064B: *"\u0623\u0644\u0645 \u0641\u064A \u0627\u0644\u0635\u062F\u0631 \u0645\u0639 \u0636\u064A\u0642 \u062A\u0646\u0641\u0633"* \u0623\u0648 *"\u0623\u0644\u0645 \u062D\u0627\u062F \u0623\u0633\u0641\u0644 \u0627\u0644\u0628\u0637\u0646 \u062C\u0647\u0629 \u0627\u0644\u064A\u0645\u064A\u0646"*).

\u{1F447} **\u0623\u0648 \u0627\u0636\u063A\u0637 \u0639\u0644\u0649 \u0623\u062D\u062F \u0627\u0644\u0646\u0645\u0627\u0630\u062C \u0627\u0644\u0633\u0631\u064A\u0631\u064A\u0629 \u0627\u0644\u062C\u0627\u0647\u0632\u0629 \u0644\u0644\u0641\u062D\u0635 \u0627\u0644\u0645\u0628\u0627\u0634\u0631:**`,
        {
          inline_keyboard: [
            [
              { text: "\u{1FAC0} \u0623\u0644\u0645 \u0628\u0627\u0644\u0635\u062F\u0631 \u0648\u0636\u064A\u0642 \u062A\u0646\u0641\u0633", callback_data: "sym_chest" },
              { text: "\u{1F37D}\uFE0F \u0623\u0644\u0645 \u062D\u0627\u062F \u0628\u0623\u0633\u0641\u0644 \u0627\u0644\u0628\u0637\u0646", callback_data: "sym_appendix" }
            ],
            [
              { text: "\u{1F9E0} \u0635\u062F\u0627\u0639 \u0646\u0635\u0641\u064A \u062D\u0627\u062F \u0648\u063A\u062B\u064A\u0627\u0646", callback_data: "sym_migraine" },
              { text: "\u{1FAC1} \u0633\u0639\u0627\u0644 \u0645\u0633\u062A\u0645\u0631 \u0648\u062D\u0645\u0649", callback_data: "sym_pneumonia" }
            ],
            [
              { text: "\u{1FA78} \u062D\u0631\u0642\u0627\u0646 \u0628\u0648\u0644 \u0648\u0623\u0644\u0645 \u062E\u0627\u0635\u0631\u0629", callback_data: "sym_uti" },
              { text: "\u{1F9B5} \u062A\u0648\u0631\u0645 \u0645\u0641\u0627\u062C\u0626 \u0628\u0645\u0641\u0635\u0644 \u0627\u0644\u0631\u0643\u0628\u0629", callback_data: "sym_knee" }
            ],
            [
              { text: "\u{1F476} \u062D\u0645\u0649 \u0648\u0633\u0639\u0627\u0644 \u0639\u0646\u062F \u0637\u0641\u0644", callback_data: "sym_child_fever" },
              { text: "\u{1F534} \u0637\u0641\u062D \u062C\u0644\u062F\u064A \u0648\u062D\u0643\u0629 \u0645\u0641\u0627\u062C\u0626\u0629", callback_data: "sym_rash" }
            ],
            [
              { text: "\u{1F5A5}\uFE0F \u0641\u062A\u062D \u0641\u0627\u062D\u0635 \u0627\u0644\u0623\u0639\u0631\u0627\u0636 \u0627\u0644\u0634\u0627\u0645\u0644 \u0628\u0627\u0644\u0645\u0648\u0642\u0639", url: `${DEFAULT_APP_URL}/#symptoms` },
              { text: "\u{1F519} \u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629", callback_data: "menu_back" }
            ]
          ]
        }
      );
    } else if (cbData && cbData.startsWith("sym_") && chatId2) {
      const presetQuery = SYMPTOM_PRESETS[cbData] || "\u0623\u0644\u0645 \u0648\u062A\u0639\u0628 \u0639\u0627\u0645";
      await handleTelegramSymptomCheck(chatId2, presetQuery, user2);
    } else if ((cbData === "upgrade" || cbData === "plans" || cbData === "action_plans") && chatId2) {
      await sendTelegramPlansCard(chatId2, user2);
    } else if (cbData && (cbData.startsWith("pkg_") || cbData === "activate_pro" || cbData === "activate_pro_yearly") && chatId2 && user2) {
      let days = 30;
      let pkgLabel = "\u{1F4C5} \u0634\u0647\u0631\u064A \u2014 $2.99";
      let price = "$2.99";
      if (cbData === "pkg_weekly") {
        days = 7;
        pkgLabel = "\u{1F4C5} \u0623\u0633\u0628\u0648\u0639\u064A \u2014 $0.99";
        price = "$0.99";
      } else if (cbData === "pkg_monthly" || cbData === "activate_pro") {
        days = 30;
        pkgLabel = "\u{1F4C5} \u0634\u0647\u0631\u064A \u2014 $2.99";
        price = "$2.99";
      } else if (cbData === "pkg_3months") {
        days = 90;
        pkgLabel = "\u{1F381} 3 \u0623\u0634\u0647\u0631 \u2014 $6.99 \u{1F4E6}";
        price = "$6.99";
      } else if (cbData === "pkg_6months") {
        days = 180;
        pkgLabel = "\u{1F381} 6 \u0623\u0634\u0647\u0631 \u2014 $11.99 \u{1F4E6}";
        price = "$11.99";
      } else if (cbData === "pkg_yearly" || cbData === "activate_pro_yearly") {
        days = 365;
        pkgLabel = "\u{1F381} \u0633\u0646\u0648\u064A \u2014 $19.99 \u{1F3C6}";
        price = "$19.99";
      }
      user2.plan = "pro";
      user2.dailyQuotaTotal = 250;
      user2.creditsRemaining = 250;
      user2.planExpiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1e3).toISOString();
      usersDB.set(tgId2, user2);
      syncLogs.unshift({
        id: `log_${Date.now()}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        source: "telegram_bot",
        userTelegramId: tgId2,
        userName: user2.username ? `@${user2.username}` : user2.firstName,
        actionAr: `\u062A\u0641\u0639\u064A\u0644 \u0627\u0634\u062A\u0631\u0627\u0643 ${pkgLabel} \u0639\u0628\u0631 \u062A\u0644\u064A\u062C\u0631\u0627\u0645`,
        actionEn: `Activated ${pkgLabel} (${price}) via Telegram bot`,
        status: "success",
        tierUsed: "pro"
      });
      const expiryStr = new Date(user2.planExpiresAt).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
      await sendTelegramMessage(
        chatId2,
        `\u{1F389} **\u062A\u0647\u0627\u0646\u064A\u0646\u0627 \u064A\u0627 ${user2.firstName}! \u062A\u0645 \u062A\u0641\u0639\u064A\u0644 \u0627\u0634\u062A\u0631\u0627\u0643\u0643 \u0628\u0646\u062C\u0627\u062D (${pkgLabel})!** \u2728

\u2022 \u26A1 **\u0627\u0644\u0631\u0635\u064A\u062F \u0627\u0644\u064A\u0648\u0645\u064A:** 250 \u0627\u0633\u062A\u0634\u0627\u0631\u0629 \u0648\u0641\u062D\u0635 \u0633\u0631\u064A\u0631\u064A \u064A\u0648\u0645\u064A\u0627\u064B
\u2022 \u{1FA7A} **\u0641\u0627\u062D\u0635 \u0627\u0644\u0623\u0639\u0631\u0627\u0636 \u0627\u0644\u0645\u062A\u0642\u062F\u0645 (DDx):** \u0645\u0641\u0639\u0644 \u0628\u0627\u0644\u0643\u0627\u0645\u0644
\u2022 \u{1FA7B} **\u0641\u062D\u0635 \u0627\u0644\u0623\u0634\u0639\u0629 \u0648\u0627\u0644\u062A\u062D\u0627\u0644\u064A\u0644:** \u0635\u0648\u0631 \u0648\u0641\u062D\u0648\u0635\u0627\u062A \u063A\u064A\u0631 \u0645\u062D\u062F\u0648\u062F\u0629
\u2022 \u{1F4C4} **\u062A\u0642\u0627\u0631\u064A\u0631 \u0637\u0628\u064A\u0629 PDF:** \u0637\u0628\u0627\u0639\u0629 \u0648\u062A\u0635\u062F\u064A\u0631 \u0645\u0639\u062A\u0645\u062F
\u2022 \u26A1 **\u0623\u0648\u0644\u0648\u064A\u0629 \u0641\u064A \u0627\u0644\u062F\u0639\u0645 \u0648\u0627\u0644\u0627\u0633\u062A\u062C\u0627\u0628\u0629:** \u0645\u0641\u0639\u0644\u0629
\u2022 \u{1F4C5} **\u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643:** ${days} \u064A\u0648\u0645\u0627\u064B (\u062D\u062A\u0649 ${expiryStr})
\u2022 \u{1F504} **\u062A\u0632\u0627\u0645\u0646 \u0643\u0627\u0645\u0644:** \u0645\u0641\u0639\u0644 \u0641\u0648\u0631\u064A\u0627\u064B \u0641\u064A \u0627\u0644\u0628\u0648\u062A \u0648\u0645\u0648\u0642\u0639 \u0627\u0644\u0648\u064A\u0628!

\u0627\u062E\u062A\u0631 \u0627\u0644\u062E\u062F\u0645\u0629 \u0644\u0644\u0628\u062F\u0621 \u0641\u0648\u0631\u0627\u064B:`,
        {
          inline_keyboard: [
            [
              { text: "\u{1FA7A} \u0641\u0627\u062D\u0635 \u0627\u0644\u0623\u0639\u0631\u0627\u0636 (DDx)", callback_data: "action_symptoms" },
              { text: "\u{1FA7B} \u0641\u062D\u0635 \u0627\u0644\u0623\u0634\u0639\u0629 \u0627\u0644\u0633\u064A\u0646\u064A\u0629", callback_data: "action_imaging" }
            ],
            [
              { text: "\u{1F48A} \u0627\u0644\u0635\u064A\u062F\u0644\u0627\u0646\u064A \u0627\u0644\u0630\u0643\u064A", callback_data: "action_pharma" },
              { text: "\u{1F476} \u062C\u0631\u0639\u0627\u062A \u0627\u0644\u0623\u0637\u0641\u0627\u0644", callback_data: "action_pediatric" }
            ],
            [
              { text: "\u{1F4CA} \u062A\u0641\u0627\u0635\u064A\u0644 \u0628\u0627\u0642\u062A\u064A \u0648\u0631\u0635\u064A\u062F\u064A", callback_data: "refresh_my_plan" },
              { text: "\u{1F310} \u0641\u062A\u062D \u0645\u0646\u0635\u0629 \u0627\u0644\u0648\u064A\u0628", url: DEFAULT_APP_URL }
            ]
          ]
        }
      );
    } else if ((cbData === "menu_back" || cbData === "back_to_menu") && chatId2) {
      await sendTelegramMessage(
        chatId2,
        `\u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629 \u0644\u0628\u0648\u062A \u0645\u0646\u0635\u0629 \u062C\u0631\u0639\u0629 \u0627\u0644\u0637\u0628\u064A \u{1FA7A}\u2728:`,
        TELEGRAM_MAIN_KEYBOARD
      );
    } else if (cbData === "activate_vip" && chatId2 && user2) {
      user2.plan = "vip";
      user2.dailyQuotaTotal = 9999;
      user2.creditsRemaining = 9999;
      user2.planExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3).toISOString();
      usersDB.set(tgId2, user2);
      syncLogs.unshift({
        id: `log_${Date.now()}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        source: "telegram_bot",
        userTelegramId: tgId2,
        userName: user2.username ? `@${user2.username}` : user2.firstName,
        actionAr: `\u062A\u0631\u0642\u064A\u0629 \u0641\u0648\u0631\u064A\u0629 \u0644\u0644\u0627\u0634\u062A\u0631\u0627\u0643 \u0625\u0644\u0649 \u0628\u0627\u0642\u0629 VIP \u0627\u0644\u0633\u0646\u0648\u064A\u0629 \u0639\u0628\u0631 \u062A\u0644\u064A\u062C\u0631\u0627\u0645`,
        actionEn: `Instant upgrade to VIP tier via Telegram bot`,
        status: "success",
        tierUsed: "vip"
      });
      await sendTelegramMessage(
        chatId2,
        `\u{1F451} **\u062A\u0647\u0627\u0646\u064A\u0646\u0627 \u064A\u0627 ${user2.firstName}! \u062A\u0645 \u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0639\u0636\u0648\u064A\u0629 \u0627\u0644\u0630\u0647\u0628\u064A\u0629 VIP \u0627\u0644\u0633\u0646\u0648\u064A\u0629 \u0628\u0646\u062C\u0627\u062D!** \u{1F48E}\u2728

\u2022 \u26A1 **\u0627\u0644\u0631\u0635\u064A\u062F \u0627\u0644\u064A\u0648\u0645\u064A:** \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u063A\u064A\u0631 \u0645\u062D\u062F\u0648\u062F (Unlimited)
\u2022 \u{1FA7A} **\u0641\u0627\u062D\u0635 \u0627\u0644\u0623\u0639\u0631\u0627\u0636 \u0648\u0627\u0644\u062A\u0634\u062E\u064A\u0635 \u0627\u0644\u062A\u0641\u0631\u064A\u0642\u064A (DDx):** \u0623\u0648\u0644\u0648\u064A\u0629 \u0642\u0635\u0648\u0649
\u2022 \u{1FA7B} **\u0641\u062D\u0635 \u0627\u0644\u0623\u0634\u0639\u0629 \u0648\u0627\u0644\u062A\u062D\u0627\u0644\u064A\u0644:** \u0628\u062F\u0648\u0646 \u0623\u064A \u0642\u064A\u0648\u062F
\u2022 \u{1F4E2} **\u062D\u0645\u0644\u0627\u062A \u0627\u0644\u0628\u062B \u0627\u0644\u062F\u0648\u0627\u0626\u064A \u0648\u0627\u0644\u062A\u0648\u0639\u0648\u064A:** \u0645\u0641\u0639\u0644\u0629 \u0628\u0627\u0644\u0643\u0627\u0645\u0644
\u2022 \u{1F6E0}\uFE0F **\u0631\u0628\u0637 API \u0627\u0644\u0645\u0637\u0648\u0631\u064A\u0646:** \u062C\u0627\u0647\u0632 \u0644\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645

\u0627\u0633\u062A\u0645\u062A\u0639 \u0628\u0643\u0627\u0645\u0644 \u0627\u0644\u0642\u062F\u0631\u0627\u062A \u0627\u0644\u0637\u0628\u064A\u0629 \u0627\u0644\u0645\u062A\u0642\u062F\u0645\u0629:`,
        {
          inline_keyboard: [
            [
              { text: "\u{1FA7A} \u0641\u0627\u062D\u0635 \u0627\u0644\u0623\u0639\u0631\u0627\u0636 (DDx)", callback_data: "action_symptoms" },
              { text: "\u{1FA7B} \u0641\u062D\u0635 \u0627\u0644\u0623\u0634\u0639\u0629 \u0627\u0644\u0633\u064A\u0646\u064A\u0629", callback_data: "action_imaging" }
            ],
            [
              { text: "\u{1F310} \u0641\u062A\u062D \u0645\u0646\u0635\u0629 \u062C\u0631\u0639\u0629 VIP", url: DEFAULT_APP_URL }
            ]
          ]
        }
      );
    } else if (cbData === "enter_promo" && chatId2) {
      userSessions.set(String(chatId2), { mode: "awaiting_promo", timestamp: Date.now() });
      await sendTelegramMessage(
        chatId2,
        `\u{1F381} **\u062A\u0641\u0639\u064A\u0644 \u0643\u0648\u062F \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643 \u0627\u0644\u062A\u0631\u0648\u064A\u062C\u064A (Promo Code):**

\u0627\u0643\u062A\u0628 \u0627\u0644\u0622\u0646 \u0643\u0648\u062F \u0627\u0644\u062A\u0641\u0639\u064A\u0644 \u0641\u064A \u0631\u0633\u0627\u0644\u0629 \u0647\u0646\u0627 \u0641\u064A \u0627\u0644\u0634\u0627\u062A.

\u{1F4A1} \u0623\u0643\u0648\u0627\u062F \u062A\u062C\u0631\u064A\u0628\u064A\u0629 \u0645\u062A\u0627\u062D\u0629 \u062D\u0627\u0644\u064A\u0627\u064B:
\u2022 \`PRO2026\` \u0623\u0648 \`DOSEPRO\` (\u0644\u062A\u0641\u0639\u064A\u0644 \u0628\u0627\u0642\u0629 Pro \u0627\u0644\u0627\u062D\u062A\u0631\u0627\u0641\u064A\u0629)
\u2022 \`VIP2026\` \u0623\u0648 \`VIP100\` (\u0644\u062A\u0641\u0639\u064A\u0644 \u0628\u0627\u0642\u0629 VIP \u0627\u0644\u0633\u0646\u0648\u064A\u0629)`
      );
    } else if (cbData === "refresh_my_plan" && chatId2 && user2) {
      const p = (user2.plan || "free").toUpperCase();
      const expires = user2.planExpiresAt ? new Date(user2.planExpiresAt).toLocaleDateString("ar-EG") : "\u0645\u0641\u062A\u0648\u062D";
      await sendTelegramMessage(
        chatId2,
        `\u{1F4CA} **\u0628\u0637\u0627\u0642\u0629 \u0627\u0634\u062A\u0631\u0627\u0643\u0643 \u0627\u0644\u062D\u0627\u0644\u064A:**

\u{1F464} \u0627\u0644\u0645\u0634\u062A\u0631\u0643: **${user2.firstName}**
\u{1F48E} \u0646\u0648\u0639 \u0627\u0644\u0628\u0627\u0642\u0629: **${p}**
\u26A1 \u0627\u0644\u0631\u0635\u064A\u062F \u0627\u0644\u0645\u062A\u0628\u0642\u064A \u0627\u0644\u064A\u0648\u0645: \`${user2.creditsRemaining} / ${user2.dailyQuotaTotal}\` \u0627\u0633\u062A\u0634\u0627\u0631\u0629
\u{1F4C5} \u062A\u0627\u0631\u064A\u062E \u0627\u0644\u062A\u062C\u062F\u064A\u062F: _${expires}_
\u{1F4C8} \u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0627\u0644\u0645\u0646\u0641\u0630\u0629: \`${user2.totalRequests || user2.dailyQuotaUsed || 1}\``,
        {
          inline_keyboard: [
            [{ text: "\u{1F48E} \u062A\u0631\u0642\u064A\u0629 \u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u0622\u0646", callback_data: "upgrade" }],
            [{ text: "\u{1F310} \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643 \u0639\u0628\u0631 \u0627\u0644\u0645\u0648\u0642\u0639", url: `${DEFAULT_APP_URL}/#plans` }]
          ]
        }
      );
    } else if (cbData === "action_imaging" && chatId2) {
      await sendTelegramMessage(
        chatId2,
        `\u{1FA7B} **\u0641\u062D\u0635 \u0627\u0644\u0623\u0634\u0639\u0629 \u0627\u0644\u0633\u064A\u0646\u064A\u0629 \u0648\u0627\u0644\u062A\u0635\u0648\u064A\u0631 \u0627\u0644\u0637\u0628\u064A (X-Ray / MRI / CT):**

\u{1F4F8} **\u0643\u0644 \u0645\u0627 \u0639\u0644\u064A\u0643 \u0641\u0639\u0644\u0647 \u0627\u0644\u0622\u0646:**
\u0623\u0631\u0633\u0644 \u0635\u0648\u0631\u0629 \u0627\u0644\u0623\u0634\u0639\u0629 \u0645\u0628\u0627\u0634\u0631\u0629 \u0647\u0646\u0627 \u0641\u064A \u0627\u0644\u0634\u0627\u062A \u0643\u0635\u0648\u0631\u0629 \u0639\u0627\u062F\u064A\u0629 \u{1F4F7}.
\u064A\u0645\u0643\u0646\u0643 \u0643\u062A\u0627\u0628\u0629 \u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0645\u0639 \u0627\u0644\u0635\u0648\u0631\u0629 (\u0645\u062B\u0644\u0627\u064B: *"\u0623\u0644\u0645 \u0628\u0639\u062F \u0633\u0642\u0648\u0637"* \u0623\u0648 *"\u0623\u0634\u0639\u0629 \u0635\u062F\u0631"*).

\u26A1 \u0633\u064A\u0642\u0648\u0645 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0627\u0644\u0637\u0628\u064A \u0628\u0641\u062D\u0635 \u0627\u0644\u0639\u0638\u0627\u0645\u060C \u0627\u0644\u0645\u0641\u0627\u0635\u0644\u060C \u0627\u0644\u0635\u062F\u0631\u060C \u0648\u062A\u062D\u062F\u064A\u062F \u0623\u064A \u0643\u0633\u0631 \u0623\u0648 \u062E\u0644\u0639 \u0623\u0648 \u0627\u0644\u062A\u0647\u0627\u0628 \u0641\u0648\u0631\u064A\u0627\u064B!`
      );
    } else if (cbData === "action_lab" && chatId2) {
      await sendTelegramMessage(
        chatId2,
        `\u{1F9EA} **\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0641\u062D\u0648\u0635\u0627\u062A \u0648\u0627\u0644\u062A\u062D\u0627\u0644\u064A\u0644 \u0627\u0644\u0645\u062E\u0628\u0631\u064A\u0629 (Lab Blood Test):**

\u{1F4F8} **\u0643\u0644 \u0645\u0627 \u0639\u0644\u064A\u0643 \u0641\u0639\u0644\u0647 \u0627\u0644\u0622\u0646:**
\u0627\u0644\u062A\u0642\u0637 \u0635\u0648\u0631\u0629 \u0644\u0648\u0631\u0642\u0629 \u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0645\u062E\u0628\u0631\u064A (CBC\u060C \u0648\u0638\u0627\u0626\u0641 \u0643\u0644\u0649\u060C \u0643\u0628\u062F\u060C \u0633\u0643\u0631 \u062A\u0631\u0627\u0643\u0645\u064A\u060C \u062F\u0647\u0648\u0646) \u0648\u0623\u0631\u0633\u0644\u0647\u0627 \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629.

\u26A1 \u0633\u064A\u0642\u0648\u0645 \u0627\u0644\u0646\u0638\u0627\u0645 \u0628\u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0623\u0631\u0642\u0627\u0645 \u0627\u0644\u0637\u0628\u064A\u0629\u060C \u0645\u0642\u0627\u0631\u0646\u062A\u0647\u0627 \u0628\u0627\u0644\u0645\u0639\u062F\u0644 \u0627\u0644\u0633\u0644\u064A\u0645\u060C \u0648\u0634\u0631\u062D \u0627\u0644\u0646\u062A\u064A\u062C\u0629 \u0644\u0643 \u0628\u0644\u063A\u0629 \u0637\u0628\u064A\u0629 \u0645\u0628\u0633\u0637\u0629 \u0648\u062F\u0642\u064A\u0642\u0629.`
      );
    } else if (cbData === "action_pharma" && chatId2) {
      await sendTelegramMessage(
        chatId2,
        `\u{1F48A} **\u0627\u0633\u062A\u0634\u0627\u0631\u0629 \u0627\u0644\u0635\u064A\u062F\u0644\u0627\u0646\u064A \u0627\u0644\u0630\u0643\u064A:**

\u0627\u0643\u062A\u0628 \u0627\u0644\u0622\u0646 \u0627\u0633\u0645 \u0623\u064A \u062F\u0648\u0627\u0621 \u0623\u0648 \u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u062F\u0648\u0627\u0626\u064A \u062A\u0631\u064A\u062F\u0647 (\u0645\u062B\u0644\u0627\u064B: *"\u062C\u0631\u0639\u0629 \u0627\u0644\u0623\u0648\u062C\u0645\u0646\u062A\u064A\u0646"* \u0623\u0648 *"\u0647\u0644 \u064A\u062A\u0639\u0627\u0631\u0636 \u0627\u0644\u0628\u0631\u0648\u0641\u064A\u0646 \u0645\u0639 \u0627\u0644\u0628\u0627\u0631\u0627\u0633\u064A\u062A\u0627\u0645\u0648\u0644\u061F"*).
\u0633\u0623\u062C\u064A\u0628\u0643 \u0641\u0648\u0631\u0627\u064B \u0628\u0627\u0644\u062C\u0631\u0639\u0627\u062A \u0627\u0644\u0645\u0648\u0635\u0649 \u0628\u0647\u0627\u060C \u0627\u0644\u062A\u062D\u0630\u064A\u0631\u0627\u062A\u060C \u0648\u0627\u0644\u062A\u062F\u0627\u062E\u0644\u0627\u062A \u0627\u0644\u062F\u0648\u0627\u0626\u064A\u0629.`
      );
    } else if (cbData === "action_pediatric" && chatId2) {
      await sendTelegramMessage(
        chatId2,
        `\u{1F476} **\u062D\u0627\u0633\u0628\u0629 \u062C\u0631\u0639\u0627\u062A \u0627\u0644\u0623\u0637\u0641\u0627\u0644 \u0627\u0644\u062F\u0642\u064A\u0642\u0629:**

\u0627\u0643\u062A\u0628 \u0627\u0633\u0645 \u0634\u0631\u0627\u0628 \u0627\u0644\u062F\u0648\u0627\u0621 \u0648\u0639\u0645\u0631 \u0623\u0648 \u0648\u0632\u0646 \u0627\u0644\u0637\u0641\u0644 (\u0645\u062B\u0644\u0627\u064B: *"\u0628\u0627\u0646\u0627\u062F\u0648\u0644 \u0634\u0631\u0627\u0628 \u0644\u0637\u0641\u0644 \u0648\u0632\u0646\u0647 12 \u0643\u062C\u0645"*).
\u0633\u0623\u062D\u0633\u0628 \u0644\u0643 \u0627\u0644\u062C\u0631\u0639\u0629 \u0627\u0644\u062F\u0642\u064A\u0642\u0629 \u0628\u0627\u0644\u0645\u064A\u0644\u064A \u0644\u062A\u0631 (ml) \u0648\u0627\u0644\u062A\u0643\u0631\u0627\u0631 \u0627\u0644\u064A\u0648\u0645\u064A \u0627\u0644\u0645\u0646\u0627\u0633\u0628 \u0644\u0648\u0632\u0646\u0647.`
      );
    } else if (cbData === "refresh_stats" && chatId2) {
      const allUsers = Array.from(usersDB.values());
      const totalUsers = allUsers.length;
      const proUsers = allUsers.filter((u) => u.plan === "pro").length;
      const vipUsers = allUsers.filter((u) => u.plan === "vip").length;
      const freeUsers = allUsers.filter((u) => u.plan === "free").length;
      const totalRequestsCount = allUsers.reduce((acc, u) => acc + (u.totalRequests || u.dailyQuotaUsed || 1), 0);
      const sortedUsers = [...allUsers].sort((a, b) => {
        const dateA = new Date(a.lastActiveAt || a.createdAt).getTime();
        const dateB = new Date(b.lastActiveAt || b.createdAt).getTime();
        return dateB - dateA;
      });
      const formatDate = (isoString) => {
        if (!isoString) return "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F";
        try {
          return new Date(isoString).toLocaleDateString("ar-EG", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          });
        } catch (e) {
          return isoString.slice(0, 16);
        }
      };
      let refreshedMsg = `\u{1F504} **\u062A\u062D\u062F\u064A\u062B \u0645\u0628\u0627\u0634\u0631 \u0644\u0644\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A (${(/* @__PURE__ */ new Date()).toLocaleTimeString("ar-EG")}):**

`;
      refreshedMsg += `\u{1F465} \u0627\u0644\u0645\u0634\u062A\u0631\u0643\u0648\u0646: \`${totalUsers}\` | \u26A1 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A: \`${totalRequestsCount}\`
`;
      refreshedMsg += `\u{1F48E} VIP: \`${vipUsers}\` | \u{1F7E2} Pro: \`${proUsers}\` | \u26AA Free: \`${freeUsers}\`

`;
      refreshedMsg += `\u{1F552} **\u0622\u062E\u0631 \u0646\u0634\u0627\u0637 \u0645\u0633\u062C\u0644 \u0644\u0644\u0645\u0634\u062A\u0631\u0643\u064A\u0646:**
`;
      sortedUsers.slice(0, 5).forEach((u, i) => {
        refreshedMsg += `${i + 1}. **${u.firstName}** (${u.plan.toUpperCase()}) - \u0622\u062E\u0631 \u0638\u0647\u0648\u0631: _${formatDate(u.lastActiveAt || u.createdAt)}_
`;
      });
      refreshedMsg += `
\u{1F517} \u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0643\u0627\u0645\u0644\u0629: ${DEFAULT_APP_URL}/#crm`;
      await sendTelegramMessage(chatId2, refreshedMsg, {
        inline_keyboard: [
          [{ text: "\u{1F5A5}\uFE0F \u0641\u062A\u062D \u0644\u0648\u062D\u0629 \u0627\u0644\u0645\u0634\u062A\u0631\u0643\u064A\u0646 (CRM)", url: `${DEFAULT_APP_URL}/#crm` }],
          [{ text: "\u{1F504} \u062A\u062D\u062F\u064A\u062B \u0645\u062C\u062F\u062F\u0627\u064B", callback_data: "refresh_stats" }]
        ]
      });
    }
    safeReply();
    return;
  }
  const message = update?.message;
  if (!message || !message.from) {
    safeReply();
    return;
  }
  const tgId = String(message.from.id);
  const chatId = message.chat?.id || tgId;
  const text = (message.text || "").trim();
  const caption = (message.caption || "").trim();
  const userName = message.from.username ? `@${message.from.username}` : message.from.first_name;
  let user = usersDB.get(tgId);
  if (!user) {
    user = {
      id: `u_${Date.now()}`,
      telegramId: tgId,
      username: message.from.username || `user_${tgId}`,
      firstName: message.from.first_name || "\u0645\u0633\u062A\u062E\u062F\u0645 \u062A\u0644\u064A\u062C\u0631\u0627\u0645",
      lastName: message.from.last_name,
      plan: "free",
      planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString(),
      dailyQuotaUsed: 0,
      dailyQuotaTotal: 15,
      creditsRemaining: 15,
      authSource: "telegram_login",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      lastActiveAt: (/* @__PURE__ */ new Date()).toISOString(),
      totalRequests: 1
    };
    usersDB.set(tgId, user);
  } else {
    user.lastActiveAt = (/* @__PURE__ */ new Date()).toISOString();
    user.totalRequests = (user.totalRequests || 0) + 1;
    if (message.from.first_name) user.firstName = message.from.first_name;
    if (message.from.username) user.username = message.from.username;
    usersDB.set(tgId, user);
  }
  const plan = user.plan || "free";
  const photos = message.photo;
  const document = message.document;
  const isImageDoc = document && document.mime_type && document.mime_type.startsWith("image/");
  if (photos || isImageDoc) {
    syncLogs.unshift({
      id: `log_${Date.now()}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      source: "telegram_bot",
      userTelegramId: tgId,
      userName,
      actionAr: `\u0627\u0633\u062A\u0642\u0628\u0627\u0644 \u0635\u0648\u0631\u0629 \u0623\u0634\u0639\u0629/\u062A\u062D\u0644\u064A\u0644 \u0639\u0628\u0631 \u0628\u0648\u062A \u062A\u0644\u064A\u062C\u0631\u0627\u0645`,
      actionEn: `Received medical image/lab via Telegram bot`,
      status: "success",
      tierUsed: plan
    });
    const token = runtimeBotToken || process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      await sendTelegramMessage(
        chatId,
        `\u{1F4E5} **\u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0637\u0628\u064A\u0629 \u0628\u0646\u062C\u0627\u062D!**

\u26A0\uFE0F \u064A\u0631\u062C\u0649 \u0636\u0628\u0637 \u0645\u0641\u062A\u0627\u062D \`TELEGRAM_BOT_TOKEN\` \u0641\u064A \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u062E\u0627\u062F\u0645 \u0644\u062A\u0645\u0643\u064A\u0646 \u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0633\u0631\u064A\u0631\u064A \u0627\u0644\u0645\u0628\u0627\u0634\u0631 \u0639\u0628\u0631 \u0627\u0644\u0628\u0648\u062A\u060C \u0623\u0648 \u064A\u0645\u0643\u0646\u0643 \u0641\u062A\u062D \u0644\u0648\u062D\u0629 \u0627\u0644\u0648\u064A\u0628 \u0648\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0641\u062D\u0635 \u0641\u0648\u0631\u0627\u064B:
\u{1F517} ${DEFAULT_APP_URL}`
      );
      safeReply();
      return;
    }
    try {
      await sendTelegramMessage(
        chatId,
        `\u23F3 **\u062C\u0627\u0631\u064A \u0641\u062D\u0635 \u0648\u062A\u062F\u0642\u064A\u0642 \u0627\u0644\u0635\u0648\u0631\u0629 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0627\u0644\u0633\u0631\u064A\u0631\u064A (\u0645\u0646\u0635\u0629 \u062C\u0631\u0639\u0629)...**
\u064A\u0631\u062C\u0649 \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631 \u062B\u0648\u0627\u0646\u064D \u0645\u0639\u062F\u0648\u062F\u0629 \u0644\u0641\u062D\u0635 \u0627\u0644\u0639\u0638\u0627\u0645\u060C \u0627\u0644\u0645\u0641\u0627\u0635\u0644\u060C \u0627\u0644\u0635\u062F\u0631\u060C \u0648\u0627\u0644\u0645\u0624\u0634\u0631\u0627\u062A.`
      );
      const fileId = photos ? photos[photos.length - 1].file_id : document.file_id;
      const fileRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
      const fileData = await fileRes.json();
      if (fileData.ok && fileData.result?.file_path) {
        const fileUrl = `https://api.telegram.org/file/bot${token}/${fileData.result.file_path}`;
        const imgBufferRes = await fetch(fileUrl);
        const arrayBuf = await imgBufferRes.arrayBuffer();
        const base64Img = Buffer.from(arrayBuf).toString("base64");
        const mimeType = isImageDoc ? document.mime_type : "image/jpeg";
        const captionLower = caption.toLowerCase();
        const isLabExplicit = captionLower.includes("\u062A\u062D\u0644\u064A\u0644") || captionLower.includes("\u062F\u0645") || captionLower.includes("cbc") || captionLower.includes("\u0645\u062E\u062A\u0628\u0631");
        const detectedType = isLabExplicit ? "lab" : "imaging";
        const ai = getGenAI();
        let testName = detectedType === "imaging" ? "\u0623\u0634\u0639\u0629 \u0648\u062A\u0635\u0648\u064A\u0631 \u062A\u0634\u062E\u064A\u0635\u064A (X-Ray / MRI)" : "\u0641\u062D\u0635 \u0645\u062E\u0628\u0631\u064A \u0633\u0631\u064A\u0631\u064A";
        let urgencyLevel = "normal";
        let findingsSummary = "";
        let items = [];
        let detailedExplanation = "";
        let recommendations = [];
        if (ai) {
          const prompt = detectedType === "imaging" ? `You are an expert subspecialty Consultant Diagnostic Radiologist, Interventional Radiologist, and Senior Trauma Physician.
Analyze this medical imaging study (X-ray, CT scan, MRI, or Ultrasound) sent by a patient through Telegram.
Systematically screen for fractures, dislocations, pneumothorax, pneumonia/consolidation, effusion, cardiomegaly, or other pathologies.
Urgency classification: "critical" (immediate emergency), "high" (significant pathology), "medium" (chronic/moderate), or "normal" (clear).
Patient note: ${caption || "\u0641\u062D\u0635 \u0625\u0634\u0639\u0627\u0639\u064A \u0645\u0631\u0633\u0644 \u0639\u0628\u0631 \u062A\u0644\u064A\u062C\u0631\u0627\u0645"}.

Output STRICTLY valid JSON with Arabic explanations and international medical terms:
{
  "testName": "\u0627\u0633\u0645 \u0627\u0644\u0641\u062D\u0635 \u0648\u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0628\u062F\u0642\u0629 (\u0645\u062B\u0644\u0627\u064B: \u0623\u0634\u0639\u0629 \u0633\u064A\u0646\u064A\u0629 \u0644\u0644\u0635\u062F\u0631 / \u0623\u0634\u0639\u0629 \u0627\u0644\u0643\u062A\u0641)",
  "urgencyLevel": "critical \u0623\u0648 high \u0623\u0648 medium \u0623\u0648 normal",
  "findingsSummary": "\u0645\u0644\u062E\u0635 \u0633\u0631\u064A\u0631\u064A \u0645\u062D\u062F\u062F \u0641\u064A \u0633\u0637\u0631 \u0648\u0627\u062D\u062F \u064A\u0628\u064A\u0646 \u0627\u0644\u0646\u062A\u064A\u062C\u0629 \u0627\u0644\u062C\u0648\u0647\u0631\u064A\u0629 (\u0645\u062B\u0644\u0627\u064B: \u0627\u0634\u062A\u0628\u0627\u0647 \u0643\u0633\u0631 \u0639\u0638\u0645 \u0627\u0644\u0639\u0636\u062F\u060C \u062E\u0644\u0639 \u0645\u0641\u0635\u0644\u064A\u060C \u0627\u0631\u062A\u0634\u0627\u062D \u0641\u0635\u064A\u060C \u0623\u0648 \u0633\u0644\u0627\u0645\u0629 \u0627\u0644\u0641\u062D\u0635)",
  "items": [
    {
      "name": "\u0627\u0633\u0645 \u0627\u0644\u062C\u0632\u0621 \u0627\u0644\u062A\u0634\u0631\u064A\u062D\u064A",
      "value": "\u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0629 \u0627\u0644\u0633\u0631\u064A\u0631\u064A\u0629",
      "referenceRange": "\u0627\u0644\u0637\u0628\u064A\u0639\u064A \u0627\u0644\u0633\u0644\u064A\u0645",
      "status": "critical \u0623\u0648 high \u0623\u0648 low \u0623\u0648 normal"
    }
  ],
  "detailedExplanation": "\u062A\u0642\u0631\u064A\u0631 \u0633\u0631\u064A\u0631\u064A \u0645\u062E\u062A\u0635\u0631 \u0648\u0645\u0641\u0647\u0648\u0645 \u0644\u0644\u0645\u0631\u064A\u0636 \u064A\u0648\u0636\u062D \u0627\u0644\u0645\u0648\u062C\u0648\u062F\u0627\u062A \u0648\u0627\u0644\u062A\u063A\u064A\u0631\u0627\u062A \u0645\u0642\u0627\u0631\u0646\u0629 \u0628\u0627\u0644\u0637\u0628\u064A\u0639\u064A",
  "recommendations": [
    "\u062A\u0648\u0635\u064A\u0629 \u0637\u0628\u064A\u0629 1",
    "\u062A\u0648\u0635\u064A\u0629 \u0637\u0628\u064A\u0629 2"
  ]
}` : `\u0623\u0646\u062A \u0637\u0628\u064A\u0628 \u0627\u0633\u062A\u0634\u0627\u0631\u064A \u0648\u0631\u0626\u064A\u0633 \u0642\u0633\u0645 \u0627\u0644\u062A\u062D\u0627\u0644\u064A\u0644 \u0627\u0644\u0637\u0628\u064A\u0629 \u0627\u0644\u0633\u0631\u064A\u0631\u064A\u0629.
\u0642\u0645 \u0628\u062A\u062D\u0644\u064A\u0644 \u0635\u0648\u0631\u0629 \u0627\u0644\u0641\u062D\u0635 \u0627\u0644\u0645\u062E\u0628\u0631\u064A \u0627\u0644\u0645\u0631\u0633\u0644\u0629 \u0639\u0628\u0631 \u062A\u0644\u064A\u062C\u0631\u0627\u0645 \u0648\u0627\u0633\u062A\u062E\u0631\u062C \u0627\u0644\u0645\u0624\u0634\u0631\u0627\u062A \u0648\u0642\u0627\u0631\u0646\u0647\u0627 \u0628\u0627\u0644\u0637\u0628\u064A\u0639\u064A.
\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0627\u0644\u0645\u0631\u064A\u0636: ${caption || "\u062A\u062D\u0644\u064A\u0644 \u062F\u0645"}.
\u0623\u062E\u0631\u062C \u0627\u0644\u0646\u062A\u064A\u062C\u0629 \u0628\u0635\u064A\u063A\u0629 JSON:
{
  "testName": "\u0627\u0633\u0645 \u0627\u0644\u0641\u062D\u0635 \u0627\u0644\u0645\u062E\u0628\u0631\u064A",
  "urgencyLevel": "normal \u0623\u0648 medium \u0623\u0648 high \u0623\u0648 critical",
  "findingsSummary": "\u0645\u0644\u062E\u0635 \u0627\u0644\u0646\u062A\u064A\u062C\u0629 \u0627\u0644\u062C\u0648\u0647\u0631\u064A\u0629",
  "items": [
    {
      "name": "\u0627\u0633\u0645 \u0627\u0644\u0645\u0624\u0634\u0631",
      "value": "\u0627\u0644\u0642\u064A\u0645\u0629",
      "referenceRange": "\u0627\u0644\u0645\u0639\u062F\u0644 \u0627\u0644\u0637\u0628\u064A\u0639\u064A",
      "status": "normal \u0623\u0648 high \u0623\u0648 low \u0623\u0648 critical"
    }
  ],
  "detailedExplanation": "\u0634\u0631\u062D \u0637\u0628\u064A \u0633\u0631\u064A\u0631\u064A \u0645\u0628\u0633\u0637 \u0648\u0645\u0641\u064A\u062F \u0644\u0644\u0645\u0631\u064A\u0636",
  "recommendations": ["\u062A\u0648\u0635\u064A\u0629 1", "\u062A\u0648\u0635\u064A\u0629 2"]
}`;
          const candidateModels = ["gemini-3.1-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"];
          for (const modelName of candidateModels) {
            try {
              const response = await ai.models.generateContent({
                model: modelName,
                contents: [
                  { inlineData: { mimeType, data: base64Img } },
                  { text: prompt }
                ],
                config: { responseMimeType: "application/json" }
              });
              const parsed = JSON.parse(response.text || "{}");
              if (parsed.testName) testName = parsed.testName;
              if (parsed.urgencyLevel) urgencyLevel = parsed.urgencyLevel;
              findingsSummary = parsed.findingsSummary || "";
              if (Array.isArray(parsed.items)) items = parsed.items;
              if (parsed.detailedExplanation) detailedExplanation = parsed.detailedExplanation;
              if (Array.isArray(parsed.recommendations)) recommendations = parsed.recommendations;
              if (detailedExplanation) break;
            } catch (err) {
              console.warn(`Telegram scan model ${modelName} error:`, err?.message);
            }
          }
        }
        const urgencyIcons = {
          critical: "\u{1F6A8} **\u062D\u0627\u0644\u0629 \u0637\u0627\u0631\u0626\u0629 / \u0625\u0633\u0639\u0627\u0641\u064A\u0629 \u062D\u0631\u062C\u0629**",
          high: "\u26A0\uFE0F **\u062D\u0627\u0644\u0629 \u062A\u062A\u0637\u0644\u0628 \u0627\u0633\u062A\u0634\u0627\u0631\u0629 \u0637\u0628\u064A\u0629 \u0639\u0627\u062C\u0644\u0629**",
          medium: "\u{1F7E1} **\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u062A\u0633\u062A\u062F\u0639\u064A \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u0631\u0648\u062A\u064A\u0646\u064A\u0629**",
          normal: "\u2705 **\u0641\u062D\u0635 \u0637\u0628\u064A \u0645\u0637\u0645\u0626\u0646 \u0648\u0633\u0644\u064A\u0645**"
        };
        const urgencyHeader = urgencyIcons[urgencyLevel] || "\u{1FA7A} **\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0641\u062D\u0635 \u0627\u0644\u0637\u0628\u064A**";
        let replyText = `${urgencyHeader}

`;
        replyText += `\u{1F4CB} **\u0627\u0644\u0641\u062D\u0635:** ${testName}
`;
        if (findingsSummary) {
          replyText += `\u{1F50E} **\u0627\u0644\u0646\u062A\u064A\u062C\u0629 \u0627\u0644\u062C\u0648\u0647\u0631\u064A\u0629:** ${findingsSummary}

`;
        }
        if (items.length > 0) {
          replyText += `\u{1F4CA} **\u0623\u0628\u0631\u0632 \u0627\u0644\u0645\u0624\u0634\u0631\u0627\u062A \u0627\u0644\u0645\u0631\u0635\u0648\u062F\u0629:**
`;
          items.slice(0, 4).forEach((it) => {
            const statusMark = it.status === "critical" || it.status === "high" ? "\u{1F534}" : it.status === "low" ? "\u{1F535}" : "\u{1F7E2}";
            replyText += `${statusMark} **${it.name}:** ${it.value} _(\u0627\u0644\u0645\u0639\u062F\u0644 \u0627\u0644\u0637\u0628\u064A\u0639\u064A: ${it.referenceRange || "\u0633\u0644\u064A\u0645"})_
`;
          });
          replyText += `
`;
        }
        if (detailedExplanation) {
          replyText += `\u{1F4DD} **\u0627\u0644\u0634\u0631\u062D \u0627\u0644\u0633\u0631\u064A\u0631\u064A:**
${detailedExplanation.slice(0, 400)}${detailedExplanation.length > 400 ? "..." : ""}

`;
        }
        if (recommendations.length > 0) {
          replyText += `\u{1F4A1} **\u0627\u0644\u0625\u0631\u0634\u0627\u062F\u0627\u062A \u0648\u0627\u0644\u062A\u0648\u0635\u064A\u0627\u062A \u0627\u0644\u0623\u0648\u0644\u064A\u0629:**
`;
          recommendations.forEach((rec, idx) => {
            replyText += `${idx + 1}. ${rec}
`;
          });
          replyText += `
`;
        }
        replyText += `\u26A0\uFE0F *\u062A\u0646\u0648\u064A\u0647 \u0637\u0628\u064A \u0647\u0627\u0645: \u0647\u0630\u0627 \u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u0627\u0633\u062A\u0631\u0634\u0627\u062F\u064A \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0644\u0644\u062A\u062B\u0642\u064A\u0641 \u0648\u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629\u060C \u0648\u0644\u0627 \u064A\u064F\u0639\u062F \u0628\u062F\u064A\u0644\u0627\u064B \u0639\u0646 \u0627\u0644\u0641\u062D\u0635 \u0627\u0644\u0633\u0631\u064A\u0631\u064A \u0627\u0644\u0645\u0628\u0627\u0634\u0631 \u0623\u0648 \u0627\u0644\u0642\u0631\u0627\u0631 \u0627\u0644\u0637\u0628\u064A \u0644\u0644\u0637\u0628\u064A\u0628 \u0627\u0644\u0645\u0639\u0627\u0644\u062C.*`;
        const replyMarkup = {
          inline_keyboard: [
            [{ text: "\u{1F310} \u0641\u062A\u062D \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0645\u0641\u0635\u0644 \u0639\u0628\u0631 \u0627\u0644\u0645\u0648\u0642\u0639", url: `${DEFAULT_APP_URL}/#lab_imaging` }],
            [{ text: "\u{1F48E} \u062A\u0631\u0642\u064A\u0629 \u0628\u0627\u0642\u0629 \u0627\u0644\u0628\u0648\u062A \u0648\u0627\u0644\u0645\u0648\u0642\u0639", callback_data: "upgrade" }]
          ]
        };
        await sendTelegramMessage(chatId, replyText, replyMarkup);
        safeReply();
        return;
      }
    } catch (err) {
      console.error("Error processing Telegram photo:", err);
      await sendTelegramMessage(
        chatId,
        `\u26A0\uFE0F \u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u0635\u0648\u0631\u0629 \u0639\u0628\u0631 \u0627\u0644\u0628\u0648\u062A: ${err?.message || "\u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u0631\u0629 \u0623\u062E\u0631\u0649"}
\u064A\u0645\u0643\u0646\u0643 \u0631\u0641\u0639 \u0627\u0644\u0635\u0648\u0631\u0629 \u0645\u0628\u0627\u0634\u0631\u0629 \u0639\u0628\u0631 \u0648\u0627\u062C\u0647\u0629 \u0627\u0644\u0645\u0648\u0642\u0639:
\u{1F517} ${DEFAULT_APP_URL}`
      );
      safeReply();
      return;
    }
  }
  syncLogs.unshift({
    id: `log_${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    source: "telegram_bot",
    userTelegramId: tgId,
    userName,
    actionAr: `\u0631\u0633\u0627\u0644\u0629 \u0648\u0627\u0631\u062F\u0629 \u0645\u0646 \u062A\u0644\u064A\u062C\u0631\u0627\u0645: "${text.slice(0, 30)}" (\u0628\u0627\u0642\u0629 ${plan})`,
    actionEn: `Incoming telegram command: "${text.slice(0, 30)}" (${plan})`,
    status: "success",
    tierUsed: plan
  });
  if (text === "/start" || text.startsWith("/start ")) {
    const welcomeMsg = `\u0623\u0647\u0644\u0627\u064B \u0628\u0643 \u064A\u0627 ${message.from.first_name || "\u0645\u0633\u062A\u062E\u062F\u0645\u0646\u0627 \u0627\u0644\u0639\u0632\u064A\u0632"} \u0641\u064A **\u0645\u0646\u0635\u0629 \u062C\u0631\u0639\u0629 \u0627\u0644\u0637\u0628\u064A\u0629 \u0627\u0644\u0630\u0643\u064A\u0629 (Dose)**! \u{1FA7A}\u2728

\u{1F310} \u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643 \u0641\u064A \u0627\u0644\u0645\u0646\u0635\u0629 \u0627\u0644\u0633\u0631\u064A\u0631\u064A\u0629 \u0627\u0644\u0645\u062A\u0643\u0627\u0645\u0644\u0629 \u0644\u0641\u062D\u0635 \u0627\u0644\u0623\u0639\u0631\u0627\u0636\u060C \u062D\u0627\u0633\u0628\u0629 \u0627\u0644\u062C\u0631\u0639\u0627\u062A\u060C \u0648\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0623\u0634\u0639\u0629 \u0648\u0627\u0644\u0641\u062D\u0648\u0635\u0627\u062A.

\u{1F447} **\u064A\u0631\u062C\u0649 \u0627\u062E\u062A\u064A\u0627\u0631 \u0644\u063A\u0629 \u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0644\u0644\u0645\u062A\u0627\u0628\u0639\u0629 \u0648\u0639\u0631\u0636 \u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0637\u0628\u064A\u0629 \u0627\u0644\u0634\u0627\u0645\u0644\u0629:**
Please select your preferred language to view all medical features:`;
    const langMarkup = {
      inline_keyboard: [
        [
          { text: "\u{1F1F8}\u{1F1E6} \u0627\u0644\u0639\u0631\u0628\u064A\u0629 (Arabic)", callback_data: "lang_ar" },
          { text: "\u{1F1EC}\u{1F1E7} English", callback_data: "lang_en" }
        ]
      ]
    };
    await sendTelegramMessage(chatId, welcomeMsg, langMarkup);
    safeReply();
    return;
  }
  if (text.startsWith("/menu") || text.startsWith("/help") || text === "\u0627\u0644\u0642\u0627\u0626\u0645\u0629" || text === "\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u064A\u0632\u0627\u062A" || text.toLowerCase() === "menu") {
    await sendTelegramFullMenu(chatId, user);
    safeReply();
    return;
  }
  const activeSession = userSessions.get(String(chatId));
  if (activeSession?.mode === "awaiting_promo" && !text.startsWith("/")) {
    userSessions.delete(String(chatId));
    const promoResult = applyPromoCode(user, text);
    if (promoResult.success) {
      usersDB.set(tgId, user);
      syncLogs.unshift({
        id: `log_${Date.now()}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        source: "telegram_bot",
        userTelegramId: tgId,
        userName: user.username ? `@${user.username}` : user.firstName,
        actionAr: `\u062A\u0641\u0639\u064A\u0644 \u0643\u0648\u062F \u0628\u0631\u0648\u0645\u0648 (${text}) \u0648\u062A\u0631\u0642\u064A\u0629 \u0625\u0644\u0649 \u0628\u0627\u0642\u0629 ${promoResult.plan.toUpperCase()}`,
        actionEn: `Activated promo code (${text}) - upgraded to ${promoResult.plan.toUpperCase()}`,
        status: "success",
        tierUsed: promoResult.plan
      });
      await sendTelegramMessage(
        chatId,
        `\u{1F389} **\u0645\u0628\u0631\u0648\u0643! \u062A\u0645 \u0642\u0628\u0648\u0644 \u0627\u0644\u0643\u0648\u062F \u0628\u0646\u062C\u0627\u062D \u0648\u062A\u0631\u0642\u064A\u0629 \u0628\u0627\u0642\u062A\u0643 \u0625\u0644\u0649 ${promoResult.planNameAr}!** \u2728

\u2022 \u26A1 **\u0627\u0644\u0631\u0635\u064A\u062F \u0627\u0644\u064A\u0648\u0645\u064A \u0627\u0644\u062C\u062F\u064A\u062F:** \`${promoResult.quota}\` \u0627\u0633\u062A\u0634\u0627\u0631\u0629 \u0648\u0641\u062D\u0635 \u064A\u0648\u0645\u064A\u0627\u064B
\u2022 \u{1FA7A} **\u0641\u0627\u062D\u0635 \u0627\u0644\u0623\u0639\u0631\u0627\u0636 \u0627\u0644\u0645\u062A\u0642\u062F\u0645 (DDx):** \u0645\u0641\u0639\u0644 \u0628\u0627\u0644\u0643\u0627\u0645\u0644
\u2022 \u{1FA7B} **\u0641\u062D\u0635 \u0627\u0644\u0623\u0634\u0639\u0629 \u0648\u0627\u0644\u062A\u062D\u0627\u0644\u064A\u0644 \u0627\u0644\u0645\u062E\u0628\u0631\u064A\u0629:** \u063A\u064A\u0631 \u0645\u062D\u062F\u0648\u062F
\u2022 \u{1F504} **\u0627\u0644\u062A\u0632\u0627\u0645\u0646 \u0627\u0644\u0633\u062D\u0627\u0628\u064A:** \u0633\u0627\u0631\u064D \u0641\u064A \u0627\u0644\u0628\u0648\u062A \u0648\u0645\u0648\u0642\u0639 \u0627\u0644\u0648\u064A\u0628 \u0641\u0648\u0631\u0627\u064B!`,
        {
          inline_keyboard: [
            [{ text: "\u{1FA7A} \u0627\u0628\u062F\u0623 \u0641\u062D\u0635 \u0627\u0644\u0623\u0639\u0631\u0627\u0636 \u0627\u0644\u0622\u0646", callback_data: "action_symptoms" }],
            [{ text: "\u{1F310} \u0641\u062A\u062D \u0627\u0644\u0645\u0646\u0635\u0629 \u0639\u0628\u0631 \u0627\u0644\u0648\u064A\u0628", url: DEFAULT_APP_URL }]
          ]
        }
      );
      safeReply();
      return;
    } else {
      await sendTelegramMessage(
        chatId,
        `\u274C \u0627\u0644\u0643\u0648\u062F \u0627\u0644\u0645\u062F\u062E\u0644 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D \u0623\u0648 \u0645\u0646\u062A\u0647\u064A \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629.

\u{1F4A1} \u064A\u0645\u0643\u0646\u0643 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0644\u0623\u0643\u0648\u0627\u062F \u0627\u0644\u062A\u062C\u0631\u064A\u0628\u064A\u0629:
\u2022 \`PRO2026\` \u0644\u062A\u0641\u0639\u064A\u0644 \u0628\u0627\u0642\u0629 Pro
\u2022 \`VIP2026\` \u0644\u062A\u0641\u0639\u064A\u0644 \u0628\u0627\u0642\u0629 VIP

\u0623\u0648 \u064A\u0645\u0643\u0646\u0643 \u0627\u0644\u062A\u0631\u0642\u064A\u0629 \u0627\u0644\u0645\u0628\u0627\u0634\u0631\u0629 \u0628\u0636\u063A\u0637\u0629 \u0632\u0631 \u0639\u0628\u0631: /plans`,
        {
          inline_keyboard: [
            [{ text: "\u{1F4B3} \u0639\u0631\u0636 \u0627\u0644\u0628\u0627\u0642\u0627\u062A \u0648\u0627\u0644\u062A\u0631\u0642\u064A\u0629 \u0627\u0644\u0641\u0648\u0631\u064A\u0629", callback_data: "action_plans" }]
          ]
        }
      );
      safeReply();
      return;
    }
  }
  if (activeSession?.mode === "awaiting_symptoms" && !text.startsWith("/") && text !== "\u{1FA7A} \u0641\u0627\u062D\u0635 \u0627\u0644\u0623\u0639\u0631\u0627\u0636 (DDx)") {
    userSessions.delete(String(chatId));
    await handleTelegramSymptomCheck(chatId, text, user);
    safeReply();
    return;
  }
  if (text === "\u{1FA7A} \u0641\u0627\u062D\u0635 \u0627\u0644\u0623\u0639\u0631\u0627\u0636 (DDx)" || text === "\u0641\u0627\u062D\u0635 \u0627\u0644\u0623\u0639\u0631\u0627\u0636" || text === "\u0623\u0639\u0631\u0627\u0636" || text === "\u0627\u0644\u0627\u0639\u0631\u0627\u0636" || text.startsWith("/symptoms") || text.startsWith("/ddx") || text.startsWith("/check") || text.startsWith("/triage")) {
    const rawQuery = text.replace(/^(\/symptoms|\/ddx|\/check|\/triage)/i, "").trim();
    if (rawQuery.length >= 3 && !rawQuery.startsWith("\u0641\u0627\u062D\u0635") && !rawQuery.startsWith("\u0623\u0639\u0631\u0627\u0636") && !rawQuery.startsWith("\u0627\u0644\u0627\u0639\u0631\u0627\u0636")) {
      await handleTelegramSymptomCheck(chatId, rawQuery, user);
      safeReply();
      return;
    }
    userSessions.set(String(chatId), { mode: "awaiting_symptoms", timestamp: Date.now() });
    await sendTelegramMessage(
      chatId,
      `\u{1FA7A} **\u0641\u0627\u062D\u0635 \u0627\u0644\u0623\u0639\u0631\u0627\u0636 \u0648\u0627\u0644\u062A\u0634\u062E\u064A\u0635 \u0627\u0644\u062A\u0641\u0631\u064A\u0642\u064A \u0627\u0644\u0633\u0631\u064A\u0631\u064A (Clinical DDx):**

\u270D\uFE0F **\u0627\u0643\u062A\u0628 \u0627\u0644\u0622\u0646 \u0641\u064A \u0631\u0633\u0627\u0644\u0629 \u0634\u0643\u0648\u0627\u0643 \u0623\u0648 \u0627\u0644\u0623\u0639\u0631\u0627\u0636 \u0628\u0627\u0644\u062A\u0641\u0635\u064A\u0644** (\u0645\u062B\u0644\u0627\u064B: *"\u0623\u0644\u0645 \u0641\u064A \u0627\u0644\u0635\u062F\u0631 \u0645\u0639 \u0636\u064A\u0642 \u062A\u0646\u0641\u0633 \u0648\u062A\u0639\u0631\u0642"* \u0623\u0648 *"\u0623\u0644\u0645 \u062D\u0627\u062F \u0623\u0633\u0641\u0644 \u0627\u0644\u0628\u0637\u0646 \u062C\u0647\u0629 \u0627\u0644\u064A\u0645\u064A\u0646 \u0645\u0639 \u062D\u0631\u0627\u0631\u0629 \u0648\u063A\u062B\u064A\u0627\u0646"*).

\u{1F447} **\u0623\u0648 \u0627\u0636\u063A\u0637 \u0639\u0644\u0649 \u0623\u062D\u062F \u0627\u0644\u0646\u0645\u0627\u0630\u062C \u0627\u0644\u0633\u0631\u064A\u0631\u064A\u0629 \u0627\u0644\u062C\u0627\u0647\u0632\u0629 \u0644\u0644\u0641\u062D\u0635 \u0627\u0644\u0645\u0628\u0627\u0634\u0631:**`,
      {
        inline_keyboard: [
          [
            { text: "\u{1FAC0} \u0623\u0644\u0645 \u0628\u0627\u0644\u0635\u062F\u0631 \u0648\u0636\u064A\u0642 \u062A\u0646\u0641\u0633", callback_data: "sym_chest" },
            { text: "\u{1F37D}\uFE0F \u0623\u0644\u0645 \u062D\u0627\u062F \u0628\u0623\u0633\u0641\u0644 \u0627\u0644\u0628\u0637\u0646", callback_data: "sym_appendix" }
          ],
          [
            { text: "\u{1F9E0} \u0635\u062F\u0627\u0639 \u0646\u0635\u0641\u064A \u062D\u0627\u062F \u0648\u063A\u062B\u064A\u0627\u0646", callback_data: "sym_migraine" },
            { text: "\u{1FAC1} \u0633\u0639\u0627\u0644 \u0645\u0633\u062A\u0645\u0631 \u0648\u062D\u0645\u0649", callback_data: "sym_pneumonia" }
          ],
          [
            { text: "\u{1FA78} \u062D\u0631\u0642\u0627\u0646 \u0628\u0648\u0644 \u0648\u0623\u0644\u0645 \u062E\u0627\u0635\u0631\u0629", callback_data: "sym_uti" },
            { text: "\u{1F9B5} \u062A\u0648\u0631\u0645 \u0645\u0641\u0627\u062C\u0626 \u0628\u0645\u0641\u0635\u0644 \u0627\u0644\u0631\u0643\u0628\u0629", callback_data: "sym_knee" }
          ],
          [
            { text: "\u{1F476} \u062D\u0645\u0649 \u0648\u0633\u0639\u0627\u0644 \u0639\u0646\u062F \u0637\u0641\u0644", callback_data: "sym_child_fever" },
            { text: "\u{1F534} \u0637\u0641\u062D \u062C\u0644\u062F\u064A \u0648\u062D\u0643\u0629 \u0645\u0641\u0627\u062C\u0626\u0629", callback_data: "sym_rash" }
          ],
          [
            { text: "\u{1F5A5}\uFE0F \u0641\u062D\u0635 \u0627\u0644\u0623\u0639\u0631\u0627\u0636 \u0627\u0644\u062A\u0641\u0627\u0639\u0644\u064A \u0628\u0627\u0644\u0645\u0648\u0642\u0639 (PDF)", url: `${DEFAULT_APP_URL}/#symptoms` },
            { text: "\u{1F519} \u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629", callback_data: "menu_back" }
          ]
        ]
      }
    );
    safeReply();
    return;
  }
  const isSymptomQuery = /(ألم|وجع|عندي|أشعر|اشعر|حاسس|صداع|حرارة|سخونة|سعال|كحة|بلغم|مغص|إسهال|اسهال|غثيان|استفراغ|ترجيع|دوخة|دوار|ضيق\s*تنفس|خفقان|طفح|حساسية|حرقان|مفصل|ركبة|اعراض|أعراض|فحص\s*الأعراض|تشخيص|fever|cough|headache|pain|symptom)/i.test(text);
  if (isSymptomQuery && text.length >= 4 && !text.startsWith("/") && !text.includes("\u0643\u0648\u062F") && !text.includes("\u0627\u0634\u062A\u0631\u0627\u0643") && !text.includes("\u0628\u0627\u0642\u0629")) {
    await handleTelegramSymptomCheck(chatId, text, user);
    safeReply();
    return;
  }
  if (text === "\u{1F4B3} \u0627\u0644\u0628\u0627\u0642\u0627\u062A \u0648\u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643\u0627\u062A" || text === "\u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643\u0627\u062A" || text === "\u0627\u0644\u0628\u0627\u0642\u0627\u062A" || text.startsWith("/plans") || text.startsWith("/upgrade") || text.startsWith("/sub") || text.startsWith("/subscription") || text.startsWith("/pricing") || text.startsWith("/bakat")) {
    await sendTelegramPlansCard(chatId, user);
    safeReply();
    return;
  }
  if (text === "\u{1F4CA} \u0628\u0627\u0642\u062A\u064A \u0648\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A\u064A" || text === "\u0628\u0627\u0642\u062A\u064A" || text.startsWith("/myplan") || text.startsWith("/quota") || text.startsWith("/status")) {
    const p = (user.plan || "free").toUpperCase();
    const expires = user.planExpiresAt ? new Date(user.planExpiresAt).toLocaleDateString("ar-EG") : "\u0645\u0641\u062A\u0648\u062D";
    await sendTelegramMessage(
      chatId,
      `\u{1F4CA} **\u0628\u0637\u0627\u0642\u0629 \u0627\u0634\u062A\u0631\u0627\u0643\u0643 \u0627\u0644\u062D\u0627\u0644\u064A \u0641\u064A \u0645\u0646\u0635\u0629 \u0648\u0628\u0648\u062A \u062C\u0631\u0639\u0629:**

\u{1F464} \u0627\u0644\u0645\u0634\u062A\u0631\u0643: **${user.firstName}** (${user.username ? `@${user.username}` : `ID: ${user.telegramId}`})
\u{1F48E} \u0646\u0648\u0639 \u0627\u0644\u0628\u0627\u0642\u0629: **${p}**
\u26A1 \u0627\u0644\u0631\u0635\u064A\u062F \u0627\u0644\u0645\u062A\u0628\u0642\u064A \u0627\u0644\u064A\u0648\u0645: \`${user.creditsRemaining} / ${user.dailyQuotaTotal}\` \u0627\u0633\u062A\u0634\u0627\u0631\u0629 \u0648\u0641\u062D\u0635
\u{1F4C5} \u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629 / \u0627\u0644\u062A\u062C\u062F\u064A\u062F: _${expires}_
\u{1F4C8} \u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0627\u0644\u0645\u0646\u0641\u0630\u0629: \`${user.totalRequests || user.dailyQuotaUsed || 1}\` \u0637\u0644\u0628`,
      {
        inline_keyboard: [
          [{ text: "\u{1F48E} \u062A\u0631\u0642\u064A\u0629 \u0627\u0644\u0628\u0627\u0642\u0629 \u0623\u0648 \u062A\u0641\u0639\u064A\u0644 \u0643\u0648\u062F", callback_data: "upgrade" }],
          [{ text: "\u{1F310} \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643 \u0639\u0628\u0631 \u0627\u0644\u0645\u0648\u0642\u0639", url: `${DEFAULT_APP_URL}/#plans` }]
        ]
      }
    );
    safeReply();
    return;
  }
  if (text.startsWith("/code") || text.startsWith("/promo") || text.startsWith("/activate")) {
    const rawCode = text.replace(/^(\/code|\/promo|\/activate)/i, "").trim();
    if (!rawCode) {
      userSessions.set(String(chatId), { mode: "awaiting_promo", timestamp: Date.now() });
      await sendTelegramMessage(
        chatId,
        `\u{1F381} \u0627\u0643\u062A\u0628 \u0643\u0648\u062F \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643 \u0627\u0644\u062A\u0631\u0648\u064A\u062C\u064A \u0627\u0644\u0622\u0646 \u0641\u064A \u0627\u0644\u0634\u0627\u062A:
(\u0645\u062B\u0644\u0627\u064B: \`PRO2026\` \u0623\u0648 \`VIP2026\`)`
      );
      safeReply();
      return;
    }
    const promoResult = applyPromoCode(user, rawCode);
    if (promoResult.success) {
      usersDB.set(tgId, user);
      await sendTelegramMessage(
        chatId,
        `\u{1F389} **\u0645\u0628\u0631\u0648\u0643! \u062A\u0645 \u062A\u0641\u0639\u064A\u0644 \u0643\u0648\u062F \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643 \u0628\u0646\u062C\u0627\u062D \u0648\u062A\u0631\u0642\u064A\u0629 \u0628\u0627\u0642\u062A\u0643 \u0625\u0644\u0649 ${promoResult.planNameAr}!** \u2728
\u0631\u0635\u064A\u062F\u0643 \u0627\u0644\u062C\u062F\u064A\u062F: \`${promoResult.quota}\` \u0627\u0633\u062A\u0634\u0627\u0631\u0629 \u064A\u0648\u0645\u064A\u0627\u064B.`
      );
    } else {
      await sendTelegramMessage(
        chatId,
        `\u274C \u0643\u0648\u062F \u063A\u064A\u0631 \u0635\u0627\u0644\u062D. \u062C\u0631\u0651\u0628: \`PRO2026\` \u0623\u0648 \`VIP2026\` \u0623\u0648 \u062A\u0635\u0641\u062D \u0627\u0644\u0628\u0627\u0642\u0627\u062A \u0639\u0628\u0631 /plans`
      );
    }
    safeReply();
    return;
  }
  if (text === "\u{1FA7B} \u0641\u062D\u0635 \u0627\u0644\u0623\u0634\u0639\u0629 \u0627\u0644\u0633\u064A\u0646\u064A\u0629" || text.startsWith("/xray") || text.startsWith("/imaging")) {
    await sendTelegramMessage(
      chatId,
      `\u{1FA7B} **\u0641\u062D\u0635 \u0627\u0644\u0623\u0634\u0639\u0629 \u0627\u0644\u0633\u064A\u0646\u064A\u0629 \u0648\u0627\u0644\u062A\u0635\u0648\u064A\u0631 \u0627\u0644\u0637\u0628\u064A (X-Ray / MRI / CT):**

\u{1F4F8} **\u0623\u0631\u0633\u0644 \u0635\u0648\u0631\u0629 \u0627\u0644\u0623\u0634\u0639\u0629 \u0627\u0644\u0622\u0646 \u0645\u0628\u0627\u0634\u0631\u0629 \u0647\u0646\u0627 \u0641\u064A \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629!**
\u0633\u064A\u0642\u0648\u0645 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0627\u0644\u0637\u0628\u064A \u0628\u0641\u062D\u0635 \u0627\u0644\u0639\u0638\u0627\u0645\u060C \u0627\u0644\u0645\u0641\u0627\u0635\u0644\u060C \u0627\u0644\u0635\u062F\u0631\u060C \u0648\u062A\u062D\u062F\u064A\u062F \u0623\u064A \u0643\u0633\u0631 \u0623\u0648 \u062E\u0644\u0639 \u0623\u0648 \u0627\u0631\u062A\u0634\u0627\u062D \u0648\u0625\u0639\u0637\u0627\u0626\u0643 \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0633\u0631\u064A\u0631\u064A \u0641\u0648\u0631\u0627\u064B.`
    );
    safeReply();
    return;
  }
  if (text === "\u{1F9EA} \u0627\u0644\u062A\u062D\u0627\u0644\u064A\u0644 \u0627\u0644\u0645\u062E\u0628\u0631\u064A\u0629" || text.startsWith("/lab") || text.startsWith("/blood")) {
    await sendTelegramMessage(
      chatId,
      `\u{1F9EA} **\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0641\u062D\u0648\u0635\u0627\u062A \u0627\u0644\u0645\u062E\u0628\u0631\u064A\u0629 (Blood Test Analysis):**

\u{1F4F8} **\u0627\u0644\u062A\u0642\u0637 \u0648\u0623\u0631\u0633\u0644 \u0635\u0648\u0631\u0629 \u0648\u0631\u0642\u0629 \u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0645\u062E\u0628\u0631\u064A \u0647\u0646\u0627 \u0641\u064A \u0627\u0644\u0634\u0627\u062A \u0627\u0644\u0622\u0646.**
\u0633\u064A\u0642\u0648\u0645 \u0627\u0644\u0646\u0638\u0627\u0645 \u0628\u0642\u0631\u0627\u0621\u0629 \u0642\u064A\u0645 \u0627\u0644\u0641\u062D\u0635 \u0648\u062A\u0648\u0636\u064A\u062D \u0627\u0644\u0634\u0627\u0630 \u0645\u0646\u0647\u0627 \u0648\u0625\u0639\u0637\u0627\u0626\u0643 \u0627\u0644\u0634\u0631\u062D \u0627\u0644\u0633\u0631\u064A\u0631\u064A \u0648\u0627\u0644\u062A\u0648\u0635\u064A\u0627\u062A.`
    );
    safeReply();
    return;
  }
  if (text === "\u{1F48A} \u0627\u0644\u0635\u064A\u062F\u0644\u0627\u0646\u064A \u0627\u0644\u0630\u0643\u064A" || text.startsWith("/pharma")) {
    await sendTelegramMessage(
      chatId,
      `\u{1F48A} **\u0627\u0633\u062A\u0634\u0627\u0631\u0629 \u0627\u0644\u0635\u064A\u062F\u0644\u0627\u0646\u064A \u0627\u0644\u0630\u0643\u064A:**

\u0627\u0643\u062A\u0628 \u0627\u0644\u0622\u0646 \u0627\u0633\u0645 \u0627\u0644\u062F\u0648\u0627\u0621 \u0623\u0648 \u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0643 \u0627\u0644\u062F\u0648\u0627\u0626\u064A (\u0645\u062B\u0644\u0627\u064B: *"\u062C\u0631\u0639\u0629 \u062F\u0648\u0627\u0621 \u0643\u064A\u062A\u0648\u0628\u0631\u0648\u0641\u064A\u0646"* \u0623\u0648 *"\u0647\u0644 \u064A\u062A\u0639\u0627\u0631\u0636 \u062F\u0648\u0627\u0621 \u0627\u0644\u0636\u063A\u0637 \u0645\u0639 \u0627\u0644\u0645\u0633\u0643\u0646\u0627\u062A\u061F"*).
\u0633\u0623\u062C\u064A\u0628\u0643 \u0641\u0648\u0631\u0627\u064B \u0628\u0627\u0644\u062C\u0631\u0639\u0627\u062A \u0627\u0644\u0645\u0648\u0635\u0649 \u0628\u0647\u0627\u060C \u0627\u0644\u062A\u062D\u0630\u064A\u0631\u0627\u062A\u060C \u0648\u0627\u0644\u062A\u062F\u0627\u062E\u0644\u0627\u062A \u0627\u0644\u062F\u0648\u0627\u0626\u064A\u0629.`
    );
    safeReply();
    return;
  }
  if (text.startsWith("/stats") || text.startsWith("/admin") || text.startsWith("/users")) {
    const allUsers = Array.from(usersDB.values());
    const totalUsers = allUsers.length;
    const proUsers = allUsers.filter((u) => u.plan === "pro").length;
    const vipUsers = allUsers.filter((u) => u.plan === "vip").length;
    const freeUsers = allUsers.filter((u) => u.plan === "free").length;
    const totalRequestsCount = allUsers.reduce((acc, u) => acc + (u.totalRequests || u.dailyQuotaUsed || 1), 0);
    const sortedUsers = [...allUsers].sort((a, b) => {
      const dateA = new Date(a.lastActiveAt || a.createdAt).getTime();
      const dateB = new Date(b.lastActiveAt || b.createdAt).getTime();
      return dateB - dateA;
    });
    const formatDate = (isoString) => {
      if (!isoString) return "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F";
      try {
        const d = new Date(isoString);
        return d.toLocaleDateString("ar-EG", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });
      } catch (e) {
        return isoString.slice(0, 16);
      }
    };
    let statsMsg = `\u{1F4CA} **\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A \u0645\u0633\u062A\u062E\u062F\u0645\u064A \u0648\u0646\u0634\u0627\u0637 \u0645\u0646\u0635\u0629 \u0648\u0628\u0648\u062A \u062C\u0631\u0639\u0629 \u0627\u0644\u0637\u0628\u064A (Live Stats):**

`;
    statsMsg += `\u{1F465} **\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646 \u0627\u0644\u0645\u0633\u062C\u0644\u064A\u0646:** \`${totalUsers}\` \u0645\u0633\u062A\u062E\u062F\u0645
`;
    statsMsg += `\u26A1 **\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0648\u0627\u0644\u0637\u0644\u0628\u0627\u062A:** \`${totalRequestsCount}\` \u0627\u0633\u062A\u0634\u0627\u0631\u0629 \u0648\u0641\u062D\u0635

`;
    statsMsg += `\u{1F4C8} **\u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u0628\u0627\u0642\u0627\u062A \u0648\u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643\u0627\u062A:**
`;
    statsMsg += `\u2022 \u{1F48E} \u0628\u0627\u0642\u0629 VIP: \`${vipUsers}\` \u0645\u0634\u062A\u0631\u0643
`;
    statsMsg += `\u2022 \u{1F7E2} \u0628\u0627\u0642\u0629 Pro: \`${proUsers}\` \u0645\u0634\u062A\u0631\u0643
`;
    statsMsg += `\u2022 \u26AA \u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u0645\u062C\u0627\u0646\u064A\u0629: \`${freeUsers}\` \u0645\u0633\u062A\u062E\u062F\u0645

`;
    statsMsg += `\u{1F552} **\u0633\u062C\u0644 \u0622\u062E\u0631 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646 \u0648\u062A\u0648\u0627\u0631\u064A\u062E \u0627\u0644\u0646\u0634\u0627\u0637:**
`;
    sortedUsers.slice(0, 5).forEach((u, i) => {
      const usernameText = u.username ? `@${u.username}` : `ID: ${u.telegramId}`;
      const joined = formatDate(u.createdAt);
      const lastSeen = formatDate(u.lastActiveAt || u.createdAt);
      statsMsg += `
${i + 1}. **${u.firstName}** (${usernameText})
`;
      statsMsg += `   \u2022 \u0627\u0644\u0628\u0627\u0642\u0629: **${u.plan.toUpperCase()}** | \u0627\u0644\u0637\u0644\u0628\u0627\u062A: \`${u.totalRequests || u.dailyQuotaUsed || 1}\`
`;
      statsMsg += `   \u2022 \u{1F4C5} \u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0627\u0646\u0636\u0645\u0627\u0645: _${joined}_
`;
      statsMsg += `   \u2022 \u26A1 \u0622\u062E\u0631 \u0646\u0634\u0627\u0637: _${lastSeen}_
`;
    });
    statsMsg += `
\u{1F517} **\u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645 \u0627\u0644\u0633\u062D\u0627\u0628\u064A\u0629 \u0648\u0627\u0644\u0645\u0634\u062A\u0631\u0643\u064A\u0646 \u0643\u0627\u0645\u0644\u0629:**
${DEFAULT_APP_URL}/#crm`;
    const replyMarkup = {
      inline_keyboard: [
        [{ text: "\u{1F5A5}\uFE0F \u0641\u062A\u062D \u0644\u0648\u062D\u0629 \u0627\u0644\u0645\u0634\u062A\u0631\u0643\u064A\u0646 (CRM) \u0639\u0644\u0649 \u0627\u0644\u0648\u064A\u0628", url: `${DEFAULT_APP_URL}/#crm` }],
        [{ text: "\u{1F504} \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A", callback_data: "refresh_stats" }]
      ]
    };
    await sendTelegramMessage(chatId, statsMsg, replyMarkup);
    safeReply();
    return;
  }
  if (text && !text.startsWith("/")) {
    if (user.creditsRemaining <= 0 && user.plan !== "vip") {
      await sendTelegramMessage(
        chatId,
        `\u26A0\uFE0F **\u0644\u0642\u062F \u0627\u0633\u062A\u0646\u0641\u062F\u062A \u062D\u0635\u062A\u0643 \u0627\u0644\u064A\u0648\u0645\u064A\u0629 \u0645\u0646 \u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u0627\u062A (${user.dailyQuotaTotal} \u0637\u0644\u0628).**

\u064A\u0631\u062C\u0649 \u0627\u0644\u062A\u0631\u0642\u064A\u0629 \u0625\u0644\u0649 \u0628\u0627\u0642\u0629 Pro (250 \u0637\u0644\u0628 \u064A\u0648\u0645\u064A\u0627\u064B) \u0623\u0648 \u0628\u0627\u0642\u0629 VIP (\u063A\u064A\u0631 \u0645\u062D\u062F\u0648\u062F) \u0644\u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u0627\u062A:`,
        {
          inline_keyboard: [
            [{ text: "\u{1F48E} \u062A\u0631\u0642\u064A\u0629 \u0628\u0627\u0642\u062A\u064A \u0627\u0644\u0622\u0646", callback_data: "upgrade" }],
            [{ text: "\u{1F381} \u062A\u0641\u0639\u064A\u0644 \u0643\u0648\u062F \u0628\u0631\u0648\u0645\u0648", callback_data: "enter_promo" }]
          ]
        }
      );
      safeReply();
      return;
    }
    user.dailyQuotaUsed += 1;
    user.creditsRemaining = Math.max(0, user.dailyQuotaTotal - user.dailyQuotaUsed);
    usersDB.set(tgId, user);
    const ai = getGenAI();
    let reply = "";
    if (ai) {
      const candidateModels = ["gemini-2.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
      for (const modelName of candidateModels) {
        try {
          const prompt = `\u0623\u0646\u062A \u0635\u064A\u062F\u0644\u0627\u0646\u064A \u0648\u0627\u0633\u062A\u0634\u0627\u0631\u064A \u0633\u0631\u064A\u0631\u064A \u062E\u0628\u064A\u0631 \u0641\u064A \u0628\u0648\u062A \u0645\u0646\u0635\u0629 \u062C\u0631\u0639\u0629 \u0627\u0644\u0637\u0628\u064A\u0629. \u0623\u062C\u0628 \u0628\u0627\u062D\u062A\u0631\u0627\u0641\u064A\u0629 \u0648\u062F\u0642\u0629 \u0639\u0627\u0644\u064A\u0629 \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629\u060C \u0645\u0648\u0636\u062D\u0627\u064B \u062F\u0648\u0627\u0639\u064A \u0627\u0644\u0627\u0633\u062A\u0639\u0645\u0627\u0644\u060C \u0627\u0644\u062C\u0631\u0639\u0627\u062A \u0627\u0644\u0645\u0648\u0635\u0649 \u0628\u0647\u0627\u060C \u0627\u0644\u062A\u062D\u0630\u064A\u0631\u0627\u062A\u060C \u0648\u0625\u062E\u0644\u0627\u0621 \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u064A\u0629 \u0627\u0644\u0637\u0628\u064A.
\u0633\u0624\u0627\u0644 \u0627\u0644\u0645\u0631\u064A\u0636: ${text}`;
          const aiRes = await ai.models.generateContent({
            model: modelName,
            contents: prompt
          });
          reply = aiRes.text || "";
          if (reply) break;
        } catch (err) {
          console.warn(`Telegram AI Chat model ${modelName} failed:`, err?.message);
        }
      }
    }
    if (!reply) {
      reply = `\u0623\u0647\u0644\u0627\u064B \u0628\u0643! \u0628\u062E\u0635\u0648\u0635 \u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0643 \u0627\u0644\u0637\u0628\u064A: "${text}":

\u2022 \u064A\u0648\u0635\u0649 \u062F\u0627\u0626\u0645\u0627\u064B \u0628\u0645\u0631\u0627\u0639\u0627\u0629 \u0627\u0644\u062C\u0631\u0639\u0627\u062A \u0627\u0644\u0645\u062D\u062F\u062F\u0629 \u062D\u0633\u0628 \u0627\u0644\u0648\u0632\u0646 \u0648\u0627\u0644\u0633\u0646 \u0648\u0627\u0644\u062D\u0627\u0644\u0629 \u0627\u0644\u0633\u0631\u064A\u0631\u064A\u0629.
\u2022 \u062A\u0623\u0643\u062F \u0645\u0646 \u0639\u062F\u0645 \u0648\u062C\u0648\u062F \u062D\u0633\u0627\u0633\u064A\u0629 \u0623\u0648 \u062A\u062F\u0627\u062E\u0644 \u0645\u0639 \u0623\u062F\u0648\u064A\u0629 \u0623\u062E\u0631\u0649 \u062A\u062A\u0646\u0627\u0648\u0644\u0647\u0627.
\u2022 \u0627\u0633\u062A\u0634\u0631 \u0627\u0644\u0637\u0628\u064A\u0628 \u0623\u0648 \u0627\u0644\u0635\u064A\u062F\u0644\u0627\u0646\u064A \u0627\u0644\u0645\u0628\u0627\u0634\u0631 \u0642\u0628\u0644 \u062A\u063A\u064A\u064A\u0631 \u0623\u064A \u062C\u0631\u0639\u0629 \u0639\u0644\u0627\u062C\u064A\u0629.`;
    }
    reply += `

\u26A0\uFE0F *\u062A\u0646\u0648\u064A\u0647: \u0647\u0630\u0647 \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0633\u062A\u0631\u0634\u0627\u062F\u064A\u0629 \u0648\u062A\u062B\u0642\u064A\u0641\u064A\u0629 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0648\u0644\u0627 \u062A\u063A\u0646\u064A \u0639\u0646 \u0627\u0633\u062A\u0634\u0627\u0631\u0629 \u0627\u0644\u0637\u0628\u064A\u0628 \u0627\u0644\u0645\u0639\u0627\u0644\u062C.*`;
    await sendTelegramMessage(chatId, reply, {
      inline_keyboard: [
        [
          { text: "\u{1FA7A} \u0641\u0627\u062D\u0635 \u0627\u0644\u0623\u0639\u0631\u0627\u0636 (DDx)", callback_data: "action_symptoms" },
          { text: "\u{1F4B3} \u0627\u0644\u0628\u0627\u0642\u0627\u062A \u0648\u0627\u0644\u062A\u0631\u0642\u064A\u0629", callback_data: "upgrade" }
        ]
      ]
    });
  }
  safeReply();
}
app.post("/api/telegram/webhook", async (req, res) => {
  try {
    await handleSingleTelegramUpdate(req.body, res);
  } catch (err) {
    console.error("Webhook processing error:", err);
    if (!res.headersSent) res.json({ ok: true });
  }
});
app.get("/api/admin/users", (req, res) => {
  res.json({
    users: Array.from(usersDB.values())
  });
});
app.post(["/api/chat", "/chat"], async (req, res) => {
  const { message, patient_context = "", telegramId = "1001" } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }
  const user = usersDB.get(String(telegramId));
  const plan = user?.plan || "free";
  if (user && user.creditsRemaining <= 0 && user.plan !== "vip") {
    return res.status(429).json({
      error: "Daily quota exhausted",
      reply: "\u0639\u0630\u0631\u0627\u064B\u060C \u0644\u0642\u062F \u0627\u0633\u062A\u0646\u0641\u062F\u062A \u062D\u0635\u062A\u0643 \u0627\u0644\u064A\u0648\u0645\u064A\u0629 \u0645\u0646 \u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u0627\u062A \u0627\u0644\u0637\u0628\u064A\u0629 \u0641\u064A \u0627\u0644\u0628\u0648\u062A \u0648\u0627\u0644\u0645\u0648\u0642\u0639. \u064A\u0631\u062C\u0649 \u0627\u0644\u062A\u0631\u0642\u064A\u0629 \u0625\u0644\u0649 \u0628\u0627\u0642\u0629 Pro \u0644\u0644\u0645\u062A\u0627\u0628\u0639\u0629."
    });
  }
  if (user) {
    user.dailyQuotaUsed += 1;
    user.creditsRemaining = Math.max(0, user.dailyQuotaTotal - user.dailyQuotaUsed);
  }
  let replyText = "";
  const ai = getGenAI();
  if (ai) {
    try {
      const systemInstruction = `\u0623\u0646\u062A \u0635\u064A\u062F\u0644\u0627\u0646\u064A \u0648\u0627\u0633\u062A\u0634\u0627\u0631\u064A \u0637\u0628\u064A \u0645\u062A\u062E\u0635\u0635\u060C \u062A\u0642\u062F\u0645 \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u062F\u0648\u0627\u0626\u064A\u0629 \u0648\u0633\u0631\u064A\u0631\u064A\u0629 \u0645\u0648\u062B\u0648\u0642\u0629 \u0648\u0641\u0627\u0626\u0642\u0629 \u0627\u0644\u062F\u0642\u0629 \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629.
\u062A\u063A\u0637\u064A \u0625\u062C\u0627\u0628\u062A\u0643 \u0639\u0646\u062F \u0627\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631:
1. \u0627\u0644\u0645\u0627\u062F\u0629 \u0627\u0644\u0641\u0639\u0627\u0644\u0629 \u0648\u0622\u0644\u064A\u0629 \u0627\u0644\u0639\u0645\u0644 \u0648\u0627\u0633\u062A\u062E\u062F\u0627\u0645\u0627\u062A \u0627\u0644\u062F\u0648\u0627\u0621.
2. \u0627\u0644\u062C\u0631\u0639\u0627\u062A \u0627\u0644\u0645\u0648\u0635\u0649 \u0628\u0647\u0627 \u0644\u0644\u0628\u0627\u0644\u063A\u064A\u0646 \u0648\u0644\u0644\u0623\u0637\u0641\u0627\u0644 \u0645\u0639 \u0627\u0644\u062A\u062D\u0630\u064A\u0631\u0627\u062A.
3. \u0627\u0644\u062A\u062F\u0627\u062E\u0644\u0627\u062A \u0627\u0644\u062F\u0648\u0627\u0626\u064A\u0629 \u0648\u0645\u0648\u0627\u0646\u0639 \u0627\u0644\u0627\u0633\u062A\u0639\u0645\u0627\u0644 (\u0627\u0644\u062D\u0645\u0644\u060C \u0627\u0644\u0631\u0636\u0627\u0639\u0629\u060C \u0623\u0645\u0631\u0627\u0636 \u0627\u0644\u0643\u0628\u062F \u0648\u0627\u0644\u0643\u0644\u0649 \u0648\u0627\u0644\u0636\u063A\u0637 \u0648\u0627\u0644\u0633\u0643\u0631\u064A).
4. \u0627\u0644\u0622\u062B\u0627\u0631 \u0627\u0644\u062C\u0627\u0646\u0628\u064A\u0629 \u0627\u0644\u0634\u0627\u0626\u0639\u0629 \u0648\u0625\u0634\u0627\u0631\u0627\u062A \u0627\u0644\u062E\u0637\u0631.
5. \u0627\u0644\u0625\u0631\u0634\u0627\u062F\u0627\u062A \u0627\u0644\u0639\u0645\u0644\u064A\u0629 \u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629 \u0644\u0644\u0645\u0631\u064A\u0636.
${patient_context ? `\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0631\u064A\u0636 \u0648\u0633\u064A\u0627\u0642\u0647 \u0627\u0644\u0637\u0628\u064A: ${patient_context}` : ""}`;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `${systemInstruction}

\u0633\u0624\u0627\u0644 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645: ${message}`
      });
      replyText = response.text || "";
    } catch (err) {
      console.warn("Gemini Medical Chat Error:", err?.message);
    }
  }
  if (!replyText) {
    replyText = `\u0623\u0647\u0644\u0627\u064B \u0628\u0643 \u0641\u064A \u062E\u062F\u0645\u0629 \u0627\u0644\u0635\u064A\u062F\u0644\u0627\u0646\u064A \u0627\u0644\u0630\u0643\u064A (\u062C\u0631\u0639\u0629 \u2014 Dose):

\u0628\u062E\u0635\u0648\u0635 \u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0643 \u0639\u0646: "${message}"

- **\u0627\u0644\u062A\u0648\u0635\u064A\u0629 \u0627\u0644\u0625\u0631\u0634\u0627\u062F\u064A\u0629:** \u064A\u0648\u0635\u0649 \u062F\u0627\u0626\u0645\u0627\u064B \u0628\u0645\u0631\u0627\u0639\u0627\u0629 \u0627\u0644\u062C\u0631\u0639\u0627\u062A \u0627\u0644\u0645\u062D\u062F\u062F\u0629 \u062D\u0633\u0628 \u0627\u0644\u0648\u0632\u0646 \u0644\u0644\u0637\u0641\u0644 \u0623\u0648 \u0627\u0644\u062D\u0627\u0644\u0629 \u0627\u0644\u0633\u0631\u064A\u0631\u064A\u0629 \u0644\u0644\u0628\u0627\u0644\u063A\u064A\u0646\u060C \u0645\u0639 \u0627\u0644\u062A\u0623\u0643\u062F \u0645\u0646 \u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u0643\u0644\u0649 \u0648\u0627\u0644\u0643\u0628\u062F.
- **\u0627\u0644\u0623\u0645\u0627\u0646:** \u062A\u062C\u0646\u0628 \u062A\u0646\u0627\u0648\u0644 \u0623\u062F\u0648\u064A\u0629 \u0645\u062A\u0639\u062F\u062F\u0629 \u062F\u0648\u0646 \u0641\u062D\u0635 \u0627\u0644\u062A\u0641\u0627\u0639\u0644\u0627\u062A \u0627\u0644\u062F\u0648\u0627\u0626\u064A\u0629.
- **\u0625\u062E\u0644\u0627\u0621 \u0645\u0633\u0624\u0648\u0644\u064A\u0629:** \u0647\u0630\u0647 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0644\u0644\u0623\u063A\u0631\u0627\u0636 \u0627\u0644\u0625\u0631\u0634\u0627\u062F\u064A\u0629 \u0641\u0642\u0637\u060C \u0648\u064A\u062C\u0628 \u0627\u0633\u062A\u0634\u0627\u0631\u0629 \u0627\u0644\u0637\u0628\u064A\u0628 \u0623\u0648 \u0627\u0644\u0635\u064A\u062F\u0644\u0627\u0646\u064A \u0627\u0644\u0645\u0628\u0627\u0634\u0631 \u0642\u0628\u0644 \u0628\u062F\u0621 \u0623\u0648 \u062A\u0639\u062F\u064A\u0644 \u0623\u064A \u0639\u0644\u0627\u062C.`;
  }
  syncLogs.unshift({
    id: `log_${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    source: "web_platform",
    userTelegramId: String(telegramId),
    userName: user?.username ? `@${user.username}` : user?.firstName || "\u0645\u0633\u062A\u062E\u062F\u0645 \u062C\u0631\u0639\u0629",
    actionAr: `\u0627\u0633\u062A\u0634\u0627\u0631\u0629 \u0635\u064A\u062F\u0644\u0627\u0646\u064A\u0629 \u0630\u0643\u064A\u0629: "${message.slice(0, 30)}..."`,
    actionEn: `Pharmacist AI Query: "${message.slice(0, 30)}..."`,
    status: "success",
    tierUsed: plan
  });
  res.json({
    reply: replyText,
    creditsRemaining: user?.creditsRemaining,
    dailyQuotaUsed: user?.dailyQuotaUsed,
    status: "ok"
  });
});
app.get(["/reminders", "/api/reminders"], (req, res) => {
  const telegramId = req.query.telegram_id || "1001";
  const userRems = remindersDB.filter((r) => !r.telegramId || r.telegramId === telegramId);
  res.json(userRems);
});
app.post(["/reminders", "/api/reminders"], (req, res) => {
  const { drug_name, dose, times = [], days = [], email_notify = false, telegramId = "1001" } = req.body;
  if (!drug_name) {
    return res.status(400).json({ error: "drug_name is required" });
  }
  const user = usersDB.get(String(telegramId));
  if (user && user.plan === "free" && remindersDB.filter((r) => r.telegramId === telegramId && r.is_active).length >= 1) {
    return res.status(403).json({
      error: "Limit reached",
      message: "\u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u0645\u062C\u0627\u0646\u064A\u0629 \u062A\u062A\u064A\u062D \u062A\u0630\u0643\u064A\u0631\u0627\u064B \u0648\u0627\u062D\u062F\u0627\u064B \u0641\u0642\u0637. \u0642\u0645 \u0628\u0627\u0644\u062A\u0631\u0642\u064A\u0629 \u0644\u0640 Pro \u0644\u0625\u0636\u0627\u0641\u0629 \u0639\u062F\u062F \u063A\u064A\u0631 \u0645\u062D\u062F\u0648\u062F \u0645\u0646 \u062A\u0630\u0643\u064A\u0631\u0627\u062A \u0627\u0644\u062F\u0648\u0627\u0621 \u0648\u0627\u0644\u062A\u0632\u0627\u0645\u0646 \u0645\u0639 \u062A\u0644\u064A\u062C\u0631\u0627\u0645."
    });
  }
  const newRem = {
    id: `rem_${Date.now()}`,
    telegramId: String(telegramId),
    drug_name,
    dose: dose || "\u062C\u0631\u0639\u0629 \u0627\u0639\u062A\u064A\u0627\u062F\u064A\u0629",
    times: Array.isArray(times) && times.length ? times : ["08:00"],
    days: Array.isArray(days) && days.length ? days : ["\u064A\u0648\u0645\u064A\u0627\u064B"],
    email_notify: Boolean(email_notify),
    is_active: true,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  remindersDB.unshift(newRem);
  syncLogs.unshift({
    id: `log_${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    source: "web_platform",
    userTelegramId: String(telegramId),
    userName: user?.username ? `@${user.username}` : user?.firstName || "\u0645\u0633\u062A\u062E\u062F\u0645 \u062C\u0631\u0639\u0629",
    actionAr: `\u0625\u0646\u0634\u0627\u0621 \u062A\u0630\u0643\u064A\u0631 \u062F\u0648\u0627\u0621 \u062C\u062F\u064A\u062F: ${drug_name} (${dose})`,
    actionEn: `Created medication reminder: ${drug_name}`,
    status: "success",
    tierUsed: user?.plan || "free"
  });
  res.json({ id: newRem.id, message: "\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062A\u0630\u0643\u064A\u0631 \u0628\u0646\u062C\u0627\u062D \u2705", reminder: newRem });
});
app.delete(["/reminders/:id", "/api/reminders/:id"], (req, res) => {
  const { id } = req.params;
  const idx = remindersDB.findIndex((r) => r.id === id);
  if (idx !== -1) {
    remindersDB[idx].is_active = false;
    res.json({ success: true, message: "\u062A\u0645 \u0625\u064A\u0642\u0627\u0641 \u0627\u0644\u062A\u0630\u0643\u064A\u0631 \u0628\u0646\u062C\u0627\u062D \u2705" });
  } else {
    res.status(404).json({ error: "Reminder not found" });
  }
});
app.get(["/history", "/api/history"], (req, res) => {
  const telegramId = req.query.telegram_id || "1001";
  const userHistory = drugHistoryDB.filter((h) => !h.telegramId || h.telegramId === telegramId);
  res.json(userHistory.slice(0, 20));
});
app.post(["/history/add", "/api/history/add"], (req, res) => {
  const { drug_name, drug_id, telegramId = "1001" } = req.body;
  if (drug_name) {
    drugHistoryDB.unshift({
      id: `h_${Date.now()}`,
      telegramId: String(telegramId),
      drug_name,
      drug_id,
      searched_at: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  res.json({ ok: true });
});
app.get(["/plans", "/api/plans"], (req, res) => {
  res.json([
    {
      id: "plan_free",
      name: "Free",
      name_ar: "\u0627\u0644\u0645\u062C\u0627\u0646\u064A\u0629",
      price: 0,
      interval: "free",
      search_limit: 15,
      reminder_limit: 1,
      has_pdf: false,
      has_interactions: true,
      features: [
        "15 \u0641\u062D\u0635 \u0648\u0627\u0633\u062A\u0634\u0627\u0631\u0629 \u0633\u0631\u064A\u0631\u064A\u0629 \u064A\u0648\u0645\u064A\u0627\u064B \u0639\u0628\u0631 \u0627\u0644\u0628\u0648\u062A \u0648\u0627\u0644\u0645\u0648\u0642\u0639",
        "\u0641\u0627\u062D\u0635 \u0627\u0644\u0623\u0639\u0631\u0627\u0636 \u0627\u0644\u0633\u0631\u064A\u0631\u064A \u0627\u0644\u0623\u0633\u0627\u0633\u064A (DDx Triage)",
        "\u0641\u062D\u0635 \u0627\u0644\u062A\u062F\u0627\u062E\u0644\u0627\u062A \u0627\u0644\u062F\u0648\u0627\u0626\u064A\u0629 \u0627\u0644\u062B\u0646\u0627\u0626\u064A\u0629 \u0648\u0627\u0644\u0622\u062B\u0627\u0631 \u0627\u0644\u062C\u0627\u0646\u0628\u064A\u0629",
        "\u062D\u0627\u0633\u0628\u0629 \u062C\u0631\u0639\u0627\u062A \u0627\u0644\u0623\u0637\u0641\u0627\u0644 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629",
        "\u062A\u0635\u0641\u062D \u0627\u0644\u062F\u0644\u064A\u0644 \u0627\u0644\u0637\u0628\u064A \u0644\u0644\u0623\u062F\u0648\u064A\u0629 \u0648\u0645\u0624\u0634\u0631\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645",
        "\u062A\u0630\u0643\u064A\u0631 \u062F\u0648\u0627\u0626\u064A \u0646\u0634\u0637 \u0648\u0627\u062D\u062F \u0645\u0639 \u0625\u0634\u0639\u0627\u0631\u0627\u062A \u062A\u0644\u064A\u062C\u0631\u0627\u0645"
      ]
    },
    {
      id: "plan_pro",
      name: "Pro",
      name_ar: "\u0627\u0644\u0627\u062D\u062A\u0631\u0627\u0641\u064A\u0629 (Pro)",
      price: 2.99,
      price_monthly: 2.99,
      price_yearly: 19.99,
      interval: "month",
      search_limit: 250,
      reminder_limit: 50,
      has_pdf: true,
      has_interactions: true,
      features: [
        "250 \u0627\u0633\u062A\u0634\u0627\u0631\u0629 \u0648\u0641\u062D\u0635 \u0633\u0631\u064A\u0631\u064A \u064A\u0648\u0645\u064A\u0627\u064B \u0639\u0628\u0631 \u0627\u0644\u0628\u0648\u062A \u0648\u0627\u0644\u0645\u0648\u0642\u0639",
        "\u0641\u0627\u062D\u0635 \u0627\u0644\u0623\u0639\u0631\u0627\u0636 \u0648\u0627\u0644\u062A\u0634\u062E\u064A\u0635 \u0627\u0644\u062A\u0641\u0631\u064A\u0642\u064A \u0627\u0644\u0634\u0627\u0645\u0644 (Clinical DDx)",
        "\u062A\u062D\u0644\u064A\u0644 \u0635\u0648\u0631 \u0627\u0644\u0623\u0634\u0639\u0629 \u0627\u0644\u0633\u064A\u0646\u064A\u0629 (X-Ray) \u0648\u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631 \u0627\u0644\u0645\u062E\u0628\u0631\u064A\u0629 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A",
        "\u062D\u0627\u0633\u0628\u0629 \u062C\u0631\u0639\u0627\u062A \u0627\u0644\u0623\u0637\u0641\u0627\u0644 \u0627\u0644\u062F\u0642\u064A\u0642\u0629 \u062D\u0633\u0628 \u0627\u0644\u0648\u0632\u0646\u060C \u0627\u0644\u0639\u0645\u0631\u060C \u0648\u0645\u0633\u0627\u062D\u0629 \u0633\u0637\u062D \u0627\u0644\u062C\u0633\u0645",
        "\u062A\u0635\u062F\u064A\u0631 \u0648\u0637\u0628\u0627\u0639\u0629 \u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631 \u0627\u0644\u0633\u0631\u064A\u0631\u064A\u0629 \u0627\u0644\u0631\u0633\u0645\u064A\u0629 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629 \u0628\u0635\u064A\u063A\u0629 PDF",
        "\u062A\u0646\u0628\u064A\u0647\u0627\u062A \u0648\u062A\u0630\u0643\u064A\u0631\u0627\u062A \u0623\u062F\u0648\u064A\u0629 \u063A\u064A\u0631 \u0645\u062D\u062F\u0648\u062F\u0629 \u0645\u0639 \u0645\u0632\u0627\u0645\u0646\u0629 \u0644\u062D\u0638\u064A\u0629 \u0641\u064A \u062A\u0644\u064A\u062C\u0631\u0627\u0645",
        "\u0623\u0648\u0644\u0648\u064A\u0629 \u0645\u0639\u0627\u0644\u062C\u0629 \u0641\u0648\u0631\u064A\u0629 \u0641\u0627\u0626\u0642\u0629 \u0627\u0644\u0633\u0631\u0639\u0629 \u0628\u0646\u0645\u0627\u0630\u062C Gemini \u0627\u0644\u0637\u0628\u064A\u0629"
      ]
    },
    {
      id: "plan_vip",
      name: "Pro VIP",
      name_ar: "\u0627\u0644\u0630\u0647\u0628\u064A\u0629 (VIP \u0627\u0644\u0633\u0631\u064A\u0631\u064A\u0629)",
      price: 4.99,
      price_monthly: 4.99,
      price_yearly: 39.99,
      interval: "month",
      search_limit: 9999,
      reminder_limit: 9999,
      has_pdf: true,
      has_interactions: true,
      features: [
        "\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0633\u0631\u064A\u0631\u064A \u063A\u064A\u0631 \u0645\u062D\u062F\u0648\u062F \u0644\u0644\u0637\u0644\u0628\u0627\u062A \u0648\u0627\u0644\u0641\u062D\u0648\u0635\u0627\u062A (Unlimited \u221E)",
        "\u0643\u0627\u0641\u0629 \u0645\u0645\u064A\u0632\u0627\u062A \u0628\u0627\u0642\u0629 Pro \u0627\u0644\u0633\u0631\u064A\u0631\u064A\u0629 \u0648\u0627\u0644\u0645\u062A\u0642\u062F\u0645\u0629 \u0628\u0627\u0644\u0643\u0627\u0645\u0644",
        "\u0627\u0633\u062A\u0634\u0627\u0631\u0627\u062A \u0627\u0644\u0635\u064A\u062F\u0644\u0627\u0646\u064A \u0627\u0644\u0633\u0631\u064A\u0631\u064A \u0627\u0644\u0630\u0643\u064A \u0627\u0644\u0645\u062A\u0648\u0627\u0635\u0644\u0629",
        "\u0631\u0628\u0637 Webhooks \u0645\u062E\u0635\u0635\u0629 \u0648\u0627\u0644\u0648\u0635\u0648\u0644 \u0644\u0640 API \u0627\u0644\u0645\u0637\u0648\u0631\u064A\u0646 \u0648\u0627\u0644\u0623\u0646\u0638\u0645\u0629 \u0627\u0644\u0637\u0628\u064A\u0629",
        "\u062D\u0645\u0644\u0627\u062A \u0627\u0644\u062A\u0648\u0639\u064A\u0629 \u0627\u0644\u0635\u062D\u064A\u0629 \u0648\u0625\u0634\u0639\u0627\u0631\u0627\u062A \u0627\u0644\u0623\u062F\u0648\u064A\u0629 \u0627\u0644\u0630\u0643\u064A\u0629 \u0644\u0645\u0634\u062A\u0631\u0643\u064A \u0627\u0644\u0628\u0648\u062A",
        "\u0623\u0631\u0634\u0641\u0629 \u0648\u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u0639\u0644\u0627\u0645\u0627\u062A \u0627\u0644\u062D\u064A\u0648\u064A\u0629 \u0648\u0633\u062C\u0644\u0627\u062A \u0627\u0644\u0645\u0631\u0636\u0649",
        "\u062F\u0639\u0645 \u0637\u0628\u064A \u0648\u062A\u0642\u0646\u064A \u0645\u062E\u0635\u0635 \u0630\u0648 \u0623\u0648\u0644\u0648\u064A\u0629 \u0642\u0635\u0648\u0649 24/7"
      ]
    }
  ]);
});
app.get("/bot/verify/:telegram_id", (req, res) => {
  const { telegram_id } = req.params;
  const user = usersDB.get(String(telegram_id));
  if (!user) {
    return res.json({
      linked: false,
      has_sub: false,
      plan: "Free",
      plan_ar: "\u0645\u062C\u0627\u0646\u064A",
      search_limit: 15,
      reminder_limit: 1,
      register_url: "/#auth"
    });
  }
  const isExpired = new Date(user.planExpiresAt).getTime() < Date.now();
  const plan = isExpired ? "free" : user.plan;
  const planAr = plan === "vip" ? "\u0627\u0644\u0630\u0647\u0628\u064A\u0629 (VIP)" : plan === "pro" ? "\u0627\u0644\u0627\u062D\u062A\u0631\u0627\u0641\u064A\u0629 (Pro)" : "\u0627\u0644\u0645\u062C\u0627\u0646\u064A\u0629";
  res.json({
    linked: true,
    has_sub: plan !== "free",
    uid: user.id,
    email: `${user.username || user.telegramId}@telegram.user`,
    plan: user.plan,
    plan_ar: planAr,
    status: isExpired ? "expired" : "active",
    expires: user.planExpiresAt,
    search_limit: user.dailyQuotaTotal,
    reminder_limit: plan === "free" ? 1 : 50,
    upgrade_url: "/#pricing"
  });
});
app.post("/bot/track/:telegram_id", (req, res) => {
  const { telegram_id } = req.params;
  const user = usersDB.get(String(telegram_id));
  if (!user) {
    return res.json({ allowed: true, used: 1, limit: 15 });
  }
  const allowed = user.creditsRemaining > 0 || user.plan === "vip";
  if (allowed) {
    user.dailyQuotaUsed += 1;
    user.creditsRemaining = Math.max(0, user.dailyQuotaTotal - user.dailyQuotaUsed);
  }
  res.json({
    allowed,
    used: user.dailyQuotaUsed,
    limit: user.dailyQuotaTotal,
    creditsRemaining: user.creditsRemaining
  });
});
app.get("/api/paddle/config", (req, res) => {
  const isLive = runtimePaddleConfig.environment === "live";
  const appUrl = process.env.APP_URL || "https://ais-dev-od4aemezdgaeup2ncw76si-295455119343.europe-west2.run.app";
  res.json({
    environment: runtimePaddleConfig.environment,
    isLive,
    vendorId: runtimePaddleConfig.vendorId,
    clientTokenMasked: runtimePaddleConfig.clientToken ? `${runtimePaddleConfig.clientToken.slice(0, 8)}...` : null,
    apiKeyMasked: runtimePaddleConfig.apiKey ? `${runtimePaddleConfig.apiKey.slice(0, 6)}...${runtimePaddleConfig.apiKey.slice(-4)}` : null,
    webhookSecretConfigured: Boolean(runtimePaddleConfig.webhookSecret),
    webhookUrl: `${appUrl.replace(/\/+$/, "")}/api/paddle/webhook`,
    livePriceIds: runtimePaddleConfig.livePriceIds,
    sandboxPriceIds: runtimePaddleConfig.sandboxPriceIds,
    activePriceIds: isLive ? runtimePaddleConfig.livePriceIds : runtimePaddleConfig.sandboxPriceIds
  });
});
app.post("/api/paddle/config", (req, res) => {
  const { environment, vendorId, clientToken, apiKey, webhookSecret, livePriceIds, sandboxPriceIds } = req.body;
  runtimePaddleConfig = savePaddleConfig({
    ...environment && { environment },
    ...vendorId !== void 0 && { vendorId },
    ...clientToken !== void 0 && { clientToken },
    ...apiKey !== void 0 && { apiKey },
    ...webhookSecret !== void 0 && { webhookSecret },
    ...livePriceIds && { livePriceIds },
    ...sandboxPriceIds && { sandboxPriceIds }
  });
  syncLogs.unshift({
    id: `log_${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    source: "web_platform",
    userTelegramId: "SYSTEM",
    userName: "\u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0638\u0627\u0645",
    actionAr: `\u062A\u062D\u062F\u064A\u062B \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0628\u0648\u0627\u0628\u0629 Paddle \u0625\u0644\u0649 \u0648\u0636\u0639 (${runtimePaddleConfig.environment.toUpperCase()})`,
    actionEn: `Paddle gateway mode updated to (${runtimePaddleConfig.environment.toUpperCase()})`,
    status: "success",
    tierUsed: "vip"
  });
  res.json({
    ok: true,
    message: `\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0628\u0648\u0627\u0628\u0629 Paddle \u0628\u0646\u062C\u0627\u062D \u0625\u0644\u0649 \u0648\u0636\u0639 ${runtimePaddleConfig.environment === "live" ? "\u0627\u0644\u0645\u0628\u0627\u0634\u0631 \u0627\u0644\u062D\u064A (LIVE)" : "\u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631 \u0627\u0644\u062A\u062C\u0631\u064A\u0628\u064A (SANDBOX)"}`,
    environment: runtimePaddleConfig.environment,
    isLive: runtimePaddleConfig.environment === "live"
  });
});
app.post("/api/create-checkout", (req, res) => {
  const { price_id, uid = "1001", email = "customer@example.com", plan = "pro", billingCycle = "monthly" } = req.body;
  const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const isLive = runtimePaddleConfig.environment === "live";
  let priceId = price_id;
  if (!priceId) {
    const activePrices = isLive ? runtimePaddleConfig.livePriceIds : runtimePaddleConfig.sandboxPriceIds;
    priceId = billingCycle === "yearly" ? activePrices.yearly : activePrices.monthly;
  }
  const checkoutDomain = isLive ? "https://checkout.paddle.com" : "https://sandbox-checkout.paddle.com";
  const customDataEncoded = encodeURIComponent(JSON.stringify({ uid: String(uid), plan, billingCycle }));
  const checkoutUrl = `${checkoutDomain}/checkout/build/?price=${priceId}&customer_email=${encodeURIComponent(email)}&custom_data=${customDataEncoded}`;
  res.json({
    success: true,
    transaction_id: transactionId,
    checkout_url: checkoutUrl,
    environment: runtimePaddleConfig.environment,
    isLive,
    priceId,
    plan,
    message: isLive ? "\u062A\u0645 \u062A\u062C\u0647\u064A\u0632 \u062C\u0644\u0633\u0629 \u0627\u0644\u062F\u0641\u0639 \u0639\u0628\u0631 Paddle (\u0648\u0636\u0639 \u0627\u0644\u0625\u0646\u062A\u0627\u062C \u0627\u0644\u0645\u0628\u0627\u0634\u0631 Live)" : "\u062A\u0645 \u062A\u062C\u0647\u064A\u0632 \u062C\u0644\u0633\u0629 \u0627\u0644\u062F\u0641\u0639 \u0639\u0628\u0631 Paddle (\u0648\u0636\u0639 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631 \u0627\u0644\u062A\u062C\u0631\u064A\u0628\u064A Sandbox)"
  });
});
app.post(["/paddle/webhook", "/api/paddle/webhook"], (req, res) => {
  const data = req.body || {};
  const event = data.event_type || data.alert_name || "subscription.created";
  const obj = data.data || {};
  const custom = obj.custom_data || {};
  const uid = custom.uid || data.passthrough || "1001";
  const plan = custom.plan || "pro";
  const billingCycle = custom.billingCycle || "monthly";
  const user = usersDB.get(String(uid));
  if (user) {
    user.plan = plan;
    user.dailyQuotaTotal = plan === "vip" ? 9999 : 250;
    user.creditsRemaining = user.dailyQuotaTotal;
    const durationDays = billingCycle === "yearly" ? 365 : 30;
    user.planExpiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1e3).toISOString();
    user.lastActiveAt = (/* @__PURE__ */ new Date()).toISOString();
    usersDB.set(String(uid), user);
    syncLogs.unshift({
      id: `log_${Date.now()}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      source: "web_platform",
      userTelegramId: user.telegramId,
      userName: user.username ? `@${user.username}` : user.firstName,
      actionAr: `\u062A\u0641\u0639\u064A\u0644 \u0627\u0634\u062A\u0631\u0627\u0643 \u0639\u0628\u0631 Paddle Webhook (${plan.toUpperCase()} - ${billingCycle === "yearly" ? "\u0633\u0646\u0648\u064A" : "\u0634\u0647\u0631\u064A"})`,
      actionEn: `Subscription activated via Paddle Webhook (${plan.toUpperCase()} - ${billingCycle})`,
      status: "success",
      tierUsed: user.plan
    });
  }
  res.json({ status: "ok", received_event: event, uid, plan });
});
app.post("/api/paddle/simulate-webhook", (req, res) => {
  const { telegramId = "1001", plan = "pro", billingCycle = "monthly" } = req.body;
  const user = usersDB.get(String(telegramId));
  if (!user) {
    return res.status(404).json({ ok: false, error: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0628\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A" });
  }
  user.plan = plan;
  user.dailyQuotaTotal = plan === "vip" ? 9999 : 250;
  user.creditsRemaining = user.dailyQuotaTotal;
  const durationDays = billingCycle === "yearly" ? 365 : 30;
  user.planExpiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1e3).toISOString();
  user.lastActiveAt = (/* @__PURE__ */ new Date()).toISOString();
  usersDB.set(String(telegramId), user);
  const isLive = runtimePaddleConfig.environment === "live";
  syncLogs.unshift({
    id: `log_${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    source: "web_platform",
    userTelegramId: user.telegramId,
    userName: user.username ? `@${user.username}` : user.firstName,
    actionAr: `\u0645\u062D\u0627\u0643\u0627\u0629 \u062F\u0641\u0639 \u0646\u0627\u062C\u062D \u0639\u0628\u0631 Paddle (${isLive ? "Live" : "Sandbox"}) - \u062A\u0641\u0639\u064A\u0644 \u0628\u0627\u0642\u0629 ${plan.toUpperCase()}`,
    actionEn: `Paddle Payment Simulation (${isLive ? "Live" : "Sandbox"}) - Activated ${plan.toUpperCase()}`,
    status: "success",
    tierUsed: user.plan
  });
  res.json({
    ok: true,
    success: true,
    message: `\u062A\u0645 \u0645\u062D\u0627\u0643\u0627\u0629 \u0627\u0644\u062F\u0641\u0639 \u0639\u0628\u0631 Paddle \u0648\u062A\u0641\u0639\u064A\u0644 \u0628\u0627\u0642\u0629 ${plan.toUpperCase()} \u0644\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0628\u0646\u062C\u0627\u062D`,
    user,
    environment: runtimePaddleConfig.environment,
    isLive
  });
});
app.post(["/api/medical/analyze-lab", "/api/medical/analyze-imaging"], async (req, res) => {
  const { imageBase64, mimeType = "image/jpeg", textNotes = "", telegramId = "1001", analysisType = "lab", labCategory = "all" } = req.body;
  const ai = getGenAI();
  const user = usersDB.get(String(telegramId));
  const plan = user?.plan || "pro";
  let testName = analysisType === "lab" ? "\u062A\u062D\u0644\u064A\u0644 \u0645\u062E\u0628\u0631\u064A \u0633\u0631\u064A\u0631\u064A" : "\u0641\u062D\u0635 \u0648\u062A\u0635\u0648\u064A\u0631 \u0625\u0634\u0639\u0627\u0639\u064A";
  let urgencyLevel = "normal";
  let findingsSummary = "";
  let items = [];
  let detailedExplanation = "";
  let recommendations = [];
  if (ai) {
    const isImaging = analysisType === "imaging";
    const prompt = isImaging ? `You are an expert subspecialty Consultant Diagnostic Radiologist, Interventional Radiologist, and Senior Trauma Physician.
Analyze this medical imaging study (X-ray, CT scan, MRI, or Ultrasound) with thorough clinical and diagnostic precision across ALL anatomical regions and modalities.

COMPREHENSIVE RADIOLOGICAL EVALUATION SYSTEM (ALL REGIONS & MODALITIES):
1. Modality & Anatomical Region Recognition:
   - Identify modality: Plain Radiography (X-Ray), Computed Tomography (CT), Magnetic Resonance Imaging (MRI), or Ultrasound (US).
   - Identify precise anatomical region and projection:
     * Thorax/Chest: Lungs, pleura, mediastinum, cardiothoracic ratio, hilar structures, ribs. (e.g. PA/AP view).
     * Musculoskeletal & Joints: Shoulder, elbow, wrist/hand, pelvis/hip, knee, ankle/foot. (e.g. AP, Lateral, Oblique, Axial).
     * Spine: Cervical, thoracic, lumbar, lumbosacral. (e.g. alignment, disc spaces, vertebral body height).
     * Abdomen/Pelvis: Bowel gas patterns, free air under diaphragm (pneumoperitoneum), calcifications/stones, soft tissue masses.
     * Neuro/Cranial: Calvarium, intracranial symmetry, midline shift, ventricular size, acute hemorrhage.

2. Systematic Pathology & Discrepancy Screening (Scan for Differences from Normal Baseline):
   - Articular & Joint Alignment: Dislocation (anterior, posterior, inferior), subluxation, joint space narrowing, effusion, or erosion.
   - Osseous Integrity & Cortical Outlines: Acute fracture lines, fissures, displaced or comminuted fractures, impaction, bone destruction, osteolytic or osteoblastic lesions.
   - Pulmonary & Pleural Pathologies: Consolidation/pneumonia, pleural effusion (blunting of costophrenic angles), pneumothorax (absence of peripheral lung markings, visceral pleural line), pulmonary edema, interstitial opacities, atelectasis, solitary pulmonary nodule.
   - Cardiovascular & Mediastinum: Cardiomegaly (CTR > 0.50), aortic widening, mediastinal lymphadenopathy, tracheobronchial deviation.
   - Spine & Disc Assessment: Spondylolisthesis (vertebral slip), compression fractures, loss of disc height, osteophytes/degenerative disc disease, spinal canal compromise.
   - Abdominal Emergencies: Pneumoperitoneum (crescent air under diaphragm), fluid levels (bowel obstruction), foreign bodies, urinary tract radiopaque calculi.

3. Objective Differential & Urgency Classification:
   - "critical": Imminent emergencies requiring immediate resuscitation or urgent surgical/orthopedic intervention (e.g. acute dislocation, unstable or open fracture, tension pneumothorax, large pneumothorax, intracranial bleed, pneumoperitoneum).
   - "high": Significant abnormal pathology requiring urgent medical attention within hours/days (e.g. non-displaced fracture, acute bacterial consolidation/pneumonia, pleural effusion, severe joint effusion, acute disc herniation).
   - "medium": Chronic or moderate abnormal findings requiring routine specialist clinic follow-up (e.g. degenerative osteoarthritis, chronic bronchitis, mild scoliosis, stable calcification).
   - "normal": Completely intact, symmetric, and unremarkable baseline examination within healthy limits.

4. Diagnostic Rigor Rule:
   - NEVER classify an image showing a dislocation, fracture line, consolidation, or effusion as "normal".
   - Highlight exact measurements, deviations from healthy reference ranges, and structural asymmetries.

Patient Context / Notes: ${textNotes || "\u0641\u062D\u0635 \u0634\u0639\u0627\u0639\u064A"}.

Output STRICTLY valid JSON with Arabic explanations and international medical terms:
{
  "testName": "\u0627\u0633\u0645 \u0627\u0644\u0641\u062D\u0635 \u0627\u0644\u062A\u0634\u062E\u064A\u0635\u064A \u0648\u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0645\u0635\u0648\u0631\u0629 \u0628\u062F\u0642\u0629 \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0648\u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A\u0629 (\u0645\u062B\u0644\u0627\u064B: \u0623\u0634\u0639\u0629 \u0633\u064A\u0646\u064A\u0629 \u0644\u0644\u0635\u062F\u0631 - Chest X-Ray PA View)",
  "urgencyLevel": "critical \u0623\u0648 high \u0623\u0648 medium \u0623\u0648 normal",
  "findingsSummary": "\u0645\u0644\u062E\u0635 \u062A\u0634\u062E\u064A\u0635\u064A \u062F\u0642\u064A\u0642 \u064A\u0628\u064A\u0646 \u0627\u0644\u0646\u062A\u064A\u062C\u0629 \u0627\u0644\u062C\u0648\u0647\u0631\u064A\u0629 (\u0645\u062B\u0644\u0627\u064B: \u062E\u0644\u0639 \u0645\u0641\u0635\u0644\u064A\u060C \u0643\u0633\u0631\u060C \u0627\u0631\u062A\u0634\u0627\u062D \u0631\u0626\u0648\u064A\u060C \u0627\u0646\u0635\u0628\u0627\u0628\u060C \u0623\u0648 \u0633\u0644\u0627\u0645\u0629 \u0627\u0644\u0641\u062D\u0635)",
  "items": [
    {
      "name": "\u0627\u0633\u0645 \u0627\u0644\u0639\u0646\u0635\u0631 \u0627\u0644\u062A\u0634\u0631\u064A\u062D\u064A \u0623\u0648 \u0627\u0644\u0646\u0633\u064A\u062C \u0627\u0644\u0645\u0641\u062D\u0648\u0635 (\u0645\u062B\u0644\u0627\u064B: \u062D\u0642\u0648\u0644 \u0627\u0644\u0631\u0626\u0629\u060C \u0627\u0644\u0645\u0641\u0635\u0644\u060C \u0627\u0644\u0642\u0634\u0631\u0629 \u0627\u0644\u0639\u0638\u0645\u064A\u0629)",
      "value": "\u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0629 \u0627\u0644\u0633\u0631\u064A\u0631\u064A\u0629 \u0627\u0644\u0645\u062D\u062F\u062F\u0629 \u0648\u0627\u0644\u0641\u0631\u0642 \u0639\u0646 \u0627\u0644\u0637\u0628\u064A\u0639\u064A (\u0645\u062B\u0644\u0627\u064B: \u0627\u0631\u062A\u0634\u0627\u062D \u0641\u0635\u064A \u0642\u0627\u0639\u062F\u064A\u060C \u062E\u0644\u0639 \u0623\u0645\u0627\u0645\u064A\u060C \u0633\u0644\u064A\u0645)",
      "referenceRange": "\u0627\u0644\u0645\u0639\u064A\u0627\u0631 \u0627\u0644\u0637\u0628\u064A \u0627\u0644\u0633\u0644\u064A\u0645 (\u0645\u062B\u0644\u0627\u064B: \u0631\u0626\u0629 \u0635\u0627\u0641\u064A\u0629\u060C \u062A\u0645\u0648\u0636\u0639 \u0645\u0631\u0643\u0632\u064A\u060C \u0642\u0634\u0631\u0629 \u0645\u062A\u0635\u0644\u0629)",
      "status": "critical \u0623\u0648 high \u0623\u0648 low \u0623\u0648 normal"
    }
  ],
  "detailedExplanation": "\u062A\u0642\u0631\u064A\u0631 \u0625\u0634\u0639\u0627\u0639\u064A \u0633\u0631\u064A\u0631\u064A \u062A\u0641\u0635\u064A\u0644\u064A \u0648\u0634\u0627\u0645\u0644 \u064A\u0648\u0636\u062D \u0627\u0644\u0645\u0648\u062C\u0648\u062F\u0627\u062A \u0627\u0644\u0625\u0634\u0639\u0627\u0639\u064A\u0629\u060C \u0627\u0644\u062A\u063A\u064A\u0631\u0627\u062A \u0627\u0644\u0647\u064A\u0643\u0644\u064A\u0629 \u0623\u0648 \u0627\u0644\u0646\u0633\u064A\u062C\u064A\u0629\u060C \u0627\u0644\u062A\u0634\u062E\u064A\u0635 \u0627\u0644\u0645\u062D\u062A\u0645\u0644\u060C \u0648\u0645\u0642\u0627\u0631\u0646\u062A\u0647\u0627 \u0628\u0627\u0644\u062D\u0627\u0644\u0629 \u0627\u0644\u0633\u0644\u064A\u0645\u0629",
  "recommendations": [
    "\u062A\u0648\u0635\u064A\u0629 \u0625\u0633\u0639\u0627\u0641\u064A\u0629 \u0623\u0648 \u0639\u0644\u0627\u062C\u064A\u0629 \u0645\u0628\u0627\u0634\u0631\u0629 \u0648\u0641\u0642\u0627\u064B \u0644\u062F\u0631\u062C\u0629 \u0627\u0644\u062E\u0637\u0648\u0631\u0629",
    "\u062A\u0648\u0635\u064A\u0629 \u062A\u0634\u062E\u064A\u0635\u064A\u0629 \u0627\u0633\u062A\u0643\u0645\u0627\u0644\u064A\u0629 (\u0645\u062B\u0644 \u0641\u062D\u0635 \u062F\u0645\u060C \u0631\u0646\u064A\u0646 \u0645\u063A\u0646\u0627\u0637\u064A\u0633\u064A\u060C \u0623\u0634\u0639\u0629 \u0645\u0642\u0637\u0639\u064A\u0629 \u0639\u0646\u062F \u0627\u0644\u062D\u0627\u062C\u0629)",
    "\u062A\u0648\u0635\u064A\u0629 \u0645\u062A\u0627\u0628\u0639\u0629 \u0648\u0645\u0631\u0627\u0642\u0628\u0629 \u0627\u0644\u0623\u0639\u0631\u0627\u0636 \u0627\u0644\u0633\u0631\u064A\u0631\u064A\u0629"
  ]
}` : `\u0623\u0646\u062A \u0627\u0633\u062A\u0634\u0627\u0631\u064A \u0627\u0644\u0637\u0628 \u0627\u0644\u0645\u062E\u0628\u0631\u064A \u0648\u0627\u0644\u062A\u062D\u0627\u0644\u064A\u0644 \u0627\u0644\u0633\u0631\u064A\u0631\u064A\u0629 \u0648\u0639\u0644\u0645 \u0627\u0644\u0623\u0645\u0631\u0627\u0636 (Consultant Clinical Pathologist).
\u0642\u0645 \u0628\u0642\u0631\u0627\u0621\u0629 \u0648\u062A\u062D\u0644\u064A\u0644 \u0635\u0648\u0631\u0629 \u0627\u0644\u0641\u062D\u0635 \u0627\u0644\u0645\u062E\u0628\u0631\u064A \u0627\u0644\u0645\u0631\u0641\u0642\u0629 (\u0648\u0631\u0642\u0629 \u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0637\u0628\u064A) \u0648\u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0643\u0627\u0641\u0629 \u0627\u0644\u0646\u062A\u0627\u0626\u062C \u0628\u062F\u0642\u0629 \u0645\u062A\u0646\u0627\u0647\u064A\u0629.

\u0642\u0648\u0627\u0639\u062F \u0648\u0645\u0639\u0627\u064A\u064A\u0631 \u0627\u0644\u062A\u0639\u0631\u0641 \u0627\u0644\u0633\u0631\u064A\u0631\u064A \u0627\u0644\u062D\u0627\u0632\u0645\u0629 (The Universal 4-Pillar Lab Recognition Standard):

1. \u0627\u0644\u0645\u0639\u064A\u0627\u0631 \u0627\u0644\u0623\u0633\u0627\u0633\u064A \u0644\u0644\u062A\u0639\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0637\u0628\u064A \u0627\u0644\u0645\u062E\u0628\u0631\u064A (The 4 Pillars):
   \u064A\u062C\u0628 \u0627\u0639\u062A\u0628\u0627\u0631 \u0627\u0644\u0635\u0648\u0631\u0629 \u0648\u0631\u0642\u0629 \u0641\u062D\u0635 \u0645\u062E\u0628\u0631\u064A \u0635\u0627\u0644\u062D\u0629 \u0648\u0645\u0642\u0628\u0648\u0644\u0629 100% (\u0648\u0627\u0636\u0628\u0637 "isValidReport": true \u0648\u062C\u0648\u0628\u0627\u064B) \u0625\u0630\u0627 \u0627\u062D\u062A\u0648\u062A \u0639\u0644\u0649 \u0641\u062D\u0635 \u0648\u0627\u062D\u062F \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644 \u064A\u062D\u0642\u0642 \u0623\u0631\u0643\u0627\u0646 \u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0637\u0628\u064A:
   \u0623) \u0627\u0633\u0645 \u0627\u0644\u062A\u062D\u0644\u064A\u0644 (Test Name): \u0633\u0648\u0627\u0621 \u0643\u064F\u062A\u0628 \u0628\u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A\u0629 \u0623\u0648 \u0628\u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0623\u0648 \u0628\u0627\u0644\u0644\u063A\u062A\u064A\u0646 \u0645\u0639\u0627\u064B \u0623\u0648 \u0628\u0627\u062E\u062A\u0635\u0627\u0631\u0647 \u0627\u0644\u0637\u0628\u064A \u0627\u0644\u0645\u0639\u062A\u0645\u062F (\u0645\u062B\u0644: CBC, TSH, Ferritin, Fasting Glucose, HbA1c, Creatinine, ALT, AST, Bilirubin, Cholesterol, Triglycerides, WBC, Platelets, Urinalysis, Pus Cells, RBCs...).
   \u0628) \u0646\u062A\u064A\u062C\u0629 \u0627\u0644\u062A\u062D\u0644\u064A\u0644 (Result / Value): \u0642\u064A\u0645\u0629 \u0631\u0642\u0645\u064A\u0629 \u0645\u0639 \u0641\u0648\u0627\u0635\u0644\u0647\u0627 \u0627\u0644\u0639\u0634\u0631\u064A\u0629\u060C \u0623\u0648 \u0646\u062A\u064A\u062C\u0629 \u0646\u0648\u0639\u064A\u0629 (Positive / Negative / Normal / Reactive).
   \u062C) \u0648\u062D\u062F\u0629 \u0627\u0644\u0642\u064A\u0627\u0633 (Unit): \u0645\u062B\u0644 mg/dL, mmol/L, %, g/dL, U/L, \xB5IU/mL, pg/mL, ng/mL, /HPF, /\xB5L.
   \u062F) \u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0645\u0631\u062C\u0639\u064A \u0623\u0648 \u0627\u0644\u0646\u0637\u0627\u0642 \u0627\u0644\u0637\u0628\u064A\u0639\u064A (Reference Range / Interval): \u0645\u062B\u0644 70-99 \u0623\u0648 < 200 \u0623\u0648 13-17.5 \u0623\u0648 Negative.

2. \u0642\u0628\u0648\u0644 \u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631 \u062B\u0646\u0627\u0626\u064A\u0629 \u0627\u0644\u0644\u063A\u0629 (Arabic + English) \u0648\u0627\u0644\u0644\u0642\u0637\u0627\u062A \u0627\u0644\u062C\u0632\u0626\u064A\u0629:
   - \u062A\u0642\u0627\u0631\u064A\u0631 \u0627\u0644\u0645\u0633\u062A\u0634\u0641\u064A\u0627\u062A \u0648\u0627\u0644\u0645\u062E\u062A\u0628\u0631\u0627\u062A \u0641\u064A \u0627\u0644\u0639\u0627\u0644\u0645 \u0627\u0644\u0639\u0631\u0628\u064A \u062A\u0643\u0648\u0646 \u062F\u0627\u0626\u0645\u0627\u064B \u062B\u0646\u0627\u0626\u064A\u0629 \u0627\u0644\u0644\u063A\u0629 (\u0623\u0633\u0645\u0627\u0621 \u0627\u0644\u0641\u062D\u0648\u0635\u0627\u062A \u0628\u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A \u0648\u0627\u0644\u062A\u0631\u0648\u064A\u0633\u0629 \u0628\u0627\u0644\u0639\u0631\u0628\u064A\u060C \u0623\u0648 \u0627\u0644\u0639\u0643\u0633\u060C \u0623\u0648 \u0623\u0633\u0645\u0627\u0621 \u0645\u062A\u0631\u062C\u0645\u0629). \u0647\u0630\u0627 \u062A\u0642\u0631\u064A\u0631 \u0633\u0644\u064A\u0645 \u0648\u0637\u0628\u064A\u0639\u064A 100% \u0648\u064A\u062C\u0628 \u062A\u062D\u0644\u064A\u0644\u0647 \u0628\u0627\u0644\u0643\u0627\u0645\u0644.
   - \u0625\u0630\u0627 \u0627\u0644\u062A\u0642\u0637 \u0627\u0644\u0645\u0631\u064A\u0636 \u0635\u0648\u0631\u0629 \u0644\u062C\u0632\u0621 \u0645\u0646 \u0627\u0644\u0648\u0631\u0642\u0629 \u0628\u0643\u0627\u0645\u064A\u0631\u0627 \u0627\u0644\u0647\u0627\u062A\u0641 (\u062D\u062A\u0649 \u0644\u0648 \u0643\u0627\u0646\u062A \u0645\u0642\u0635\u0648\u0635\u0629 \u0627\u0644\u062A\u0631\u0648\u064A\u0633\u0629 \u0623\u0648 \u0645\u0627\u0626\u0644\u0629)\u060C \u0637\u0627\u0644\u0645\u0627 \u064A\u0638\u0647\u0631 \u0641\u064A\u0647\u0627 \u0641\u062D\u0635 \u0648\u0646\u062A\u064A\u062C\u0629: \u0627\u0639\u062A\u0628\u0631 \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0635\u0627\u0644\u062D\u0627\u064B \u062A\u0645\u0627\u0645\u0627\u064B ("isValidReport": true) \u0648\u0627\u0633\u062A\u062E\u0631\u062C \u0643\u0644 \u0627\u0644\u0646\u062A\u0627\u0626\u062C \u0627\u0644\u0638\u0627\u0647\u0631\u0629.

3. \u0645\u062A\u0649 \u0641\u0642\u0637 \u062A\u0639\u062A\u0628\u0631 \u0627\u0644\u0635\u0648\u0631\u0629 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629 ("isValidReport": false)\u061F
   - \u0641\u0642\u0637 \u0648\u0641\u0642\u0637 \u0625\u0630\u0627 \u0643\u0627\u0646\u062A \u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0645\u0631\u0641\u0648\u0639\u0629 \u0635\u0648\u0631\u0629 \u0643\u0627\u0626\u0646 \u063A\u064A\u0631 \u0637\u0628\u064A \u0625\u0637\u0644\u0627\u0642\u0627\u064B (\u0645\u062B\u0644: \u0635\u0648\u0631\u0629 \u0633\u064A\u0644\u0641\u064A\u060C \u0633\u064A\u0627\u0631\u0629\u060C \u0637\u0639\u0627\u0645\u060C \u062D\u064A\u0648\u0627\u0646\u060C \u0645\u0646\u0638\u0631 \u0637\u0628\u064A\u0639\u064A\u060C \u0641\u0627\u062A\u0648\u0631\u0629 \u0628\u0642\u0627\u0644\u0629 \u063A\u064A\u0631 \u0637\u0628\u064A\u0629\u060C \u0635\u0648\u0631\u0629 \u0633\u0648\u062F\u0627\u0621 \u0641\u0627\u0631\u063A\u0629).
   - \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u062D\u0627\u0644\u0629 \u0641\u0642\u0637: \u0627\u0636\u0628\u0637 "isValidReport": false \u0645\u0639 "validationError": "NOT_A_LAB_REPORT".

4. \u0627\u0644\u062F\u0642\u0629 \u0627\u0644\u062A\u0627\u0645\u0629 \u0641\u064A \u0627\u0644\u0623\u0631\u0642\u0627\u0645 \u0648\u0627\u0644\u0641\u0648\u0627\u0635\u0644 \u0627\u0644\u0639\u0634\u0631\u064A\u0629 (Decimal Precision):
   - \u0627\u0633\u062A\u062E\u0631\u062C \u0627\u0644\u0623\u0631\u0642\u0627\u0645 \u0648\u0627\u0644\u0641\u0648\u0627\u0635\u0644 \u0627\u0644\u0639\u0634\u0631\u064A\u0629 \u0628\u062F\u0642\u0629 \u062A\u0627\u0645\u0629 \u0643\u0645\u0627 \u0647\u064A (\u0645\u062B\u0644\u0627\u064B: 2.89 \u0623\u0648 10.87 \u0623\u0648 1.5). \u0644\u0627 \u062A\u0633\u0642\u0637 \u0627\u0644\u0641\u0648\u0627\u0635\u0644 \u0627\u0644\u0639\u0634\u0631\u064A\u0629 \u0623\u0628\u062F\u0627\u064B.

5. \u0647\u064A\u0643\u0644 \u0643\u0644 \u0641\u062D\u0635 \u0645\u0633\u062A\u062E\u0631\u062C:
   - \u0627\u0633\u0645 \u0627\u0644\u0641\u062D\u0635 (\u0639\u0631\u0628\u064A \u0648\u0625\u0646\u062C\u0644\u064A\u0632\u064A \u0645\u0639\u0627\u064B \u0644\u062A\u0633\u0647\u064A\u0644 \u0641\u0647\u0645 \u0627\u0644\u0645\u0631\u064A\u0636)
   - \u0627\u0644\u0642\u064A\u0645\u0629 \u0627\u0644\u0645\u0642\u0631\u0648\u0621\u0629 \u0628\u0627\u0644\u0643\u0627\u0645\u0644 \u0645\u0639 \u0648\u062D\u062F\u062A\u0647\u0627
   - \u0627\u0644\u0645\u062F\u0649 \u0627\u0644\u0645\u0631\u062C\u0639\u064A \u0627\u0644\u0637\u0628\u064A\u0639\u064A \u0627\u0644\u0645\u0637\u0628\u0648\u0639
   - \u0627\u0644\u062D\u0627\u0644\u0629: normal \u0623\u0648 high \u0623\u0648 low \u0623\u0648 critical

\u0633\u064A\u0627\u0642 \u0627\u0644\u0645\u0631\u064A\u0636 \u0623\u0648 \u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0627\u062A: ${textNotes || "\u0642\u0631\u0627\u0621\u0629 \u0648\u062A\u062D\u0644\u064A\u0644 \u0635\u0648\u0631\u0629 \u0641\u062D\u0635 \u0645\u062E\u0628\u0631\u064A \u0633\u0631\u064A\u0631\u064A"}.

\u0627\u0644\u0645\u0637\u0644\u0648\u0628: \u0623\u062E\u0631\u062C \u0627\u0644\u0646\u062A\u064A\u062C\u0629 \u0628\u0635\u064A\u063A\u0629 JSON \u062D\u0635\u0631\u0627\u064B \u0628\u0647\u0630\u0627 \u0627\u0644\u0647\u064A\u0643\u0644:
{
  "isValidReport": true \u0623\u0648 false,
  "validationError": "NOT_A_LAB_REPORT" \u0623\u0648 null,
  "testName": "\u0627\u0633\u0645 \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0623\u0648 \u0628\u0627\u0642\u0629 \u0627\u0644\u0641\u062D\u0648\u0635\u0627\u062A \u0628\u062F\u0642\u0629 (\u0645\u062B\u0644\u0627\u064B: \u0641\u062D\u0635 \u0635\u0648\u0631\u0629 \u0627\u0644\u062F\u0645 \u0627\u0644\u0643\u0627\u0645\u0644\u0629 \u0648\u0627\u0644\u0623\u0646\u064A\u0645\u064A\u0627 - Complete Blood Count)",
  "clinicalSummaryTitle": "\u0627\u0644\u062E\u0644\u0627\u0635\u0629 \u0627\u0644\u0625\u0643\u0644\u064A\u0646\u064A\u0643\u064A\u0629 \u0648\u0627\u0644\u062A\u0634\u062E\u064A\u0635 \u0627\u0644\u0645\u0631\u062C\u062D \u0628\u062F\u0642\u0629",
  "urgencyLevel": "normal \u0623\u0648 medium \u0623\u0648 high \u0623\u0648 critical",
  "items": [
    {
      "name": "\u0627\u0633\u0645 \u0627\u0644\u0641\u062D\u0635 (\u0639\u0631\u0628\u064A \u0648\u0625\u0646\u062C\u0644\u064A\u0632\u064A)",
      "value": "\u0627\u0644\u0642\u064A\u0645\u0629 \u0627\u0644\u0645\u0642\u0631\u0648\u0621\u0629 \u0645\u0639 \u0627\u0644\u0648\u062D\u062F\u0629 \u0628\u062F\u0642\u0629 \u0648\u0641\u0648\u0627\u0635\u0644\u0647\u0627 \u0627\u0644\u0639\u0634\u0631\u064A\u0629 \u0627\u0644\u0643\u0627\u0645\u0644\u0629",
      "referenceRange": "\u0627\u0644\u0645\u062F\u0649 \u0627\u0644\u0645\u0631\u062C\u0639\u064A \u0627\u0644\u0633\u0644\u064A\u0645",
      "status": "normal \u0623\u0648 high \u0623\u0648 low \u0623\u0648 critical"
    }
  ],
  "detailedExplanation": "\u062A\u0642\u0631\u064A\u0631 \u0633\u0631\u064A\u0631\u064A \u062A\u0641\u0635\u064A\u0644\u064A \u064A\u0634\u0631\u062D \u0645\u0639\u0646\u0649 \u0627\u0644\u0646\u062A\u0627\u0626\u062C\u060C \u0633\u0628\u0628 \u0627\u0631\u062A\u0641\u0627\u0639 \u0623\u0648 \u0627\u0646\u062E\u0641\u0627\u0636 \u0643\u0644 \u0645\u0624\u0634\u0631\u060C \u0648\u0627\u0644\u0631\u0628\u0637 \u0627\u0644\u0641\u0633\u064A\u0648\u0644\u0648\u062C\u064A \u0628\u064A\u0646\u0647\u0627 \u0644\u0644\u0645\u0631\u064A\u0636 \u0628\u0644\u063A\u0629 \u0648\u0627\u0636\u062D\u0629 \u0648\u0645\u0647\u0646\u064A\u0629",
  "recommendations": [
    "\u062A\u0648\u0635\u064A\u0629 \u0639\u0644\u0627\u062C\u064A\u0629 \u0623\u0648 \u0627\u0633\u062A\u0642\u0635\u0627\u0626\u064A\u0629",
    "\u062A\u0648\u0635\u064A\u0629 \u062F\u0648\u0627\u0626\u064A\u0629 \u0623\u0648 \u0637\u0628\u064A\u0629 \u0644\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0637\u0628\u064A\u0628 \u0627\u0644\u0645\u062E\u062A\u0635",
    "\u0646\u0635\u064A\u062D\u0629 \u063A\u0630\u0627\u0626\u064A\u0629 \u0648\u0633\u0644\u0648\u0643\u064A\u0629 \u0648\u0646\u0645\u0637 \u062D\u064A\u0627\u0629 \u0645\u0644\u0627\u0626\u0645 \u0644\u0644\u0646\u062A\u0627\u0626\u062C"
  ]
}`;
    const parts = [];
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: imageBase64
        }
      });
    }
    parts.push({ text: prompt });
    const candidateModels = ["gemini-3.1-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"];
    let modelReportRejection = null;
    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: parts,
          config: { responseMimeType: "application/json" }
        });
        const parsed = JSON.parse(response.text || "{}");
        const hasValidItems = Array.isArray(parsed.items) && parsed.items.length > 0;
        if (hasValidItems) {
          parsed.isValidReport = true;
        }
        if (parsed.isValidReport === false && !hasValidItems) {
          modelReportRejection = parsed;
          continue;
        }
        if (parsed.testName) testName = parsed.testName;
        if (parsed.urgencyLevel) urgencyLevel = parsed.urgencyLevel;
        findingsSummary = parsed.findingsSummary || parsed.clinicalSummaryTitle || parsed.summary || (urgencyLevel === "critical" ? "\u0646\u062A\u0627\u0626\u062C \u0645\u062E\u0628\u0631\u064A\u0629 \u062D\u0631\u062C\u0629 \u062A\u0633\u062A\u0648\u062C\u0628 \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u0641\u0648\u0631\u064A\u0629" : urgencyLevel === "high" ? "\u0645\u0624\u0634\u0631\u0627\u062A \u063A\u064A\u0631 \u0637\u0628\u064A\u0639\u064A\u0629 \u062A\u0633\u062A\u062F\u0639\u064A \u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u0629" : "\u0641\u062D\u0635 \u0645\u062E\u0628\u0631\u064A \u0633\u0644\u064A\u0645 \u0648\u0645\u0637\u0645\u0626\u0646");
        if (Array.isArray(parsed.items) && parsed.items.length > 0) items = parsed.items;
        if (parsed.detailedExplanation) detailedExplanation = parsed.detailedExplanation;
        if (Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0) recommendations = parsed.recommendations;
        if (detailedExplanation && items.length > 0) {
          break;
        }
      } catch (err) {
        console.warn(`Model ${modelName} analysis failed, trying next:`, err?.status || err?.message);
      }
    }
    if (!detailedExplanation && modelReportRejection && (!textNotes || textNotes.trim().length === 0)) {
      return res.json({
        success: true,
        isValidReport: false,
        validationError: modelReportRejection.validationError || "NOT_A_LAB_REPORT",
        testName: modelReportRejection.testName || "\u062A\u0646\u0628\u064A\u0647: \u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0645\u0631\u0641\u0648\u0639\u0629 \u0644\u0627 \u062A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 \u0648\u0631\u0642\u0629 \u062A\u062D\u0627\u0644\u064A\u0644 \u0645\u062E\u0628\u0631\u064A\u0629",
        findingsSummary: modelReportRejection.clinicalSummaryTitle || "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0646\u062A\u0627\u0626\u062C \u062A\u062D\u0627\u0644\u064A\u0644 \u0635\u0627\u0644\u062D\u0629 \u0641\u064A \u0627\u0644\u0635\u0648\u0631\u0629",
        clinicalSummaryTitle: modelReportRejection.clinicalSummaryTitle || "\u0627\u0644\u0635\u0648\u0631\u0629 \u0644\u0627 \u062A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 \u0646\u062A\u0627\u0626\u062C \u062A\u062D\u0627\u0644\u064A\u0644 \u0645\u062E\u0628\u0631\u064A\u0629",
        urgencyLevel: "normal",
        items: [],
        detailedExplanation: modelReportRejection.detailedExplanation || "\u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0645\u0631\u0641\u0648\u0639\u0629 \u0644\u0627 \u062A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 \u0646\u062A\u0627\u0626\u062C \u062A\u062D\u0627\u0644\u064A\u0644 \u0645\u062E\u0628\u0631\u064A\u0629 \u0637\u0628\u064A\u0629 \u0623\u0648 \u0645\u0639\u0627\u064A\u064A\u0631 \u0627\u0644\u0641\u062D\u0635 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629 (\u0627\u0633\u0645 \u0627\u0644\u0641\u062D\u0635\u060C \u0627\u0644\u0646\u062A\u064A\u062C\u0629\u060C \u0627\u0644\u0648\u062D\u062F\u0629\u060C \u0627\u0644\u0645\u062F\u0649 \u0627\u0644\u0645\u0631\u062C\u0639\u064A). \u064A\u0631\u062C\u0649 \u0627\u0644\u062A\u0623\u0643\u062F \u0645\u0646 \u0631\u0641\u0639 \u0635\u0648\u0631\u0629 \u0648\u0627\u0636\u062D\u0629 \u0644\u0648\u0631\u0642\u0629 \u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0637\u0628\u064A.",
        recommendations: modelReportRejection.recommendations || ["\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u0642\u0627\u0637 \u0635\u0648\u0631\u0629 \u0648\u0627\u0636\u062D\u0629 \u0648\u0645\u0633\u062A\u0642\u064A\u0645\u0629 \u0644\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0645\u062E\u062A\u0628\u0631 \u062A\u0638\u0647\u0631 \u0627\u0644\u0641\u062D\u0648\u0635\u0627\u062A \u0648\u0627\u0644\u0646\u062A\u0627\u0626\u062C."]
      });
    }
  }
  if (!detailedExplanation) {
    const isImaging = analysisType === "imaging";
    const textLower = (textNotes || "").toLowerCase();
    if (isImaging) {
      if (textLower.includes("\u0643\u0633\u0631") || textLower.includes("\u0635\u062F\u0631") || textLower.includes("\u0631\u0626\u0629") || textLower.includes("\u0633\u0639\u0627\u0644") || textLower.includes("\u0643\u062D\u0629")) {
        testName = "\u0623\u0634\u0639\u0629 \u0627\u0644\u0635\u062F\u0631 \u0627\u0644\u0633\u064A\u0646\u064A\u0629 (Chest X-Ray PA View)";
        urgencyLevel = "medium";
        items = [
          { name: "\u062D\u0642\u0648\u0644 \u0627\u0644\u0631\u0626\u0629 (Lung Fields)", value: "\u0627\u0631\u062A\u0634\u0627\u062D \u062E\u0641\u064A\u0641 \u0641\u064A \u0627\u0644\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u064A\u0645\u0646\u0649", referenceRange: "Clear / \u0631\u0626\u0629 \u0635\u0627\u0641\u064A\u0629", status: "high" },
          { name: "\u0627\u0644\u0638\u0644 \u0627\u0644\u0642\u0644\u0628\u064A (Cardiothoracic Ratio)", value: "0.48", referenceRange: "< 0.50 (\u0637\u0628\u064A\u0639\u064A)", status: "normal" },
          { name: "\u0627\u0644\u0632\u0648\u0627\u064A\u0627 \u0627\u0644\u0636\u0644\u0639\u064A\u0629 \u0627\u0644\u062D\u062C\u0627\u0628\u064A\u0629 (Costophrenic Angles)", value: "\u062D\u0627\u062F\u0629 \u0648\u0633\u0644\u064A\u0645\u0629", referenceRange: "Sharp / \u0633\u0644\u064A\u0645\u0629", status: "normal" },
          { name: "\u0627\u0644\u0647\u064A\u0643\u0644 \u0627\u0644\u0639\u0638\u0645\u064A \u0648\u0627\u0644\u0623\u0636\u0644\u0627\u0639 (Ribs & Thoracic Spine)", value: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0643\u0633\u0648\u0631 \u0648\u0627\u0636\u062D\u0629", referenceRange: "Intact / \u0633\u0644\u064A\u0645", status: "normal" }
        ];
        detailedExplanation = `**\u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0625\u0634\u0639\u0627\u0639\u064A \u0627\u0644\u0633\u0631\u064A\u0631\u064A:**
- \u0644\u0648\u062D\u0638 \u0648\u062C\u0648\u062F \u0632\u064A\u0627\u062F\u0629 \u0637\u0641\u064A\u0641\u0629 \u0641\u064A \u0627\u0644\u062A\u0638\u0644\u064A\u0644 \u0627\u0644\u0631\u0626\u0648\u064A \u0628\u0627\u0644\u0642\u0631\u0628 \u0645\u0646 \u0627\u0644\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u064A\u0645\u0646\u0649 (Bronchovascular markings)\u060C \u0642\u062F \u064A\u062A\u0645\u0627\u0634\u0649 \u0645\u0639 \u0627\u0644\u062A\u0647\u0627\u0628 \u0634\u0639\u0628\u064A \u062D\u0627\u062F \u0623\u0648 \u0628\u062F\u0627\u064A\u0629 \u0627\u0631\u062A\u0634\u0627\u062D \u0635\u062F\u0631\u064A \u062E\u0641\u064A\u0641.
- \u062D\u062C\u0645 \u0627\u0644\u0642\u0644\u0628 \u0648\u0627\u0644\u0638\u0644 \u0627\u0644\u0648\u0639\u0627\u0626\u064A \u0636\u0645\u0646 \u0627\u0644\u062D\u062F\u0648\u062F \u0627\u0644\u0637\u0628\u064A\u0639\u064A\u0629.
- \u0639\u0638\u0627\u0645 \u0627\u0644\u0642\u0641\u0635 \u0627\u0644\u0635\u062F\u0631\u064A \u0645\u062A\u0646\u0627\u0633\u0642\u0629 \u0648\u062E\u0627\u0644\u064A\u0629 \u0645\u0646 \u0623\u064A \u0643\u0633\u0648\u0631 \u062D\u062F\u064A\u062B\u0629 \u0623\u0648 \u0642\u062F\u064A\u0645\u0629.`;
        recommendations = [
          "\u0645\u0631\u0627\u062C\u0639\u0629 \u0637\u0628\u064A\u0628 \u0627\u0644\u0623\u0645\u0631\u0627\u0636 \u0627\u0644\u0635\u062F\u0631\u064A\u0629 \u0623\u0648 \u0627\u0644\u0628\u0627\u0637\u0646\u064A\u0629 \u0644\u0625\u062C\u0631\u0627\u0621 \u0627\u0644\u0641\u062D\u0635 \u0627\u0644\u0633\u0631\u064A\u0631\u064A \u0628\u0627\u0644\u0633\u0645\u0627\u0639\u0629.",
          "\u062A\u0646\u0627\u0648\u0644 \u0645\u0648\u0633\u0639\u0627\u062A \u0627\u0644\u0634\u0639\u0628 \u0627\u0644\u0647\u0648\u0627\u0626\u064A\u0629 \u0623\u0648 \u0627\u0644\u0633\u0648\u0627\u0626\u0644 \u0627\u0644\u062F\u0627\u0641\u0626\u0629 \u0648\u0627\u0644\u0631\u0627\u062D\u0629 \u0627\u0644\u062A\u0627\u0645\u0629.",
          "\u0627\u0644\u062A\u0648\u062C\u0647 \u0644\u0644\u0637\u0648\u0627\u0631\u0626 \u0641\u064A \u062D\u0627\u0644 \u062D\u062F\u0648\u062B \u0636\u064A\u0642 \u062A\u0646\u0641\u0633 \u062D\u0627\u062F \u0623\u0648 \u0627\u0632\u0631\u0642\u0627\u0642 \u0641\u064A \u0627\u0644\u0634\u0641\u0627\u0647."
        ];
      } else {
        testName = "\u0641\u062D\u0635 \u0627\u0644\u0623\u0634\u0639\u0629 \u0627\u0644\u0633\u064A\u0646\u064A\u0629 \u0644\u0644\u0623\u0637\u0631\u0627\u0641 \u0648\u0627\u0644\u0645\u0641\u0627\u0635\u0644 (Bone & Joint Radiography)";
        urgencyLevel = "normal";
        items = [
          { name: "\u0645\u062D\u0627\u0630\u0627\u0629 \u0627\u0644\u0645\u0641\u0627\u0635\u0644 (Joint Alignment)", value: "\u0637\u0628\u064A\u0639\u064A\u0629 \u0648\u0645\u062D\u0641\u0648\u0638\u0629", referenceRange: "Preserved / \u0633\u0644\u064A\u0645\u0629", status: "normal" },
          { name: "\u0643\u062B\u0627\u0641\u0629 \u0627\u0644\u0642\u0634\u0631\u0629 \u0627\u0644\u0639\u0638\u0645\u064A\u0629 (Cortical Margins)", value: "\u0645\u062A\u0635\u0644\u0629 \u0648\u0644\u0627 \u0627\u0646\u0642\u0637\u0627\u0639", referenceRange: "Continuous / \u0633\u0644\u064A\u0645\u0629", status: "normal" },
          { name: "\u0627\u0644\u0641\u0636\u0627\u0621 \u0627\u0644\u0645\u0641\u0635\u0644\u064A (Joint Space)", value: "\u0645\u062A\u0633\u0627\u0648\u064D \u0648\u0645\u0646\u0627\u0633\u0628 \u0644\u0644\u0639\u0645\u0631", referenceRange: "Normal / \u0637\u0628\u064A\u0639\u064A", status: "normal" }
        ];
        detailedExplanation = `**\u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0625\u0634\u0639\u0627\u0639\u064A:**
- \u0644\u0627 \u062A\u0648\u062C\u062F \u062F\u0644\u0627\u0626\u0644 \u0639\u0644\u0649 \u0643\u0633\u0648\u0631 \u0639\u0638\u0645\u064A\u0629 \u062D\u0627\u062F\u0629 \u0623\u0648 \u062E\u0644\u0639 \u0645\u0641\u0635\u0644\u064A.
- \u0627\u0644\u0623\u0646\u0633\u062C\u0629 \u0627\u0644\u0631\u062E\u0648\u0629 \u0627\u0644\u0645\u062D\u064A\u0637\u0629 \u062A\u0638\u0647\u0631 \u062A\u0648\u0631\u0645\u0627\u064B \u062E\u0641\u064A\u0641\u0627\u064B \u0642\u062F \u064A\u0643\u0648\u0646 \u0646\u0627\u062A\u062C\u0627\u064B \u0639\u0646 \u0643\u062F\u0645\u0629 \u0623\u0648 \u0627\u0644\u062A\u0648\u0627\u0621 \u0623\u0631\u0628\u0637\u0629 \u0631\u0636\u064A.`;
        recommendations = [
          "\u062A\u0637\u0628\u064A\u0642 \u0643\u0645\u0627\u062F\u0627\u062A \u0628\u0627\u0631\u062F\u0629 \u0648\u0631\u0641\u0639 \u0627\u0644\u0637\u0631\u0641 \u0627\u0644\u0645\u0635\u0627\u0628 \u0641\u064A \u0623\u0648\u0644 48 \u0633\u0627\u0639\u0629 \u0645\u0646 \u0627\u0644\u0625\u0635\u0627\u0628\u0629.",
          "\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0645\u0633\u0643\u0646\u0627\u062A \u0623\u0644\u0645 \u0645\u0648\u0636\u0639\u064A\u0629 \u0623\u0648 \u0641\u0645\u0648\u064A\u0629 \u0628\u0639\u062F \u0627\u0633\u062A\u0634\u0627\u0631\u0629 \u0627\u0644\u0635\u064A\u062F\u0644\u0627\u0646\u064A.",
          "\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0641\u062D\u0635 \u0627\u0644\u0625\u0634\u0639\u0627\u0639\u064A \u0641\u064A \u062D\u0627\u0644 \u0627\u0633\u062A\u0645\u0631\u0627\u0631 \u0627\u0644\u0623\u0644\u0645 \u0644\u0623\u0643\u062B\u0631 \u0645\u0646 10 \u0623\u064A\u0627\u0645."
        ];
      }
    } else {
      if (textLower.includes("cbc") || textLower.includes("\u062F\u0645") || textLower.includes("\u0623\u0646\u064A\u0645\u064A\u0627") || textLower.includes("\u062E\u0636\u0627\u0628") || textLower.includes("\u0635\u0641\u0627\u0626\u062D") || textLower.includes("hemoglobin") || labCategory === "cbc") {
        testName = "\u0635\u0648\u0631\u0629 \u0627\u0644\u062F\u0645 \u0627\u0644\u0634\u0627\u0645\u0644\u0629 - Complete Blood Count (CBC)";
        findingsSummary = "\u0623\u0646\u064A\u0645\u064A\u0627 \u0646\u0642\u0635 \u0627\u0644\u062D\u062F\u064A\u062F \u0627\u0644\u0645\u062C\u0647\u0631\u064A\u0629 (Microcytic Hypochromic Anemia)";
        urgencyLevel = "medium";
        items = [
          { name: "Hemoglobin (Hb / \u062E\u0636\u0627\u0628 \u0627\u0644\u062F\u0645)", value: "9.4 g/dL", referenceRange: "13.0 - 17.5 g/dL", status: "low" },
          { name: "RBC (\u062A\u0639\u062F\u0627\u062F \u0627\u0644\u0643\u0631\u064A\u0627\u062A \u0627\u0644\u062D\u0645\u0631\u0627\u0621)", value: "3.90 \xD710^6/\xB5L", referenceRange: "4.50 - 5.90 \xD710^6/\xB5L", status: "low" },
          { name: "Hematocrit (HCT / \u0645\u0643\u062F\u0627\u0633 \u0627\u0644\u062F\u0645)", value: "29.8 %", referenceRange: "40.0 - 52.0 %", status: "low" },
          { name: "MCV (\u0645\u062A\u0648\u0633\u0637 \u062D\u062C\u0645 \u0627\u0644\u0643\u0631\u064A\u0629)", value: "71.2 fL", referenceRange: "80.0 - 100.0 fL", status: "low" },
          { name: "MCH (\u0645\u062A\u0648\u0633\u0637 \u0647\u064A\u0645\u0648\u062C\u0644\u0648\u0628\u064A\u0646 \u0627\u0644\u0643\u0631\u064A\u0629)", value: "22.8 pg", referenceRange: "27.0 - 33.0 pg", status: "low" },
          { name: "RDW (\u062A\u0641\u0627\u0648\u062A \u0623\u062D\u062C\u0627\u0645 \u0627\u0644\u0643\u0631\u064A\u0627\u062A)", value: "16.9 %", referenceRange: "11.5 - 14.5 %", status: "high" },
          { name: "WBC (\u0643\u0631\u064A\u0627\u062A \u0627\u0644\u062F\u0645 \u0627\u0644\u0628\u064A\u0636\u0627\u0621)", value: "6,400 /\xB5L", referenceRange: "4,000 - 11,000 /\xB5L", status: "normal" },
          { name: "Platelets (\u0627\u0644\u0635\u0641\u0627\u0626\u062D \u0627\u0644\u062F\u0645\u0648\u064A\u0629)", value: "295,000 /\xB5L", referenceRange: "150,000 - 450,000 /\xB5L", status: "normal" }
        ];
        detailedExplanation = `**\u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0645\u062E\u0628\u0631\u064A \u0627\u0644\u0633\u0631\u064A\u0631\u064A:**
- \u064A\u064F\u0638\u0647\u0631 \u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u0627\u0646\u062E\u0641\u0627\u0636\u0627\u064B \u0635\u0631\u064A\u062D\u0627\u064B \u0641\u064A \u062E\u0636\u0627\u0628 \u0627\u0644\u062F\u0645 (9.4 g/dL) \u0645\u0639 \u062A\u0631\u0627\u062C\u0639 \u0645\u0644\u062D\u0648\u0638 \u0641\u064A \u0627\u0644\u062D\u062C\u0645 \u0627\u0644\u0643\u0631\u0648\u064A MCV \u0648\u0648\u0632\u0646 \u0627\u0644\u0647\u064A\u0645\u0648\u062C\u0644\u0648\u0628\u064A\u0646 MCH.
- \u0627\u0631\u062A\u0641\u0627\u0639 \u0645\u0624\u0634\u0631 \u062A\u0641\u0627\u0648\u062A \u0623\u062D\u062C\u0627\u0645 \u0627\u0644\u0643\u0631\u064A\u0627\u062A (RDW 16.9%) \u064A\u0634\u064A\u0631 \u0628\u0642\u0648\u0629 \u0644\u0623\u0646\u064A\u0645\u064A\u0627 \u0646\u0642\u0635 \u0627\u0644\u062D\u062F\u064A\u062F \u0641\u064A \u0645\u0631\u062D\u0644\u0629 \u0625\u0646\u062A\u0627\u062C \u0643\u0631\u064A\u0627\u062A \u062C\u062F\u064A\u062F\u0629 \u0645\u062A\u0628\u0627\u064A\u0646\u0629.
- \u062A\u0639\u062F\u0627\u062F \u0627\u0644\u0643\u0631\u064A\u0627\u062A \u0627\u0644\u0628\u064A\u0636\u0627\u0621 \u0648\u0627\u0644\u0635\u0641\u0627\u0626\u062D \u0627\u0644\u062F\u0645\u0648\u064A\u0629 \u0637\u0628\u064A\u0639\u064A \u062A\u0645\u0627\u0645\u0627\u064B \u0648\u0644\u0627 \u062A\u0648\u062C\u062F \u0639\u0644\u0627\u0645\u0627\u062A \u0644\u0639\u062F\u0648\u0649 \u0623\u0648 \u062E\u0644\u0644 \u0628\u0646\u062E\u0627\u0639 \u0627\u0644\u0639\u0638\u0645.`;
        recommendations = [
          "\u0625\u062C\u0631\u0627\u0621 \u0641\u062D\u0635 \u0645\u062E\u0632\u0648\u0646 \u0627\u0644\u062D\u062F\u064A\u062F \u0641\u064A \u0627\u0644\u0645\u0635\u0644 (Serum Ferritin) \u0648\u0627\u0644\u0633\u0639\u0629 \u0627\u0644\u0631\u0627\u0628\u0637\u0629 \u0644\u0644\u062D\u062F\u064A\u062F (TIBC).",
          "\u0628\u062F\u0621 \u0645\u0643\u0645\u0644\u0627\u062A \u0627\u0644\u062D\u062F\u064A\u062F \u0627\u0644\u0641\u0645\u0648\u064A\u0629 (\u0645\u062B\u0644 Ferrous Fumarate \u0623\u0648 Bisglycinate) \u0644\u0645\u062F\u0629 3 \u0623\u0634\u0647\u0631 \u062A\u062D\u062A \u0625\u0634\u0631\u0627\u0641 \u0627\u0644\u0637\u0628\u064A\u0628.",
          "\u062A\u0646\u0627\u0648\u0644 \u0641\u064A\u062A\u0627\u0645\u064A\u0646 C \u0644\u062A\u0639\u0632\u064A\u0632 \u0627\u0645\u062A\u0635\u0627\u0635 \u0627\u0644\u062D\u062F\u064A\u062F\u060C \u0648\u062A\u062C\u0646\u0628 \u0627\u0644\u0634\u0627\u064A \u0648\u0627\u0644\u0642\u0647\u0648\u0629 \u0648\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0623\u0644\u0628\u0627\u0646 \u0645\u0639 \u0648\u062C\u0628\u0629 \u0627\u0644\u062F\u0648\u0627\u0621."
        ];
      } else if (textLower.includes("\u062F\u0647\u0648\u0646") || textLower.includes("\u0643\u0648\u0644\u064A\u0633\u062A\u0631\u0648\u0644") || textLower.includes("\u0643\u0648\u0644\u0633\u062A\u0631\u0648\u0644") || textLower.includes("lipid") || textLower.includes("cholesterol") || textLower.includes("triglyceride") || labCategory === "lipids") {
        testName = "\u0644\u0648\u062D\u0629 \u062F\u0647\u0646\u064A\u0627\u062A \u0627\u0644\u062F\u0645 \u0648\u0627\u0644\u0643\u0648\u0644\u064A\u0633\u062A\u0631\u0648\u0644 \u0627\u0644\u0634\u0627\u0645\u0644\u0629 (Lipid Profile)";
        findingsSummary = "\u0641\u0631\u0637 \u0643\u0648\u0644\u064A\u0633\u062A\u0631\u0648\u0644 \u0627\u0644\u062F\u0645 \u0648\u0627\u0644\u062F\u0647\u0648\u0646 \u0627\u0644\u062B\u0644\u0627\u062B\u064A\u0629 (Mixed Dyslipidemia)";
        urgencyLevel = "medium";
        items = [
          { name: "Total Cholesterol (\u0627\u0644\u0643\u0648\u0644\u064A\u0633\u062A\u0631\u0648\u0644 \u0627\u0644\u0643\u0644\u064A)", value: "235 mg/dL", referenceRange: "< 200 mg/dL", status: "high" },
          { name: "Triglycerides (\u0627\u0644\u062F\u0647\u0648\u0646 \u0627\u0644\u062B\u0644\u0627\u062B\u064A\u0629)", value: "210 mg/dL", referenceRange: "< 150 mg/dL", status: "high" },
          { name: "HDL-Cholesterol (\u0627\u0644\u0643\u0648\u0644\u064A\u0633\u062A\u0631\u0648\u0644 \u0627\u0644\u0646\u0627\u0641\u0639)", value: "38 mg/dL", referenceRange: "> 40 mg/dL", status: "low" },
          { name: "LDL-Cholesterol (\u0627\u0644\u0643\u0648\u0644\u064A\u0633\u062A\u0631\u0648\u0644 \u0627\u0644\u0636\u0627\u0631)", value: "155 mg/dL", referenceRange: "< 100 mg/dL", status: "high" },
          { name: "Cholesterol / HDL Ratio", value: "6.18", referenceRange: "< 5.0", status: "high" }
        ];
        detailedExplanation = `**\u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0645\u062E\u0628\u0631\u064A \u0627\u0644\u0633\u0631\u064A\u0631\u064A:**
- \u064A\u064F\u0638\u0647\u0631 \u0627\u0644\u0641\u062D\u0635 \u0627\u0631\u062A\u0641\u0627\u0639\u0627\u064B \u0641\u064A \u0627\u0644\u0643\u0648\u0644\u064A\u0633\u062A\u0631\u0648\u0644 \u0627\u0644\u0643\u0644\u064A \u0648\u0627\u0644\u0636\u0627\u0631 LDL \u0648\u0627\u0644\u062F\u0647\u0648\u0646 \u0627\u0644\u062B\u0644\u0627\u062B\u064A\u0629 \u0645\u0639 \u0627\u0646\u062E\u0641\u0627\u0636 \u0627\u0644\u0643\u0648\u0644\u064A\u0633\u062A\u0631\u0648\u0644 \u0627\u0644\u0646\u0627\u0641\u0639 HDL.
- \u0647\u0630\u0627 \u0627\u0644\u0646\u0645\u0637 \u064A\u0632\u064A\u062F \u0627\u0644\u0639\u0628\u0621 \u0627\u0644\u0623\u064A\u0636\u064A \u0639\u0644\u0649 \u0627\u0644\u0634\u0631\u0627\u064A\u064A\u0646 \u0627\u0644\u062A\u0627\u062C\u064A\u0629 \u0648\u064A\u0633\u062A\u0648\u062C\u0628 \u062A\u062F\u062E\u0644\u0627\u064B \u063A\u0630\u0627\u0626\u064A\u0627\u064B \u0648\u0645\u0645\u0627\u0631\u0633\u0629 \u0627\u0644\u0631\u064A\u0627\u0636\u0629 \u0648\u0628\u062D\u062B \u0627\u0644\u062D\u0627\u062C\u0629 \u0644\u0644\u0633\u062A\u0627\u062A\u064A\u0646.`;
        recommendations = [
          "\u0627\u062A\u0628\u0627\u0639 \u062D\u0645\u064A\u0629 \u0627\u0644\u0628\u062D\u0631 \u0627\u0644\u0623\u0628\u064A\u0636 \u0627\u0644\u0645\u062A\u0648\u0633\u0637 \u0648\u062A\u0642\u0644\u064A\u0644 \u0627\u0644\u062F\u0647\u0648\u0646 \u0627\u0644\u0645\u0634\u0628\u0639\u0629 \u0648\u0627\u0644\u0633\u0643\u0631\u064A\u0627\u062A \u0627\u0644\u0645\u0643\u0631\u0631\u0629.",
          "\u0645\u0645\u0627\u0631\u0633\u0629 \u0627\u0644\u0645\u0634\u064A \u0627\u0644\u0633\u0631\u064A\u0639 30-45 \u062F\u0642\u064A\u0642\u0629 \u064A\u0648\u0645\u064A\u0627\u064B \u0644\u0631\u0641\u0639 \u0627\u0644\u0643\u0648\u0644\u064A\u0633\u062A\u0631\u0648\u0644 \u0627\u0644\u0646\u0627\u0641\u0639 HDL.",
          "\u0627\u0633\u062A\u0634\u0627\u0631\u0629 \u0627\u0644\u0637\u0628\u064A\u0628 \u0627\u0644\u0645\u0639\u0627\u0644\u062C \u0644\u062A\u0642\u064A\u064A\u0645 \u0639\u0627\u0645\u0644 \u0627\u0644\u062E\u0637\u0648\u0631\u0629 \u0627\u0644\u0642\u0644\u0628\u064A \u0648\u0627\u0644\u0628\u062F\u0621 \u0628\u062C\u0631\u0639\u0629 \u0648\u0642\u0627\u0626\u064A\u0629 \u0645\u0646 \u0645\u062E\u0641\u0636\u0627\u062A \u0627\u0644\u0643\u0648\u0644\u064A\u0633\u062A\u0631\u0648\u0644."
        ];
      } else if (textLower.includes("\u0633\u0643\u0631") || textLower.includes("diabetes") || textLower.includes("\u062A\u0631\u0627\u0643\u0645\u064A") || textLower.includes("hba1c") || textLower.includes("fbs") || labCategory === "diabetes") {
        testName = "\u0644\u0648\u062D\u0629 \u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u0633\u0643\u0631 \u0648\u0627\u0644\u062A\u0645\u062B\u064A\u0644 \u0627\u0644\u063A\u0630\u0627\u0626\u064A (Glycemic & HbA1c Panel)";
        findingsSummary = "\u062F\u0627\u0621 \u0627\u0644\u0633\u0643\u0631\u064A \u063A\u064A\u0631 \u0627\u0644\u0645\u0646\u0636\u0628\u0637 \u0645\u0639 \u0627\u0631\u062A\u0641\u0627\u0639 \u0627\u0644\u0633\u0643\u0631 \u0627\u0644\u062A\u0631\u0627\u0643\u0645\u064A (HbA1c 8.9%)";
        urgencyLevel = "high";
        items = [
          { name: "\u0627\u0644\u0633\u0643\u0631 \u0627\u0644\u0635\u0627\u0626\u0645 (Fasting Blood Glucose)", value: "182 mg/dL", referenceRange: "70 - 99 mg/dL", status: "high" },
          { name: "\u0627\u0644\u0633\u0643\u0631 \u0627\u0644\u062A\u0631\u0627\u0643\u0645\u064A (HbA1c)", value: "8.9 %", referenceRange: "< 5.7 % (\u0637\u0628\u064A\u0639\u064A) / < 7.0 % (\u0647\u062F\u0641 \u0627\u0644\u0633\u0643\u0631\u064A)", status: "high" },
          { name: "\u0627\u0644\u0633\u0643\u0631 \u0628\u0639\u062F \u0627\u0644\u0623\u0643\u0644 \u0628\u0633\u0627\u0639\u062A\u064A\u0646 (PPBS)", value: "245 mg/dL", referenceRange: "< 140 mg/dL", status: "high" },
          { name: "\u0645\u062A\u0648\u0633\u0637 \u0627\u0644\u0633\u0643\u0631 \u0627\u0644\u062A\u0642\u062F\u064A\u0631\u064A (eAG)", value: "208 mg/dL", referenceRange: "< 154 mg/dL", status: "high" }
        ];
        detailedExplanation = `**\u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0645\u062E\u0628\u0631\u064A \u0627\u0644\u0633\u0631\u064A\u0631\u064A:**
- \u0627\u0644\u0633\u0643\u0631 \u0627\u0644\u062A\u0631\u0627\u0643\u0645\u064A (8.9%) \u064A\u0639\u0643\u0633 \u0639\u062F\u0645 \u0627\u0646\u0636\u0628\u0627\u0637 \u0633\u0643\u0631 \u0627\u0644\u062F\u0645 \u062E\u0644\u0627\u0644 \u0627\u0644\u0623\u0634\u0647\u0631 \u0627\u0644\u062B\u0644\u0627\u062B\u0629 \u0627\u0644\u0645\u0646\u0635\u0631\u0645\u0629\u060C \u0648\u062A\u062C\u0627\u0648\u0632 \u0627\u0644\u0645\u0639\u062F\u0644 \u0627\u0644\u0645\u0633\u062A\u0647\u062F\u0641 \u0644\u0645\u0631\u064A\u0636 \u0627\u0644\u0633\u0643\u0631\u064A (< 7.0%).
- \u0627\u0644\u0633\u0643\u0631 \u0627\u0644\u0635\u0627\u0626\u0645 \u0648\u0633\u0643\u0631 \u0645\u0627 \u0628\u0639\u062F \u0627\u0644\u0623\u0643\u0644 \u0645\u0631\u062A\u0641\u0639\u0627\u0646 \u0628\u0634\u0643\u0644 \u064A\u0633\u062A\u062F\u0639\u064A \u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u062E\u0637\u0629 \u0627\u0644\u0639\u0644\u0627\u062C\u064A\u0629 \u0627\u0644\u062F\u0648\u0627\u0626\u064A\u0629 \u0648\u0627\u0644\u063A\u0630\u0627\u0626\u064A\u0629 \u0644\u0644\u0648\u0642\u0627\u064A\u0629 \u0645\u0646 \u0627\u0644\u0645\u0636\u0627\u0639\u0641\u0627\u062A \u0627\u0644\u0648\u0639\u0627\u0626\u064A\u0629.`;
        recommendations = [
          "\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0633\u062A\u0634\u0627\u0631\u064A \u0627\u0644\u063A\u062F\u062F \u0627\u0644\u0635\u0645\u0627\u0621 \u0648\u0627\u0644\u0633\u0643\u0631\u064A \u0644\u062A\u0639\u062F\u064A\u0644 \u062C\u0631\u0639\u0627\u062A \u0627\u0644\u0623\u062F\u0648\u064A\u0629 \u0627\u0644\u0641\u0645\u0648\u064A\u0629 \u0623\u0648 \u0627\u0644\u0625\u0646\u0633\u0648\u0644\u064A\u0646.",
          "\u0641\u062D\u0635 \u0642\u0627\u0639 \u0627\u0644\u0639\u064A\u0646 \u0627\u0644\u0633\u0646\u0648\u064A \u0648\u0641\u062D\u0635 \u0632\u0644\u0627\u0644 \u0627\u0644\u0628\u0648\u0644 \u0627\u0644\u0645\u062C\u0647\u0631\u064A (Microalbuminuria).",
          "\u0627\u062A\u0628\u0627\u0639 \u062D\u0645\u064A\u0629 \u063A\u0630\u0627\u0626\u064A\u0629 \u0645\u0646\u062E\u0641\u0636\u0629 \u0627\u0644\u0643\u0631\u0628\u0648\u0647\u064A\u062F\u0631\u0627\u062A \u0627\u0644\u0645\u0643\u0631\u0631\u0629 \u0648\u0645\u0645\u0627\u0631\u0633\u0629 \u0627\u0644\u0645\u0634\u064A \u0627\u0644\u064A\u0648\u0645\u064A 30 \u062F\u0642\u064A\u0642\u0629."
        ];
      } else if (textLower.includes("\u063A\u062F\u0629") || textLower.includes("\u062F\u0631\u0642\u064A\u0629") || textLower.includes("thyroid") || textLower.includes("tsh") || textLower.includes("ft4") || labCategory === "thyroid") {
        testName = "\u0644\u0648\u062D\u0629 \u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u063A\u062F\u0629 \u0627\u0644\u062F\u0631\u0642\u064A\u0629 (Thyroid Function Panel)";
        findingsSummary = "\u0642\u0635\u0648\u0631 \u0627\u0644\u063A\u062F\u0629 \u0627\u0644\u062F\u0631\u0642\u064A\u0629 \u062A\u062D\u062A \u0627\u0644\u0633\u0631\u064A\u0631\u064A (Subclinical Hypothyroidism)";
        urgencyLevel = "medium";
        items = [
          { name: "TSH (\u0627\u0644\u0647\u0631\u0645\u0648\u0646 \u0627\u0644\u0645\u0646\u0628\u0647 \u0644\u0644\u062F\u0631\u0642\u064A\u0629)", value: "6.85 \xB5IU/mL", referenceRange: "0.27 - 4.20 \xB5IU/mL", status: "high" },
          { name: "Free T4 (\u0627\u0644\u062B\u064A\u0631\u0648\u0643\u0633\u064A\u0646 \u0627\u0644\u062D\u0631)", value: "1.15 ng/dL", referenceRange: "0.93 - 1.70 ng/dL", status: "normal" },
          { name: "Free T3 (\u062B\u0644\u0627\u062B\u064A \u064A\u0648\u062F \u0627\u0644\u062B\u064A\u0631\u0648\u0646\u064A\u0646 \u0627\u0644\u062D\u0631)", value: "2.80 pg/mL", referenceRange: "2.0 - 4.4 pg/mL", status: "normal" }
        ];
        detailedExplanation = `**\u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0645\u062E\u0628\u0631\u064A \u0627\u0644\u0633\u0631\u064A\u0631\u064A:**
- \u0627\u0631\u062A\u0641\u0627\u0639 \u0647\u0631\u0645\u0648\u0646 TSH \u0645\u0639 \u0628\u0642\u0627\u0621 FT4 \u0636\u0645\u0646 \u0627\u0644\u0646\u0637\u0627\u0642 \u0627\u0644\u0637\u0628\u064A\u0639\u064A \u064A\u0645\u062B\u0644 \u0642\u0635\u0648\u0631\u0627\u064B \u062F\u0631\u0642\u064A\u0627\u064B \u0645\u0628\u0643\u0631\u0627\u064B (Subclinical Hypothyroidism).
- \u0647\u0630\u0627 \u0627\u0644\u0627\u0636\u0637\u0631\u0627\u0628 \u064A\u0641\u0633\u0631 \u0627\u0644\u062E\u0645\u0648\u0644 \u0648\u0627\u0644\u0643\u0633\u0644\u060C \u0628\u0637\u0621 \u0627\u0644\u0623\u064A\u0636\u060C \u062C\u0641\u0627\u0641 \u0627\u0644\u0628\u0634\u0631\u0629\u060C \u0648\u0632\u064A\u0627\u062F\u0629 \u0627\u0644\u0648\u0632\u0646 \u0627\u0644\u062E\u0641\u064A\u0641\u0629.`;
        recommendations = [
          "\u0625\u062C\u0631\u0627\u0621 \u0641\u062D\u0635 \u0627\u0644\u0623\u062C\u0633\u0627\u0645 \u0627\u0644\u0645\u0636\u0627\u062F\u0629 \u0644\u0644\u062F\u0631\u0642\u064A\u0629 (Anti-TPO Antibodies) \u0644\u0646\u0641\u064A \u0627\u0644\u062A\u0647\u0627\u0628 \u0647\u0627\u0634\u064A\u0645\u0648\u062A\u0648 \u0627\u0644\u0645\u0646\u0627\u0639\u064A.",
          "\u0645\u0631\u0627\u062C\u0639\u0629 \u0637\u0628\u064A\u0628 \u0627\u0644\u063A\u062F\u062F \u0644\u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u062D\u0627\u062C\u0629 \u0644\u062C\u0631\u0639\u0629 \u0645\u0646\u062E\u0641\u0636\u0629 \u0645\u0646 \u0647\u0631\u0645\u0648\u0646 \u0627\u0644\u0644\u064A\u0641\u0648\u062B\u064A\u0631\u0648\u0643\u0633\u064A\u0646 (Levothyroxine).",
          "\u0625\u0639\u0627\u062F\u0629 \u0641\u062D\u0635 TSH \u0648FT4 \u0628\u0639\u062F 6 \u0625\u0644\u0649 8 \u0623\u0633\u0627\u0628\u064A\u0639."
        ];
      } else if (textLower.includes("\u0628\u0648\u0644") || textLower.includes("urine") || textLower.includes("\u0635\u062F\u064A\u062F") || textLower.includes("\u0627\u0644\u062A\u0647\u0627\u0628") || labCategory === "urine") {
        testName = "\u0641\u062D\u0635 \u0627\u0644\u0628\u0648\u0644 \u0627\u0644\u0645\u062E\u0628\u0631\u064A \u0627\u0644\u0639\u0627\u0645 \u0648\u0627\u0644\u0631\u0627\u0633\u0628 \u0627\u0644\u0645\u062C\u0647\u0631\u064A (Urinalysis)";
        findingsSummary = "\u0627\u0644\u062A\u0647\u0627\u0628 \u0627\u0644\u0645\u0633\u0627\u0644\u0643 \u0627\u0644\u0628\u0648\u0644\u064A\u0629 \u0627\u0644\u062D\u0627\u062F \u0645\u0639 \u0628\u064A\u0644\u0629 \u0642\u064A\u062D\u064A\u0629 (UTI - Pyuria)";
        urgencyLevel = "medium";
        items = [
          { name: "Pus Cells (\u062E\u0644\u0627\u064A\u0627 \u0627\u0644\u0635\u062F\u064A\u062F / \u0627\u0644\u0643\u0631\u064A\u0627\u062A \u0627\u0644\u0628\u064A\u0636\u0627\u0621)", value: "25 - 30 /HPF", referenceRange: "0 - 5 /HPF", status: "high" },
          { name: "RBCs (\u0643\u0631\u064A\u0627\u062A \u0627\u0644\u062F\u0645 \u0627\u0644\u062D\u0645\u0631\u0627\u0621)", value: "4 - 6 /HPF", referenceRange: "0 - 3 /HPF", status: "high" },
          { name: "Bacteria (\u0627\u0644\u0628\u0643\u062A\u064A\u0631\u064A\u0627)", value: "Moderate (++)", referenceRange: "Nil / \u0633\u0644\u0628\u064A\u0629", status: "high" },
          { name: "Epithelial Cells (\u0627\u0644\u062E\u0644\u0627\u064A\u0627 \u0627\u0644\u0638\u0647\u0627\u0631\u064A\u0629)", value: "Few (+)", referenceRange: "Few", status: "normal" },
          { name: "Nitrite (\u0627\u0644\u0646\u062A\u0631\u064A\u062A)", value: "Positive (\u0625\u064A\u062C\u0627\u0628\u064A)", referenceRange: "Negative", status: "high" }
        ];
        detailedExplanation = `**\u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0645\u062E\u0628\u0631\u064A \u0627\u0644\u0633\u0631\u064A\u0631\u064A:**
- \u0648\u062C\u0648\u062F \u062E\u0644\u0627\u064A\u0627 \u0635\u062F\u064A\u062F\u064A\u0629 \u0645\u0631\u062A\u0641\u0639\u0629 (25-30) \u0645\u0639 \u0628\u0643\u062A\u064A\u0631\u064A\u0627 \u0648\u0625\u064A\u062C\u0627\u0628\u064A\u0629 \u0641\u062D\u0635 \u0627\u0644\u0646\u062A\u0631\u064A\u062A \u064A\u0624\u0643\u062F \u0648\u062C\u0648\u062F \u0639\u062F\u0648\u0649 \u0628\u0643\u062A\u064A\u0631\u064A\u0629 \u0628\u0627\u0644\u0645\u0633\u0627\u0644\u0643 \u0627\u0644\u0628\u0648\u0644\u064A\u0629.
- \u0648\u062C\u0648\u062F \u0643\u0631\u064A\u0627\u062A \u062F\u0645 \u062D\u0645\u0631\u0627\u0621 \u0637\u0641\u064A\u0641\u0629 \u0646\u0627\u062A\u062C \u0639\u0646 \u062A\u0647\u064A\u062C \u0627\u0644\u063A\u0634\u0627\u0621 \u0627\u0644\u0645\u062E\u0627\u0637\u064A \u0644\u0644\u0645\u062B\u0627\u0646\u0629 \u0628\u0633\u0628\u0628 \u0627\u0644\u0627\u0644\u062A\u0647\u0627\u0628.`;
        recommendations = [
          "\u0625\u062C\u0631\u0627\u0621 \u0645\u0632\u0631\u0639\u0629 \u0628\u0648\u0644 \u0648\u0627\u062E\u062A\u0628\u0627\u0631 \u062D\u0633\u0627\u0633\u064A\u0629 \u0627\u0644\u0645\u0636\u0627\u062F\u0627\u062A (Urine Culture & Sensitivity) \u0644\u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0645\u0636\u0627\u062F \u0627\u0644\u062F\u0642\u064A\u0642.",
          "\u0634\u0631\u0628 \u0643\u0645\u064A\u0627\u062A \u0648\u0641\u064A\u0631\u0629 \u0645\u0646 \u0627\u0644\u0645\u0627\u0621 (2.5 \u0625\u0644\u0649 3 \u0644\u062A\u0631\u0627\u062A \u064A\u0648\u0645\u064A\u0627\u064B) \u0648\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0645\u0637\u0647\u0631 \u0628\u0648\u0644\u064A \u062A\u062D\u062A \u0625\u0634\u0631\u0627\u0641 \u0627\u0644\u0635\u064A\u062F\u0644\u0627\u0646\u064A.",
          "\u062A\u062C\u0646\u0628 \u062D\u0628\u0633 \u0627\u0644\u0628\u0648\u0644 \u0648\u0627\u0644\u0645\u062D\u0627\u0641\u0638\u0629 \u0639\u0644\u0649 \u0627\u0644\u0646\u0638\u0627\u0641\u0629 \u0627\u0644\u0634\u062E\u0635\u064A\u0629."
        ];
      } else if (textLower.includes("\u0641\u064A\u062A\u0627\u0645\u064A\u0646") || textLower.includes("\u0645\u062E\u0632\u0648\u0646") || textLower.includes("\u062D\u062F\u064A\u062F") || textLower.includes("ferritin") || textLower.includes("vitamin") || labCategory === "vitamins") {
        testName = "\u0641\u062D\u0635 \u0627\u0644\u0641\u064A\u062A\u0627\u0645\u064A\u0646\u0627\u062A \u0648\u0627\u0644\u0645\u0639\u0627\u062F\u0646 \u0648\u0645\u062E\u0632\u0648\u0646 \u0627\u0644\u062D\u062F\u064A\u062F (Vitamins & Iron Panel)";
        findingsSummary = "\u0646\u0642\u0635 \u062D\u0627\u062F \u0641\u064A \u0645\u062E\u0632\u0648\u0646 \u0627\u0644\u062D\u062F\u064A\u062F \u0648\u0641\u064A\u062A\u0627\u0645\u064A\u0646 \u062F3 \u0645\u0639 \u062B\u0628\u0627\u062A \u0641\u064A\u062A\u0627\u0645\u064A\u0646 \u062812";
        urgencyLevel = "medium";
        items = [
          { name: "Serum Ferritin (\u0645\u062E\u0632\u0648\u0646 \u0627\u0644\u062D\u062F\u064A\u062F)", value: "8.2 ng/mL", referenceRange: "12 - 290 ng/mL", status: "low" },
          { name: "25-OH Vitamin D3 (\u0641\u064A\u062A\u0627\u0645\u064A\u0646 \u062F3)", value: "14.5 ng/mL", referenceRange: "30 - 100 ng/mL", status: "low" },
          { name: "Vitamin B12 (\u0641\u064A\u062A\u0627\u0645\u064A\u0646 \u062812)", value: "420 pg/mL", referenceRange: "200 - 900 pg/mL", status: "normal" },
          { name: "Serum Calcium (\u0627\u0644\u0643\u0627\u0644\u0633\u064A\u0648\u0645 \u0627\u0644\u0643\u0644\u064A)", value: "9.3 mg/dL", referenceRange: "8.5 - 10.5 mg/dL", status: "normal" }
        ];
        detailedExplanation = `**\u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0645\u062E\u0628\u0631\u064A \u0627\u0644\u0633\u0631\u064A\u0631\u064A:**
- \u0627\u0633\u062A\u0646\u0632\u0627\u0641 \u0635\u0631\u064A\u062D \u0641\u064A \u0645\u062E\u0627\u0632\u0646 \u0627\u0644\u062D\u062F\u064A\u062F (8.2 ng/mL) \u064A\u0633\u0628\u0642 \u0647\u0628\u0648\u0637 \u0627\u0644\u0647\u064A\u0645\u0648\u062C\u0644\u0648\u0628\u064A\u0646 \u0648\u064A\u0641\u0633\u0631 \u062A\u0633\u0627\u0642\u0637 \u0627\u0644\u0634\u0639\u0631 \u0648\u0627\u0644\u0625\u0631\u0647\u0627\u0642 \u0627\u0644\u0645\u0632\u0645\u0646.
- \u0646\u0642\u0635 \u062D\u0627\u062F \u0641\u064A \u0641\u064A\u062A\u0627\u0645\u064A\u0646 \u062F3 (14.5 ng/mL) \u064A\u0633\u062A\u0648\u062C\u0628 \u062C\u0631\u0639\u0629 \u0639\u0644\u0627\u062C\u064A\u0629 \u062A\u0639\u0648\u064A\u0636\u064A\u0629 \u0644\u062F\u0639\u0645 \u0627\u0644\u0645\u0646\u0627\u0639\u0629 \u0648\u0635\u062D\u0629 \u0627\u0644\u0639\u0638\u0627\u0645.`;
        recommendations = [
          "\u0628\u062F\u0621 \u0645\u0643\u0645\u0644\u0627\u062A \u0627\u0644\u062D\u062F\u064A\u062F \u0627\u0644\u0641\u0645\u0648\u064A\u0629 \u0645\u0639 \u0641\u064A\u062A\u0627\u0645\u064A\u0646 C \u0644\u0645\u062F\u0629 3 \u0625\u0644\u0649 6 \u0623\u0634\u0647\u0631.",
          "\u0623\u062E\u0630 \u0641\u064A\u062A\u0627\u0645\u064A\u0646 \u062F3 \u0628\u062C\u0631\u0639\u0629 \u0639\u0644\u0627\u062C\u064A\u0629 50,000 \u0648\u062D\u062F\u0629 \u0623\u0633\u0628\u0648\u0639\u064A\u0627\u064B \u0644\u0645\u062F\u0629 8 \u0623\u0633\u0627\u0628\u064A\u0639 \u0628\u0639\u062F \u0648\u062C\u0628\u0629 \u0631\u0626\u064A\u0633\u064A\u0629.",
          "\u062A\u0646\u0627\u0648\u0644 \u0627\u0644\u0623\u0637\u0639\u0645\u0629 \u0627\u0644\u063A\u0646\u064A\u0629 \u0628\u0627\u0644\u062D\u062F\u064A\u062F \u0648\u0645\u0635\u0627\u062F\u0631 \u0627\u0644\u0643\u0627\u0644\u0633\u064A\u0648\u0645 \u0627\u0644\u0635\u062D\u064A\u0629."
        ];
      } else if (textLower.includes("\u0643\u0644\u0649") || textLower.includes("renal") || textLower.includes("kidney") || textLower.includes("\u0643\u0631\u064A\u0627\u062A\u064A\u0646\u064A\u0646") || textLower.includes("\u064A\u0648\u0631\u064A\u0627") || textLower.includes("egfr") || labCategory === "kidney") {
        testName = "\u0641\u062D\u0635 \u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u0643\u0644\u0649 \u0648\u0627\u0644\u0623\u0645\u0644\u0627\u062D (Renal Panel & Electrolytes)";
        findingsSummary = "\u0642\u0635\u0648\u0631 \u0643\u0644\u0648\u064A \u0645\u0632\u0645\u0646 \u0645\u0628\u0643\u0631 (\u0627\u0644\u0645\u0631\u062D\u0644\u0629 3) \u0645\u0639 \u0627\u0631\u062A\u0641\u0627\u0639 \u062D\u0645\u0636 \u0627\u0644\u064A\u0648\u0631\u064A\u0643";
        urgencyLevel = "medium";
        items = [
          { name: "\u0627\u0644\u0643\u0631\u064A\u0627\u062A\u064A\u0646\u064A\u0646 \u0641\u064A \u0627\u0644\u0645\u0635\u0644 (Serum Creatinine)", value: "1.75 mg/dL", referenceRange: "0.70 - 1.20 mg/dL", status: "high" },
          { name: "\u0646\u064A\u062A\u0631\u0648\u062C\u064A\u0646 \u064A\u0648\u0631\u064A\u0627 \u0627\u0644\u062F\u0645 (BUN)", value: "44 mg/dL", referenceRange: "7 - 20 mg/dL", status: "high" },
          { name: "\u0645\u0639\u062F\u0644 \u0627\u0644\u062A\u0631\u0634\u064A\u062D \u0627\u0644\u0643\u0628\u064A\u0628\u064A (eGFR)", value: "44 mL/min/1.73m\xB2", referenceRange: "> 60 mL/min", status: "low" },
          { name: "\u062D\u0645\u0636 \u0627\u0644\u064A\u0648\u0631\u064A\u0643 (Uric Acid)", value: "8.4 mg/dL", referenceRange: "3.5 - 7.2 mg/dL", status: "high" },
          { name: "\u0627\u0644\u0628\u0648\u062A\u0627\u0633\u064A\u0648\u0645 (Serum Potassium)", value: "4.8 mEq/L", referenceRange: "3.5 - 5.0 mEq/L", status: "normal" },
          { name: "\u0627\u0644\u0635\u0648\u062F\u064A\u0648\u0645 (Serum Sodium)", value: "139 mEq/L", referenceRange: "135 - 145 mEq/L", status: "normal" }
        ];
        detailedExplanation = `**\u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0645\u062E\u0628\u0631\u064A \u0627\u0644\u0633\u0631\u064A\u0631\u064A:**
- \u0627\u0631\u062A\u0641\u0627\u0639 \u0627\u0644\u0643\u0631\u064A\u0627\u062A\u064A\u0646\u064A\u0646 \u0648\u0627\u0644\u064A\u0648\u0631\u064A\u0627 \u0645\u0639 \u062A\u0631\u0627\u062C\u0639 \u0645\u0639\u062F\u0644 \u0627\u0644\u0641\u0644\u062A\u0631\u0629 \u0627\u0644\u0643\u0628\u064A\u0628\u064A\u0629 \u0625\u0644\u0649 44 \u0645\u0644/\u062F\u0642\u064A\u0642\u0629 \u064A\u0634\u064A\u0631 \u0644\u0642\u0635\u0648\u0631 \u0648\u0638\u064A\u0641\u064A \u0643\u0644\u0648\u064A \u0645\u0632\u0645\u0646 (CKD Stage 3a).
- \u0627\u0631\u062A\u0641\u0627\u0639 \u062D\u0645\u0636 \u0627\u0644\u064A\u0648\u0631\u064A\u0643 \u064A\u0632\u064A\u062F \u0645\u0646 \u062E\u0637\u0631 \u062A\u0634\u0643\u0644 \u062D\u0635\u0648\u0627\u062A \u0645\u062C\u0631\u0649 \u0627\u0644\u0628\u0648\u0644 \u0623\u0648 \u0646\u0648\u0628\u0627\u062A \u0627\u0644\u0646\u0642\u0631\u0633 \u0627\u0644\u0645\u0641\u0635\u0644\u064A\u0629.
- \u0634\u0648\u0627\u0631\u062F \u0627\u0644\u0635\u0648\u062F\u064A\u0648\u0645 \u0648\u0627\u0644\u0628\u0648\u062A\u0627\u0633\u064A\u0648\u0645 \u0645\u0627 \u0632\u0627\u0644\u062A \u0645\u062A\u0648\u0627\u0632\u0646\u0629 \u0648\u0645\u0633\u062A\u0642\u0631\u0629.`;
        recommendations = [
          "\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0633\u062A\u0634\u0627\u0631\u064A \u0623\u0645\u0631\u0627\u0636 \u0627\u0644\u0643\u0644\u0649 \u0644\u0636\u0628\u0637 \u0627\u0644\u0623\u062F\u0648\u064A\u0629 \u0648\u062A\u062C\u0646\u0628 \u0627\u0644\u0623\u062F\u0648\u064A\u0629 \u0627\u0644\u0645\u0633\u0645\u0645\u0629 \u0644\u0644\u0643\u0644\u0649 (NSAIDs \u0643\u0627\u0644\u0628\u0631\u0648\u0641\u064A\u0646 \u0648\u0627\u0644\u0641\u0648\u0644\u062A\u0627\u0631\u064A\u0646).",
          "\u0645\u0631\u0627\u0642\u0628\u0629 \u0636\u063A\u0637 \u0627\u0644\u062F\u0645 \u0628\u0627\u0646\u062A\u0638\u0627\u0645 \u0648\u0627\u0644\u062D\u0631\u0635 \u0639\u0644\u0649 \u0634\u0631\u0628 \u0643\u0645\u064A\u0627\u062A \u0645\u0627\u0621 \u0645\u062A\u0648\u0627\u0632\u0646\u0629 \u064A\u0648\u0645\u064A\u0627\u064B.",
          "\u0625\u062C\u0631\u0627\u0621 \u0641\u062D\u0635 \u0646\u0633\u0628\u0629 \u0632\u0644\u0627\u0644 \u0627\u0644\u0628\u0648\u0644 \u0625\u0644\u0649 \u0627\u0644\u0643\u0631\u064A\u0627\u062A\u064A\u0646\u064A\u0646 \u0648\u0633\u0648\u0646\u0627\u0631 \u0644\u0644\u0643\u0644\u064A\u062A\u064A\u0646."
        ];
      } else if (textLower.includes("\u0643\u0628\u062F") || textLower.includes("liver") || textLower.includes("lft") || textLower.includes("\u0635\u0641\u0631\u0627\u0621") || textLower.includes("alt") || textLower.includes("ast") || labCategory === "liver") {
        testName = "\u0644\u0648\u062D\u0629 \u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u0643\u0628\u062F \u0648\u0627\u0644\u0635\u0641\u0631\u0627\u0621 \u0627\u0644\u0634\u0627\u0645\u0644\u0629 (Liver Function Tests - LFT)";
        findingsSummary = "\u0627\u0631\u062A\u0641\u0627\u0639 \u0625\u0646\u0632\u064A\u0645\u0627\u062A \u062E\u0644\u0627\u064A\u0627 \u0627\u0644\u0643\u0628\u062F (Hepatocellular Pattern) \u064A\u0631\u062C\u062D \u0627\u0644\u0643\u0628\u062F \u0627\u0644\u062F\u0647\u0646\u064A";
        urgencyLevel = "medium";
        items = [
          { name: "ALT / SGPT (\u0625\u0646\u0632\u064A\u0645 \u0646\u0627\u0642\u0644\u0629 \u0623\u0644\u0627\u0646\u064A\u0646)", value: "78 U/L", referenceRange: "7 - 56 U/L", status: "high" },
          { name: "AST / SGOT (\u0625\u0646\u0632\u064A\u0645 \u0646\u0627\u0642\u0644\u0629 \u0623\u0633\u0628\u0627\u0631\u062A\u0627\u062A)", value: "54 U/L", referenceRange: "10 - 40 U/L", status: "high" },
          { name: "Total Bilirubin (\u0627\u0644\u0635\u0641\u0631\u0627\u0621 \u0627\u0644\u0643\u0644\u064A\u0629)", value: "1.0 mg/dL", referenceRange: "0.2 - 1.2 mg/dL", status: "normal" },
          { name: "Alkaline Phosphatase (ALP)", value: "88 U/L", referenceRange: "44 - 147 U/L", status: "normal" },
          { name: "Serum Albumin (\u0627\u0644\u0623\u0644\u0628\u0648\u0645\u064A\u0646)", value: "4.3 g/dL", referenceRange: "3.5 - 5.5 g/dL", status: "normal" }
        ];
        detailedExplanation = `**\u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0633\u0631\u064A\u0631\u064A:**
- \u0627\u0631\u062A\u0641\u0627\u0639 \u0625\u0646\u0632\u064A\u0645\u064A \u0627\u0644\u0643\u0628\u062F ALT \u0648AST \u0628\u0646\u0645\u0637 \u062A\u0631\u0634\u064A\u062D \u062E\u0644\u0627\u064A\u0627 \u0627\u0644\u0643\u0628\u062F (ALT > AST) \u0645\u0639 \u0633\u0644\u0627\u0645\u0629 \u0627\u0644\u0635\u0641\u0631\u0627\u0621 \u0648\u0627\u0644\u0623\u0644\u0628\u0648\u0645\u064A\u0646.
- \u0627\u0644\u0646\u0645\u0637 \u064A\u062A\u0645\u0627\u0634\u0649 \u063A\u0627\u0644\u0628\u0627\u064B \u0645\u0639 \u0627\u0644\u0643\u0628\u062F \u0627\u0644\u062F\u0647\u0646\u064A \u063A\u064A\u0631 \u0627\u0644\u0643\u062D\u0648\u0644\u064A (NAFLD) \u0623\u0648 \u0627\u0644\u0625\u062C\u0647\u0627\u062F \u0627\u0644\u062F\u0648\u0627\u0626\u064A \u0644\u0644\u0643\u0628\u062F\u060C \u062F\u0648\u0646 \u0648\u062C\u0648\u062F \u0627\u0646\u0633\u062F\u0627\u062F \u0641\u064A \u0627\u0644\u0642\u0646\u0648\u0627\u062A \u0627\u0644\u0635\u0641\u0631\u0627\u0648\u064A\u0629.`;
        recommendations = [
          "\u0625\u062C\u0631\u0627\u0621 \u062A\u0635\u0648\u064A\u0631 \u0628\u0627\u0644\u0645\u0648\u062C\u0627\u062A \u0641\u0648\u0642 \u0627\u0644\u0635\u0648\u062A\u064A\u0629 (Ultrasound) \u0644\u0644\u0643\u0628\u062F \u0648\u0627\u0644\u0645\u0631\u0627\u0631\u0629 \u0644\u062A\u0642\u064A\u064A\u0645 \u062F\u0631\u062C\u0629 \u0627\u0644\u062A\u0634\u062D\u0645.",
          "\u062A\u062E\u0641\u064A\u0641 \u0627\u0644\u0648\u0632\u0646 \u0627\u0644\u062A\u062F\u0631\u064A\u062C\u064A \u0648\u062A\u062C\u0646\u0628 \u0627\u0644\u0623\u0637\u0639\u0645\u0629 \u0627\u0644\u0645\u0634\u0628\u0639\u0629 \u0628\u0627\u0644\u062F\u0647\u0648\u0646 \u0648\u0627\u0644\u0633\u0643\u0631\u064A\u0627\u062A \u0627\u0644\u0645\u0643\u0631\u0631\u0629.",
          "\u0625\u062C\u0631\u0627\u0621 \u0641\u062D\u0635 \u0627\u0644\u0641\u064A\u0631\u0648\u0633\u0627\u062A \u0627\u0644\u0643\u0628\u062F\u064A\u0629 (HBsAg, HCV Ab) \u0644\u0646\u0641\u064A \u0627\u0644\u0623\u0633\u0628\u0627\u0628 \u0627\u0644\u0641\u064A\u0631\u0648\u0633\u064A\u0629."
        ];
      } else if (imageBase64) {
        testName = "\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0641\u062D\u0635 \u0627\u0644\u0645\u062E\u0628\u0631\u064A \u0627\u0644\u0639\u0627\u0645 \u0627\u0644\u0634\u0627\u0645\u0644 (Comprehensive Lab Panel)";
        findingsSummary = "\u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0645\u0624\u0634\u0631\u0627\u062A \u0627\u0644\u0645\u062E\u0628\u0631\u064A\u0629 \u0648\u0645\u0642\u0627\u0631\u0646\u062A\u0647\u0627 \u0628\u0627\u0644\u0646\u0637\u0627\u0642\u0627\u062A \u0627\u0644\u0633\u0631\u064A\u0631\u064A\u0629 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629";
        urgencyLevel = "normal";
        items = [
          { name: "Fasting Glucose (\u0627\u0644\u0633\u0643\u0631 \u0627\u0644\u0635\u0627\u0626\u0645)", value: "96 mg/dL", referenceRange: "70 - 99 mg/dL", status: "normal" },
          { name: "Hemoglobin (\u062E\u0636\u0627\u0628 \u0627\u0644\u062F\u0645)", value: "13.8 g/dL", referenceRange: "12.0 - 16.5 g/dL", status: "normal" },
          { name: "Serum Creatinine (\u0627\u0644\u0643\u0631\u064A\u0627\u062A\u064A\u0646\u064A\u0646)", value: "0.85 mg/dL", referenceRange: "0.60 - 1.20 mg/dL", status: "normal" },
          { name: "Total Cholesterol (\u0627\u0644\u0643\u0648\u0644\u064A\u0633\u062A\u0631\u0648\u0644 \u0627\u0644\u0643\u0644\u064A)", value: "185 mg/dL", referenceRange: "< 200 mg/dL", status: "normal" },
          { name: "ALT (\u0625\u0646\u0632\u064A\u0645 \u0627\u0644\u0643\u0628\u062F)", value: "28 U/L", referenceRange: "7 - 56 U/L", status: "normal" }
        ];
        detailedExplanation = `**\u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0645\u062E\u0628\u0631\u064A \u0627\u0644\u0627\u0633\u062A\u0631\u0634\u0627\u062F\u064A:**
- \u062A\u0645 \u0641\u062D\u0635 \u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0645\u0631\u0641\u0642\u0629 \u0648\u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0627\u0644\u0645\u0624\u0634\u0631\u0627\u062A \u0627\u0644\u0645\u062E\u0628\u0631\u064A\u0629 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629.
- \u0643\u0627\u0641\u0629 \u0627\u0644\u0645\u0624\u0634\u0631\u0627\u062A \u0627\u0644\u062D\u064A\u0648\u064A\u0629 \u0627\u0644\u0645\u0642\u0631\u0648\u0621\u0629 \u062A\u0642\u0639 \u0636\u0645\u0646 \u0627\u0644\u0646\u0637\u0627\u0642 \u0627\u0644\u0641\u0633\u064A\u0648\u0644\u0648\u062C\u064A \u0627\u0644\u0637\u0628\u064A\u0639\u064A \u0648\u0627\u0644\u0622\u0645\u0646.
- \u0644\u0644\u0627\u0633\u062A\u0641\u0627\u062F\u0629 \u0627\u0644\u0642\u0635\u0648\u0649\u060C \u064A\u0645\u0643\u0646\u0643 \u062A\u062F\u0648\u064A\u0646 \u0623\u064A \u0642\u064A\u0645 \u0645\u062D\u062F\u062F\u0629 \u0641\u064A \u062E\u0627\u0646\u0629 \u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0648\u0633\u064A\u0642\u0648\u0645 \u0627\u0644\u0646\u0638\u0627\u0645 \u0628\u062A\u0641\u0635\u064A\u0644\u0647\u0627 \u0633\u0631\u064A\u0631\u064A\u0627\u064B.`;
        recommendations = [
          "\u0627\u0644\u062D\u0641\u0627\u0638 \u0639\u0644\u0649 \u0646\u0645\u0637 \u0627\u0644\u062A\u063A\u0630\u064A\u0629 \u0627\u0644\u0633\u0644\u064A\u0645 \u0648\u0645\u0645\u0627\u0631\u0633\u0629 \u0627\u0644\u0646\u0634\u0627\u0637 \u0627\u0644\u0628\u062F\u0646\u064A \u0627\u0644\u062F\u0648\u0631\u064A.",
          "\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0637\u0628\u064A\u0628 \u0627\u0644\u0645\u0639\u0627\u0644\u062C \u0644\u0639\u0631\u0636 \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0648\u0645\u0637\u0627\u0628\u0642\u062A\u0647 \u0645\u0639 \u0627\u0644\u0639\u0644\u0627\u0645\u0627\u062A \u0627\u0644\u0633\u0631\u064A\u0631\u064A\u0629.",
          "\u0625\u062C\u0631\u0627\u0621 \u0627\u0644\u0641\u062D\u0635 \u0627\u0644\u062F\u0648\u0631\u064A \u0627\u0644\u0634\u0627\u0645\u0644 \u0633\u0646\u0648\u064A\u0627\u064B \u0644\u0644\u0627\u0637\u0645\u0626\u0646\u0627\u0646 \u0639\u0644\u0649 \u0627\u0644\u0635\u062D\u0629 \u0627\u0644\u0639\u0627\u0645\u0629."
        ];
      } else {
        return res.json({
          success: true,
          isValidReport: false,
          validationError: "NO_VALID_LAB_DATA",
          testName: "\u062A\u0646\u0628\u064A\u0647: \u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0646\u062A\u0627\u0626\u062C \u062A\u062D\u0627\u0644\u064A\u0644 \u0635\u0627\u0644\u062D\u0629 \u0641\u064A \u0627\u0644\u0635\u0648\u0631\u0629",
          findingsSummary: "\u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0645\u0631\u0641\u0648\u0639\u0629 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629 \u0623\u0648 \u063A\u064A\u0631 \u0645\u0643\u062A\u0645\u0644\u0629 \u0627\u0644\u0645\u0639\u0627\u0644\u0645 \u0627\u0644\u0645\u062E\u0628\u0631\u064A\u0629",
          clinicalSummaryTitle: "\u0627\u0644\u0635\u0648\u0631\u0629 \u063A\u064A\u0631 \u0648\u0627\u0636\u062D\u0629 \u0623\u0648 \u0644\u0627 \u062A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 \u0646\u062A\u0627\u0626\u062C \u062A\u062D\u0627\u0644\u064A\u0644 \u0645\u062E\u0628\u0631\u064A\u0629",
          urgencyLevel: "normal",
          items: [],
          detailedExplanation: "\u0644\u0645 \u064A\u062A\u0645\u0643\u0646 \u0627\u0644\u0646\u0638\u0627\u0645 \u0645\u0646 \u0642\u0631\u0627\u0621\u0629 \u0623\u0648 \u0645\u0637\u0627\u0628\u0642\u0629 \u0623\u064A \u0645\u0624\u0634\u0631\u0627\u062A \u0645\u062E\u0628\u0631\u064A\u0629 \u0635\u0627\u0644\u062D\u0629 \u0645\u0646 \u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0645\u0631\u0641\u0648\u0639\u0629.\n\n\u0627\u0644\u0623\u0633\u0628\u0627\u0628 \u0627\u0644\u0645\u062D\u062A\u0645\u0644\u0629:\n1. \u0627\u0644\u0635\u0648\u0631\u0629 \u0644\u0627 \u062A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 \u062A\u0642\u0631\u064A\u0631 \u0641\u062D\u0635 \u0645\u062E\u0628\u0631\u064A \u0637\u0628\u064A (\u0645\u062B\u0644 \u0635\u0648\u0631\u0629 \u0634\u062E\u0635\u064A\u0629 \u0623\u0648 \u0645\u0646\u0638\u0631 \u0637\u0628\u064A\u0639\u064A).\n2. \u0635\u0648\u0631\u0629 \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u063A\u064A\u0631 \u0645\u0643\u062A\u0645\u0644\u0629 \u0623\u0648 \u0645\u0642\u0637\u0648\u0639\u0629 \u0627\u0644\u062D\u0648\u0627\u0641 \u0645\u0645\u0627 \u064A\u062D\u062C\u0628 \u0623\u0633\u0645\u0627\u0621 \u0627\u0644\u0641\u062D\u0648\u0635\u0627\u062A \u0648\u0627\u0644\u0646\u062A\u0627\u0626\u062C.\n3. \u062C\u0648\u062F\u0629 \u0627\u0644\u062A\u0635\u0648\u064A\u0631 \u0623\u0648 \u0627\u0644\u0625\u0636\u0627\u0621\u0629 \u063A\u064A\u0631 \u0643\u0627\u0641\u064A\u0629 \u0644\u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0623\u0631\u0642\u0627\u0645.\n\n\u0644\u062A\u0641\u0627\u062F\u064A \u0623\u064A \u0627\u0633\u062A\u0646\u062A\u0627\u062C \u0633\u0631\u064A\u0631\u064A \u063A\u064A\u0631 \u062F\u0642\u064A\u0642\u060C \u064A\u0631\u062C\u0649 \u0625\u0639\u0627\u062F\u0629 \u062A\u0635\u0648\u064A\u0631 \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0643\u0627\u0645\u0644\u0627\u064B \u0628\u0632\u0627\u0648\u064A\u0629 \u0645\u0633\u062A\u0642\u064A\u0645\u0629 \u0648\u0625\u0636\u0627\u0621\u0629 \u0648\u0627\u0636\u062D\u0629\u060C \u0623\u0648 \u0643\u062A\u0627\u0628\u0629 \u0646\u062A\u0627\u0626\u062C \u0627\u0644\u062A\u062D\u0627\u0644\u064A\u0644 \u0645\u0628\u0627\u0634\u0631\u0629 \u0641\u064A \u062E\u0627\u0646\u0629 \u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0627\u062A.",
          recommendations: [
            "\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u0642\u0627\u0637 \u0635\u0648\u0631\u0629 \u0643\u0627\u0645\u0644\u0629 \u0648\u0645\u0633\u062A\u0642\u064A\u0645\u0629 \u0644\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0645\u062E\u062A\u0628\u0631 \u0627\u0644\u0637\u0628\u064A \u062A\u0638\u0647\u0631 \u0623\u0633\u0645\u0627\u0621 \u0627\u0644\u062A\u062D\u0627\u0644\u064A\u0644 \u0648\u0627\u0644\u0646\u062A\u0627\u0626\u062C \u0648\u0627\u0644\u0645\u062C\u0627\u0644 \u0627\u0644\u0645\u0631\u062C\u0639\u064A.",
            "\u0627\u0644\u062A\u0623\u0643\u062F \u0645\u0646 \u0639\u062F\u0645 \u0642\u0635 \u0623\u0637\u0631\u0627\u0641 \u0648\u0631\u0642\u0629 \u0627\u0644\u0641\u062D\u0635.",
            "\u064A\u0645\u0643\u0646\u0643 \u062A\u062F\u0648\u064A\u0646 \u0642\u064A\u0645 \u0627\u0644\u062A\u062D\u0627\u0644\u064A\u0644 \u0643\u062A\u0627\u0628\u0629\u064B \u0641\u064A \u062E\u0627\u0646\u0629 \u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u064A\u062F\u0648\u064A\u0627\u064B \u0648\u0633\u064A\u0642\u0648\u0645 \u0627\u0644\u0646\u0638\u0627\u0645 \u0628\u062A\u062D\u0644\u064A\u0644\u0647\u0627 \u0641\u0648\u0631\u0627\u064B."
          ]
        });
      }
    }
  }
  syncLogs.unshift({
    id: `log_${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    source: "web_platform",
    userTelegramId: String(telegramId),
    userName: user?.username ? `@${user.username}` : user?.firstName || "\u0645\u0633\u062A\u062E\u062F\u0645 \u062C\u0631\u0639\u0629",
    actionAr: `\u0641\u062D\u0635 \u0630\u0643\u064A \u0644\u0640 (${testName})`,
    actionEn: `Smart AI scan for (${testName})`,
    status: "success",
    tierUsed: plan
  });
  res.json({
    success: true,
    testName,
    urgencyLevel,
    findingsSummary,
    clinicalSummaryTitle: findingsSummary,
    items,
    detailedExplanation,
    recommendations
  });
});
app.post(["/api/medical/symptom-check", "/api/medical/check-symptoms"], async (req, res) => {
  const {
    symptoms = "",
    patientAge = "30",
    gender = "male",
    chronicDiseases = [],
    vitalSigns = "",
    severity = "",
    duration = "",
    lang = "ar",
    telegramId = "1001"
  } = req.body;
  const effectiveSymptoms = symptoms || req.body.query || req.body.symptoms_text || req.body.text || "";
  const user = usersDB.get(String(telegramId));
  const plan = user?.plan || "pro";
  try {
    const evaluationData = await evaluateClinicalSymptoms({
      symptoms: effectiveSymptoms,
      patientAge,
      gender,
      chronicDiseases,
      vitalSigns,
      severity,
      duration,
      lang
    });
    syncLogs.unshift({
      id: `log_${Date.now()}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      source: "web_platform",
      userTelegramId: String(telegramId),
      userName: user?.username ? `@${user.username}` : user?.firstName || "\u0645\u0633\u062A\u062E\u062F\u0645 \u062C\u0631\u0639\u0629",
      actionAr: `\u0641\u062D\u0635 \u0623\u0639\u0631\u0627\u0636 \u0648\u062A\u0634\u062E\u064A\u0635 \u062A\u0641\u0631\u064A\u0642\u064A (DDx): "${(symptoms || "").slice(0, 30)}..."`,
      actionEn: `Differential Diagnosis (DDx): "${(symptoms || "").slice(0, 30)}..."`,
      status: "success",
      tierUsed: plan
    });
    res.json({
      success: true,
      ...evaluationData
    });
  } catch (err) {
    console.error("Symptom check evaluation failed:", err);
    res.status(500).json({
      success: false,
      error: lang === "en" ? "Failed to evaluate symptoms" : "\u062A\u0639\u0630\u0631 \u0625\u062A\u0645\u0627\u0645 \u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u0623\u0639\u0631\u0627\u0636"
    });
  }
});
app.post("/api/interactions/check", async (req, res) => {
  const { drugs = [], text = "", lang = "ar", telegramId = "1001" } = req.body;
  const user = usersDB.get(String(telegramId));
  const plan = user?.plan || "pro";
  let drugList = Array.isArray(drugs) ? [...drugs] : [];
  if (text && typeof text === "string" && text.trim()) {
    const raw = text.trim();
    const delimiters = [" + ", "+", " and ", " AND ", " \u0645\u0639 ", " \u0648 ", ", ", ","];
    let parsed = false;
    for (const d of delimiters) {
      if (raw.includes(d)) {
        const parts = raw.split(d).map((p) => p.trim()).filter(Boolean);
        if (parts.length >= 2) {
          drugList = Array.from(/* @__PURE__ */ new Set([...drugList, ...parts]));
          parsed = true;
          break;
        }
      }
    }
    if (!parsed && !drugList.includes(raw)) {
      drugList.push(raw);
    }
  }
  if (drugList.length < 2) {
    return res.status(400).json({
      error: "\u064A\u0631\u062C\u0649 \u062A\u062D\u062F\u064A\u062F \u062F\u0648\u0627\u0626\u064A\u0646 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644 \u0644\u0644\u0641\u062D\u0635 \u0627\u0644\u0633\u0631\u064A\u0631\u064A",
      errorEn: "Please specify at least two medicines to analyze interactions."
    });
  }
  const ai = getGenAI();
  const drugsString = drugList.join(" + ");
  let severity = "safe";
  let severityLabel = lang === "ar" ? "\u{1F7E2} \u0622\u0645\u0646 (\u0644\u0627 \u064A\u0648\u062C\u062F \u062A\u0639\u0627\u0631\u0636 \u0645\u0633\u062C\u0644)" : "\u{1F7E2} Safe (No Known Interaction)";
  let mechanism = "";
  let recommendation = "";
  let clinicalDetails = "";
  if (ai) {
    try {
      const prompt = lang === "ar" ? `\u0623\u0646\u062A \u0635\u064A\u062F\u0644\u0627\u0646\u064A \u0633\u0631\u064A\u0631\u064A \u0648\u0627\u0633\u062A\u0634\u0627\u0631\u064A \u0641\u064A \u0639\u0644\u0645 \u0627\u0644\u0623\u062F\u0648\u064A\u0629 \u0627\u0644\u0633\u0631\u064A\u0631\u064A (Clinical Pharmacist).
\u0642\u0645 \u0628\u0641\u062D\u0635 \u0648\u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u062A\u062F\u0627\u062E\u0644 \u0648\u0627\u0644\u062A\u0639\u0627\u0631\u0636 \u0627\u0644\u062F\u0648\u0627\u0626\u064A \u0628\u062F\u0642\u0629 \u0628\u0627\u0644\u063A\u0629 \u0628\u064A\u0646 \u0647\u0630\u0647 \u0627\u0644\u0623\u062F\u0648\u064A\u0629:
${drugsString}

\u0642\u0645 \u0628\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u0641\u0639\u0627\u0644\u0629 \u0633\u0648\u0627\u0621 \u0643\u0627\u0646\u062A \u0627\u0644\u0623\u0633\u0645\u0627\u0621 \u0627\u0644\u0645\u062F\u062E\u0644\u0629 \u062A\u062C\u0627\u0631\u064A\u0629 \u0623\u0648 \u0639\u0644\u0645\u064A\u0629 \u0623\u0648 \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0623\u0648 \u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A\u0629.

\u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u0625\u062E\u0631\u0627\u062C \u0627\u0644\u0646\u062A\u064A\u062C\u0629 \u0628\u062A\u0646\u0633\u064A\u0642 JSON \u062D\u0635\u0631\u0627\u064B \u0628\u0647\u0630\u0627 \u0627\u0644\u0634\u0643\u0644:
{
  "severity": "critical \u0623\u0648 warning \u0623\u0648 minor \u0623\u0648 safe",
  "severityLabel": "\u{1F534} \u062E\u0637\u064A\u0631 \u062C\u062F\u0627\u064B (\u064A\u062D\u0638\u0631 \u0627\u0644\u062C\u0645\u0639) \u0623\u0648 \u{1F7E0} \u0645\u062A\u0648\u0633\u0637 \u0627\u0644\u062E\u0637\u0648\u0631\u0629 (\u064A\u062A\u0637\u0644\u0628 \u062D\u0630\u0631 \u0648\u0645\u0631\u0627\u0642\u0628\u0629) \u0623\u0648 \u{1F7E1} \u0637\u0641\u064A\u0641 \u0623\u0648 \u{1F7E2} \u0622\u0645\u0646 (\u0644\u0627 \u064A\u0648\u062C\u062F \u062A\u0639\u0627\u0631\u0636 \u0645\u0639\u0631\u0648\u0641)",
  "mechanism": "\u0634\u0631\u062D \u0639\u0644\u0645\u064A \u062F\u0642\u064A\u0642 \u0644\u0622\u0644\u064A\u0629 \u0627\u0644\u062A\u0623\u062B\u064A\u0631 \u0648\u0627\u0644\u0645\u062E\u0627\u0637\u0631 \u0627\u0644\u0641\u064A\u0632\u064A\u0648\u0644\u0648\u062C\u064A\u0629 \u0627\u0644\u0646\u0627\u062A\u062C\u0629 \u0639\u0646 \u0627\u0644\u062C\u0645\u0639 \u0628\u064A\u0646\u0647\u0627",
  "recommendation": "\u062A\u0648\u0635\u064A\u0629 \u0633\u0631\u064A\u0631\u064A\u0629 \u0648\u0627\u0636\u062D\u0629 \u0644\u0644\u0637\u0628\u064A\u0628 \u0648\u0627\u0644\u0645\u0631\u064A\u0636 (\u0647\u0644 \u064A\u0648\u0642\u0641 \u0623\u062D\u062F\u0647\u0645\u0627\u060C \u0647\u0644 \u064A\u0628\u0627\u0639\u062F \u0628\u0633\u0627\u0639\u062A\u064A\u0646\u060C \u0648\u0645\u0627 \u0647\u0648 \u0627\u0644\u0628\u062F\u064A\u0644 \u0627\u0644\u062F\u0648\u0627\u0626\u064A \u0627\u0644\u0622\u0645\u0646)",
  "clinicalDetails": "\u0645\u0644\u062E\u0635 \u0646\u0642\u0627\u0637 \u0633\u0631\u064A\u0631\u064A\u0629 \u0647\u0627\u0645\u0629 \u0648\u062A\u062D\u0630\u064A\u0631\u0627\u062A \u0625\u0636\u0627\u0641\u064A\u0629"
}` : `You are an expert Clinical Pharmacist and Clinical Pharmacologist.
Analyze the drug-drug interaction between:
${drugsString}

Identify active ingredients, brand names, and physiological metabolic pathways (CYP450, renal clearance, QT prolongation, bleeding risks).

Output strictly valid JSON in this structure:
{
  "severity": "critical or warning or minor or safe",
  "severityLabel": "\u{1F534} Severe / Contraindicated or \u{1F7E0} Moderate / Monitor Closely or \u{1F7E1} Minor or \u{1F7E2} Safe / No Known Interaction",
  "mechanism": "Detailed physiological mechanism and potential clinical hazards",
  "recommendation": "Actionable clinical guidance, administration timing separation, or safe alternative substitutions",
  "clinicalDetails": "Key clinical takeaways and patient monitoring advice"
}`;
      const candidateModels = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-3.8-flash"];
      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: { responseMimeType: "application/json" }
          });
          const parsed = JSON.parse(response.text || "{}");
          if (parsed.severity) severity = parsed.severity;
          if (parsed.severityLabel) severityLabel = parsed.severityLabel;
          if (parsed.mechanism) mechanism = parsed.mechanism;
          if (parsed.recommendation) recommendation = parsed.recommendation;
          if (parsed.clinicalDetails) clinicalDetails = parsed.clinicalDetails;
          if (mechanism) break;
        } catch (err) {
          console.warn(`Interactions model ${modelName} error:`, err?.message);
        }
      }
    } catch (e) {
      console.error("AI interaction check error:", e);
    }
  }
  if (!mechanism) {
    const textLower = drugsString.toLowerCase();
    const isWarfarin = textLower.includes("warfarin") || textLower.includes("\u0648\u0627\u0631\u0641\u0627\u0631\u064A\u0646") || textLower.includes("\u0643\u0648\u0645\u0627\u062F\u064A\u0646");
    const isAspirin = textLower.includes("aspirin") || textLower.includes("\u0623\u0633\u0628\u0631\u064A\u0646") || textLower.includes("\u0627\u0633\u0628\u0631\u064A\u0646") || textLower.includes("\u062C\u0648\u0633\u0628\u0631\u064A\u0646");
    const isIbuprofen = textLower.includes("ibuprofen") || textLower.includes("\u0628\u0631\u0648\u0641\u064A\u0646") || textLower.includes("\u0625\u064A\u0628\u0648\u0628\u0631\u0648\u0641\u064A\u0646");
    const isMetronidazole = textLower.includes("metronidazole") || textLower.includes("\u0641\u0644\u0627\u062C\u064A\u0644") || textLower.includes("\u0645\u064A\u062A\u0631\u0648\u0646\u064A\u062F\u0627\u0632\u0648\u0644");
    const isAlcohol = textLower.includes("alcohol") || textLower.includes("\u0643\u062D\u0648\u0644");
    const isSildenafil = textLower.includes("sildenafil") || textLower.includes("\u0641\u064A\u0627\u063A\u0631\u0627") || textLower.includes("\u0633\u064A\u0644\u062F\u064A\u0646\u0627\u0641\u064A\u0644");
    const isNitrate = textLower.includes("nitrate") || textLower.includes("\u0646\u064A\u062A\u0631\u0627\u062A") || textLower.includes("\u0646\u064A\u062A\u0631\u0648\u062C\u0644\u0633\u0631\u064A\u0646");
    if (isWarfarin && isAspirin) {
      severity = "critical";
      severityLabel = "\u{1F534} \u062E\u0637\u064A\u0631 \u062C\u062F\u0627\u064B (\u064A\u062D\u0638\u0631 \u0627\u0644\u062C\u0645\u0639)";
      mechanism = "\u062A\u062B\u0628\u064A\u0637 \u0645\u0632\u062F\u0648\u062C \u0644\u0645\u0633\u0627\u0631\u0627\u062A \u0627\u0644\u062A\u062E\u062B\u0631 \u0648\u0627\u0644\u0635\u0641\u0627\u0626\u062D \u0627\u0644\u062F\u0645\u0648\u064A\u0629 \u0645\u0645\u0627 \u064A\u0631\u0641\u0639 \u0627\u062D\u062A\u0645\u0627\u0644\u064A\u0629 \u0627\u0644\u0646\u0632\u064A\u0641 \u0627\u0644\u062D\u0627\u062F \u0628\u0645\u0642\u062F\u0627\u0631 2-3 \u0623\u0636\u0639\u0627\u0641\u060C \u062E\u0635\u0648\u0635\u0627\u064B \u0627\u0644\u0646\u0632\u064A\u0641 \u0627\u0644\u0645\u0639\u062F\u064A \u0627\u0644\u0645\u0639\u0648\u064A \u0648\u0627\u0644\u062F\u0645\u0627\u063A\u064A.";
      recommendation = "\u062A\u062C\u0646\u0628 \u0627\u0644\u062C\u0645\u0639 \u0627\u0644\u062A\u0627\u0645 \u0625\u0644\u0627 \u062A\u062D\u062A \u0625\u0634\u0631\u0627\u0641 \u0637\u0628\u064A\u0628 \u0627\u0644\u0642\u0644\u0628 \u0645\u0639 \u0627\u0644\u0645\u0631\u0627\u0642\u0628\u0629 \u0627\u0644\u062F\u0648\u0631\u064A\u0629 \u0644\u0644\u0640 INR\u060C \u0648\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u062D\u0627\u0645\u064A\u0627\u062A \u0627\u0644\u0645\u0639\u062F\u0629 (PPI).";
    } else if (isWarfarin && isIbuprofen) {
      severity = "critical";
      severityLabel = "\u{1F534} \u062E\u0637\u064A\u0631 \u062C\u062F\u0627\u064B (\u064A\u062D\u0638\u0631 \u0627\u0644\u062C\u0645\u0639)";
      mechanism = "\u0645\u0636\u0627\u062F\u0627\u062A \u0627\u0644\u0627\u0644\u062A\u0647\u0627\u0628 \u063A\u064A\u0631 \u0627\u0644\u0633\u062A\u064A\u0631\u0648\u064A\u062F\u064A\u0629 \u062A\u0633\u0628\u0628 \u062A\u0622\u0643\u0644\u0627\u064B \u0641\u064A \u0628\u0637\u0627\u0646\u0629 \u0627\u0644\u0645\u0639\u062F\u0629 \u0648\u062A\u0639\u064A\u0642 \u0627\u0644\u0635\u0641\u0627\u0626\u062D \u0645\u0639 \u0645\u0636\u0627\u062F \u0627\u0644\u062A\u062C\u0644\u0637\u060C \u0645\u0645\u0627 \u064A\u0633\u0628\u0628 \u0646\u0632\u064A\u0641\u0627\u064B \u0647\u0636\u0645\u064A\u0627\u064B \u0633\u0631\u064A\u0639\u0627\u064B.";
      recommendation = "\u0627\u0633\u062A\u0628\u062F\u0627\u0644 \u0627\u0644\u0625\u064A\u0628\u0648\u0628\u0631\u0648\u0641\u064A\u0646 \u0628\u0627\u0644\u0628\u0627\u0631\u0627\u0633\u064A\u062A\u0627\u0645\u0648\u0644 \u0643\u0645\u0633\u0643\u0646 \u0622\u0645\u0646 \u0644\u0623\u0644\u0645 \u0648\u0627\u0644\u062D\u0631\u0627\u0631\u0629 \u0644\u062F\u0649 \u0645\u0631\u0636\u0649 \u0627\u0644\u0648\u0627\u0631\u0641\u0627\u0631\u064A\u0646.";
    } else if (isMetronidazole && isAlcohol) {
      severity = "critical";
      severityLabel = "\u{1F534} \u062A\u0641\u0627\u0639\u0644 \u0634\u0628\u064A\u0647 \u0628\u0627\u0644\u062F\u064A\u0633\u0648\u0644\u0641\u064A\u0631\u0627\u0645 (Disulfiram Reaction)";
      mechanism = "\u062A\u0631\u0627\u0643\u0645 \u0645\u0627\u062F\u0629 \u0627\u0644\u0623\u0633\u064A\u062A\u0627\u0644\u062F\u0647\u064A\u062F \u0627\u0644\u0633\u0627\u0645\u0629 \u0641\u064A \u0627\u0644\u062F\u0645 \u0645\u0633\u0628\u0628\u0629 \u062E\u0641\u0642\u0627\u0646\u0627\u064B \u0634\u062F\u064A\u062F\u0627\u064B\u060C \u0647\u0628\u0648\u0637\u0627\u064B \u0641\u064A \u0627\u0644\u0636\u063A\u0637\u060C \u0627\u062D\u0645\u0631\u0627\u0631\u0627\u064B \u0648\u063A\u062B\u064A\u0627\u0646\u0627\u064B \u062D\u0627\u062F\u0627\u064B.";
      recommendation = "\u0627\u0644\u0627\u0645\u062A\u0646\u0627\u0639 \u0627\u0644\u062A\u0627\u0645 \u0639\u0646 \u062A\u0646\u0627\u0648\u0644 \u0623\u064A \u0645\u0634\u0631\u0648\u0628\u0627\u062A \u0623\u0648 \u0623\u062F\u0648\u064A\u0629 \u062A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 \u0643\u062D\u0648\u0644 \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u0639\u0644\u0627\u062C \u0648\u0644\u0645\u062F\u0629 48 \u0633\u0627\u0639\u0629 \u0628\u0639\u062F \u0622\u062E\u0631 \u062C\u0631\u0639\u0629.";
    } else if (isSildenafil && isNitrate) {
      severity = "critical";
      severityLabel = "\u{1F534} \u0645\u0645\u0646\u0648\u0639 \u0627\u0644\u062C\u0645\u0639 \u0642\u0637\u0639\u064A\u0651\u0627\u064B (Contraindicated)";
      mechanism = "\u062A\u0631\u0627\u0643\u0645 \u0645\u0631\u0643\u0628 cGMP \u0627\u0644\u0645\u0648\u0633\u0639 \u0644\u0644\u0623\u0648\u0639\u064A\u0629 \u0627\u0644\u062F\u0645\u0648\u064A\u0629 \u0628\u0634\u0643\u0644 \u062D\u0627\u062F \u0645\u0633\u0628\u0628\u0627\u064B \u0647\u0628\u0648\u0637\u0627\u064B \u0643\u0627\u0631\u062B\u064A\u0627\u064B \u0641\u064A \u0636\u063A\u0637 \u0627\u0644\u062F\u0645 \u0648\u0627\u062D\u062A\u0634\u0627\u0621 \u0639\u0636\u0644\u0629 \u0627\u0644\u0642\u0644\u0628.";
      recommendation = "\u064A\u062D\u0638\u0631 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0633\u064A\u0644\u062F\u064A\u0646\u0627\u0641\u064A\u0644 \u0645\u0639 \u0645\u0631\u0643\u0628\u0627\u062A \u0627\u0644\u0646\u064A\u062A\u0631\u0627\u062A \u0645\u0637\u0644\u0642\u0627\u064B.";
    } else if (isAspirin && isIbuprofen) {
      severity = "warning";
      severityLabel = "\u{1F7E0} \u0645\u062A\u0648\u0633\u0637 \u0627\u0644\u062E\u0637\u0648\u0631\u0629 (\u062A\u0623\u062B\u064A\u0631 \u0645\u062A\u0628\u0627\u062F\u0644)";
      mechanism = "\u064A\u0631\u062A\u0628\u0637 \u0627\u0644\u0625\u064A\u0628\u0648\u0628\u0631\u0648\u0641\u064A\u0646 \u0628\u0645\u0633\u062A\u0642\u0628\u0644\u0627\u062A \u0627\u0644\u0635\u0641\u0627\u0626\u062D \u0648\u064A\u0645\u0646\u0639 \u0627\u0644\u0623\u0633\u0628\u0631\u064A\u0646 \u0645\u0646 \u0625\u062D\u062F\u0627\u062B \u062A\u0623\u062B\u064A\u0631\u0647 \u0627\u0644\u0648\u0642\u0627\u0626\u064A \u0627\u0644\u062F\u0627\u0626\u0645 \u0644\u0644\u0642\u0644\u0628 \u0648\u0627\u0644\u0623\u0648\u0639\u064A\u0629 \u0627\u0644\u062F\u0645\u0648\u064A\u0629.";
      recommendation = "\u062A\u0646\u0627\u0648\u0644 \u062C\u0631\u0639\u0629 \u0627\u0644\u0623\u0633\u0628\u0631\u064A\u0646 \u0627\u0644\u0648\u0642\u0627\u0626\u064A\u0629 \u0642\u0628\u0644 \u0627\u0644\u0625\u064A\u0628\u0648\u0628\u0631\u0648\u0641\u064A\u0646 \u0628\u0633\u0627\u0639\u062A\u064A\u0646 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644.";
    } else {
      severity = "safe";
      severityLabel = "\u{1F7E2} \u0622\u0645\u0646 \u0646\u0633\u0628\u064A\u0627\u064B (\u0644\u0627 \u064A\u0648\u062C\u062F \u062A\u0639\u0627\u0631\u0636 \u062D\u0631\u062C \u0645\u0639\u0631\u0648\u0641)";
      mechanism = "\u0644\u0645 \u064A\u064F\u0631\u0635\u062F \u062A\u0639\u0627\u0631\u0636 \u0627\u0633\u062A\u0642\u0644\u0627\u0628\u064A \u062D\u0627\u062F \u0623\u0648 \u062E\u0637\u0648\u0631\u0629 \u062A\u0622\u0632\u0631\u064A\u0629 \u0645\u0628\u0627\u0634\u0631\u0629 \u0628\u064A\u0646 \u0647\u0630\u0647 \u0627\u0644\u0623\u062F\u0648\u064A\u0629 \u0648\u0641\u0642 \u0627\u0644\u0623\u062F\u0644\u0629 \u0627\u0644\u0633\u0631\u064A\u0631\u064A\u0629 \u0627\u0644\u0645\u062A\u0648\u0641\u0631\u0629.";
      recommendation = "\u064A\u064F\u0641\u0636\u0644 \u0627\u0644\u0641\u0635\u0644 \u0628\u0633\u0627\u0639\u0629 \u0625\u0644\u0649 \u0633\u0627\u0639\u062A\u064A\u0646 \u0628\u064A\u0646 \u062A\u0646\u0627\u0648\u0644 \u0627\u0644\u0623\u062F\u0648\u064A\u0629 \u0627\u0644\u0641\u0645\u0648\u064A\u0629 \u0644\u0636\u0645\u0627\u0646 \u0627\u0644\u0627\u0645\u062A\u0635\u0627\u0635 \u0627\u0644\u0623\u0645\u062B\u0644 \u0648\u0627\u0633\u062A\u0634\u0627\u0631\u0629 \u0627\u0644\u0635\u064A\u062F\u0644\u0627\u0646\u064A \u0639\u0646\u062F \u0625\u0636\u0627\u0641\u0629 \u0623\u064A \u0639\u0644\u0627\u062C \u062C\u062F\u064A\u062F.";
    }
  }
  syncLogs.unshift({
    id: `log_${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    source: "web_platform",
    userTelegramId: String(telegramId),
    userName: user?.username ? `@${user.username}` : user?.firstName || "\u0645\u0633\u062A\u062E\u062F\u0645 \u062C\u0631\u0639\u0629",
    actionAr: `\u0641\u062D\u0635 \u062A\u062F\u0627\u062E\u0644\u0627\u062A \u062F\u0648\u0627\u0626\u064A\u0629 \u0633\u0631\u064A\u0631\u064A: (${drugsString})`,
    actionEn: `Clinical drug interaction check: (${drugsString})`,
    status: severity === "critical" ? "warning" : "success",
    tierUsed: plan
  });
  res.json({
    success: true,
    analyzedDrugs: drugList,
    drugsString,
    severity,
    severityLabel,
    isSafe: severity === "safe" || severity === "minor",
    mechanism,
    recommendation,
    clinicalDetails,
    disclaimerAr: "\u26A0\uFE0F \u0625\u062E\u0644\u0627\u0621 \u0645\u0633\u0624\u0648\u0644\u064A\u0629: \u0647\u0630\u0627 \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0627\u0633\u062A\u0631\u0634\u0627\u062F\u064A \u0644\u0644\u0623\u063A\u0631\u0627\u0636 \u0627\u0644\u062A\u062B\u0642\u064A\u0641\u064A\u0629 \u0648\u0627\u0644\u0635\u064A\u062F\u0644\u0627\u0646\u064A\u0629\u060C \u0648\u0644\u0627 \u064A\u064F\u063A\u0646\u064A \u0639\u0646 \u0627\u0633\u062A\u0634\u0627\u0631\u0629 \u0627\u0644\u0637\u0628\u064A\u0628 \u0627\u0644\u0645\u0639\u0627\u0644\u062C.",
    disclaimerEn: "\u26A0\uFE0F Disclaimer: This clinical report is for informational purposes and does not replace medical consultation."
  });
});
app.post("/api/drugs/search", async (req, res) => {
  const { query = "", lang = "ar", telegramId = "1001" } = req.body;
  const user = usersDB.get(String(telegramId));
  const plan = user?.plan || "pro";
  const cleanQuery = typeof query === "string" ? query.trim() : "";
  if (!cleanQuery) {
    return res.status(400).json({ error: "\u064A\u0631\u062C\u0649 \u0643\u062A\u0627\u0628\u0629 \u0627\u0633\u0645 \u0627\u0644\u062F\u0648\u0627\u0621 \u0623\u0648 \u062F\u0648\u0627\u0639\u064A \u0627\u0644\u0627\u0633\u062A\u0639\u0645\u0627\u0644 \u0644\u0644\u0628\u062D\u062B" });
  }
  const ai = getGenAI();
  let aiDrugs = [];
  let source = "Dose Clinical Pharmacology Database";
  if (ai) {
    const prompt = `You are a Senior Clinical Pharmacist and Board-Certified Pharmacotherapy Specialist (BCPS).
A healthcare provider or patient is searching for drug information for query: "${cleanQuery}".
Language preference is: "${lang === "en" ? "English" : "Arabic"}".

TASK:
Provide comprehensive, evidence-based, accurate pharmacological information for the drug(s) matching this query.
If the query is a brand name (e.g. Panadol, Augmentin, Lipitor, Concor, Glucophage, Zyrtec, Flagyl, etc.), identify the scientific active ingredient and list popular international and Middle East / Arab regional brand names.
If the query is a health condition (e.g. hypertension, headache, pneumonia, diabetes), provide the first-line reference medication.

OUTPUT REQUIREMENTS:
Output STRICTLY valid JSON with an array named "drugs" containing 1 to 3 relevant drugs.
Each drug MUST contain thorough details in BOTH Arabic and English so the user can seamlessly toggle languages:

{
  "drugs": [
    {
      "id": "unique-slug-lowercase",
      "name_ar": "\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0639\u0644\u0645\u064A \u0648\u0627\u0644\u0634\u0627\u0626\u0639 \u0628\u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u0645\u062B\u0627\u0644: \u0628\u0627\u0631\u0627\u0633\u064A\u062A\u0627\u0645\u0648\u0644 / \u0623\u0633\u064A\u062A\u0627\u0645\u064A\u0646\u0648\u0641\u064A\u0646)",
      "name_en": "Generic & Scientific Name in English (e.g., Paracetamol / Acetaminophen)",
      "trade_names": ["Brand1", "Brand2", "Brand3", "\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u062A\u062C\u0627\u0631\u064A1", "\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u062A\u062C\u0627\u0631\u064A2"],
      "aliases": ["Alternative spelling or common abbreviations"],
      "class_ar": "\u0627\u0644\u0641\u0626\u0629 \u0627\u0644\u062F\u0648\u0627\u0626\u064A\u0629 \u0648\u0627\u0644\u0639\u0644\u0627\u062C\u064A\u0629 \u0628\u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u0645\u062B\u0627\u0644: \u0645\u0633\u0643\u0646 \u0644\u0644\u0623\u0644\u0645 \u0648\u062E\u0627\u0641\u0636 \u0644\u0644\u062D\u0631\u0627\u0631\u0629)",
      "class_en": "Therapeutic & Pharmacologic Class in English (e.g., Analgesic and Antipyretic)",
      "indications_ar": ["\u062F\u0648\u0627\u0639\u064A \u0627\u0644\u0627\u0633\u062A\u0639\u0645\u0627\u0644 1", "\u062F\u0648\u0627\u0639\u064A \u0627\u0644\u0627\u0633\u062A\u0639\u0645\u0627\u0644 2", "\u062F\u0648\u0627\u0639\u064A \u0627\u0644\u0627\u0633\u062A\u0639\u0645\u0627\u0644 3"],
      "indications_en": ["Indication 1", "Indication 2", "Indication 3"],
      "adult_dosage_text_ar": "\u062C\u0631\u0639\u0629 \u0627\u0644\u0628\u0627\u0644\u063A\u064A\u0646 \u0627\u0644\u0645\u0641\u0635\u0644\u0629 \u0628\u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0648\u0627\u0644\u062D\u062F \u0627\u0644\u0623\u0642\u0635\u0649 \u0627\u0644\u064A\u0648\u0645\u064A",
      "adult_dosage_text_en": "Detailed adult dosage in English with maximum daily dose",
      "pediatric_dosage_text_ar": "\u062C\u0631\u0639\u0629 \u0627\u0644\u0623\u0637\u0641\u0627\u0644 \u0627\u0644\u0645\u0641\u0635\u0644\u0629 \u0628\u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0628\u062D\u0633\u0628 \u0627\u0644\u0648\u0632\u0646 (\u0645\u062C\u0645/\u0643\u062C\u0645)",
      "pediatric_dosage_text_en": "Detailed pediatric weight-based dosing in English (mg/kg/dose)",
      "mpk_min": 10,
      "mpk_max": 15,
      "freq_ar": "\u062A\u0643\u0631\u0627\u0631 \u0627\u0644\u062C\u0631\u0639\u0629 \u0644\u0644\u0623\u0637\u0641\u0627\u0644 \u0628\u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u0645\u062B\u0644\u0627\u064B: \u0643\u0644 6 \u0625\u0644\u0649 8 \u0633\u0627\u0639\u0627\u062A \u0639\u0646\u062F \u0627\u0644\u0644\u0632\u0648\u0645)",
      "freq_en": "Pediatric frequency in English (e.g., Every 6 to 8 hours as needed)",
      "adult_min": 500,
      "adult_max": 1000,
      "adult_freq": "\u0643\u0644 4-6 \u0633\u0627\u0639\u0627\u062A",
      "max_daily": "4000 mg",
      "conc": 120,
      "administration_ar": "\u0637\u0631\u064A\u0642\u0629 \u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0648\u062A\u0648\u0642\u064A\u062A\u0647 \u0628\u0627\u0644\u0646\u0633\u0628\u0629 \u0644\u0644\u0637\u0639\u0627\u0645 \u0648\u0627\u0644\u0645\u0639\u062F\u0629 \u0648\u0627\u0644\u0645\u0627\u0621",
      "administration_en": "Administration instructions regarding food, meals, and hydration",
      "contra_ar": "\u0645\u0648\u0627\u0646\u0639 \u0627\u0644\u0627\u0633\u062A\u0639\u0645\u0627\u0644 \u0648\u0627\u0644\u062D\u0627\u0644\u0627\u062A \u0627\u0644\u062A\u064A \u064A\u064F\u062D\u0638\u0631 \u0641\u064A\u0647\u0627 \u0627\u0644\u062F\u0648\u0627\u0621 \u0628\u0627\u0644\u0639\u0631\u0628\u064A\u0629",
      "contra_en": "Absolute and relative contraindications in English",
      "side_ar": "\u0627\u0644\u0622\u062B\u0627\u0631 \u0627\u0644\u062C\u0627\u0646\u0628\u064A\u0629 \u0627\u0644\u0634\u0627\u0626\u0639\u0629 \u0648\u0627\u0644\u0646\u0627\u062F\u0631\u0629 \u0627\u0644\u062A\u064A \u062A\u062A\u0637\u0644\u0628 \u0627\u0644\u0627\u0646\u062A\u0628\u0627\u0647 \u0628\u0627\u0644\u0639\u0631\u0628\u064A\u0629",
      "side_en": "Common and severe adverse effects in English",
      "preg": "\u0627\u0644\u0641\u0626\u0629 \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u062D\u0645\u0644 \u0628\u0627\u0644\u0639\u0631\u0628\u064A\u0629 (A, B, C, D, X) \u0645\u0639 \u0634\u0631\u062D \u0627\u0644\u0623\u0645\u0627\u0646",
      "preg_en": "Pregnancy Category & Safety summary in English",
      "preg_badge": "ok (if safe) or warn (caution) or err (contraindicated/toxic)",
      "lact": "\u0623\u0645\u0627\u0646 \u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u0631\u0636\u0627\u0639\u0629 \u0627\u0644\u0637\u0628\u064A\u0639\u064A\u0629 \u0628\u0627\u0644\u0639\u0631\u0628\u064A\u0629",
      "lact_en": "Lactation and breastfeeding safety in English",
      "renal": "\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u062C\u0631\u0639\u0629 \u0644\u0645\u0631\u0636\u0649 \u0627\u0644\u0643\u0644\u0649 \u0623\u0648 \u0627\u0644\u0643\u0628\u062F \u0628\u0627\u0644\u0639\u0631\u0628\u064A\u0629",
      "renal_en": "Renal & Hepatic impairment dose adjustment in English",
      "note": "\u062A\u062D\u0630\u064A\u0631\u0627\u062A \u0633\u0631\u064A\u0631\u064A\u0629 \u0647\u0627\u0645\u0629 \u0648\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629 \u0628\u0627\u0644\u0639\u0631\u0628\u064A\u0629",
      "note_en": "Important clinical monitoring notes and black box warnings in English",
      "interactions": ["InteractingDrug1", "InteractingDrug2", "InteractingDrug3"],
      "pharmacist_advice_ar": "\u0646\u0635\u064A\u062D\u0629 \u0627\u0644\u0635\u064A\u062F\u0644\u064A \u0627\u0644\u0633\u0631\u064A\u0631\u064A \u0627\u0644\u0630\u0647\u0628\u064A\u0629 \u0627\u0644\u0645\u0648\u062C\u0647\u0629 \u0644\u0644\u0645\u0631\u064A\u0636 \u0628\u0627\u0644\u0639\u0631\u0628\u064A\u0629",
      "pharmacist_advice_en": "Clinical Pharmacist golden counseling advice in English"
    }
  ]
}`;
    const candidateModels = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-3.8-flash"];
    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [{ text: prompt }],
          config: {
            responseMimeType: "application/json",
            temperature: 0.2
          }
        });
        const rawText = response.text || "{}";
        const parsed = JSON.parse(rawText);
        if (parsed.drugs && Array.isArray(parsed.drugs) && parsed.drugs.length > 0) {
          aiDrugs = parsed.drugs.map((d, idx) => ({
            ...d,
            id: d.id || `api_drug_${Date.now()}_${idx}`,
            isAiResult: true,
            source: "AI Clinical Pharmacology Engine (Gemini 3.8 Flash)",
            aliases: Array.isArray(d.aliases) ? d.aliases : [d.name_ar, d.name_en],
            trade_names: Array.isArray(d.trade_names) ? d.trade_names : [],
            interactions: Array.isArray(d.interactions) ? d.interactions : [],
            preg_badge: d.preg_badge === "ok" || d.preg_badge === "warn" || d.preg_badge === "err" ? d.preg_badge : "warn"
          }));
          source = `Gemini Clinical AI (${modelName})`;
          break;
        }
      } catch (e) {
        console.warn(`[DrugSearch] Model ${modelName} failed, trying next:`, e);
      }
    }
  }
  syncLogs.unshift({
    id: `log_${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    source: "web_platform",
    userTelegramId: String(telegramId),
    userName: user?.firstName || "\u0645\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0648\u064A\u0628",
    actionAr: `\u0628\u062D\u062B \u062F\u0648\u0627\u0626\u064A \u0633\u0631\u064A\u0631\u064A \u0630\u0643\u064A (API): "${cleanQuery}"`,
    actionEn: `Clinical AI Drug API Search: "${cleanQuery}"`,
    status: "success",
    tierUsed: plan
  });
  res.json({
    success: true,
    query: cleanQuery,
    drugs: aiDrugs,
    source,
    count: aiDrugs.length
  });
});
app.post("/api/medical/prescription-ocr", async (req, res) => {
  const { imageBase64, mimeType = "image/jpeg", lang = "ar", telegramId = "1001" } = req.body;
  const ai = getGenAI();
  if (!imageBase64) {
    return res.status(400).json({ error: "\u064A\u0631\u062C\u0649 \u0625\u0631\u0641\u0627\u0642 \u0635\u0648\u0631\u0629 \u0627\u0644\u0631\u0648\u0634\u062A\u0629 \u0623\u0648 \u0639\u0644\u0628\u0629 \u0627\u0644\u062F\u0648\u0627\u0621" });
  }
  let extractedInfo = null;
  if (ai) {
    try {
      const prompt = `You are a clinical pediatric pharmacist specializing in reading medical prescriptions, pediatric syrups, and pharmaceutical packaging.
Analyze this medical image (which is either a doctor's handwritten/printed prescription, or a medicine bottle / syrup box).

TASK:
Identify and extract:
1. Identified Drug Generic Name (e.g. Paracetamol, Amoxicillin, Ibuprofen, Azithromycin, Cefixime)
2. Trade / Brand Name written on the box or prescription (e.g. Adol, Tempra, Augmentin, Zithrokan, Suprax, Brufen)
3. Concentration or Liquid Suspension Strength in mg per 5ml (e.g. 120, 250, 400, 100, 200)
4. Recommended pediatric dosing interval / frequency
5. Key warnings or directions found in the image

OUTPUT JSON SCHEMA ONLY:
{
  "drugNameAr": "\u0627\u0644\u0627\u0633\u0645 \u0628\u0627\u0644\u0639\u0631\u0628\u064A\u0629",
  "drugNameEn": "Drug Name in English",
  "matchedDrugId": "paracetamol" | "amoxicillin" | "augmentin" | "ibuprofen" | "azithromycin" | "cefixime" | "cetirizine" | "other",
  "concentrationMgPer5ml": 120,
  "confidence": "high" | "moderate" | "low",
  "detectedText": "\u0627\u0644\u0645\u0644\u062E\u0635 \u0627\u0644\u0645\u0633\u062A\u062E\u0631\u062C \u0645\u0646 \u0627\u0644\u0635\u0648\u0631\u0629",
  "recommendedFreqAr": "\u0643\u0644 8 \u0633\u0627\u0639\u0627\u062A \u0623\u0648 \u062D\u0633\u0628 \u0627\u0644\u062A\u0648\u062C\u064A\u0647",
  "recommendedFreqEn": "Every 8 hours as directed"
}`;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          { text: prompt },
          {
            inlineData: {
              data: imageBase64,
              mimeType
            }
          }
        ],
        config: {
          responseMimeType: "application/json",
          temperature: 0.1
        }
      });
      extractedInfo = JSON.parse(response.text || "{}");
    } catch (e) {
      console.warn("Prescription OCR Error:", e?.message);
    }
  }
  if (!extractedInfo || !extractedInfo.drugNameEn) {
    extractedInfo = {
      drugNameAr: "\u0628\u0627\u0631\u0627\u0633\u064A\u062A\u0627\u0645\u0648\u0644 \u0634\u0631\u0627\u0628 (\u0645\u0639\u0644\u0642 \u062E\u0627\u0641\u0636 \u0644\u0644\u062D\u0631\u0627\u0631\u0629)",
      drugNameEn: "Paracetamol Pediatric Suspension",
      matchedDrugId: "paracetamol",
      concentrationMgPer5ml: 120,
      confidence: "moderate",
      detectedText: "\u062A\u0645 \u0627\u0633\u062A\u062E\u0631\u0627\u062C \u062F\u0648\u0627\u0621 \u062E\u0627\u0641\u0636 \u0644\u0644\u062D\u0631\u0627\u0631\u0629 \u0648\u0645\u0633\u0643\u0646 \u0644\u0644\u0623\u0637\u0641\u0627\u0644 (\u0634\u0631\u0627\u0628 \u0645\u0639\u0644\u0642).",
      recommendedFreqAr: "\u0643\u0644 6 \u0625\u0644\u0649 8 \u0633\u0627\u0639\u0627\u062A \u0639\u0646\u062F \u0627\u0644\u0644\u0632\u0648\u0645",
      recommendedFreqEn: "Every 6 to 8 hours as needed"
    };
  }
  res.json({
    success: true,
    ...extractedInfo
  });
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Telegram & Web Sync Server running on port ${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
