# McBopomofoWeb - 使用網頁技術打造的小麥注音輸入法

本專案嘗試使用 JavaScript/TypeScript 與網頁相關技術實作小麥注音輸入法。小麥注音
是一套自動選字的注音輸入法，提供多種常用鍵盤配置，以及各種方便快速輸入的功能。

在專案目錄下提供

- src：使用 TypeScript 寫成的小麥輸入法核心
- output/example：範例網頁
- output/chromeos：Chrome OS 下的輸入法
- output/pime：在 Windows 上的輸入法 (基於 [PIME](https://github.com/EasyIME/PIME) 框架)

除了輸入法之外，這個專案中也提供以下的文字轉換服務：

- 國字加上注音，包括 HTML Ruby 形式
- 國字轉換成台灣點字
- 台灣點字轉換成國字

## 使用

- 網頁版本：可以在 [這裡](https://openvanilla.github.io/McBopomofoWeb/) 使用
- Chrome OS 版本：請前往 [Chrome Web Store](https://chromewebstore.google.com/detail/pkjjfjnlglfhgfaipoempeaghmpfakkg) 下載
- PIME 版本：目前請自行透過 Node.js 工具編譯後使用

## 編譯方式

如果使用 npm，請輸入以下指令：

```sh
npm install
npm run build # 編譯翻譯網頁版本
npm run build:chromeos # 編譯 Chrome OS 版本
npm run build:pime # 編譯 Windows PIME 版本
```

這個指令會在 output，分別建立對應的檔案，通常叫做 bundle.js。

### 範例網頁

用 `npm run build` 編譯後，直接用瀏覽器打開 output/example/index.html ，就可以看到網頁版本的小麥輸入法功能展示。

### 編譯與測試 Chrome OS 版本

想要測試 Chrome OS 版本，可以參考以下步驟

- 先根據之前的指令，編譯出 chomeos 目錄下的 bundle.js。
- 您可以在您的 Chromebook 上建立 Node.js 開發環境，請參考 [Wiki 中的文件](https://github.com/openvanilla/McBopomofoWeb/wiki/Chrome-OS-%E8%BC%B8%E5%85%A5%E6%B3%95%E9%96%8B%E7%99%BC)。
- 如果您是在其他的個人電腦上編譯，您可以把整個 output/chromeos 目錄搬到 Google Drive，然後同步到你的 Chromebook 上。
- 在您的 Chromebook 上，或是其他裝了 Chrome OS 的裝置上，輸入 `chrome://extensions`，選擇 "load unpacked"，選擇 Google Drive 上的 `chromeos` 目錄。

### 編譯與測試 Windows 上的 PIME 版本

- 請先在您的 Windows PC 上安裝 [PIME](https://github.com/EasyIME/PIME/releases)，安裝過程中，請注意需要勾選安裝 Node 相關的輸入法。PIME 支援 Python 與 Node 兩種輸入法架構，Node 相關的輸入法不在預設安裝選項中，但小麥注音是基於 Node 的版本。
- 您可以在自己的 PC 上，安裝 Node.js 環境，然後執行 `npm run build:pime`。
- 將 output\pime 目錄下的檔案，複製到 PIME 的安裝目錄下，例如 `C:\Program Files (x86)\PIME\node\input_methods\mcbopomofo`。您可能需要系統管理員權限。
- 使用系統管理員權限執行 `regsvr32 "C:\Program Files (X86)\PIME\x86\PIMETextService.dll"`，將小麥注音輸入法註冊到系統中。
- 每次重新編譯之後，都要進行相同的步驟，然後記得重新啟動 PIME 服務。您可以在系統列上的 PIME Launcher 圖示上按右鍵，然後選擇「重新啟動」。
- 您也可以參考 build_pime.bat 的內容。

除錯：在開發 PIME 版本的過程中，可以透過 PIME 本身的 Debug Log 除錯。您可以從 Windows 系統列上的 PIME Launcher 圖示上按下右鍵，點開右鍵選單，當中就可以看到開啟以及查看 Log 的選項。另外，您也可以使用以下 PowerShell 命令查看即時的 Log：

```bat
set LOG_FILE="%localappdata%\\PIME\Log\\PIMELauncher.log"
set COMMAND="powershell Get-Content -Tail 10 -Wait %LOG_FILE%"
powershell -noexit %COMMAND%
```

## 第三方套件

本軟體使用了下套件

- [chinese_convert](https://github.com/ccckmit/chinese_convert): 處理簡繁轉換
- [chrome-storage-largeSync](https://github.com/dtuit/chrome-storage-largeSync): 用來儲存使用者詞庫

## 社群公約

歡迎小麥注音用戶回報問題與指教，也歡迎大家參與小麥注音開發。

首先，請參考我們在「[常見問題](https://github.com/openvanilla/McBopomofo/wiki/常見問題)」中所提「[我可以怎麼參與小麥注音？](https://github.com/openvanilla/McBopomofo/wiki/常見問題#我可以怎麼參與小麥注音)」一節的說明。

我們採用了 GitHub 的[通用社群公約](https://github.com/openvanilla/McBopomofo/blob/master/CODE_OF_CONDUCT.md)。公約的中文版請參考[這裡的翻譯](https://www.contributor-covenant.org/zh-tw/version/1/4/code-of-conduct/)。

## 軟體授權

本專案採用 MIT License 釋出，使用者可自由使用、散播本軟體，惟散播時必須完整保留版權聲明及軟體授權（[詳全文](https://github.com/openvanilla/McBopomofo/blob/master/LICENSE.txt)）。

## 感謝

特別感謝 William Wang 的技術支援。
