import * as tslint from 'tslint';
import { show_invisibles } from './show-invisibles';

// modified from https://github.com/prettier/eslint-plugin-prettier/blob/6c351c3/eslint-plugin-prettier.js#L220-L239

export function report_delete(
  context: tslint.WalkContext<any>,
  offset: number,
  delete_text: string,
) {
  const start = offset;
  const end = offset + delete_text.length;
  const delete_code = show_invisibles(delete_text);
  context.addFailure(
    start,
    end,
    `Delete \`${delete_code}\``,
    tslint.Replacement.deleteFromTo(start, end),
  );
}
