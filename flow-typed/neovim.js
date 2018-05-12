declare module 'neovim' {
  declare type AutocmdOptions = {
    pattern?: string,
    sync?: boolean,
    eval?: string,
  };

  declare type CommandOptions = { nargs?: '*' | '?', sync?: boolean };

  declare type FunctionOptions = {
    sync?: boolean,
    eval?: string,
    range: boolean,
  };

  declare export function Plugin(args?: {
    dev?: boolean,
    name?: string,
  }): Function;

  declare export function Command(cmd: string, args?: CommandOptions): Function;

  declare export function Autocmd(
    cmd: string,
    options?: AutocmdOptions,
  ): Function;

  declare export function Function(
    name: string,
    options?: FunctionOptions,
  ): Function;

  declare class BaseApi {
    data: string;
    getVar(name: string): Promise<string>;
    setVar(name: string, value: *): Promise<*>;
    deleteVar(name: string): Promise<*>;
  }

  declare type BufferSetLines = {
    start?: number,
    end?: number,
    strictIndexing?: boolean,
  };

  declare export class Buffer extends BaseApi {
    lines: Promise<string[]>;
    name: Promise<string>;
    mark(name: string): Promise<[number, number]>;
    getLines(params?: BufferSetLines): Promise<string[]>;
    setLines(lines: string[], args: BufferSetLines): Promise<void>;
  }

  declare export class NeovimPlugin {
    nvim: NeovimClient;
    registerCommand(
      commandName: string,
      fn: (args: string[]) => ?Promise<*>,
      options?: CommandOptions,
    ): void;
    registerFunction(
      functionName: string,
      fn: (args: string[]) => ?Promise<*>,
      options?: FunctionOptions,
    ): void;
    registerAutocmd(
      autocmd: string,
      fn: (args: string) => ?Promise<*>,
      options?: AutocmdOptions,
    ): void;
  }

  declare export class NeovimClient extends BaseApi {
    buffer: Promise<Buffer>;
    buffers: Promise<Buffer[]>;
    eval(args: string): Promise<string>;
    call(fnName: string, args: any): Promise<void>;
    command(command: string): Promise<void>;
    input(keys: string): Promise<number>;
  }
}
