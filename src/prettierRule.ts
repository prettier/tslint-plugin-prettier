import * as utils from 'eslint-plugin-prettier';
import * as prettier from 'prettier';
import * as tslint from 'tslint';
import * as ts from 'typescript';

// tslint:disable:naming-convention
declare module 'prettier' {
  export namespace resolveConfig {
    function sync(
      filePath?: string,
      options?: ResolveConfigOptions,
    ): null | Options;
  }
}
// tslint:enable:naming-convention

// tslint:disable:max-classes-per-file no-use-before-declare restrict-plus-operands

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
      default:
        const resolved_config = prettier.resolveConfig.sync(
          source_file.fileName,
        );
        if (resolved_config !== null) {
          options = resolved_config;
        }
        break;
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
