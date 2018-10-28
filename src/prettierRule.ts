import * as utils from 'eslint-plugin-prettier';
import LineAndColumn from 'lines-and-columns';
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
    const [ruleArgument1, ruleArgument2 = {}] = this.options;
    const { editorconfig = true } = ruleArgument2;

    let options: prettier.Options = {};

    switch (typeof ruleArgument1) {
      case 'string': {
        const configFilePath = path.resolve(
          process.cwd(),
          ruleArgument1 as string,
        );

        const resolvedConfig = prettier.resolveConfig.sync(
          sourceFile.fileName,
          { config: configFilePath, editorconfig },
        );

        // istanbul ignore next
        if (resolvedConfig === null) {
          throw new Error(`Config file not found: ${configFilePath}`);
        }

        options = resolvedConfig;
        break;
      }
      case 'object':
        if (ruleArgument1) {
          options = ruleArgument1 as prettier.Options;
          break;
        }
      // falls through for null
      default: {
        const resolvedConfig = prettier.resolveConfig.sync(
          sourceFile.fileName,
          { editorconfig },
        );

        if (resolvedConfig !== null) {
          options = resolvedConfig;
        }

        break;
      }
    }

    const source = sourceFile.getFullText();

    try {
      const formatted = prettier.format(source, {
        parser: 'typescript',
        ...options,
      });

      if (source === formatted) {
        return;
      }

      reportDifferences(this, source, formatted);
    } catch (e) {
      // istanbul ignore else
      if (e.loc) {
        reportSyntaxError(this, source, e);
      } else {
        throw e;
      }
    }
  }
}

function reportSyntaxError(
  walkContext: tslint.WalkContext<any>,
  source: string,
  error: { message: string; loc: { start: { line: number; column: number } } },
) {
  const locator = new LineAndColumn(source);
  const offset = locator.indexForLocation({
    column: error.loc.start.column - 1,
    line: error.loc.start.line - 1,
  })!;
  const message = error.message
    .split('\n')[0]
    .replace(/\s*\(\d+:\d+\)\s*$/, '');
  walkContext.addFailureAt(offset, 1, `SyntaxError: ${message}`);
}

function reportDifferences(
  walkContext: tslint.WalkContext<any>,
  source: string,
  formatted: string,
) {
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
        walkContext.addFailureAt(
          start,
          1,
          `Insert \`${insertCode}\``,
          tslint.Replacement.appendText(start, insertText),
        );
        break;
      case 'delete':
        walkContext.addFailure(
          start,
          end,
          `Delete \`${deleteCode}\``,
          tslint.Replacement.deleteFromTo(start, end),
        );
        break;
      case 'replace':
        walkContext.addFailure(
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
