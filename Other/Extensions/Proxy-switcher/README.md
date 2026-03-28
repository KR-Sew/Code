# Proxy Switcher Starter

A small starter browser extension for learning how proxy-related extensions work.

## What it does
- Saves proxy settings in extension storage
- Applies a fixed browser proxy using the extension UI
- Resets the browser back to system proxy mode

## Main files
- `manifest.json` - extension metadata and permissions
- `background.js` - background/service worker logic
- `popup.html` - popup UI
- `popup.js` - popup behavior
- `popup.css` - popup styling

## Load in Chrome
1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select this folder

## Test idea
Create a SOCKS5 tunnel first, for example:
```bash
ssh -D 1080 user@your-vps
```

Then in the extension:
- Mode: **Use fixed proxy**
- Scheme: **SOCKS5**
- Host: `127.0.0.1`
- Port: `1080`

## Important
This starter is aimed at Chromium-style browsers using the `chrome.proxy` API.
Firefox has a similar but **not identical** proxy API model.