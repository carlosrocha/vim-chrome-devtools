// @flow

import { type NeovimClient } from 'neovim';

export const debounce = (fn: (...params: *) => *, timeout: number) => {
  let timeoutId;

  return (...params: *) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn.call(this, ...params);
      timeoutId = null;
    }, timeout);
  };
};

export async function getVisualSelection(nvim: NeovimClient) {
  const buffer = await nvim.buffer;
  const [startLine, startCol] = await buffer.mark('<');
  const [endLine, endCol] = await buffer.mark('>');

  const lines = await buffer.getLines({ start: startLine - 1, end: endLine });
  if (lines.length == 0) {
    return '';
  } else if (startLine == endLine) {
    return lines[0].substring(startCol, endCol + 1);
  } else {
    const firstLine = lines[0].substring(startCol);
    const lastLine = lines[lines.length - 1].substring(0, endCol + 1);

    return [firstLine, ...lines, lastLine].join('\n');
  }
}
