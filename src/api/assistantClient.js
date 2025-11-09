// Lightweight assistant client that prefers a local MCP server for CyberRazor-specific QA.
// Returns an object { response: string, source?: string }

// Build MCP candidate endpoints in reasonable order:
// 1. runtime override: global.MCP_HOST (string like 'http://192.168.1.5:3333')
// 2. AsyncStorage 'MCP_HOST' set from device UI
// 3. Expo debugger host IP (for development on physical device)
// 4. Android emulator host 10.0.2.2
// 5. localhost
async function getMcpCandidates() {
  const list = [];

  // 1) runtime global override (highest priority)
  try {
    if (global && global.MCP_HOST) {
      const host = String(global.MCP_HOST).replace(/\/$/, "");
      list.push(`${host}/query`);
    }
  } catch (err) {}

  // 2) AsyncStorage override (settable from device UI)
  try {
    const AsyncStorage =
      require("@react-native-async-storage/async-storage").default;
    const stored = await AsyncStorage.getItem("MCP_HOST");
    if (stored) {
      const host = String(stored).replace(/\/$/, "");
      list.push(`${host}/query`);
    }
  } catch (err) {
    // AsyncStorage not available or error, continue
  }

  // 3) Expo debugger host IP
  try {
    const Constants = require("expo-constants");
    const manifest = Constants.manifest || Constants.expoConfig || {};
    const dbg =
      manifest.debuggerHost ||
      (manifest.packagerOpts && manifest.packagerHost) ||
      manifest.hostUri;
    if (dbg && typeof dbg === "string") {
      const ip = dbg.split(":")[0];
      if (ip && ip !== "localhost" && ip !== "127.0.0.1")
        list.push(`http://${ip}:3333/query`);
    }
  } catch (err) {}

  // 4) Android emulator common host (useful when running Android emulator)
  list.push("http://10.0.2.2:3333/query");

  // 5) localhost and explicit loopback (assistant-backend default uses port 3333)
  list.push("http://localhost:3333/query");
  list.push("http://127.0.0.1:3333/query");

  // Deduplicate
  return Array.from(new Set(list));
}

// Helper with timeout using AbortController
async function fetchWithTimeout(url, options = {}, timeout = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const resp = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return resp;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

async function queryMCP(question) {
  const candidates = await getMcpCandidates();
  for (const url of candidates) {
    try {
      console.log("[assistantClient] trying MCP at", url);
      const resp = await fetchWithTimeout(
        url,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question }),
        },
        7000,
      );

      if (!resp || !resp.ok) {
        console.warn(
          "[assistantClient] non-ok response from",
          url,
          "status:",
          resp && resp.status,
        );
        continue;
      }
      const data = await resp.json();
      console.log("[assistantClient] MCP response from", url, data);
      return data;
    } catch (err) {
      console.warn(
        "[assistantClient] MCP request failed for",
        url,
        err.message || err,
      );
      // try next candidate
    }
  }
  return null;
}

// Local Q->A map (lazy-loaded from assets/assistanttrain.txt)
let localQAMap = null;
let localMapLoaded = false;

const normalize = (s = "") => {
  return String(s)
    .toLowerCase()
    .replace(/\u2019/g, "'")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

// Levenshtein & fuzzy utilities
const levenshtein = (a = "", b = "") => {
  const al = a.length,
    bl = b.length;
  if (!al) return bl;
  if (!bl) return al;
  let prev = Array.from({ length: bl + 1 }, (_, j) => j);
  for (let i = 1; i <= al; i++) {
    const cur = [i];
    for (let j = 1; j <= bl; j++) {
      const ins = cur[j - 1] + 1;
      const del = prev[j] + 1;
      const rep = prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1);
      cur[j] = Math.min(ins, del, rep);
    }
    prev = cur;
  }
  return prev[bl];
};

const normalizedLevenshtein = (a = "", b = "") => {
  if (!a && !b) return 0;
  const d = levenshtein(a, b);
  const max = Math.max(a.length || 0, b.length || 0);
  return max ? d / max : 0;
};

const tokenSet = (s = "") => new Set((s || "").split(/\s+/).filter(Boolean));

const tokenOverlapScore = (a = "", b = "") => {
  const A = tokenSet(a);
  const B = tokenSet(b);
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  return inter / Math.max(A.size, B.size);
};

const fuzzyFindCanonical = (normQ, map) => {
  if (!map || map.size === 0) return null;
  let best = { key: null, answer: null, score: 0, lev: 1, overlap: 0 };
  for (const [k, a] of map.entries()) {
    const overlap = tokenOverlapScore(normQ, k);
    const lev = normalizedLevenshtein(normQ, k);
    const score = overlap * 0.7 + (1 - lev) * 0.3;
    if (score > best.score) best = { key: k, answer: a, score, lev, overlap };
  }
  return best.key ? best : null;
};

