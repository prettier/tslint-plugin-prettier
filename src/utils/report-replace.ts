import * as tslint from 'tslint';
import { show_invisibles } from './show-invisibles';

// modified from https://github.com/prettier/eslint-plugin-prettier/blob/6c351c3/eslint-plugin-prettier.js#L241-L265

export function report_replace(
  context: tslint.WalkContext<any>,
  offset: number,
  delete_text: string,
  insert_text: string,
) {
  const start = offset;
  const end = offset + delete_text.length;

  const delete_code = show_invisibles(delete_text);
  const insert_code = show_invisibles(insert_text);

  context.addFailure(
    start,
    end,
    `Replace \`${delete_code}\` with \`${insert_code}\``,
    tslint.Replacement.replaceFromTo(start, end, insert_text),
  );
}
