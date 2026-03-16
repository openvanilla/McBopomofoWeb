# McBopomofoWeb - McBopomofo Input Method Built with Web Technologies

![Static Badge](https://img.shields.io/badge/platform-web-green)
![ChromeOS](https://img.shields.io/badge/platform-chome_os-yellow) ![Static Badge](https://img.shields.io/badge/platform-windows-blue) [![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/openvanilla/McBopomofoWeb)

This project attempts to implement the McBopomofo input method using JavaScript/TypeScript and web-related technologies. McBopomofo is an automatic character selection Bopomofo input method that provides multiple common keyboard layouts and various convenient features for fast input.

The project directory provides:

- [src](https://github.com/openvanilla/McBopomofoWeb/tree/main/src): McBopomofo input method core written in TypeScript
- [output/example](https://github.com/openvanilla/McBopomofoWeb/tree/main/output/example): Example web page
- [output/chromeos](https://github.com/openvanilla/McBopomofoWeb/tree/main/output/chromeos): Input method for Chrome OS
- [output/pime](https://github.com/openvanilla/McBopomofoWeb/tree/main/output/pime): Input method for Windows (based on [PIME](https://github.com/EasyIME/PIME) framework)
- [output/mcp](https://github.com/openvanilla/McBopomofoWeb/tree/main/output/mcp): MCP service

In addition to the input method, this project also provides the following text conversion services:

- Adding Bopomofo annotations to Chinese characters, including HTML Ruby format
- Converting Chinese characters to Taiwan Braille
- Converting Taiwan Braille to Chinese characters

These text conversion services can be used not only in the Chrome browser's right-click context menu, but also as an MCP server.

## Table of Contents

<!-- TOC -->

- [McBopomofoWeb - McBopomofo Input Method Built with Web Technologies](#mcbopomofoweb---mcbopomofo-input-method-built-with-web-technologies)
    - [Table of Contents](#table-of-contents)
    - [Usage](#usage)
    - [Build Instructions](#build-instructions)
        - [Building Example Web Page](#building-example-web-page)
        - [Building and Testing Chrome OS Version](#building-and-testing-chrome-os-version)
        - [Building and Testing Windows PIME Version](#building-and-testing-windows-pime-version)
        - [Building MCP Service](#building-mcp-service)
    - [Others](#others)
        - [Microsoft Word Add-in](#microsoft-word-add-in)
    - [Third-party Packages](#third-party-packages)
    - [Community Guidelines](#community-guidelines)
    - [Software License](#software-license)
    - [Acknowledgments](#acknowledgments)

<!-- /TOC -->

## Usage

- Web version: Available [here](https://openvanilla.github.io/McBopomofoWeb/)
- Chrome OS version: Please download from [Chrome Web Store](https://chromewebstore.google.com/detail/pkjjfjnlglfhgfaipoempeaghmpfakkg)
- PIME version: Currently please compile using Node.js tools and use manually

## Build Instructions

If using npm, please enter the following commands:

```sh
npm install
npm run build # Build web version
npm run build:chromeos # Build Chrome OS version
npm run build:pime # Build Windows PIME version
npm run build:mcp # Build MCP Server version
```

These commands will create corresponding files in the output directory, usually called bundle.js.

### Building Example Web Page

After compiling with `npm run build`, directly open output/example/index.html with a browser to see the web version McBopomofo input method functionality demonstration.

### Building and Testing Chrome OS Version

To test the Chrome OS version, you can follow these steps:

- First, compile the bundle.js in the chromeos directory according to the previous instructions.
- You can set up a Node.js development environment on your Chromebook, please refer to the [documentation in the Wiki](https://github.com/openvanilla/McBopomofoWeb/wiki/Chrome-OS-%E8%BC%B8%E5%85%A5%E6%B3%95%E9%96%8B%E7%99%BC).
- If you are compiling on another personal computer, you can move the entire output/chromeos directory to Google Drive and then sync it to your Chromebook.
- On your Chromebook, or other devices with Chrome OS installed, enter `chrome://extensions`, select "load unpacked", and choose the `chromeos` directory on Google Drive.

### Building and Testing Windows PIME Version

- Please first install [PIME](https://github.com/EasyIME/PIME/releases) on your Windows PC. During installation, please note that you need to check the option to install Node-related input methods. PIME supports both Python and Node input method frameworks, but Node-related input methods are not in the default installation options, while McBopomofo is based on the Node version.
- You can install Node.js environment on your own PC, then execute `npm run build:pime`.
- Copy the files in the output\pime directory to the PIME installation directory, for example `C:\Program Files (x86)\PIME\node\input_methods\mcbopomofo`. You may need administrator privileges.
- Use administrator privileges to execute `regsvr32 "C:\Program Files (X86)\PIME\x86\PIMETextService.dll"` to register the McBopomofo input method in the system.
- After each recompilation, you need to perform the same steps, then remember to restart the PIME service. You can right-click on the PIME Launcher icon in the system tray and select "Restart".
- You can also refer to the content of build_pime.bat.

Debugging: During the development of the PIME version, you can debug through PIME's own Debug Log. You can right-click on the PIME Launcher icon in the Windows system tray to open the right-click menu, where you can see options to open and view logs. Additionally, you can use the following PowerShell command to view real-time logs:

```
set LOG_FILE="%localappdata%\\PIME\Log\\PIMELauncher.log"
set COMMAND="powershell Get-Content -Tail 10 -Wait %LOG_FILE%"
powershell -noexit %COMMAND%
```

### Building MCP Service

You can use McBopomofo as an MCP server, providing text conversion functions such as adding Bopomofo annotations to Chinese characters, converting Chinese characters to Braille, and converting Braille to Chinese characters. To build this MCP service, please execute:

```sh
npm run build:mcp
```

The output files are generated in the `output/mcp` directory. You can use Node.js to run this MCP server:

```sh
cd output/mcp
node index.js
```

To use it with [Claude](https://claude.ai/), taking macOS as an example, you need to open Claude's configuration file `~/Library/ApplicationSupport/Claude/claude_desktop_config.json` and add the following settings:

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

If you want to use it with [Codex](https://openai.com/codex/), edit `~/.codex/config.toml` and add the following settings:

```toml
[mcp_servers.mcbopomofo]
command = "node"
args = ["/PATH/TO/output/mcp/index.js"]
```

After modifying the settings, restart Codex. If you compiled in this project directory, the actual path will typically be `.../McBopomofoWeb/output/mcp/index.js`.

After installing the McBopomofo MCP server, you can try the following prompts with Claude:

- Please convert the following Chinese characters to Braille.
- Please convert the following Chinese characters into Bopomofo using the LLM's own AI capabilities, and then convert the Bopomofo into Taiwan Braille.
- Please convert the following Braille to Chinese characters.
- Please convert the following Braille to Bopomofo, and then use the LLM's own capabilities to convert the Bopomofo into Chinese characters.
- Please convert the following Chinese characters to a Bopomofo annotated web page.
- Please use the MCP tool to generate text with Bopomofo annotations.

Note that the McBopomofo MCP supports generating the codes required for Bopomofo annotation fonts, but this feature requires additional font support. You can download the supported fonts from [here](https://github.com/ButTaiwan/bpmfvs/releases/tag/v1.500). If you want the AI to generate an HTML page with Bopomofo annotations, you can remind the AI in the prompt:

> Please add the CSS stylesheet `https://oikasu1.github.io/fonts/twfonts.css` to the HTML, and then apply the `BpmfZihiSerif-Regular`, `BpmfZihiSans-Regular`, or `BpmfZihiKaiStd-Regular` font to the corresponding elements.

You can also deploy it to other AI services that support MCP, such as Gemini CLI, according to your own needs.

## Others

### Microsoft Word Add-in

In the others directory, we provide a Word Add-in that facilitates the use of Chinese character to Braille conversion functions in Microsoft Word. Usage is as follows:

```sh
cd others/WordAddin
npm install
npm run start:desktop
```

If you have Microsoft Word installed on your computer (Windows or macOS), it will automatically open Word and enable this Add-in in Word. If you want to test in the web version of Word, please refer to Microsoft's documentation [Sideload Office Add-ins to Office on the web](https://learn.microsoft.com/en-us/office/dev/add-ins/testing/sideload-office-add-ins-for-testing).

## Third-party Packages

This software uses the following packages:

- [chinese_convert](https://github.com/ccckmit/chinese_convert): Handles simplified-traditional Chinese conversion
- [chrome-storage-largeSync](https://github.com/dtuit/chrome-storage-largeSync): Used to store user dictionaries

## Community Guidelines

We welcome McBopomofo users to report issues and provide feedback, and we also welcome everyone to participate in McBopomofo development.

First, please refer to the "[How can I participate in McBopomofo?](https://github.com/openvanilla/McBopomofo/wiki/常見問題#我可以怎麼參與小麥注音)" section in our "[Frequently Asked Questions](https://github.com/openvanilla/McBopomofo/wiki/常見問題)".

We have adopted GitHub's [Universal Code of Conduct](https://github.com/openvanilla/McBopomofo/blob/master/CODE_OF_CONDUCT.md). For the Chinese version of the code of conduct, please refer to [this translation](https://www.contributor-covenant.org/zh-tw/version/1/4/code-of-conduct/).

## Software License

This project is released under the MIT License. Users are free to use and distribute this software, but must retain the complete copyright notice and software license when distributing ([full text](https://github.com/openvanilla/McBopomofo/blob/master/LICENSE.txt)).

## Acknowledgments

Special thanks to:

- William Wang for technical support in Node and WebPack
- [視覺障礙輔助科技筆記本](https://class.kh.edu.tw/19061/page/view/27) for support in the Braille field
