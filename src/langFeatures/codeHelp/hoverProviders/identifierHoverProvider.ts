import * as vscode from 'vscode';
import { findIdentifierDefinition } from '../common/definitionFinder';
import { getClickedIdentifierSegment } from '../common/getClickedIdentifierSegment';

export class IdentifierHoverProvider implements vscode.HoverProvider {
    async provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): Promise<vscode.Hover | undefined> {
        const segment = getClickedIdentifierSegment(document, position);
        if (!segment) {
            return undefined;
        }

        const definition = await findIdentifierDefinition(document, position);
        if (!definition) {
            return undefined;
        }

        const definitionDocument = await vscode.workspace.openTextDocument(definition.uri)

        const line = definitionDocument.lineAt(definition.range.start.line);

        return new vscode.Hover(`\t${line.text.trim()}`);
    }
}