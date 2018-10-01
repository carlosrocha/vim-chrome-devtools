// @flow

import CDP, { type Chrome, type Script } from 'chrome-remote-interface';
import { type NeovimPlugin, type NeovimClient } from 'neovim';

import JavaScriptPlugin from './plugins/JavaScriptPlugin';
import { getVisualSelection, debounce } from './utils';
import { echomsg, echoerr } from './echo';

export default class ChromeDevToolsPlugin {
  _plugin: NeovimPlugin;
  _nvim: NeovimClient;
  _chrome: Chrome;
  _scripts: Script[];

  _js: JavaScriptPlugin;

  constructor(plugin: NeovimPlugin) {
    this._plugin = plugin;
    this._nvim = plugin.nvim;

    process.on('uncaughtException', err => {
      console.error(err);
    });

    this._js = new JavaScriptPlugin(plugin);

    plugin.registerFunction('ChromeDevTools_Page_reload', this.pageReload, {
      sync: false,
    });
    plugin.registerFunction(
      'ChromeDevTools_CSS_createStyleSheet',
      this.cssCreateStyleSheet,
      { sync: false },
    );

    plugin.registerCommand('ChromeDevToolsConnect', this.listOrConnect, {
      nargs: '*',
    });

    plugin.registerAutocmd('TextChanged', this.cssSetStyleSheetText, {
      pattern: '*.css',
    });
    plugin.registerAutocmd(
      'TextChangedI',
      debounce(this.cssSetStyleSheetText, 200),
      { pattern: '*.css' },
    );
  }

  async _getDefaultOptions() {
    const port = await this._nvim.getVar('ChromeDevTools_port');
    const host = await this._nvim.getVar('ChromeDevTools_host');

    return {
      host: host && typeof host == 'string' ? host : 'localhost',
      port: port && typeof port == 'string' ? port : '9222',
    };
  }

  listOrConnect = (args: string[]) => {
    if (args.length == 0) {
      this.list();
    } else {
      const [target] = args[0].split(':');
      this.connect(target);
    }
  };

  list = async () => {
    let targets;
    try {
      targets = await CDP.List(await this._getDefaultOptions());
    } catch (e) {
      echoerr(this._nvim, e.message);
    }

    if (!targets) {
      return;
    }

    const labels = targets.map(
      ({ id, title, url }) => `${id}: ${title} - ${url}`,
    );

    if (labels.length == 0) {
      echomsg(this._nvim, 'No targets available.');
    } else {
      await this._nvim.call('fzf#run', {
        down: '40%',
        sink: 'ChromeDevToolsConnect',
        source: labels,
      });
      // Force focus on fzf.
      await this._nvim.input('<c-m>');
    }
  };

  connect = async (target: string) => {
    const defaultOptions = await this._getDefaultOptions();
    const chrome = await CDP({ ...defaultOptions, target });
    this._chrome = chrome;

    this._js._chrome = chrome;
    this._scripts = [];
    chrome.Debugger.scriptParsed(script => {
      this._scripts.push(script);
    });

    await chrome.Page.enable();
    await chrome.DOM.enable();
    await chrome.CSS.enable();
    await chrome.Runtime.enable();
    await chrome.Debugger.enable();

    chrome.once('disconnect', () => {
      echomsg(this._nvim, 'Disconnected from target.');
    });

    echomsg(this._nvim, 'Connected to target: ' + target);
  };

  pageReload = () => {
    this._chrome.Page.reload();
  };

  cssCreateStyleSheet = async () => {
    const { _chrome: chrome, _nvim: nvim } = this;

    // Get the top level frame id.
    const { frameTree } = await chrome.Page.getResourceTree();
    const frameId = frameTree.frame.id;

    const { styleSheetId } = await chrome.CSS.createStyleSheet({ frameId });
    await nvim.command(`edit ${styleSheetId}.css`);
    const buffer = await nvim.buffer;
    await buffer.setVar('ChromeDevTools_styleSheetId', styleSheetId);
  };

  cssSetStyleSheetText = async () => {
    const buffer = await this._nvim.buffer;
    const styleSheetId = await buffer.getVar('ChromeDevTools_styleSheetId');

    if (!styleSheetId || typeof styleSheetId != 'string') {
      return;
    }

    const lines = await buffer.lines;
    const text = lines.join('\n');
    await this._chrome.CSS.setStyleSheetText({ styleSheetId, text });
  };
}
