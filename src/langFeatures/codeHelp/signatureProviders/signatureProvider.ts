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
import { IKpcArgument } from '../docs/types/kpcArgument';
import { IKpcSignature } from '../docs/types/kpcSignature';
import { TokenClassType } from '../docs/types/tokenClass';

abstract class SignatureProvider implements SignatureHelpProvider, HoverProvider {
    protected abstract signatures: IKpcSignature[];
    protected abstract descriptions: {
        label: string;
        details: string;
    }[];

    protected prettyPrintSignatureName(signatureName: string) {
        return signatureName.toLowerCase();
    }

    public provideSignatureHelp(document: TextDocument, position: Position, token: CancellationToken, context: SignatureHelpContext): ProviderResult<SignatureHelp> {
        return new Promise((a, r) => this.getSignature(document, position, a, r));
    }

    public provideHover(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Hover> {
        return new Promise((a, r) => this.getHover(document, position, a, r));
    }

    protected abstract tokenClassToParameterName(tokenClass: TokenClassType | undefined, i: number): string;

    protected getWordAt(str: string, pos: number) {
        var left = str.slice(0, pos + 1).search(/\S+$/),
            right = str.slice(pos).search(/\s/);

        if (right < 0) {
            return str.slice(left);
        }

        return str.slice(left, right + pos);
    }

    private getSignature(document: TextDocument, position: Position, onfulfilled, onrejected) {
        const line = document.lineAt(position.line).text.substring(0, position.character);
        const codeStarRegex = /([a-zA-Z]+\s+)/;
        if (codeStarRegex.test(line)) {
            const name = line.match(codeStarRegex)![0].trim();
            const index = line.trimStart().match(/([\s]+)/g)?.length! - 1 ?? 0;
            const signature = this.provideSignature(name, index, false);
            if (signature) {
                onfulfilled(signature);
            }
        }

        onrejected();
    }

    private getHover(document: TextDocument, position: Position, onfulfilled, onrejected) {
        const fullLine = document.lineAt(position.line).text;
        let word = this.getWordAt(fullLine, position.character);

        if (word.startsWith('.')) {
            word = word.substring(1);
        }

        const signature = this.provideSignature(word, 0, true);
        if (signature) {
            const hover: Hover = new Hover(signature.signatures[0]!.documentation! as MarkdownString);
            onfulfilled(hover);
        }

        onrejected();
    }

    private provideSignature(instructionName: string, argumentIndex: number, withDocumentation: boolean): SignatureHelp | undefined {
        const signature = this.signatures.find(x => x.name.toUpperCase() === instructionName.toUpperCase());
        if (!signature) {
            return undefined;
        }
        const description = this.descriptions.find(x => x.label == signature.name.toLowerCase());
        const signatureHelp: SignatureHelp = {
            activeParameter: argumentIndex,
            activeSignature: 0,
            signatures: [
                {
                    label: this.formatSignatureLabel(this.prettyPrintSignatureName(signature.name), signature.arguments),
                    parameters: signature.arguments.map((x, i) => {
                        const parameterName = this.tokenClassToParameterName(x.tokenClass, i);
                        return {
                            label: parameterName,
                            documentation: new MarkdownString(`${description?.details.split("\n\n")[i + 2] ?? `\`${parameterName}\` - *${x.tokenClass}* parameter`}${withDocumentation ? '\n\n***' : ""}`)
                        }
                    }),
                    documentation: withDocumentation ?
                        new MarkdownString(`### ${this.formatSignatureLabel(this.prettyPrintSignatureName(signature.name), signature.arguments, "`")} - ${description?.details}`)
                        : undefined
                }
            ]
        };

        return signatureHelp;
    }

    private formatSignatureLabel(name: string, parameters: IKpcArgument[], parameterStyle: string = "") {
        const label: string[] = [];
        label.push(
            name
        );
        parameters.map((x, i) => label.push(`${parameterStyle}${this.tokenClassToParameterName(x.tokenClass, i)}${parameterStyle}`));

        return label.join(" ");
    }
}

export default SignatureProvider;
