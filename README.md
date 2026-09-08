# AURA-Studio
!!文章由AI生成，僅供參考，因為我還在想怎麼寫


AURA Studio | 沉浸式雨夜專注空間 🌧️🎧

一款基於瀏覽器的極致沉浸專注工具。結合環境白噪音、雙耳節律、番茄鐘與唯美的動態視覺，幫助你瞬間隔離外界喧囂，進入深度心流狀態。


(建議：請將上方圖片替換為你實際的網頁截圖)

✨ 核心特色 (Features)

🌧️ 極致視覺體驗 (Immersive Visuals)

動態擬真雨景： 基於 HTML5 Canvas 打造的雨滴滑落玻璃特效，支援滑鼠/觸控互動排開水珠。

多樣化沉浸主題： 內建「深夜圖書館」、「雨夜咖啡館」、「賽博雨夜」、「深海月光」等 8 種高質感主題。

3D 主題切換： 仿 iOS 鎖定畫面的長按下壓與卡片滑動切換體驗。

雷雨特效： 隨機生成的閃電視覺與畫面閃爍，增添環境真實感。

Zen 沉浸模式： 一鍵隱藏所有 UI，只留下純粹的時鐘與雨夜，極致防分心。

🎵 專注音效混音器 (Audio Mixer)

多軌環境音： 內建溫馨雨聲、柴火劈啪聲、微風與靜心磬音，可自由調整各軌音量。

雙耳節律 (Binaural Beats)： 透過 Web Audio API 即時生成 $\alpha$ 波 (10Hz)、$\beta$ 波 (18Hz)、$\theta$ 波 (6Hz)，科學輔助大腦進入特定狀態。

YouTube 音樂嵌入： 可無縫貼上 YouTube 影片或直播連結（如 Lofi Girl），作為背景音樂持續播放。

⏱️ 高效專注工具 (Productivity Tools)

智慧番茄鐘： 支援 25/5/15 分鐘標準模式，亦可自訂倒數時間。支援階段自動連播與完成提示音。

子母畫面 (PiP)： 支援瀏覽器原生 Document PiP 懸浮時鐘，切換視窗也能隨時查看倒數進度。

任務與隨手筆記： 內建 Todo List 與自動儲存（LocalStorage）的草稿備忘錄，捕捉轉瞬即逝的靈感。

⚙️ 深度客製化 (Customization)

時鐘字體切換（無襯線、單寬碼、典雅襯線）、尺寸與圓環樣式調整。

可自訂專注格言/座右銘。

效能模式： 內建「節能模式」，降低 Canvas 渲染負擔，適合筆電拔插頭時使用。

PWA 支援： 支援安裝為桌面/手機應用程式 (Progressive Web App)，享受原生的全螢幕體驗。

🛠️ 技術棧 (Tech Stack)

此專案採用極簡且高效的前端技術構建，無須打包工具，開箱即用：

核心語言： HTML5, Vanilla JavaScript (ES6+), CSS3

視覺渲染： HTML5 <canvas> (2D Context 粒子與流體模擬)

音訊處理： Web Audio API (振盪器、雙通道合併、濾波器即時運算)

UI 框架： Tailwind CSS (透過 CDN 引入)

圖示庫： FontAwesome 6

資料儲存： LocalStorage API

🚀 如何使用 (Quick Start)

因為此專案為純前端應用程式，無需複雜的 Node.js 環境設定。

Clone 專案：

git clone https://github.com/你的帳號/AURA-Studio.git


開啟專案：

直接用瀏覽器雙擊開啟 aura_studio.html。

或使用 VS Code 的 Live Server 擴充功能開啟，以獲得最佳體驗（確保 YouTube iframe 與 Web Audio 正常運作）。

PWA 安裝 (可選)：
使用 Chrome 或 Edge 瀏覽器開啟網頁後，點擊網址列右側的「安裝」圖示，即可將 AURA Studio 安裝至電腦桌面。

⌨️ 快捷鍵指南 (Keyboard Shortcuts)

為了保持心流不被打斷，AURA Studio 支援全鍵盤操作：

快捷鍵

功能

Space

開始 / 暫停番茄鐘倒數

Alt + P

開啟 / 關閉時鐘子母畫面 (PiP)

C

折疊 / 展開番茄鐘控制列

R

重設目前的番茄鐘

N

跳過目前階段 (專注/休息切換)

Z

開關 Zen 沉浸模式 (按 Esc 亦可退出)

M

總聲音 一鍵靜音/恢復

T

開啟 / 關閉 任務與草稿抽屜

A

開啟 / 關閉 專注音效混音器抽屜

S

開啟 進階設定面板

F

切換 全螢幕模式

L

切換 標準 / 節能效能模式

? 或 /

快速開啟快捷鍵說明面板

🤝 貢獻與反饋 (Contributing)

歡迎提出 Issue 或發起 Pull Request 來改善 AURA Studio！
如果你喜歡這個專案，請不要吝嗇給一個 ⭐ Star！這對我是莫大的鼓勵。

📜 授權條款 (License)

This project is licensed under the MIT License - see the LICENSE file for details.

