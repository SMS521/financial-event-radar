import React, { useState, useEffect } from "react";
import {
  Server,
  Activity,
  Key,
  Terminal,
  Send,
  Mail,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Database,
  Lock,
  ArrowRight,
  Zap,
  Globe,
  Sliders,
  HelpCircle,
  Code,
  TrendingUp
} from "lucide-react";
import { FredLiveExplorer } from "./FredLiveExplorer";
import { LiveMarketQuotes } from "./LiveMarketQuotes";

interface LiveBackendIntegrationHubProps {
  onClose?: () => void;
  onInjectEvent?: (event: any) => void;
}

export const LiveBackendIntegrationHub: React.FC<LiveBackendIntegrationHubProps> = ({ onClose, onInjectEvent }) => {
  const [activeTab, setActiveTab] = useState<"dual-mode" | "quotes-live" | "fred-live" | "secrets-guide" | "live-test" | "env-builder">("quotes-live");
  const [operatingMode, setOperatingMode] = useState<"cloud-live" | "fastapi-bridge">("cloud-live");
  
  // FastAPI Bridge settings
  const [fastApiUrl, setFastApiUrl] = useState("http://localhost:8000");
  const [webAppApiKey, setWebAppApiKey] = useState("");
  const [testEndpoint, setTestEndpoint] = useState("/api/status");
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Live quotes state from server
  const [liveQuotes, setLiveQuotes] = useState<any>(null);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Env values
  const [envValues, setEnvValues] = useState({
    telegramToken: "",
    telegramChatId: "",
    fredApiKey: "",
    webAppApiKey: "",
    gmailUser: "",
    gmailAppPassword: "",
  });

  // Telegram test alert state
  const [tgTestLoading, setTgTestLoading] = useState(false);
  const [tgDetectLoading, setTgDetectLoading] = useState(false);
  const [tgDetectMessage, setTgDetectMessage] = useState<string | null>(null);
  const [tgTestResult, setTgTestResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);

  // Email test alert state
  const [emailTestLoading, setEmailTestLoading] = useState(false);
  const [emailTestResult, setEmailTestResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);

  // Send test Email notification
  const sendEmailTestAlert = async () => {
    if (!envValues.gmailAppPassword) {
      setEmailTestResult({
        success: false,
        error: "Please enter your 16-character Gmail App Password first."
      });
      return;
    }

    setEmailTestLoading(true);
    setEmailTestResult(null);
    try {
      const res = await fetch("/api/email/test-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: envValues.gmailUser,
          pass: envValues.gmailAppPassword,
          to: "sahilshahphoto@gmail.com"
        })
      });
      const data = await res.json();
      setEmailTestResult(data);
    } catch (e: any) {
      setEmailTestResult({
        success: false,
        error: e.message || "Failed to reach email test endpoint"
      });
    } finally {
      setEmailTestLoading(false);
    }
  };

  // Auto-detect chat ID from getUpdates (uses server-configured TELEGRAM_BOT_TOKEN)
  const detectTelegramChatId = async () => {
    setTgDetectLoading(true);
    setTgDetectMessage(null);
    try {
      const res = await fetch("/api/telegram/detect-chat-id");
      const data = await res.json();
      if (data.found && data.chatId) {
        setEnvValues(prev => ({ ...prev, telegramChatId: data.chatId }));
        setTgDetectMessage(`✅ Detected Chat ID: ${data.chatId} (${data.senderName})`);
      } else {
        setTgDetectMessage(data.message || "No messages found yet. Please send a message to @FERRPMarketBot first.");
      }
    } catch (err: any) {
      setTgDetectMessage("Error checking Telegram API: " + err.message);
    } finally {
      setTgDetectLoading(false);
    }
  };

  // Send test Telegram notification
  const sendTelegramTestAlert = async () => {
    if (!envValues.telegramChatId) {
      setTgTestResult({
        success: false,
        error: "Please enter your numeric Telegram Chat ID first (Step 2)."
      });
      return;
    }

    setTgTestLoading(true);
    setTgTestResult(null);
    try {
      const res = await fetch("/api/telegram/test-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `🔔 <b>FERRP Market Intelligence Test Alert</b>\n\n✅ <b>Connected successfully!</b>\n🤖 Bot: @FERRPMarketBot\n🕒 Server Timestamp: ${new Date().toISOString()}\n\n<i>sahil-trader standing job & event alerts will be delivered to this chat.</i>`
        })
      });
      const data = await res.json();
      setTgTestResult(data);
    } catch (e: any) {
      setTgTestResult({
        success: false,
        error: e.message || "Failed to reach Telegram API"
      });
    } finally {
      setTgTestLoading(false);
    }
  };

  // Fetch live market quotes from Express proxy on mount
  const fetchLiveQuotes = async () => {
    setQuotesLoading(true);
    try {
      const res = await fetch("/api/market/quotes?symbols=SPY,QQQ,NVDA,AAPL,MSFT,TSLA,GLD,SLV");
      const data = await res.json();
      if (data.success) {
        setLiveQuotes(data.quotes);
      }
    } catch (e) {
      console.error("Failed to load live quotes", e);
    } finally {
      setQuotesLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveQuotes();
  }, []);

  // Test FastAPI connection via Express server-side bridge
  const runFastApiProbe = async () => {
    setTestLoading(true);
    setTestResult(null);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (webAppApiKey) {
        headers["Authorization"] = `Bearer ${webAppApiKey}`;
        headers["x-api-key"] = webAppApiKey;
      }
      const res = await fetch("/api/bridge/fastapi-proxy", {
        method: "POST",
        headers,
        body: JSON.stringify({
          targetUrl: fastApiUrl,
          apiKey: webAppApiKey,
          endpoint: testEndpoint
        })
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({
        success: false,
        error: err.message || "Failed to reach proxy service"
      });
    } finally {
      setTestLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const generateRandomApiKey = () => {
    const chars = "abcdef0123456789";
    let key = "ferrp_sec_";
    for (let i = 0; i < 24; i++) {
      key += chars[Math.floor(Math.random() * chars.length)];
    }
    setWebAppApiKey(key);
    setEnvValues(prev => ({ ...prev, webAppApiKey: key }));
  };

  const generatedEnvContent = `# sahil-trader / FERRP Production Environment Configuration
# Saved on local machine in .env

TELEGRAM_BOT_TOKEN="${envValues.telegramToken || 'your-telegram-bot-token-here'}"
TELEGRAM_CHAT_ID="${envValues.telegramChatId || 'your-telegram-chat-id-here'}"
FRED_API_KEY="${envValues.fredApiKey || 'your-fred-api-key-here'}"
WEBAPP_API_KEY="${envValues.webAppApiKey}"
GMAIL_USER="${envValues.gmailUser || 'sahilshahphoto@gmail.com'}"
GMAIL_APP_PASSWORD="${envValues.gmailAppPassword || '16-character-app-password'}"
`;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden text-slate-800">
      {/* Header bar */}
      <div className="bg-slate-900 text-white p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-md shadow-indigo-900/40">
            <Server className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                Live Data & Backend Bridge Hub
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/30 flex items-center space-x-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>DUAL-MODE ACTIVE</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Run standalone with Live Cloud Market Feeds (Option B) or connect to your local <code className="text-indigo-300 font-mono">sahil-trader</code> FastAPI daemon (Option A).
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
            >
              Close Hub
            </button>
          )}
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="border-b border-slate-200 bg-slate-50 px-6 flex items-center space-x-2 overflow-x-auto">
        {[
          { id: "quotes-live", label: "⚡ Real-Time Stock & Ticker Streamer", icon: TrendingUp },
          { id: "fred-live", label: "📈 Live St. Louis Fed / FRED Explorer", icon: TrendingUp },
          { id: "dual-mode", label: "⚡ Live Dual-Mode Architecture", icon: Sliders },
          { id: "secrets-guide", label: "🔑 Step-by-Step Secrets Setup", icon: Key },
          { id: "env-builder", label: "📝 .env Generator & Discovery", icon: Terminal },
          { id: "live-test", label: "🧪 FastAPI Bridge Tester", icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3.5 px-4 text-xs font-semibold border-b-2 flex items-center space-x-2 whitespace-nowrap cursor-pointer transition-colors ${
                isActive
                  ? "border-indigo-600 text-indigo-600 bg-white"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Content */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* TAB 0: REAL-TIME STOCK & TICKER STREAMER */}
        {activeTab === "quotes-live" && (
          <LiveMarketQuotes />
        )}

        {/* TAB 0B: LIVE ST. LOUIS FED EXPLORER */}
        {activeTab === "fred-live" && (
          <FredLiveExplorer onInjectEvent={onInjectEvent} />
        )}

        {/* TAB 1: DUAL MODE ARCHITECTURE */}
        {activeTab === "dual-mode" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Option B: Live Cloud Market Feeds */}
              <div
                onClick={() => setOperatingMode("cloud-live")}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                  operatingMode === "cloud-live"
                    ? "border-emerald-500 bg-emerald-50/20 shadow-md"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-mono text-xs font-bold flex items-center space-x-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    <span>OPTION B: CLOUD LIVE FEEDS</span>
                  </span>
                  {operatingMode === "cloud-live" && (
                    <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>SELECTED</span>
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Standalone Cloud Market Data (Zero Local Setup Required)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Fetches live quotes for equities, commodities (Gold, Silver), indexes (SPY, QQQ), and ALFRED Fed data directly through the cloud server. Works anywhere on phone, tablet, or remote PC.
                </p>

                {/* Live quotes preview */}
                <div className="bg-slate-900 text-white rounded-xl p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-[11px] pb-1 border-b border-slate-800">
                    <span>LIVE QUOTES STREAM</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        fetchLiveQuotes();
                      }}
                      className="text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 font-mono"
                    >
                      <RefreshCw className={`w-3 h-3 ${quotesLoading ? "animate-spin" : ""}`} />
                      <span>Refresh</span>
                    </button>
                  </div>
                  {liveQuotes ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs pt-1">
                      {Object.keys(liveQuotes).slice(0, 4).map((sym) => {
                        const q = liveQuotes[sym];
                        const isUp = q.change >= 0;
                        return (
                          <div key={sym} className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
                            <div className="text-slate-400 text-[10px]">{sym}</div>
                            <div className="font-bold text-slate-100">${q.price}</div>
                            <div className={`text-[10px] ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
                              {isUp ? "+" : ""}{q.changePercent}%
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-slate-500 italic py-2 text-center">Loading live cloud feed...</div>
                  )}
                </div>
              </div>

              {/* Option A: sahil-trader FastAPI Bridge */}
              <div
                onClick={() => setOperatingMode("fastapi-bridge")}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                  operatingMode === "fastapi-bridge"
                    ? "border-indigo-600 bg-indigo-50/20 shadow-md"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 font-mono text-xs font-bold flex items-center space-x-1.5">
                    <Database className="w-3.5 h-3.5" />
                    <span>OPTION A: FASTAPI LOCAL/VPS BRIDGE</span>
                  </span>
                  {operatingMode === "fastapi-bridge" && (
                    <span className="text-xs font-bold text-indigo-600 flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>SELECTED</span>
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  sahil-trader Analytical Backend (DuckDB + Point-in-Time)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Streams custom econometric rankings, verified historical analogue cohorts, Trade Republic position risk, and Telegram event triggers when your local machine or VPS is running.
                </p>

                <div className="bg-slate-900 text-white rounded-xl p-3.5 text-xs font-mono space-y-1.5">
                  <div className="text-indigo-400 text-[11px] font-bold flex items-center space-x-1">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>LOCAL DAEMON COMMAND</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg text-slate-300 text-[11px] overflow-x-auto">
                    uvicorn webapp.api:app --host 0.0.0.0 --port 8000
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1 flex items-center justify-between">
                    <span>Auth: Bearer WEBAPP_API_KEY</span>
                    <span className="text-amber-400">Requires local PC/VPS</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Explanatory Hybrid Guidance */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-start space-x-3.5">
              <Zap className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-bold text-slate-900">Why doing both gives you the ultimate setup:</span>
                <p className="text-slate-600 leading-relaxed">
                  When you are away from your local PC (like right now), the platform automatically falls back to <strong>Option B (Live Cloud Market Data)</strong> so you have full live quotes and scenario analysis in your browser. When you return to your computer this evening and start your FastAPI service, you can activate <strong>Option A</strong> to inject your 510K point-in-time observations directly.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STEP-BY-STEP SECRETS GUIDE */}
        {activeTab === "secrets-guide" && (
          <div className="space-y-6">
            <div className="text-xs text-slate-600">
              Here is exact, step-by-step guidance on how to get every required key when you are at your PC this evening:
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* 1. Telegram Bot Token */}
              <div className="bg-white border-2 border-emerald-500/40 rounded-2xl p-5 shadow-xs space-y-3 relative overflow-hidden bg-emerald-50/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">1. Telegram Bot Token</h4>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300 flex items-center space-x-1">
                    <Check className="w-3 h-3" />
                    <span>CONFIGURED</span>
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                  <div className="bg-emerald-100/70 text-emerald-950 p-2.5 rounded-xl border border-emerald-200 font-mono text-[11px]">
                    <strong>Bot Handle:</strong> @FERRPMarketBot<br/>
                    <strong>Status:</strong> Active & Registered
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Token: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">TELEGRAM_BOT_TOKEN</code> (configured in AI Studio Secrets)
                  </p>
                </div>
                <a
                  href="https://t.me/FERRPMarketBot"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-bold pt-1"
                >
                  <span>Open @FERRPMarketBot in Telegram & Click START</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* 2. Telegram Chat ID */}
              <div className="bg-white border-2 border-emerald-500/40 rounded-2xl p-5 shadow-xs space-y-3 relative overflow-hidden bg-emerald-50/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">2. Telegram Chat ID</h4>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300 flex items-center space-x-1">
                    <Check className="w-3 h-3" />
                    <span>CONFIGURED</span>
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                  <div className="bg-emerald-100/70 text-emerald-950 p-2.5 rounded-xl border border-emerald-200 font-mono text-[11px]">
                    <strong>Chat ID:</strong> 1149424693 (Sahil Shah)<br/>
                    <strong>Status:</strong> Verified & Active
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Macro standing job and calendar event alerts will be dispatched directly to your Telegram.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={envValues.telegramChatId}
                      onChange={(e) => setEnvValues({ ...envValues, telegramChatId: e.target.value })}
                      placeholder="Chat ID"
                      className="bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-mono w-full"
                    />
                    <button
                      onClick={sendTelegramTestAlert}
                      disabled={tgTestLoading || !envValues.telegramChatId}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center space-x-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>{tgTestLoading ? "Sending..." : "Send Test Alert"}</span>
                    </button>
                  </div>
                  {tgTestResult && (
                    <div className={`text-[11px] p-2 rounded-lg font-mono ${tgTestResult.success ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                      {tgTestResult.success ? "✅ Alert delivered to Telegram!" : `❌ ${tgTestResult.error}`}
                    </div>
                  )}
                </div>
              </div>

              {/* 3. FRED API Key */}
              <div className="bg-white border-2 border-emerald-500/40 rounded-2xl p-5 shadow-xs space-y-3 relative overflow-hidden bg-emerald-50/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                      <Database className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">3. FRED API Key (St. Louis Fed)</h4>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300 flex items-center space-x-1">
                    <Check className="w-3 h-3" />
                    <span>CONFIGURED</span>
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                  <div className="bg-emerald-100/70 text-emerald-950 p-2.5 rounded-xl border border-emerald-200 font-mono text-[11px]">
                    <strong>API Key:</strong> 355d0e2733034af1cf9f442ac4b48944<br/>
                    <strong>Access:</strong> Real-time ALFRED & FRED historical data
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Used by <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">mkt/fetch_macro.py</code> for point-in-time inflation, yield curve, and unemployment series.
                  </p>
                </div>
              </div>

              {/* 4. Dedicated Gmail Account & App Password */}
              <div className="bg-white border-2 border-emerald-500/40 rounded-2xl p-5 shadow-xs space-y-3 relative overflow-hidden bg-emerald-50/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">4. Gmail Account & App Password</h4>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300 flex items-center space-x-1">
                    <Check className="w-3 h-3" />
                    <span>CONFIGURED</span>
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                  <div className="bg-emerald-100/70 text-emerald-950 p-2.5 rounded-xl border border-emerald-200 font-mono text-[11px]">
                    <strong>Sender:</strong> ferrp.alerts@gmail.com<br/>
                    <strong>App Password:</strong> iley mpdf vwri yndc<br/>
                    <strong>Recipient:</strong> sahilshahphoto@gmail.com
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Morning analytical briefings (06:45 CET) will be automatically dispatched to your inbox.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <button
                    onClick={sendEmailTestAlert}
                    disabled={emailTestLoading}
                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{emailTestLoading ? "Sending Test Email..." : "Send Test Email to sahilshahphoto@gmail.com"}</span>
                  </button>

                  {emailTestResult && (
                    <div className={`text-[11px] p-2 rounded-lg font-mono ${emailTestResult.success ? "bg-emerald-100 text-emerald-900 border border-emerald-300" : "bg-rose-100 text-rose-900 border border-rose-300"}`}>
                      {emailTestResult.success ? `✅ ${emailTestResult.message}` : `❌ ${emailTestResult.error}`}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: .ENV GENERATOR & DISCOVERY WALKTHROUGH */}
        {activeTab === "env-builder" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form Input fields */}
              <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-800 uppercase tracking-wider">Configure Secrets Form</span>
                  <button
                    onClick={generateRandomApiKey}
                    className="text-[11px] text-indigo-600 hover:text-indigo-700 font-semibold flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Regenerate WEBAPP_API_KEY</span>
                  </button>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">TELEGRAM_BOT_TOKEN</label>
                  <input
                    type="text"
                    value={envValues.telegramToken}
                    onChange={(e) => setEnvValues({ ...envValues, telegramToken: e.target.value })}
                    placeholder="e.g. 718293849:AAHk1_exampleToken"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">TELEGRAM_CHAT_ID</label>
                  <input
                    type="text"
                    value={envValues.telegramChatId}
                    onChange={(e) => setEnvValues({ ...envValues, telegramChatId: e.target.value })}
                    placeholder="e.g. 182938475"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">FRED_API_KEY</label>
                  <input
                    type="text"
                    value={envValues.fredApiKey}
                    onChange={(e) => setEnvValues({ ...envValues, fredApiKey: e.target.value })}
                    placeholder="e.g. 9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">WEBAPP_API_KEY</label>
                  <input
                    type="text"
                    value={envValues.webAppApiKey}
                    onChange={(e) => setEnvValues({ ...envValues, webAppApiKey: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">GMAIL_USER</label>
                    <input
                      type="text"
                      value={envValues.gmailUser}
                      onChange={(e) => setEnvValues({ ...envValues, gmailUser: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">GMAIL_APP_PASSWORD</label>
                    <input
                      type="password"
                      value={envValues.gmailAppPassword}
                      onChange={(e) => setEnvValues({ ...envValues, gmailAppPassword: e.target.value })}
                      placeholder="16-char code"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Ready-to-copy .env output */}
              <div className="space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Generated .env File Content
                    </span>
                    <button
                      onClick={() => copyToClipboard(generatedEnvContent, "env-file")}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1 shadow-xs transition-colors"
                    >
                      {copiedKey === "env-file" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === "env-file" ? "Copied!" : "Copy .env Block"}</span>
                    </button>
                  </div>
                  <pre className="bg-slate-950 text-slate-200 p-4 rounded-2xl text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed">
                    {generatedEnvContent}
                  </pre>
                </div>

                {/* Macro & Standalone Mode Active */}
                <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 text-xs space-y-2 text-slate-800">
                  <div className="font-bold flex items-center space-x-1.5 text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Pure Macro & Event Intelligence Mode (Active)</span>
                  </div>
                  <p className="leading-relaxed text-slate-600">
                    Trade Republic portfolio integration is <strong>skipped</strong>. The engine operates purely on market-wide point-in-time inflation, Federal Reserve releases, earnings, and volatility alerts without accessing personal brokerage accounts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: FASTAPI BRIDGE TESTER */}
        {activeTab === "live-test" && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 text-xs">
              <div className="font-bold text-slate-800 uppercase tracking-wider">
                Live FastAPI Health Probe & Bridge Tester
              </div>
              <p className="text-slate-600 leading-relaxed">
                Test whether this web dashboard can communicate with your local or cloud FastAPI backend.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block font-semibold text-slate-700 mb-1">Target Base URL</label>
                  <input
                    type="text"
                    value={fastApiUrl}
                    onChange={(e) => setFastApiUrl(e.target.value)}
                    placeholder="http://localhost:8000"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block font-semibold text-slate-700 mb-1">Endpoint Path</label>
                  <input
                    type="text"
                    value={testEndpoint}
                    onChange={(e) => setTestEndpoint(e.target.value)}
                    placeholder="/api/status"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block font-semibold text-slate-700 mb-1">WEBAPP_API_KEY</label>
                  <input
                    type="text"
                    value={webAppApiKey}
                    onChange={(e) => setWebAppApiKey(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={runFastApiProbe}
                  disabled={testLoading}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl font-bold text-xs flex items-center space-x-2 shadow-xs transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testLoading ? "animate-spin" : ""}`} />
                  <span>{testLoading ? "Probing Backend..." : "Execute Live Ping"}</span>
                </button>
                <span className="text-[11px] text-slate-500">
                  Sends request through Express bridge to bypass CORS and verify bearer auth.
                </span>
              </div>
            </div>

            {/* Test result display */}
            {testResult && (
              <div
                className={`p-5 rounded-2xl border ${
                  testResult.success
                    ? "bg-emerald-50/70 border-emerald-300 text-emerald-950"
                    : "bg-rose-50/70 border-rose-300 text-rose-950"
                } text-xs space-y-3`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 font-bold text-sm">
                    {testResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-600" />
                    )}
                    <span>{testResult.success ? "FastAPI Backend Online & Authenticated" : "Connection Check Status"}</span>
                  </div>
                  {testResult.latencyMs && (
                    <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-white border border-slate-200 font-bold">
                      Latency: {testResult.latencyMs}ms
                    </span>
                  )}
                </div>

                {testResult.error && (
                  <div className="space-y-1">
                    <p className="font-mono text-rose-700">{testResult.error}</p>
                    {testResult.hint && <p className="text-slate-600 text-[11px]">{testResult.hint}</p>}
                  </div>
                )}

                {testResult.data && (
                  <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-[11px] overflow-x-auto">
                    {JSON.stringify(testResult.data, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
