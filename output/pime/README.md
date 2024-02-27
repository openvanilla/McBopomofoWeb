# Run McBopomofo JS on PIME

## Build and Run

- Install a copy of PIME on your PC
- run `npm run build:pime`. The command build a "index.js" file into the folder.
- Copy the folder to `C:\Program Files (x86)\PIME\node\input_methods\mcbopomofo`
- Open a command prompt or Windows terminal as administrator, and then run
  `regsvr32 "C:\Program Files (X86)\PIME\x86\PIMETextService.dll"`
- Try to switch to McBopomofo input method

## Debug

- Take a look on the Windows task bar, there is an icon representing the PIME
  launcher process. Right click on it, and select "Enable Debug Log" from the
  context menu.
- There is another menu item "Show Debug Log" to let you view the log. The debug
  log contains the interaction between PIME text client and your input method
  server.
- After replacing a new copy of index.js, select "restart PIME".
