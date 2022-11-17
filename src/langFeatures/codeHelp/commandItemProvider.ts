import {
    CancellationToken,
    CompletionItem,
    CompletionItemKind,
    CompletionItemProvider,
    Position,
    TextDocument
    } from 'vscode';
import { KpcCommandType } from './docs/kpcCommandType';

'use strict';

const commandDescriptions = Object.entries(KpcCommandType).map(([label, details]) => ({ label, details: String(details) }));
class CommandItemProvider implements CompletionItemProvider {
    public provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken): Thenable<CompletionItem[]> {

        return new Promise((a, r) => this.getCompletionItems(document, position, a, r));
    }

    private getCompletionItems(document: TextDocument, position: Position, onfulfilled, onrejected) {
        const line = document.lineAt(position.line).text.replace(/\s+/g, "");
        if (line.length == 1 && (line.match(/\./g) || []).length == 1) {
            const allCommands = this.provideCommands();
            onfulfilled(allCommands);
        } else {
            onrejected();
        }
    }

    private provideCommands(): CompletionItem[] {
        return commandDescriptions.map(e => ({
            label: e.label.toLowerCase(),
            detail: e.details,
            kind: CompletionItemKind.Keyword
        }));
    }
}

export default CommandItemProvider;
