# vim-chrome-devtools

This plugin uses [chrome-remote-interface](https://github.com/cyrus-and/chrome-remote-interface)
to connect to your Google Chrome instance.

## Requirements

- Google Chrome with open remote debugging port. You can find setup instructions [here](https://chromedevtools.github.io/devtools-protocol/).
- [Neovim](https://neovim.io) 0.2.2 for Node.js remote plugin support.
- [Node.js](https://nodejs.org)
- [FZF](https://github.com/junegunn/fzf.vim)

Tested on node 8.5.0 and Google Chrome 61.

## Installation

### Using [vim-plug](https://github.com/junegunn/vim-plug)

```
Plug 'carlosrocha/vim-chrome-devtools', { 'do': 'npm install && npm run build' }
```

After installing or updating you need to run `:UpdateRemotePlugins` and restart Neovim.

## Variables

- `g:ChromeDevTools_host`: Chrome host, `localhost` by default.
- `g:ChromeDevTools_port`: Chrome port, `9222` by default.

## Commands

- `ChromeDevToolsConnect`

## Functions

- `ChromeDevTools_Page_reload()`
- `ChromeDevTools_Runtime_evaluate()`
- `ChromeDevTools_CSS_createStyleSheet()`
