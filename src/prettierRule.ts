import * as prettier from 'prettier';
import * as tslint from 'tslint';
import * as ts from 'typescript';
import { report_differences } from './utils/report-differences';

// tslint:disable:max-classes-per-file no-use-before-declare

export class Rule extends tslint.Rules.AbstractRule {
  public apply(source_file: ts.SourceFile): tslint.RuleFailure[] {
    const [raw_options = {}] = this.ruleArguments;
    const options: prettier.Options = {
      parser: 'typescript',
      ...raw_options as prettier.Options,
    };
    return this.applyWithWalker(
      new Walker(source_file, this.ruleName, options),
    );
  }
}

class Walker extends tslint.AbstractWalker<prettier.Options> {
  public walk(source_file: ts.SourceFile) {
    const source = source_file.getFullText();
    const formatted = prettier.format(source, this.options);
    if (source !== formatted) {
      report_differences(this, formatted);
    }
  }
}
