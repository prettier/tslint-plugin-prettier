import * as diff from 'fast-diff';
import * as tslint from 'tslint';
import { report_delete } from './report-delete';
import { report_insert } from './report-insert';
import { report_replace } from './report-replace';

// modified from https://github.com/prettier/eslint-plugin-prettier/blob/6c351c3/eslint-plugin-prettier.js#L111-L198

const line_ending_regex = /\r\n|[\r\n\u2028\u2029]/;

export function report_differences(
  context: tslint.WalkContext<any>,
  formatted: string,
) {
  const source = context.sourceFile.getFullText();
  const results = diff(source, formatted);

  const batch: diff.Diff[] = [];
  let offset = 0; // NOTE: INSERT never advances the offset.

  while (results.length > 0) {
    const result = results.shift()!;
    const [operation, text] = result;

    switch (operation) {
      case diff.INSERT:
      case diff.DELETE:
        batch.push(result);
        break;
      case diff.EQUAL:
        // tslint:disable-next-line:early-exit
        if (results.length > 0) {
          if (batch.length > 0) {
            if (line_ending_regex.test(text)) {
              flush();
              offset += text.length;
            } else {
              batch.push(result);
            }
          } else {
            offset += text.length;
          }
        }
        break;
      default:
        throw new Error(`Unexpected fast-diff operation '${operation}'`);
    }
    if (batch.length > 0 && results.length === 0) {
      flush();
    }
  }

  function flush() {
    let ahead_delete_text = '';
    let ahead_insert_text = '';
    while (batch.length > 0) {
      const next = batch.shift()!;
      const [operation, text] = next;

      switch (operation) {
        case diff.INSERT:
          ahead_insert_text += text;
          break;
        case diff.DELETE:
          ahead_delete_text += text;
          break;
        case diff.EQUAL:
          ahead_delete_text += text;
          ahead_insert_text += text;
          break;
        default:
          throw new Error(`Unexpected fast-diff operation '${operation}'`);
      }
    }

    if (ahead_delete_text.length > 0 && ahead_insert_text.length > 0) {
      report_replace(context, offset, ahead_delete_text, ahead_insert_text);
    } else if (ahead_delete_text.length === 0 && ahead_insert_text.length > 0) {
      report_insert(context, offset, ahead_insert_text);
    } else if (ahead_delete_text.length > 0 && ahead_insert_text.length === 0) {
      report_delete(context, offset, ahead_delete_text);
    }

    offset += ahead_delete_text.length;
  }
}
