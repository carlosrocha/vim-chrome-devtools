Archived: A pure Lua version of this is available on https://github.com/carlosrocha/chrome-remote.nvim

# vim-chrome-devtools

This plugin uses [chrome-remote-interface](https://github.com/cyrus-and/chrome-remote-interface)
to connect to your Google Chrome instance.

![CSS reload](https://user-images.githubusercontent.com/312351/39975780-335638a2-56f6-11e8-945a-128fe59fa76c.gif)

More screencasts can be seen [here](https://github.com/carlosrocha/vim-chrome-devtools/issues/1).

## Requirements

- Google Chrome with open remote debugging port using flag `--remote-debugging-port=9222`. You can find setup instructions [here](https://chromedevtools.github.io/devtools-protocol/).
- [Neovim](https://neovim.io) 0.2.2 for Node.js remote plugin support.
- [Neovim Node.js provider](https://github.com/neovim/node-client).
- [Node.js](https://nodejs.org)
- [FZF (optional)](https://github.com/junegunn/fzf.vim)

Tested on node 8.5.0 and Google Chrome 61.

## Installation

### Using [vim-plug](https://github.com/junegunn/vim-plug)

```
Plug 'carlosrocha/vim-chrome-devtools', { 'do': 'bash install.sh' }
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
