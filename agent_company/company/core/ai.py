"""Claude access for the AI agents (official Anthropic SDK, bundled in vendor/).

If there is no ANTHROPIC_API_KEY, every AI agent falls back to its rule-based
mode, so the company still runs end to end - just less smart."""
import json
import threading

from company.core.base import cfg, log, secrets

_lock = threading.Lock()
_calls = {"n": 0}


class AI:
    def __init__(self, demo=False):
        self.settings = cfg("settings.json", {})
        self.key = None if demo else secrets().get("ANTHROPIC_API_KEY")
        self.client = None
        self.error = None
        if self.key:
            try:
                import anthropic
                self.anthropic = anthropic
                self.client = anthropic.Anthropic(api_key=self.key, max_retries=3, timeout=300)
            except Exception as e:   # SDK missing or broken: degrade, don't crash the night
                self.error = f"Anthropic SDK unavailable: {e}"

    @property
    def on(self):
        return self.client is not None

    def json(self, agent, system, prompt, schema):
        """One structured call. Returns a dict matching `schema`, or None."""
        if not self.on:
            return None
        with _lock:
            if _calls["n"] >= self.settings.get("ai_max_calls_per_night", 40):
                log(agent, "AI call budget for this run used up - rule-based fallback")
                return None
            _calls["n"] += 1
        a = self.anthropic
        try:
            # Server-side fallback keeps the night going if a request is declined.
            resp = self.client.beta.messages.create(
                model=self.settings.get("ai_model", "claude-opus-5-5"),
                max_tokens=16000,
                betas=["server-side-fallback-2026-07-01"],
                fallbacks="default",
                output_config={"effort": self.settings.get("ai_effort", "medium"),
                               "format": {"type": "json_schema", "schema": schema}},
                system=system,
                messages=[{"role": "user", "content": prompt}],
            )
            if resp.stop_reason == "refusal":
                log(agent, "AI declined this request - rule-based fallback")
                return None
            if resp.stop_reason == "max_tokens":
                log(agent, "AI answer cut off (max_tokens) - rule-based fallback")
                return None
            text = next((b.text for b in resp.content if b.type == "text"), None)
            return json.loads(text) if text else None
        except a.AuthenticationError:
            self.error = "ANTHROPIC_API_KEY rejected - check secrets/keys.txt"
            self.client = None
        except a.RateLimitError:
            self.error = "rate limited by Anthropic API"
        except a.APIStatusError as e:
            self.error = f"Anthropic API error {e.status_code}"
        except a.APIConnectionError:
            self.error = "cannot reach api.anthropic.com (network/proxy?)"
        except json.JSONDecodeError:
            self.error = "AI returned invalid JSON"
        log(agent, f"AI unavailable: {self.error} - rule-based fallback")
        return None

    @staticmethod
    def calls():
        return _calls["n"]
