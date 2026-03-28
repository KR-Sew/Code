function $(id) {
  return document.getElementById(id);
}

function showStatus(message, isError = false) {
  const el = $("status");
  el.textContent = message;
  el.style.color = isError ? "#b00020" : "#1a7f37";
}

function getFormSettings() {
  return {
    mode: $("mode").value,
    scheme: $("scheme").value,
    host: $("host").value.trim(),
    port: Number($("port").value),
    bypassList: $("bypassList").value.trim()
  };
}

function setFormSettings(settings) {
  $("mode").value = settings.mode || "system";
  $("scheme").value = settings.scheme || "socks5";
  $("host").value = settings.host || "";
  $("port").value = settings.port || 1080;
  $("bypassList").value = settings.bypassList || "";
  toggleFixedFields();
}

function toggleFixedFields() {
  const isFixed = $("mode").value === "fixed";
  document.querySelectorAll(".fixed-only").forEach(el => {
    el.style.display = isFixed ? "block" : "none";
  });
}

async function loadSettings() {
  const response = await chrome.runtime.sendMessage({ type: "getSettings" });
  if (!response.ok) {
    showStatus(response.error || "Failed to load settings.", true);
    return;
  }

  setFormSettings(response.settings);
  showStatus("Settings loaded.");
}

$("mode").addEventListener("change", toggleFixedFields);

$("saveApply").addEventListener("click", async () => {
  const settings = getFormSettings();

  if (settings.mode === "fixed" && (!settings.host || !settings.port)) {
    showStatus("Host and port are required for fixed proxy mode.", true);
    return;
  }

  const response = await chrome.runtime.sendMessage({
    type: "saveAndApply",
    settings
  });

  if (!response.ok) {
    showStatus(response.error || "Could not apply proxy.", true);
    return;
  }

  showStatus(`Applied mode: ${response.settings.mode}`);
});

$("disable").addEventListener("click", async () => {
  const response = await chrome.runtime.sendMessage({ type: "disableProxy" });

  if (!response.ok) {
    showStatus(response.error || "Could not reset proxy.", true);
    return;
  }

  setFormSettings(response.settings);
  showStatus("Proxy reset to system mode.");
});

loadSettings().catch(error => {
  showStatus(error.message || String(error), true);
});