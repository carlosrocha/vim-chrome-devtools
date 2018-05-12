// @flow

import CDP, { type Chrome } from 'chrome-remote-interface';
import { type NeovimPlugin, type NeovimClient } from 'neovim';

import { getVisualSelection, debounce } from './utils';

const portVarName = 'ChromeDevTools_port';
const hostVarName = 'ChromeDevTools_host';
const defaultPort = '9222';
const defaultHost = 'localhost';

export default class ChromeDevToolsPlugin {
  _plugin: NeovimPlugin;
  _nvim: NeovimClient;
  _chrome: Chrome;

  constructor(plugin: NeovimPlugin) {
    this._plugin = plugin;
    this._nvim = plugin.nvim;

    plugin.registerFunction('ChromeDevTools_Page_reload', this.pageReload);
    plugin.registerFunction(
      'ChromeDevTools_Runtime_evaluate',
      this.runtimeEvaluate,
      { range: true },
    );
    plugin.registerFunction(
      'ChromeDevTools_CSS_createStyleSheet',
      this.cssCreateStyleSheet,
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

  echoerr(err: string) {
    return this._nvim.command(`echohl Error | echomsg "${err}" | echohl None`);
  }

  echomsg(msg: string) {
    return this._nvim.command(`echomsg "${msg}"`);
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
    const port = await this._nvim.getVar(portVarName);
    const host = await this._nvim.getVar(hostVarName);
    const targets = await CDP.List({
      host: host ? host : defaultHost,
      port: port ? port : defaultPort,
    });

    const labels = targets
      .filter(target => target.type == 'page')
      .map(({ id, title, url }) => `${id}: ${title} - ${url}`);

    if (labels.length == 0) {
      this.echomsg('No targets available');
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
    const chrome = await CDP({ target });
    this._chrome = chrome;

    await chrome.Page.enable();
    await chrome.DOM.enable();
    await chrome.CSS.enable();
    await chrome.Runtime.enable();
    await chrome.Debugger.enable();

    chrome.once('disconnect', () => {
      this.echomsg('Disconnected from target.');
    });

    this.echomsg('Connected to target: ' + target);
  };

  pageReload = () => {
    this._chrome.Page.reload();
  };

  runtimeEvaluate = async (args: string[]) => {
    const expression =
      args.length > 0 ? args[0] : await getVisualSelection(this._nvim);

    const result = await this._chrome.Runtime.evaluate({
      expression,
      generatePreview: true,
    });

    if (result.exceptionDetails) {
      console.error(result.exceptionDetails);
      this.echoerr(`Failed with message: ${result.exceptionDetails.text}`);
    } else {
      this.echomsg('OK');
    }
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

    if (!styleSheetId) {
      return;
    }

    const lines = await buffer.lines;
    const text = lines.join('\n');
    await this._chrome.CSS.setStyleSheetText({ styleSheetId, text });
  };
}
