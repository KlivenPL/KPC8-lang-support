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
import { signatureContext } from '../common/signatureContext';
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
        // Get the full text of the current line.
        const lineText = document.lineAt(position.line).text;

        // Split the line into segments delimited by ';' and record their start/end positions.
        const segments: { text: string; start: number; end: number }[] = [];
        let segStart = 0;
        for (let i = 0; i < lineText.length; i++) {
            if (lineText[i] === ';') {
                segments.push({
                    text: lineText.substring(segStart, i),
                    start: segStart,
                    end: i
                });
                segStart = i + 1;
            }
        }
        // Push the final segment.
        segments.push({
            text: lineText.substring(segStart),
            start: segStart,
            end: lineText.length
        });

        // Find the active segment (the one in which the caret is located).
        let activeSegment = segments.find(seg => position.character >= seg.start && position.character <= seg.end);
        if (!activeSegment) {
            activeSegment = segments[segments.length - 1];
        }

        // Calculate the relative caret position within the active segment.
        const relativeCaret = position.character - activeSegment.start;
        // Get the text from the start of the segment to the caret.
        const segmentText = activeSegment.text.substring(0, relativeCaret);
        const trimmedSegment = segmentText.trim();

        // If there's no meaningful text in the segment, reject.
        if (!trimmedSegment) {
            this.clearSignatureContext()
            onrejected();
            return;
        }

        // Split the segment into tokens by whitespace.
        const tokens = trimmedSegment.split(/\s+/);
        // The first token is the instruction/command name.
        let instructionName = tokens[0];
        if (instructionName.startsWith('.')) {
            instructionName = instructionName.substring(1);
        }

        // Determine the active argument index.
        // The number of arguments already typed is tokens.length - 1 (instruction is token[0]).
        // If the segment text ends with whitespace, then the user is starting a new argument.
        let argumentIndex: number;
        if (/\s$/.test(segmentText)) {
            argumentIndex = tokens.length - 1;
        } else {
            argumentIndex = tokens.length - 2;
        }
        if (argumentIndex < 0) {
            argumentIndex = 0;
        }

        // Call your signature provider with the instruction/command name and active argument index.
        const signature = this.provideSignature(instructionName, argumentIndex, false);
        if (signature) {
            this.setSignatureContext(signature.KpcSignature, argumentIndex);
            onfulfilled(signature.SignatureHelp);
            return;
        }

        this.clearSignatureContext()
        onrejected();
    }

    private setSignatureContext(signature: IKpcSignature, index: number) {
        signatureContext.activeArgumentIndex = index;
        signatureContext.kpcSignature = signature;
        signatureContext.dirty = false;
    }

    private clearSignatureContext() {
        signatureContext.activeArgumentIndex = undefined;
        signatureContext.kpcSignature = undefined;
        signatureContext.dirty = true;
    }

    private getHover(document: TextDocument, position: Position, onfulfilled, onrejected) {
        const fullLine = document.lineAt(position.line).text;
        let word = this.getWordAt(fullLine, position.character);

        if (word.startsWith('.')) {
            word = word.substring(1);
        }

        const signature = this.provideSignature(word, 0, true);
        if (signature) {
            const hover: Hover = new Hover(signature.SignatureHelp.signatures[0]!.documentation! as MarkdownString);
            onfulfilled(hover);
        }

        onrejected();
    }

    private provideSignature(instructionName: string, argumentIndex: number, withDocumentation: boolean): { SignatureHelp: SignatureHelp, KpcSignature: IKpcSignature } | undefined {
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

        return { KpcSignature: signature, SignatureHelp: signatureHelp };
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
