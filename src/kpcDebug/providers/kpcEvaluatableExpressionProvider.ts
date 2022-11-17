import {
    EvaluatableExpression,
    EvaluatableExpressionProvider,
    Position,
    ProviderResult,
    Range,
    TextDocument
    } from 'vscode';

export class KpcEvaluatableExpressionProvider implements EvaluatableExpressionProvider {
    provideEvaluatableExpression(document: TextDocument, position: Position): ProviderResult<EvaluatableExpression> {
        const registerRegex = /(\$[a-z][a-z0-9]*)/ig
        const VARIABLE_REGEXP = /([a-z][a-z0-9]*)/ig;
        const line = document.lineAt(position.line).text;
        const separator = ":/?";

        let m: RegExpExecArray | null;

        while (m = registerRegex.exec(line)) {
            const varName = `${m[1]}`;
            const varRange = new Range(position.line, m.index, position.line, m.index + m[0].length);

            if (varRange.contains(position)) {
                return new EvaluatableExpression(varRange, `${varName}${separator}${position.line}${separator}${document.fileName}`);
            }
        }

        while (m = VARIABLE_REGEXP.exec(line)) {
            const varName = `${m[1]}`;
            const varRange = new Range(position.line, m.index, position.line, m.index + m[0].length);

            if (varRange.contains(position)) {
                return new EvaluatableExpression(varRange, `${varName}${separator}${position.line}${separator}${document.fileName}`);
            }
        }
        return undefined;
    }
}