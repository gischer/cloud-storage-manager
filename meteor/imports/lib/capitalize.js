import R from 'ramda';

export function capitalize(string) {
  return R.concat(string[0].toUpperCase(), R.slice(1, Infinity, string));
}

export function unCapitalize(string) {
  return R.concat(string[0].toLowerCase(), R.slice(1, Infinity, string));
}
