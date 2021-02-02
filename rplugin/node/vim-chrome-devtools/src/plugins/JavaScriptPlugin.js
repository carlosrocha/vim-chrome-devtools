import { getVisualSelection } from '../utils';
import { echoerr } from '../echo';

export default class JavaScriptPlugin {
  constructor(plugin) {
    this._nvim = plugin.nvim;

    plugin.registerFunction(
      'ChromeDevTools_Runtime_evaluate',
      this.runtimeEvaluate,
      { range: true },
    );
  }

  runtimeEvaluate = async (args) => {
    const expression =
      args.length > 0 ? args[0] : await getVisualSelection(this._nvim);

    const result = await this._chrome.Runtime.evaluate({
      expression,
      generatePreview: true,
    });

    if (result.exceptionDetails) {
      echoerr(
        this._nvim,
        `Failed with message: ${result.exceptionDetails.text}`,
      );
      return;
    }

    console.log(result);
  };
}
