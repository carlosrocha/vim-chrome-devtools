// @flow

import { type NeovimClient } from 'neovim';

export function echoerr(nvim: NeovimClient, msg: string) {
  return nvim.command(`echohl Error | echomsg "${msg}" | echohl None`);
}

export function echowarn(nvim: NeovimClient, msg: string) {
  return nvim.command(`echohl WarningMsg | echomsg "${msg}" | echohl None`);
}

export function echomsg(nvim: NeovimClient, msg: string) {
  return nvim.command(`echomsg "${msg}"`);
}
