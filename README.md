# AURA-Studio
# 從這裡打開Open Here:

# https://aura.henry0115.dpdns.org/
OR https://aura-studio-8yn.pages.dev/


下載來離線使用Download for offline use：

https://github.com/henry01151111/AURA-Studio/releases/latest

[查看即將新增功能Upcoming features](./todo.md) | **English**

# AURA Studio

**A Focus Timer.**

AURA Studio is an immersive focus tool built as a single, pure front-end HTML file: a Pomodoro timer, ambient themes, focus soundscapes, and a mindful breathing guide — plus an extensible toolbox (Desktop Clock, To-Do, Notepad) — all in one screen. Just open it and go, or install it as a PWA for offline use.

🔗 Repo: https://github.com/henry01151111/AURA-Studio/

---

## ✨ Features

- **Pomodoro Timer**: Focus / Short Break / Long Break phases, custom countdown length, auto-advance through cycles, chime toggle, and a completed-cycles counter.
- **Immersive Ambient Themes**: A range of mood themes (Morning Mist, Sunlit Greenhouse, Midnight Library, Rainy Night Cafe, Silent Forest, Cyber Rain, Deep Sea Moonlight, Sunset Glow, Aurora Tundra, Starlit Zen, and more), with live rain-drop / glass-water visual effects whose density and speed can be tuned.
- **Focus Sounds**: A multi-track ambient sound mixer (rain, binaural beats, crackling fireplace, breeze & chimes, etc.) with independent volume control per track, plus support for pasting a YouTube link to play focus music.
- **Mindful Breathing Guide**: Three techniques — 4-4-4-4 Box Breathing, 4-7-8 Relaxing Breath, and 5-5 Coherent Breathing — with animated guidance and cycle counting.
- **Zen Immersive Mode**: Hide the entire UI with one tap for a fully immersive countdown.
- **Extensions Store**: Open built-in tools in a resizable split view on the right side of the screen, including:
  - 🖥️ **Desktop Clock Suite**: timers, stopwatch, focus phases, and clock (previously a separate window, now integrated as a split-view panel)
  - ✅ **To-Do**: categories, priorities, subtasks, charts, and drag-to-sort
  - 📝 **Notepad**: Markdown notes with live preview and code highlighting
  - The split ratio can be freely dragged and resized, with one-tap fullscreen / restore-to-1:1 support.
- **Multi-language**: Traditional Chinese, Simplified Chinese, Japanese, and English, switchable instantly from a dropdown in the top right (the language dictionary is pivoted on Traditional Chinese and composes translations between any two languages automatically, covering the main UI text).
- **PWA / Offline Support**: Installable as a standalone app (desktop or mobile home screen), backed by a Service Worker for resource caching so it still works offline.
- **Performance Modes**: Standard and Eco modes, with an optional live FPS counter, so it runs smoothly even on lower-powered devices.
- **Personalization**: Clock font (Sans / Mono / Serif), clock ring style, overall scale, 24-hour format, custom focus mottos, and more — all settings and task data are saved automatically in the browser's local storage.

---

## 📁 Project Structure

```
AURA-Studio/
├── index.html        # Main app: focus timer, themes, settings, extensions store entry point
├── clock_app.html     # Extension: Desktop Clock Suite (embedded via iframe)
├── taskmaster.html    # Extension: To-Do
├── notepad.html        # Extension: Notepad (Markdown)
├── manifest.json      # PWA manifest (name, icons, launch screen, etc.)
└── sw.js              # Service Worker (offline caching, Network First strategy)
```

> Every extension is inlined into `index.html` as base64 at build/first-load time (via `window.__xxxAppSrcdoc` + `iframe.srcdoc`), so **no extra server or external files are required** — a single `index.html` runs the whole app. The separate files above exist purely for source maintenance.

---

## 🚀 Getting Started

### Open it directly
Just download `index.html` and open it in a browser, or deploy it to any static hosting service (GitHub Pages, Netlify, Vercel, etc.).

### Install as a PWA
1. Open the page in a supported browser (Chrome, Edge, etc.).
2. Click the "Install App" button in the top right, or use the install icon in the desktop browser's address bar.
3. On iPhone/iPad, open it in Safari → Share → Add to Home Screen.

