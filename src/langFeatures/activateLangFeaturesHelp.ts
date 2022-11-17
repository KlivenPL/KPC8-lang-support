import * as vscode from 'vscode';
import CommandItemProvider from './codeHelp/commandItemProvider';
import InstructionItemProvider from './codeHelp/instructionItemProvider';
import InstructionSignatureProvider from './codeHelp/instructionSignatureProvider';
import { ExtensionContext } from 'vscode';
'use strict';

const activateLangFeatures = (context: ExtensionContext) => {
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider('kpc', new InstructionItemProvider()));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider('kpc', new CommandItemProvider(), '.'));

    const instructionSignatureAndHoverProvider = new InstructionSignatureProvider();
    context.subscriptions.push(vscode.languages.registerSignatureHelpProvider('kpc', instructionSignatureAndHoverProvider, ' ', '\t'));
    context.subscriptions.push(vscode.languages.registerHoverProvider('kpc', instructionSignatureAndHoverProvider));
}

export default activateLangFeatures;