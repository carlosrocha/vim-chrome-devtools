// @flow

import CDP, { type Chrome, type Script } from 'chrome-remote-interface';
import { type NeovimPlugin, type NeovimClient } from 'neovim';

import { getVisualSelection, debounce } from './utils';
import { echomsg, echoerr } from './echo';

const prefix = 'ChromeDevTools';

export default class ChromeDevToolsPlugin {
  _plugin: NeovimPlugin;
  _nvim: NeovimClient;
  _chrome: Chrome;

  constructor(plugin: NeovimPlugin) {
    this._plugin = plugin;
    this._nvim = plugin.nvim;

    process.on('uncaughtException', err => {
      console.error(err);
    });

    plugin.registerFunction(`${prefix}_notify`, this.notify);
    plugin.registerCommand(`${prefix}Connect`, this.connect, { nargs: '*' });
  }

  notify = (args: string[]) => {
    const command = args[0];

    if (command == 'CSS/createStyleSheet') {
      return this.cssCreateStyleSheet();
    }
  };

  async _getDefaultOptions() {
    const port = await this._nvim.getVar('ChromeDevTools_port');
    const host = await this._nvim.getVar('ChromeDevTools_host');

    return {
      host: host && typeof host == 'string' ? host : 'localhost',
      port: port && typeof port == 'string' ? port : '9222',
    };
  }

  connect = async (args: string[]) => {
    const target = args[0];
    const defaultOptions = await this._getDefaultOptions();
    const chrome = await CDP({ ...defaultOptions, target });
    this._chrome = chrome;

    await chrome.Page.enable();
    await chrome.DOM.enable();
    await chrome.CSS.enable();

    chrome.once('disconnect', () => {
      echomsg(this._nvim, 'Disconnected from target.');
    });

    echomsg(this._nvim, `Connected to target: ${target}`);
  };

  cssCreateStyleSheet = async () => {
    const { _chrome: chrome, _nvim: nvim } = this;

    // Get the top level frame id.
    const { frameTree } = await chrome.Page.getResourceTree();
    const frameId = frameTree.frame.id;
    const { styleSheetId } = await chrome.CSS.createStyleSheet({ frameId });

    await nvim.command(`edit ${styleSheetId}.css`);
    const buffer = await nvim.buffer;

    buffer.listen('lines', (bufn, changedTick, startLine, endLine) => {
      this.cssSetStyleSheetText(styleSheetId);
    });
  };

  cssSetStyleSheetText = async (styleSheetId: string) => {
    const buffer = await this._nvim.buffer;
    const lines = await buffer.lines;
    const text = lines.join('\n');
    await this._chrome.CSS.setStyleSheetText({ styleSheetId, text });
  };
}
