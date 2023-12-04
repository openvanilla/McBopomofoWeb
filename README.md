# McBopomofoWeb - 使用網頁技術打造的小麥注音輸入法

本專案嘗試使用 JavaScript/TypeScript 與網頁相關技術實作小麥注音輸入法，在專案目錄下提供

- src：使用 TypeScript 寫成的小麥輸入法核心
- example：範例網頁
- chromeos：ChromeOS 下的輸入法

## 使用

- Chrome OS 版本：請前往 [Chrome Web Store](https://chromewebstore.google.com/detail/pkjjfjnlglfhgfaipoempeaghmpfakkg) 下載
- 網頁版本：可以在 [這裡](https://openvanilla.github.io/McBopomofoWeb/) 使用

## 編譯方式

如果使用 npm，請輸入以下指令：

```sh
npm install
npm run build
npm run build:chromeos
```

這個指令會在 example 與 chomeos 目錄下，分別建立 bundle.js 檔案。

### 範例網頁

直接用瀏覽器打開 example/index.html ，就可以看到網頁版本的小麥輸入法功能展示。

### 編譯 Chrome OS 版本

想要測試 Chrome OS 版本，可以參考以下步驟

- 先根據之前的指令，編譯出 chomeos 目錄下的 bundle.js。
- 把整個 chromeos 目錄搬到 Google Drive，然後同步到你的 Chromebook 上
- 在 Chromebook 上，輸入 `chrome://extensions`，選擇 "load unpacked"，選擇 Google Drive 上的 `chromeos` 目錄

## 社群公約

歡迎小麥注音用戶回報問題與指教，也歡迎大家參與小麥注音開發。

首先，請參考我們在「[常見問題](https://github.com/openvanilla/McBopomofo/wiki/常見問題)」中所提「[我可以怎麼參與小麥注音？](https://github.com/openvanilla/McBopomofo/wiki/常見問題#我可以怎麼參與小麥注音)」一節的說明。

我們採用了 GitHub 的[通用社群公約](https://github.com/openvanilla/McBopomofo/blob/master/CODE_OF_CONDUCT.md)。公約的中文版請參考[這裡的翻譯](https://www.contributor-covenant.org/zh-tw/version/1/4/code-of-conduct/)。

## 軟體授權

本專案採用 MIT License 釋出，使用者可自由使用、散播本軟體，惟散播時必須完整保留版權聲明及軟體授權（[詳全文](https://github.com/openvanilla/McBopomofo/blob/master/LICENSE.txt)）。

## 感謝

特別感謝 William Wang 的技術支援。