> Installing as a PWA requires the page to be served over `https`. Opening the local file directly via `file://` won't show an install prompt, but the core features still work fine.

### Offline Use
Once installed, the Service Worker automatically caches the core assets so the app still opens offline, and updates itself automatically the next time you're back online.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `Space` | Start / Pause Timer |
| `T` | Open Tasks & Drafts |
| `A` | Open Focus Sounds panel |
| `S` | Open Settings |
| `F` | Fullscreen |
| `L` | Toggle Performance Mode |
| `B` | Mindful Breathing Guide |
| `Alt + C` | Open Extensions |
| `Alt + P` | Floating Clock |
| `?` / `/` | Show keyboard shortcuts list |

---

## 🛠 Tech Details

- Pure front-end, single-file HTML + Tailwind CSS (CDN) + Font Awesome — no build step, no backend.
- Settings, tasks, and notes are stored in the user's own browser via `localStorage`.
- Internationalization: a Traditional-Chinese-pivoted dictionary (`zhToEnMap` / `zhToCnMap` / `zhToJaMap`) combined with a DOM-walking translator (`translateDOM`) that composes a translation map between any two languages through the Traditional Chinese pivot.
- Offline caching: `sw.js` uses a Network First strategy, falling back to the cache on failure, to keep content as fresh as possible while still supporting offline use.

---

## 📦 Changelog Summary

- **v1.1.1**: Added Simplified Chinese and Japanese support; the language button is now a dropdown menu for direct language selection.
- **v1.1.0**: Extensions Store (Desktop Clock Suite + To-Do), a freely resizable split view, and a smoother install flow with a compact toolbar.

---

## 📄 License

No license has been chosen for this project yet. Feel free to add a `LICENSE` file (MIT, Apache-2.0, etc.) to the repo if you'd like to make it official.

## 🙋 About

