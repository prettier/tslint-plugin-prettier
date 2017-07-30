import * as tslint from 'tslint';
import { show_invisibles } from './show-invisibles';

// modified from https://github.com/prettier/eslint-plugin-prettier/blob/6c351c3/eslint-plugin-prettier.js#L200-L218

export function report_insert(
  context: tslint.WalkContext<any>,
  offset: number,
  insert_text: string,
) {
  const start = offset;
  const insert_code = show_invisibles(insert_text);
  context.addFailureAt(
    start,
    1,
    `Insert \`${insert_code}\``,
    tslint.Replacement.appendText(start, insert_text),
  );
}
