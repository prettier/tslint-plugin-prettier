import assert = require('assert');
import * as utils from 'eslint-plugin-prettier';
import * as path from 'path';
import * as prettier from 'prettier';
import * as tslint from 'tslint';
import * as ts from 'typescript';

export class Rule extends tslint.Rules.AbstractRule {
  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    return this.applyWithWalker(
      new Walker(sourceFile, this.ruleName, this.ruleArguments),
    );
  }
}

class Walker extends tslint.AbstractWalker<any[]> {
  public walk(sourceFile: ts.SourceFile) {
    const [ruleArgument1] = this.options;

    let options: prettier.Options = {};

    switch (typeof ruleArgument1) {
      case 'object':
        options = ruleArgument1 as prettier.Options;
        break;
      case 'string': {
        try {
          assert_existence_of_resolve_config_sync();
        } catch {
          // istanbul ignore next
          throw new Error(
            `Require prettier@1.7.0+ to specify config file, but got prettier@${
              prettier.version
            }.`,
          );
        }

        const filePath = path.resolve(process.cwd(), ruleArgument1 as string);
        const resolvedConfig = prettier.resolveConfig.sync(filePath);

        // istanbul ignore next
        if (resolvedConfig === null) {
          throw new Error(`Config file not found: ${filePath}`);
        }

        options = resolvedConfig;
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

        const resolvedConfig = prettier.resolveConfig.sync(sourceFile.fileName);

        if (resolvedConfig !== null) {
          options = resolvedConfig;
        }

        break;
      }
    }

    const source = sourceFile.getFullText();
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
        deleteText = '',
        insertText = '',
      } = difference;

      const end = start + deleteText.length;
      const deleteCode = utils.showInvisibles(deleteText);
      const insertCode = utils.showInvisibles(insertText);

      switch (operation) {
        case 'insert':
          this.addFailureAt(
            start,
            1,
            `Insert \`${insertCode}\``,
            tslint.Replacement.appendText(start, insertText),
          );
          break;
        case 'delete':
          this.addFailure(
            start,
            end,
            `Delete \`${deleteCode}\``,
            tslint.Replacement.deleteFromTo(start, end),
          );
          break;
        case 'replace':
          this.addFailure(
            start,
            end,
            `Replace \`${deleteCode}\` with \`${insertCode}\``,
            tslint.Replacement.replaceFromTo(start, end, insertText),
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
  assert(typeof prettier.resolveConfig.sync === 'function');
}
