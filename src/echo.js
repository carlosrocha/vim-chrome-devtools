export function echoerr(nvim, msg) {
  return nvim.command(`echohl Error | echomsg "${msg}" | echohl None`);
}

export function echowarn(nvim, msg) {
  return nvim.command(`echohl WarningMsg | echomsg "${msg}" | echohl None`);
}

export function echomsg(nvim, msg) {
  return nvim.command(`echomsg "${msg}"`);
}