A personal focus-tool project built and maintained by [henry01151111](https://github.com/henry01151111). Issues and PRs are welcome!


# AURA Studio

**一個專注時鐘。／ A Focus Timer.**

AURA Studio 是一個純前端、單一 HTML 檔案打造的沉浸式專注工具：番茄鐘、環境主題、專注音效、正念呼吸引導，再加上可擴充的小工具商店（桌面時鐘、待辦事項、記事本），全部整合在同一個畫面裡，開啟即可使用，也能安裝成 PWA 離線使用。

🔗 Repo：https://github.com/henry01151111/AURA-Studio/

---

## ✨ 主要功能

- **番茄鐘 Pomodoro**：專注 / 短休息 / 長休息三階段，自訂倒數時間，循環自動連播，提示音開關，完成次數統計。
- **沉浸主題背景**：多種氛圍主題（晨霧雨露、日光溫室、深夜圖書館、雨夜咖啡館、靜謐森林、賽博雨夜、深海月光、落日餘暉、極光冰原、靜謐星空……），雨滴 / 玻璃水珠等即時視覺特效，可調整密度與速度。
- **專注音效**：多軌環境音混音器（雨聲、雙耳節律 Binaural Beats、壁爐噼啪聲、微風磬音等），可各自調整音量，也支援貼上 YouTube 連結播放專注音樂。
- **正念呼吸引導**：4-4-4-4 箱式呼吸、4-7-8 放鬆呼吸、5-5 均勻呼吸三種技巧，附動畫與循環計次。
- **Zen 沉浸模式**：一鍵隱藏所有介面，全螢幕沉浸倒數。
- **擴充功能商店**：右側分割畫面可開啟內建小工具，目前包含：
  - 🖥️ **桌面時鐘套件**：計時器、碼錶、專注階段與時鐘（原獨立視窗，已整合為分割畫面模式）
  - ✅ **待辦事項**：分類、優先順序、子任務、統計圖表、拖曳排序
  - 📝 **記事本**：Markdown 筆記、即時預覽與程式碼高亮
  - 分割畫面比例可自由拖曳調整，支援一鍵全螢幕／還原 1:1
- **多國語言**：繁體中文、简体中文、日本語、English 四語言，右上角下拉選單即時切換（語言字典以繁中為基準，自動組合翻譯，涵蓋介面主要文字）。
- **PWA 離線支援**：可安裝成獨立 App（桌面 / 手機主畫面），搭配 Service Worker 做資源快取，離線也能使用。
- **效能模式**：標準／節能兩種模式，可顯示即時 FPS，低效能裝置也能流暢運行。
- **個人化設定**：時鐘字體（無襯線 / 單寬碼 / 典雅）、時鐘圓環樣式、整體尺寸、24 小時制、自訂專注格言等，所有設定與任務資料皆自動儲存在瀏覽器本機。

---

## 📁 專案結構

```
AURA-Studio/
├── index.html        # 主程式：專注時鐘、主題、設定、擴充功能商店入口
├── clock_app.html     # 擴充功能：桌面時鐘套件（以 iframe 內嵌載入）
├── taskmaster.html    # 擴充功能：待辦事項
├── notepad.html        # 擴充功能：記事本（Markdown）
├── manifest.json      # PWA 設定（名稱、圖示、啟動畫面等）
└── sw.js              # Service Worker（離線快取、Network First 策略）
```

> 所有擴充功能在建置／首次開啟時會被轉成 base64 內嵌進 `index.html`（透過 `window.__xxxAppSrcdoc` + `iframe.srcdoc`），所以**不需要額外伺服器或外部檔案**，單一 `index.html` 就能完整運作；上列分檔只是原始碼維護用途。

---

## 🚀 使用方式

### 線上直接開啟
直接下載 `index.html` 用瀏覽器開啟即可，或部署到任何靜態網站託管服務（GitHub Pages、Netlify、Vercel 等）。

### 安裝成 PWA
1. 用 Chrome / Edge 等支援的瀏覽器開啟網頁。
2. 點擊右上角「安裝 App」按鈕，或桌面瀏覽器網址列的安裝圖示。
3. 手機（iPhone / iPad）請用 Safari 開啟 → 分享 → 加入主畫面。

> 需透過 `https` 網站開啟才能安裝為 PWA；直接用 `file://` 開啟本機檔案則沒有安裝提示，但基本功能仍可正常使用。

### 離線使用
安裝後，Service Worker 會自動快取核心資源，離線時也能開啟使用；重新連網時會自動更新到最新版本。

---

## ⌨️ 快捷鍵

| 按鍵 | 功能 |
| --- | --- |
| `Space` | 開始 / 暫停倒數 |
| `T` | 開啟任務與草稿 |
| `A` | 開啟專注音效面板 |
| `S` | 開啟設定 |
| `F` | 全螢幕 |
| `L` | 切換效能模式 |
| `B` | 正念呼吸引導 |
| `Alt + C` | 開啟擴充功能 |
| `Alt + P` | 懸浮時鐘 |
| `?` / `/` | 顯示快捷鍵列表 |

---

## 🛠 技術細節

- 純前端單檔案 HTML + Tailwind CSS（CDN）+ Font Awesome，無建置流程、無後端。
- 設定、任務、筆記等資料使用 `localStorage` 儲存在使用者本機瀏覽器。
- 多語言：以繁體中文為基準字典（`zhToEnMap` / `zhToCnMap` / `zhToJaMap`），搭配 DOM 走訪翻譯（`translateDOM`），任兩語言間透過繁中樞紐動態組合對照表。
- 離線快取：`sw.js` 採 Network First、失敗時降級讀取快取的策略，確保內容盡量保持最新同時支援離線。

---

## 📦 版本紀錄摘要

- **v1.1.1**：新增簡體中文、日文支援，語言按鈕改為下拉選單可直接選取切換語言。
- **v1.1.0**：擴充功能商店（桌面時鐘套件 + 待辦事項）、可自由拖曳調整的分割畫面、更完整的安裝流程與窄版工具列。

---

## 📄 授權 License

本專案目前尚未指定授權條款，如需公開授權（MIT / Apache-2.0 等）歡迎自行於 repo 加入 `LICENSE` 檔案。

## 🙋 關於

由 [henry01151111](https://github.com/henry01151111) 開發與維護的個人專注工具專案。歡迎提出 Issue 或 PR！
