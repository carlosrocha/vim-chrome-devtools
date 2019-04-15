declare module 'chrome-remote-interface' {
  declare type StyleSheetOrigin =
    | 'injected'
    | 'user-agent'
    | 'inspector'
    | 'regular';

  declare type StyleSheetId = string;

  declare export type CSSStyleSheetHeader = {
    styleSheetId: StyleSheetId,
    frameId: string,
    sourceURL: string,
    origin: StyleSheetOrigin,
    length: number,
    disabled: boolean,
    isInline: boolean,
  };

  declare type ResourceType =
    | 'Document'
    | 'Stylesheet'
    | 'Image'
    | 'Media'
    | 'Font'
    | 'Script'
    | 'TextTrack'
    | 'XHR'
    | 'Fetch'
    | 'EventSource'
    | 'WebSocket'
    | 'Manifest'
    | 'Other';

  declare type Frame = {
    id: string,
    url: string,
    mimeType: string,
  };

  declare type FrameId = string;

  declare type FrameResource = {
    url: string,
    type: ResourceType,
    mimeType: string,
  };

  declare type FrameResourceTree = {
    frame: Frame,
    resources: FrameResource[],
  };

  declare export type Script = {
    scriptId: ScriptId,
    url: string,
    executionContextId: ExecutionContextId,
    sourceMapURL?: string,
  };

  declare class Page {
    enable(): Promise<void>;
    reload(): Promise<void>;
    frameNavigated(({ frame: Frame }) => void): void;
    frameAttached(({ frameId: FrameId, parentFrameId: FrameId }) => void): void;
    getResourceTree(): Promise<{ frameTree: FrameResourceTree }>;
    setAutoAttachToCreatedPages({ autoAttach: boolean }): Promise<void>;
  }

  declare class DOM {
    enable(): Promise<void>;
  }

  declare export type ExecutionContextDescription = {
    id: number,
    origin: string,
    name: string,
  };

  declare type CallFrame = {
    functionName: string,
    scriptId: ScriptId,
    url: string,
    lineNumber: number,
    columnNumber: number,
  };

  declare type StackTrace = {
    description?: string,
    callFrames: CallFrame[],
    parent?: StackTrace,
  };

  declare export type ExceptionDetails = {
    exceptionId: number,
    text: string,
    lineNumber: number,
    columnNumber: number,
    scriptId?: ScriptId,
    url?: string,
    stackTrace?: StackTrace,
    exception?: RemoteObject,
    executionContextId?: ExecutionContextId,
  };

  declare type Timestamp = number;
  declare type UniqueDebuggerId = string;
  declare type ExecutionContextId = number;
  declare type ScriptId = string;
  declare type RemoteObjectId = string;

  declare type PropertyPreview = {
    name: string,
    type: string,
    value?: string,
  };

  declare type ObjectPreview = {
    overflow: boolean,
    properties: PropertyPreview[],
  };

  declare type UnserializableValue = 'Infinity' | 'NaN' | '-Infinity' | '-0';

  declare type UndefinedObject = { type: 'undefined' };
  declare type StringObject = { type: 'string', value: string };
  declare type BooleanObject = { type: 'boolean', value: boolean };
  declare type UnserializableObject = {
    type: 'number',
    description: string,
    unserializableValue: UnserializableValue,
  };
  declare type NumberObject = {
    type: 'number',
    description: string,
    value: number,
  };
  declare type FunctionObject = {
    type: 'function',
    description: string,
    objectId: RemoteObjectId,
  };
  declare type NullObject = { type: 'object', subtype: 'null' };
  declare type JsonObject = {
    type: 'object',
    value: Object,
  };

  declare export type RemoteObject =
    | UndefinedObject
    | FunctionObject
    | StringObject
    | UnserializableObject
    | NumberObject
    | BooleanObject
    | JsonObject
    | NullObject
    | {
        type: 'object',
        subtype:
          | 'array'
          | 'regexp'
          | 'node'
          | 'date'
          | 'map'
          | 'set'
          | 'weakmap'
          | 'weakset'
          | 'iterator'
          | 'generator'
          | 'error'
          | 'proxy'
          | 'promise'
          | 'typedarray',
        preview: ObjectPreview,
        className: string,
        objectId: RemoteObjectId,
        description: string,
      };

  declare export type EvalResponse = {
    result: RemoteObject,
    exceptionDetails?: ExceptionDetails,
  };

  declare export type ConsoleEvent = {
    type: 'log' | 'debug' | 'info' | 'error' | 'warning',
    args: RemoteObject[],
    executionContextId: ExecutionContextId,
    timestamp: Timestamp,
  };

  declare export type ExceptionEvent = {
    timestamp: Timestamp,
    exceptionDetails: ExceptionDetails,
  };

  declare type CompileScriptResult =
    | { scriptId: ScriptId }
    | { exceptionDetails: ExceptionDetails };

  declare class Runtime {
    enable(): Promise<void>;
    consoleAPICalled(cb: (ev: ConsoleEvent) => void): void;
    compileScript(params: {
      expression: string,
      sourceURL: string,
      persistScript: boolean,
      executionContextId?: ExecutionContextId,
    }): Promise<CompileScriptResult>;
    discardConsoleEntries(): Promise<void>;
    evaluate(params: {
      expression: string,
      objectGroup?: string,
      includeCommandLineAPI?: boolean,
      silent?: boolean,
      contextId?: ExecutionContextId,
      returnByValue?: boolean,
      generatePreview?: boolean,
      userGesture?: boolean,
    }): Promise<EvalResponse>;
    exceptionThrown(cb: (exception: ExceptionEvent) => void): void;
    executionContextCreated(
      cb: (context: ExecutionContextDescription) => void,
    ): void;
    executionContextDestroyed(
      cb: ({ executionContextId: ExecutionContextId }) => void,
    ): void;
    executionContextsCleared(cb: () => void): void;
    queryObjects(params: {
      prototypeObjectId: RemoteObjectId,
    }): Promise<RemoteObject>;
    releaseObjectGroup(params: { objectGroup: string }): Promise<void>;
    runIfWaitingForDebugger(): Promise<void>;
    runScript(params: {
      scriptId: ScriptId,
      executionContextId?: ExecutionContextId,
    }): Promise<EvalResponse>;
  }

  declare class Debugger {
    enable(): Promise<{ debuggerId: UniqueDebuggerId }>;
    scriptParsed(cb: (arg: Script) => void): void;
    setBlackboxPatterns({ patterns: string[] }): Promise<void>;
    setScriptSource(params: {
      scriptId: ScriptId,
      scriptSource: string,
    }): Promise<void>;
    getScriptSource({ scriptId: ScriptId }): Promise<{ scriptSource: string }>;
    setPauseOnExceptions({ state: string }): Promise<void>;
    setAsyncCallStackDepth({ maxDepth: number }): Promise<void>;
  }

  declare class CSS {
    enable(): Promise<void>;
    createStyleSheet(params: { frameId: FrameId }): Promise<{
      styleSheetId: StyleSheetId,
    }>;
    styleSheetAdded(cb: (arg: { header: CSSStyleSheetHeader }) => void): void;
    styleSheetRemoved(cb: (arg: { styleSheetId: StyleSheetId }) => void): void;
    setStyleSheetText(params: {
      styleSheetId: StyleSheetId,
      text: string,
    }): Promise<void>;
    getStyleSheetText(params: { styleSheetId: StyleSheetId }): Promise<{
      text: string,
    }>;
  }

  declare class Inspector {
    enable(): Promise<void>;
  }

  declare class Profiler {
    enable(): Promise<void>;
  }

  declare class Overlay {
    enable(): Promise<void>;
  }

  declare class Network {
    enable(): Promise<void>;
  }

  declare class Log {
    enable(): Promise<void>;
    clear(): Promise<void>;
  }

  declare class Target {
    activateTarget({ targetId: string }): Promise<void>;
  }

  declare export class Chrome extends events$EventEmitter {
    CSS: CSS;
    DOM: DOM;
    Debugger: Debugger;
    Inspector: Inspector;
    Log: Log;
    Network: Network;
    Overlay: Overlay;
    Page: Page;
    Profiler: Profiler;
    Runtime: Runtime;
    Target: Target;

    host: string;
    port: number;
    target: string;
    secure: boolean;
    _ws: WebSocket;

    close(): Promise<void>;
    send(method: string, params: any): Promise<any>;
  }

  declare type TargetEntry = {
    id: string,
    description: string,
    title: string,
    url: string,
    type: 'page' | 'service_worker' | 'node',
  };

  declare type ConnectionOptions = {
    host?: string,
    port?: string,
    secure?: boolean,
  };

  declare type CDP = {
    (options: { target?: string } & ConnectionOptions): Promise<Chrome>,
    List(options?: ConnectionOptions): Promise<TargetEntry[]>,
    Activate(options: { id: string }): Promise<void>,
  };

  declare export default CDP;
}
