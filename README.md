# McBopomofoWeb - 使用網頁技術打造的小麥注音輸入法

![Static Badge](https://img.shields.io/badge/platform-web-green)
![ChromeOS](https://img.shields.io/badge/platform-chrome_os-yellow) ![Static Badge](https://img.shields.io/badge/platform-windows-blue) [![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/openvanilla/McBopomofoWeb) [![codecov](https://codecov.io/github/openvanilla/McBopomofoWeb/branch/main/graph/badge.svg?token=YpF9Z7IPMO)](https://codecov.io/github/openvanilla/McBopomofoWeb)

本專案嘗試使用 JavaScript/TypeScript 與網頁相關技術，實作小麥注音輸入法，進而延伸出各種文字服務。

小麥注音是一套自動選字的注音輸入法，提供多種常用鍵盤配置，以及各種方便快速輸入的功能。而基於這套輸入法所衍生出的服務，則包括注音與國字的雙向轉換，以及國字與台灣點字的雙向轉換。

在專案目錄下提供：

- [src](https://github.com/openvanilla/McBopomofoWeb/tree/main/src)：使用 TypeScript 寫成的小麥輸入法核心
- [output/example](https://github.com/openvanilla/McBopomofoWeb/tree/main/output/example)：範例網頁
- [output/chromeos](https://github.com/openvanilla/McBopomofoWeb/tree/main/output/chromeos)：Chrome OS 下的輸入法
- [output/pime](https://github.com/openvanilla/McBopomofoWeb/tree/main/output/pime)：在 Windows 上的輸入法 (基於 [PIME](https://github.com/EasyIME/PIME) 框架)
- [output/mcp](https://github.com/openvanilla/McBopomofoWeb/tree/main/output/mcp)：MCP 服務

除了輸入法之外，這個專案中也提供以下的文字轉換服務：

- 國字加上注音，包括 HTML Ruby 形式
- 國字轉換成台灣點字
- 台灣點字轉換成國字

這些文字服務除了可以用在 Chrome 瀏覽器的右鍵選單之外，也可以當成 MCP server 使
用。

<!-- TOC -->

- [McBopomofoWeb - 使用網頁技術打造的小麥注音輸入法](#mcbopomofoweb---使用網頁技術打造的小麥注音輸入法)
  - [使用](#使用)
  - [編譯方式](#編譯方式)
    - [編譯範例網頁](#編譯範例網頁)
    - [編譯與測試 Chrome OS 版本](#編譯與測試-chrome-os-版本)
    - [編譯與測試 Windows 上的 PIME 版本](#編譯與測試-windows-上的-pime-版本)
    - [編譯 MCP 服務](#編譯-mcp-服務)
  - [其他](#其他)
    - [Microsoft Word Add-in](#microsoft-word-add-in)
  - [開發](#開發)
  - [第三方套件](#第三方套件)
  - [社群公約](#社群公約)
  - [軟體授權](#軟體授權)
  - [感謝](#感謝)

<!-- /TOC -->

## 使用

- 網頁版本：可以在 [這裡](https://openvanilla.github.io/McBopomofoWeb/) 使用
- Chrome OS 版本：請前往 [Chrome Web Store](https://chromewebstore.google.com/detail/pkjjfjnlglfhgfaipoempeaghmpfakkg) 下載
- PIME 版本：目前請自行透過 Node.js 工具編譯後使用

## 編譯方式

如果使用 npm，請輸入以下指令：

```sh
npm install
npm run build # 編譯網頁版本
npm run build:chromeos # 編譯 Chrome OS 版本
npm run build:pime # 編譯 Windows PIME 版本
npm run build:mcp # 編譯 MCP Server 版本
```

這個指令會在 output，分別建立對應的檔案，通常叫做 bundle.js。

### 編譯範例網頁

小麥注音輸入法提供 Web 版本，適合在連接網路與實體鍵盤，但是不方便安裝輸入法的環境下使用。例如公共電腦、學校教室、iPad 平板，以及各種有鍵盤的電子紙裝置等。由於不需要額外安裝輸入法，也適合用在教學場合。網頁版本採用簡單的色彩，避免額外的漸層、動畫，以及其他可能會對閱讀造成干擾的元素，讓使用者可以專注在輸入法的使用上，而且特地配合電子紙裝置。

用 `npm run build` 編譯後，直接用瀏覽器打開 output/example/index.html ，就可以看到網頁版本的小麥輸入法功能展示。

在網頁版本上，也提供以下功能

- 詞庫產生工具：您可以一次輸入批詞彙，然後一次產生對應的注音，方便您建立自己的詞庫
- 國字轉點字：您可以輸入一段國字，然後一次產生對應的台灣點字
- 點字轉國字：您可以輸入一段台灣點字，然後一次產生對應的國字
- 國字加上注音：您可以輸入一段國字，然後一次產生對應的 HTML 網頁，裡面包含了對應的注音標記（HTML Ruby 形式）
- 國字轉拼音：您可以輸入一段國字，然後一次產生對應的漢語拼音

### 編譯與測試 Chrome OS 版本

想要測試 Chrome OS 版本，可以參考以下步驟

- 先根據之前的指令 `npm run build:chromeos`，編譯出 chromeos 目錄下的 bundle.js。
- 您可以在您的 Chromebook 上建立 Node.js 開發環境，請參考 [Wiki 中的文件](https://github.com/openvanilla/McBopomofoWeb/wiki/Chrome-OS-%E8%BC%B8%E5%85%A5%E6%B3%95%E9%96%8B%E7%99%BC)。
- 如果您是在其他的個人電腦上編譯，您可以把整個 output/chromeos 目錄搬到 Google Drive，然後同步到你的 Chromebook 上。
- 在您的 Chromebook 上，或是其他裝了 Chrome OS 的裝置上，輸入 `chrome://extensions`，選擇 "load unpacked"，選擇 Google Drive 上的 `chromeos` 目錄。

### 編譯與測試 Windows 上的 PIME 版本

- 請先在您的 Windows PC 上安裝 [PIME](https://github.com/EasyIME/PIME/releases)，安裝過程中，請注意需要勾選安裝 Node 相關的輸入法。PIME 支援 Python 與 Node 兩種輸入法架構，Node 相關的輸入法不在預設安裝選項中，但小麥注音是基於 Node 的版本。
- 您可以在自己的 PC 上，安裝 Node.js 環境，然後執行 `npm run build:pime`。
- 另外，如果您用的不是中文版的 Windows，也需要先在 Windows 的語言設定中，加入繁體中文語系，小麥注音輸入法必須在安裝了繁體中文語系才會出現。
- 將 output\pime 目錄下的檔案，複製到 PIME 的安裝目錄下，例如 `C:\Program Files (x86)\PIME\node\input_methods\mcbopomofo`。您可能需要系統管理員權限。
- 使用系統管理員權限執行 `regsvr32 "C:\Program Files (X86)\PIME\x86\PIMETextService.dll"`，將小麥注音輸入法註冊到系統中。
- 如果前一步不成功，通常是因為並沒有使用系統管理員權限。另外，就是可能用了沒有 code sign 的 DLL，請確定是否安裝了官方有簽名的 PIME 版本。
- 每次重新編譯之後，都要進行相同的步驟，然後記得重新啟動 PIME 服務。您可以在系統列上的 PIME Launcher 圖示上按右鍵，然後選擇「重新啟動」。
- 您也可以參考 build_pime.bat 的內容。

除錯：在開發 PIME 版本的過程中，可以透過 PIME 本身的 Debug Log 除錯。您可以從 Windows 系統列上的 PIME Launcher 圖示上按下右鍵，點開右鍵選單，當中就可以看到開啟以及查看 Log 的選項。另外，您也可以使用以下 PowerShell 命令查看即時的 Log：

```
set LOG_FILE="%localappdata%\\PIME\Log\\PIMELauncher.log"
set COMMAND="powershell Get-Content -Tail 10 -Wait %LOG_FILE%"
powershell -noexit %COMMAND%
```

### 編譯 MCP 服務

您可以將小麥注音當成 MCP 伺服器使用，提供國字注音、國字轉點字、點字轉國字等轉換功能。要編譯這個 MCP 服務，請執行：

```sh
npm run build:mcp
```

產出的檔案位在 output/mcp 目錄下。您可以使用 Node.js 執行這個 MCP 伺服器：

```sh
cd output/mcp
node index.js
```

如果要搭配 [Claude](https://claude.ai/) 使用，以 macOS 為例。您需要打開 claude 的設定檔 `~/Library/ApplicationSupport/Claude/claude_desktop_config.json`，加入以下的設定：

```json
{
  "mcpServers": {
    "my-local-server": {
      "command": "node",
      "args": ["/PATH/TO/output/mcp/index.js"]
    }
  }
}
```

如果要搭配 [Codex](https://openai.com/codex/) 使用，可以編輯 `~/.codex/config.toml`，加入以下設定：

```toml
[mcp_servers.mcbopomofo]
command = "node"
args = ["/PATH/TO/output/mcp/index.js"]
```

修改設定之後，重新啟動 Codex 即可。若您是在這個專案目錄下編譯，實際路徑通常會是 `.../McBopomofoWeb/output/mcp/index.js`。

安裝了小麥注音的 MCP 伺服器之後，您可以試試看以下的 prompt：

- 請將以下的國字轉換成點字。
- 請將以下的國字，用 LLM 自己的 AI 能力轉換成注音後，然後將注音轉換成台灣點字。
- 請將以下點字轉換成國字。
- 請將以下點字轉換成注音後，再用 LLM 自己的能力，將注音轉換成國字。
- 請將以下的國字轉換成帶有注音標記的網頁。
- 請使用小麥注音 MCP 工具，將以下的國字轉換成注音字型內碼。

小麥注音 MCP 支援產生注音字型（BPMF annotation font）所需要的內碼，但這個功能需要額外的字型支援。您可以從[這裡](https://github.com/ButTaiwan/bpmfvs/releases/tag/v1.500)下載支援的字型。如果您要請 AI 產生帶有注音的 HTML 網頁，您可以在 prompt 提醒 AI：

> 請在 HTML 中加上 CSS stylesheet `https://oikasu1.github.io/fonts/twfonts.css`，然後在對應的元素套用 `BpmfZihiSerif-Regular`、`BpmfZihiSans-Regular` 或 `BpmfZihiKaiStd-Regular` 字體。

您也可以按照自己的需求，部署在其他支援 MCP 的 AI 服務上，像是 Gemini CLI 等。

## 其他

### Microsoft Word Add-in

在 others 目錄中，我們提供了一個 Word Add-in，方便在 Microsoft Word 中使用國字轉換點字的相關功能。使用方式如下：

```sh
cd others/word_addin
npm install
npm run start:desktop
```

如果您的電腦（Windows 或 macOS）上裝了 Microsoft Word，那麼就會自動開啟 Word，並且在 Word 中啟用這個 Add-in。如果您想在網頁版本的 Word 當中測試，請參考微軟的文件 [Sideload Office Add-ins to Office on the web](https://learn.microsoft.com/en-us/office/dev/add-ins/testing/sideload-office-add-ins-for-testing)。

## 開發

由於專案使用 TypeScript 等網頁技術開發，因此除了必須安裝 Node.js 之外，其餘可以使用各種順手的網頁開發工具，像是 Visual Studio Code 等等。

## 第三方套件

本軟體使用了下列套件

- [chinese_convert](https://github.com/ccckmit/chinese_convert): 處理簡繁轉換
- [chrome-storage-largeSync](https://github.com/dtuit/chrome-storage-largeSync): 用來儲存使用者詞庫

## 社群公約

歡迎小麥注音用戶回報問題與指教，也歡迎大家參與小麥注音開發。

首先，請參考我們在「[常見問題](https://github.com/openvanilla/McBopomofo/wiki/常見問題)」中所提「[我可以怎麼參與小麥注音？](https://github.com/openvanilla/McBopomofo/wiki/常見問題#我可以怎麼參與小麥注音)」一節的說明。

我們採用了 GitHub 的[通用社群公約](https://github.com/openvanilla/McBopomofo/blob/master/CODE_OF_CONDUCT.md)。公約的中文版請參考[這裡的翻譯](https://www.contributor-covenant.org/zh-tw/version/1/4/code-of-conduct/)。

## 軟體授權

本專案採用 MIT License 釋出，使用者可自由使用、散播本軟體，惟散播時必須完整保留版權聲明及軟體授權（[詳全文](https://github.com/openvanilla/McBopomofo/blob/master/LICENSE.txt)）。

## 感謝

特別感謝：

- William Wang 在 Node 與 WebPack 方面的技術支援
- [視覺障礙輔助科技筆記本](https://class.kh.edu.tw/19061/page/view/27) 在點字領域的支援
