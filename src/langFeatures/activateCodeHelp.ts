import * as vscode from 'vscode';
import CommandItemProvider from './codeHelp/commandItemProvider';
import InstructionItemProvider from './codeHelp/instructionItemProvider';
import { ExtensionContext } from 'vscode';
'use strict';


const activateCodeHelp = (context: ExtensionContext) => {
    //context.subscriptions.push(vscode.languages.registerSignatureHelpProvider('kpc', new GoSignatureHelpProvider(), ' ', "\t"));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider('kpc', new InstructionItemProvider()));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider('kpc', new CommandItemProvider(), '.'));
}

export default activateCodeHelp;