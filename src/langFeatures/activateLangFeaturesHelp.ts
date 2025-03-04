import * as vscode from 'vscode';
import CommandItemProvider from './codeHelp/itemProviders/commandItemProvider';
import CommandSignatureProvider from './codeHelp/signatureProviders/commandSignatureProvider';
import ExpressionValueHoverProvider from './codeHelp/hoverProviders/expressionValueHoverProvider';
import InstructionItemProvider from './codeHelp/itemProviders/instructionItemProvider';
import InstructionSignatureProvider from './codeHelp/signatureProviders/instructionSignatureProvider';
import PseudoinstructionSignatureProvider from './codeHelp/signatureProviders/pseudoinstructionSignatureProvider';
import { ExtensionContext } from 'vscode';
import { IdentifierDefinitionProvider } from './codeHelp/definitionAndReferenceProviders/identifierDefinitionProvider';
import { IdentifierHighlightProvider } from './codeHelp/highlightProviders/identifierHighlightProvider';
import { IdentifierHoverProvider } from './codeHelp/hoverProviders/identifierHoverProvider';
import { IdentifierItemProvider } from './codeHelp/itemProviders/identifierItemProvider';
import { IdentifierReferenceProvider } from './codeHelp/definitionAndReferenceProviders/identifierReferenceProvider';
import { IdentifierSemanticTokensProvider } from './codeHelp/semanticProviders/identifierSemanticTokenProvider';
import { KpcDocumentFormattingEditProvider } from './codeHelp/formatting/formattingEditProvider';
import { RegisterHoverProvider } from './codeHelp/hoverProviders/registerHoverProvider';
import { RegisterItemProvider } from './codeHelp/itemProviders/registerItemProvider';

const activateLangFeatures = (context: ExtensionContext) => {
    const completionItemTriggers = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];


    const instructionSignatureAndHoverProvider = new InstructionSignatureProvider();
    context.subscriptions.push(vscode.languages.registerSignatureHelpProvider('kpc', instructionSignatureAndHoverProvider, ' ', '\t'));
    context.subscriptions.push(vscode.languages.registerHoverProvider('kpc', instructionSignatureAndHoverProvider));

    const pseudoinstructionSignatureAndHoverProvider = new PseudoinstructionSignatureProvider();
    context.subscriptions.push(vscode.languages.registerSignatureHelpProvider('kpc', pseudoinstructionSignatureAndHoverProvider, ' ', '\t'));
    context.subscriptions.push(vscode.languages.registerHoverProvider('kpc', pseudoinstructionSignatureAndHoverProvider));

    const commandSignatureAndHoverProvider = new CommandSignatureProvider();
    context.subscriptions.push(vscode.languages.registerSignatureHelpProvider('kpc', commandSignatureAndHoverProvider, ' ', '\t'));
    context.subscriptions.push(vscode.languages.registerHoverProvider('kpc', commandSignatureAndHoverProvider));

    context.subscriptions.push(vscode.languages.registerHoverProvider('kpc', new IdentifierHoverProvider()));
    context.subscriptions.push(vscode.languages.registerHoverProvider('kpc', new RegisterHoverProvider()));
    context.subscriptions.push(vscode.languages.registerHoverProvider('kpc', new ExpressionValueHoverProvider()));

    context.subscriptions.push(vscode.languages.registerCompletionItemProvider('kpc', new InstructionItemProvider(), ...completionItemTriggers, '\n'));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider('kpc', new IdentifierItemProvider(), ...completionItemTriggers, '.'));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider('kpc', new RegisterItemProvider(), '$'));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider('kpc', new CommandItemProvider(), '.'));

    context.subscriptions.push(vscode.languages.registerDefinitionProvider('kpc', new IdentifierDefinitionProvider()));
    context.subscriptions.push(vscode.languages.registerReferenceProvider('kpc', new IdentifierReferenceProvider()));

    // Define our semantic token types.
    const tokenTypes = ['function', 'operator', 'keyword', 'typeParameter', 'number', 'string'];
    //const tokenModifiers: string[] = [];
    const semanticLegend = new vscode.SemanticTokensLegend(tokenTypes);

    const identifierSemanticTokenProvider = new IdentifierSemanticTokensProvider(semanticLegend, tokenTypes);
    context.subscriptions.push(vscode.languages.registerDocumentSemanticTokensProvider('kpc', identifierSemanticTokenProvider, semanticLegend));

    context.subscriptions.push(vscode.languages.registerDocumentHighlightProvider('kpc', new IdentifierHighlightProvider()));
    context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider('kpc', new KpcDocumentFormattingEditProvider()));
}

export default activateLangFeatures;