const DEFAULT_SETTINGS = {
  mode: "system",
  scheme: "socks5",
  host: "",
  port: 1080,
  username: "",
  password: "",
  bypassList: "localhost,127.0.0.1"
};

function parseBypassList(value) {
  return (value || "")
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
}

function buildChromeProxyConfig(settings) {
  if (settings.mode === "direct") {
    return { mode: "direct" };
  }

  if (settings.mode === "system") {
    return { mode: "system" };
  }

  return {
    mode: "fixed_servers",
    rules: {
      singleProxy: {
        scheme: settings.scheme,
        host: settings.host,
        port: Number(settings.port)
      },
      bypassList: parseBypassList(settings.bypassList)
    }
  };
}

async function getSettings() {
  const stored = await chrome.storage.local.get(DEFAULT_SETTINGS);
  return { ...DEFAULT_SETTINGS, ...stored };
}

async function saveSettings(newSettings) {
  await chrome.storage.local.set(newSettings);
}

async function applyProxySettings() {
  const settings = await getSettings();
  const config = buildChromeProxyConfig(settings);

  await chrome.proxy.settings.set({
    value: config,
    scope: "regular"
  });

  return settings;
}

async function resetToSystemProxy() {
  await chrome.proxy.settings.clear({ scope: "regular" });
  await chrome.storage.local.set({ mode: "system" });
}

chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.local.get(null);
  if (Object.keys(existing).length === 0) {
    await chrome.storage.local.set(DEFAULT_SETTINGS);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    if (message.type === "getSettings") {
      const settings = await getSettings();
      sendResponse({ ok: true, settings });
      return;
    }

    if (message.type === "saveAndApply") {
      await saveSettings(message.settings);
      const settings = await applyProxySettings();
      sendResponse({ ok: true, settings });
      return;
    }

    if (message.type === "disableProxy") {
      await resetToSystemProxy();
      const settings = await getSettings();
      sendResponse({ ok: true, settings });
      return;
    }

    if (message.type === "applyCurrent") {
      const settings = await applyProxySettings();
      sendResponse({ ok: true, settings });
      return;
    }

    sendResponse({ ok: false, error: "Unknown message type." });
  })().catch(error => {
    sendResponse({ ok: false, error: error.message || String(error) });
  });

  return true;
});
chrome.webRequest.onAuthRequired.addListener(
  async (details) => {
    const settings = await chrome.storage.local.get(null);

    // Only handle proxy auth (not website auth)
    if (!details.isProxy) {
      return {};
    }

    if (!settings.username || !settings.password) {
      return {}; // no credentials
    }

    return {
      authCredentials: {
        username: settings.username,
        password: settings.password
      }
    };
  },
  { urls: ["<all_urls>"] },
  ["asyncBlocking"]
);