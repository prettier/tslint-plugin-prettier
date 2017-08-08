// modified from https://github.com/prettier/eslint-plugin-prettier/blob/6c351c3/eslint-plugin-prettier.js#L81-L105

export function show_invisibles(str: string) {
  let ret = '';
  // tslint:disable-next-line:prefer-for-of
  for (let i = 0; i < str.length; i++) {
    switch (str[i]) {
      case ' ':
        ret += '·'; // Middle Dot, \u00B7
        break;
      case '\n':
        ret += '⏎'; // Return Symbol, \u23ce
        break;
      case '\t':
        ret += '↹'; // Left Arrow To Bar Over Right Arrow To Bar, \u21b9
        break;
      default:
        ret += str[i];
        break;
    }
  }
  return ret;
}
