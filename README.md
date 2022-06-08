# 使用網頁技術打造的小麥注音輸入法

本專案嘗試使用 JavaScript/TypeScript 與網頁相關技術實作小麥注音輸入法，在專案目錄下提供

- src：使用 TypeScript 寫成的小麥輸入法核心
- example：範例網頁
- chromeos：ChromeOS 下的輸入法

## 編譯方式

如果使用 npm，請輸入以下指令：

```sh
npm install
npm run build
npm run build:chromeos
```

這個指令會在 example 與 chomeos 目錄下，分別建立 bundle.js 檔案。

## 範例網頁

直接用瀏覽器打開 example/index.html ，就可以看到網頁版本的小麥輸入法功能展示。

### ChromeOS 版本

想要測試 ChromeOS 版本，可以參考以下步驟

- 先根據之前的指令，編譯出 chomeos 目錄下的 bundle.js。
- 把整個 chromeos 目錄搬到 Google Drive，然後同步到你的 Chromebook 上
- 在 Chromebook 上，輸入 `chrome://extensions`，選擇 "load unpacked"，選擇 Google Drive 上的 `chromeos` 目錄

## 感謝

特別感謝 William Wang 的技術支援。

```

```
