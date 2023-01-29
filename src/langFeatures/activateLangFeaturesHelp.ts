import * as vscode from 'vscode';
import CommandItemProvider from './codeHelp/itemProviders/commandItemProvider';
import CommandSignatureProvider from './codeHelp/signatureProviders/commandSignatureProvider';
import InstructionItemProvider from './codeHelp/itemProviders/instructionItemProvider';
import InstructionSignatureProvider from './codeHelp/signatureProviders/instructionSignatureProvider';
import PseudoinstructionSignatureProvider from './codeHelp/signatureProviders/pseudoinstructionSignatureProvider';
import { ExtensionContext } from 'vscode';

const activateLangFeatures = (context: ExtensionContext) => {
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider('kpc', new InstructionItemProvider()));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider('kpc', new CommandItemProvider(), '.'));

    const instructionSignatureAndHoverProvider = new InstructionSignatureProvider();
    context.subscriptions.push(vscode.languages.registerSignatureHelpProvider('kpc', instructionSignatureAndHoverProvider, ' ', '\t'));
    context.subscriptions.push(vscode.languages.registerHoverProvider('kpc', instructionSignatureAndHoverProvider));

    const pseudoinstructionSignatureAndHoverProvider = new PseudoinstructionSignatureProvider();
    context.subscriptions.push(vscode.languages.registerSignatureHelpProvider('kpc', pseudoinstructionSignatureAndHoverProvider, ' ', '\t'));
    context.subscriptions.push(vscode.languages.registerHoverProvider('kpc', pseudoinstructionSignatureAndHoverProvider));

    const commandSignatureAndHoverProvider = new CommandSignatureProvider();
    context.subscriptions.push(vscode.languages.registerSignatureHelpProvider('kpc', commandSignatureAndHoverProvider, ' ', '\t'));
    context.subscriptions.push(vscode.languages.registerHoverProvider('kpc', commandSignatureAndHoverProvider));
}

export default activateLangFeatures;