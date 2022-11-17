import {
    CancellationToken,
    Hover,
    HoverProvider,
    MarkdownString,
    Position,
    ProviderResult,
    SignatureHelp,
    SignatureHelpContext,
    SignatureHelpProvider,
    TextDocument
    } from 'vscode';
import { getInstructionSignatures } from './docs/kpcSignatures';
import { IKpcArgument } from './docs/types/kpcArgument';
import { KpcInstructionType } from './docs/kpcInstructionType';
import { TokenClass, TokenClassType } from './docs/types/tokenClass';

'use strict';

class InstructionSignatureProvider implements SignatureHelpProvider, HoverProvider {
    private instructionSignatures = getInstructionSignatures();
    private instructionDescriptions = Object.entries(KpcInstructionType).map(([label, details]) => ({ label: label.toLowerCase(), details: String(details) }));

    public provideSignatureHelp(document: TextDocument, position: Position, token: CancellationToken, context: SignatureHelpContext): ProviderResult<SignatureHelp> {
        return new Promise((a, r) => this.getSignature(document, position, a, r));
    }

    provideHover(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Hover> {
        return new Promise((a, r) => this.getHover(document, position, a, r));
    }

    private getSignature(document: TextDocument, position: Position, onfulfilled, onrejected) {
        const line = document.lineAt(position.line).text.substring(0, position.character);
        const codeStarRegex = /([a-zA-Z]+\s+)/;
        if (codeStarRegex.test(line)) {
            const name = line.match(codeStarRegex)![0].trim();
            const index = line.trimStart().match(/([\s]+)/g)?.length! - 1 ?? 0;
            const signature = this.provideSignatures(name, index, true);//.concat(this.providePseudoInstructions());
            if (signature) {
                onfulfilled(signature);
            }
        }

        onrejected();
    }

    private getHover(document: TextDocument, position: Position, onfulfilled, onrejected) {
        const fullLine = document.lineAt(position.line).text;
        const word = this.getWordAt(fullLine, position.character);

        const signature = this.provideSignatures(word, 0, false);//.concat(this.providePseudoInstructions());
        if (signature) {
            const hover: Hover = new Hover(signature.signatures[0]!.documentation! as MarkdownString);
            onfulfilled(hover);
        }

        onrejected();
    }

    private getWordAt(str: string, pos: number) {
        // Search for the word's beginning and end.
        var left = str.slice(0, pos + 1).search(/\S+$/),
            right = str.slice(pos).search(/\s/);

        // The last word in the string is a special case.
        if (right < 0) {
            return str.slice(left);
        }

        // Return the word, using the located bounds to extract it from the string.
        return str.slice(left, right + pos);
    }


    private provideSignatures(instructionName: string, argumentIndex: number, withParameterDocumentation: boolean): SignatureHelp | undefined {
        const signature = this.instructionSignatures.find(x => x.name.toUpperCase() === instructionName.toUpperCase());
        if (!signature) {
            return undefined;
        }
        const signatureHelp: SignatureHelp = {
            activeParameter: argumentIndex,
            activeSignature: 0,
            signatures: [
                {
                    label: this.formatSignatureLabel(signature.name.toLowerCase(), signature.arguments),
                    parameters: signature.arguments.map((x, i) => { return { label: this.formatParametersLabel(x.tokenClass, i), documentation: withParameterDocumentation ? new MarkdownString(`*${this.formatParametersLabel(x.tokenClass, i)}* parameter`) : undefined } }),
                    documentation: new MarkdownString(`*${signature.name.toLowerCase()}* - ${this.instructionDescriptions.find(x => x.label == signature.name.toLowerCase())?.details}`)
                }
            ]
        };

        return signatureHelp;
    }

    private formatSignatureLabel(name: string, parameters: IKpcArgument[]) {
        const label: string[] = [];
        label.push(
            name,
            `${this.tokenClassToParameterName(parameters[0]?.tokenClass, 0)} ${this.tokenClassToParameterName(parameters[1]?.tokenClass, 1)} ${this.tokenClassToParameterName(parameters[2]?.tokenClass, 2)}`,
        );
        return label.join('\n');
    }

    private formatParametersLabel(name: TokenClassType, index: number) {
        return this.tokenClassToParameterName(name, index);
    }

    private tokenClassToParameterName(tokenClass: TokenClassType | undefined, i: number) {
        switch (tokenClass) {
            case undefined:
                return "";
            case TokenClass.Register:
                return `$r${i + 1}`;
            case TokenClass.Number:
                return `byte`;
            default:
                return `${tokenClass}${i + 1}`;
        }
    }
}

export default InstructionSignatureProvider;
