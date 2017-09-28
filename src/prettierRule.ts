import assert = require('assert');
import * as utils from 'eslint-plugin-prettier';
import * as path from 'path';
import * as prettier from 'prettier';
import * as tslint from 'tslint';
import * as ts from 'typescript';

// tslint:disable:max-classes-per-file no-use-before-declare

export class Rule extends tslint.Rules.AbstractRule {
  public apply(source_file: ts.SourceFile): tslint.RuleFailure[] {
    return this.applyWithWalker(
      new Walker(source_file, this.ruleName, this.ruleArguments),
    );
  }
}

class Walker extends tslint.AbstractWalker<any[]> {
  public walk(source_file: ts.SourceFile) {
    const [rule_argument_1] = this.options;

    let options: prettier.Options = {};

    switch (typeof rule_argument_1) {
      case 'object':
        options = rule_argument_1 as prettier.Options;
        break;
      case 'string': {
        try {
          assert_existence_of_resolve_config_sync();
        } catch {
          // istanbul ignore next
          throw new Error(
            `Require prettier@1.7.0+ to specify config file, but got prettier@${prettier.version}.`,
          );
        }

        const file_path = path.resolve(
          process.cwd(),
          rule_argument_1 as string,
        );
        const resolved_config = prettier.resolveConfig.sync(file_path);

        // istanbul ignore next
        if (resolved_config === null) {
          throw new Error(`Config file not found: ${file_path}`);
        }

        options = resolved_config;
        break;
      }
      default: {
        try {
          assert_existence_of_resolve_config_sync();
        } catch {
          // backward compatibility: use default options if no resolveConfig.sync()
          // istanbul ignore next
          break;
        }

        const resolved_config = prettier.resolveConfig.sync(
          source_file.fileName,
        );

        if (resolved_config !== null) {
          options = resolved_config;
        }

        break;
      }
    }

    const source = source_file.getFullText();
    const formatted = prettier.format(source, {
      parser: 'typescript',
      ...options,
    });

    if (source === formatted) {
      return;
    }

    utils.generateDifferences(source, formatted).forEach(difference => {
      const {
        operation,
        offset: start,
        deleteText: delete_text = '',
        insertText: insert_text = '',
      } = difference;

      const end = start + delete_text.length;
      const delete_code = utils.showInvisibles(delete_text);
      const insert_code = utils.showInvisibles(insert_text);

      switch (operation) {
        case 'insert':
          this.addFailureAt(
            start,
            1,
            `Insert \`${insert_code}\``,
            tslint.Replacement.appendText(start, insert_text),
          );
          break;
        case 'delete':
          this.addFailure(
            start,
            end,
            `Delete \`${delete_code}\``,
            tslint.Replacement.deleteFromTo(start, end),
          );
          break;
        case 'replace':
          this.addFailure(
            start,
            end,
            `Replace \`${delete_code}\` with \`${insert_code}\``,
            tslint.Replacement.replaceFromTo(start, end, insert_text),
          );
          break;
        // istanbul ignore next
        default:
          throw new Error(`Unexpected operation '${operation}'`);
      }
    });
  }
}

function assert_existence_of_resolve_config_sync() {
  // tslint:disable-next-line:strict-type-predicates
  assert(typeof prettier.resolveConfig.sync === 'function');
}
