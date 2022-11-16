import * as vscode from 'vscode';
import {
    CancellationToken,
    CompletionItem,
    CompletionItemKind,
    CompletionItemProvider,
    Position,
    TextDocument
    } from 'vscode';
import { KpcInstructionType } from './kpcTypes/kpcInstructionType';
import { KpcPseudoinstructionType } from './kpcTypes/kpcPseudoInstructionType';

'use strict';

class InstructionItemProvider implements CompletionItemProvider {
    private kpcInstructionDescriptions = Object.entries(KpcInstructionType).map(([label, details]) => ({ label, details: String(details.split("\n\n")[0]) }));
    private kpcPseudoinstructionDescriptions = Object.entries(KpcPseudoinstructionType).map(([label, details]) => ({ label, details: String(details.split("\n\n")[0]) }));

    public provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken): Thenable<CompletionItem[]> {

        return new Promise((a, r) => this.getCompletionItems(document, position, a, r));
    }

    private getCompletionItems(document: TextDocument, position: Position, onfulfilled, onrejected) {
        const line = document.lineAt(position.line).text;
        const emptyLineRegex = /\S/;
        const codeStarRegex = /([a-zA-Z]+\s+)/;
        if (!emptyLineRegex.test(line) || !codeStarRegex.test(line)) {
            const allInstructions = this.provideInstructions().concat(this.providePseudoInstructions());
            onfulfilled(allInstructions);
        } else {
            onrejected();
        }
    }

    private provideInstructions(): CompletionItem[] {
        return this.kpcInstructionDescriptions.map(e => ({
            label: e.label.toLowerCase(),
            detail: e.details,
            kind: CompletionItemKind.Method
        }));
    }

    private providePseudoInstructions(): CompletionItem[] {
        return this.kpcPseudoinstructionDescriptions.map(e => ({
            label: e.label.toLowerCase(),
            detail: `${e.details} (pseudoinstruction)`,
            kind: CompletionItemKind.Method
        }));
    }
}

export default InstructionItemProvider;
