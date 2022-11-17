import {
    InlineValue,
    InlineValueContext,
    InlineValuesProvider,
    InlineValueVariableLookup,
    ProviderResult,
    Range,
    TextDocument
    } from 'vscode';

export class KpcInlineValuesProvider implements InlineValuesProvider {
    provideInlineValues(document: TextDocument, viewport: Range, context: InlineValueContext): ProviderResult<InlineValue[]> {
        const usedVariables: Array<string> = []
        const allValues: InlineValue[] = [];

        for (let l = context.stoppedLocation.end.line - 1; l >= viewport.start.line; l--) {
            const line = document.lineAt(l);
            var regExp = /\$([a-z][a-z0-9]*)/ig;	// variables are words starting with '$'
            do {
                var m = regExp.exec(line.text);
                if (m) {
                    const varName = `${m[1]}`;
                    const varRange = new Range(l, m.index, l, m.index + varName.length);

                    if (!usedVariables.includes(varName)) {
                        allValues.push(new InlineValueVariableLookup(varRange, varName, false));
                        usedVariables.push(varName);
                    }
                }
            } while (m);
        }

        return allValues;
    }
}