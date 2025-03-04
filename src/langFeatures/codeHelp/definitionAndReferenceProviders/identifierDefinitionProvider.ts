import * as vscode from 'vscode';
import { findIdentifierDefinition } from '../common/definitionFinder';

/**
 * DefinitionProvider that uses the clicked segment logic and
 * checks for exported regions in modules (three-segment case).
 */
export class IdentifierDefinitionProvider implements vscode.DefinitionProvider {
    async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): Promise<vscode.Location | undefined> {
        return await findIdentifierDefinition(document, position);
    }
}