async function loadLocalQAMap() {
  if (localMapLoaded) return;
  localMapLoaded = true;
  try {
    const Asset = require("expo-asset").Asset;
    const FileSystem = require("expo-file-system");
    // asset path relative to src/api is '../../assets/assistanttrain.txt'
    const assetModule = require("../../assets/assistanttrain.txt");
    const asset = Asset.fromModule(assetModule);
    await asset.downloadAsync();
    const fileUri = asset.localUri || asset.uri;
    if (!fileUri) throw new Error("No asset URI for assistanttrain.txt");
    const content = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    const map = new Map();
    // Split into reasonable blocks and attempt to parse Q/A pairs
    const parts = content
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
    for (const p of parts) {
      // Try Q: / A:
      const qMatch = p.match(/Q\s*[:\-]\s*(.+)/i);
      const aMatch = p.match(/A\s*[:\-]\s*([\s\S]+)/i);
      if (qMatch && aMatch) {
        const q = qMatch[1].trim();
        const a = aMatch[1].trim();
        if (q) map.set(normalize(q), a);
        continue;
      }
      // Try first-line question then answer lines
      const lines = p
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length >= 2) {
        const q = lines[0].replace(/^\d+[\).\s]*/, "").trim();
        const a = lines.slice(1).join("\n").trim();
        if (q) map.set(normalize(q), a);
        continue;
      }
      // Fallback numbered extraction
      const numMatch = p.match(/^\s*\d+[\)\.]\s*(.+?)\s*[\r\n]+([\s\S]+)/);
      if (numMatch) {
        const q = numMatch[1].trim();
        const a = numMatch[2].trim();
        if (q) map.set(normalize(q), a);
      }
    }
    localQAMap = map;
    console.log(
      "[assistantClient] Loaded local Q->A map with",
      map.size,
      "entries",
    );
  } catch (err) {
    console.warn(
      "[assistantClient] Failed to load local assistanttrain.txt map",
      err && (err.message || err),
    );
    localQAMap = null;
  }
}

export const assistantService = {
  async sendMessage(message) {
    if (!message || typeof message !== "string") return { response: "" };

    // Prefer local canonical/fuzzy answers before contacting MCP
    try {
      await loadLocalQAMap();
      if (localQAMap && localQAMap.size > 0) {
        const norm = normalize(message);
        // Exact normalized match
        if (localQAMap.has(norm)) {
          const ans = localQAMap.get(norm);
          console.log(
            "[assistantClient] Local canonical exact match for:",
            message,
          );
          if (ans) return { response: ans, source: "local" };
        }
        // Fuzzy match
        const fuzzy = fuzzyFindCanonical(norm, localQAMap);
        if (fuzzy && fuzzy.score >= 0.55) {
          console.log("[assistantClient] Local canonical FUZZY match:", {
            query: message,
            matchedKey: fuzzy.key,
            score: fuzzy.score,
            overlap: fuzzy.overlap,
            normalizedLev: fuzzy.lev,
          });
          if (fuzzy.answer)
            return { response: fuzzy.answer, source: "local-fuzzy" };
        }
      }
    } catch (err) {
      console.warn(
        "[assistantClient] Local Q/A lookup failed",
        err && (err.message || err),
      );
      // continue to MCP fallback
    }

    // Try MCP server
    const mcp = await queryMCP(message);
    if (mcp) {
      if (mcp.inDomain === false) {
        return {
          response: "This is out of my scope or not related to CyberRazor.",
          source: "mcp",
        };
      }
      const ans = mcp.answer || mcp.response || mcp.text || null;
      if (ans) return { response: ans, source: mcp.source || "mcp" };
    }

    // Fallback canned logic (keeps app working offline)
    const q = message.toLowerCase();
    const irrelevant = [
      "weather",
      "recipe",
      "movie",
      "music",
      "sports",
      "travel",
      "bank",
      "finance",
      "stock",
      "shopping",
    ];
    if (irrelevant.some((k) => q.includes(k))) {
      return {
        response: "This is out of my scope or not related to CyberRazor.",
        source: "fallback",
      };
    }

    // Simple canned reply for common CyberRazor topics
    if (
      q.includes("install") ||
      q.includes("access") ||
      q.includes("sign in") ||
      q.includes("login") ||
      q.includes("how do i")
    ) {
      return {
        response:
          "For installation or access, refer to the app settings or the login page. If you need specific steps, tell me which platform (Android/iOS/backend).",
        source: "fallback",
      };
    }

    if (q.includes("what is cyberrazor") || q.includes("cyberrazor")) {
      return {
        response:
          "CyberRazor is an AI-based SOAR platform combining Wazuh, AI models, and a dashboard to detect and respond to threats.",
        source: "fallback",
      };
    }

    // Generic helpful fallback
    return {
      response:
        "I can help with CyberRazor-related questions: ask about alerts, threats, playbooks, integrations, or app usage.",
      source: "fallback",
    };
  },
};
