import * as vscode from 'vscode';
import { findIdentifierDefinition } from '../common/definitionFinder';

/**
 * Returns true if the given line text is a definition line.
 * We skip such lines when coloring identifier usages.
 */
function isDefinitionLine(text: string): boolean {
    // Definitions start with a colon (labels), a dot (def* lines)
    // or an asterisk (module/region definitions)
    return /^\s*[:\.*]/.test(text);
}

/**
 * Given a definition line, determine the semantic type.
 */
function getDefinitionType(defLineText: string): string {
    if (/^\s*:/.test(defLineText)) {
        return 'function';
    } else if (/^\s*\*(@module\s+)?/.test(defLineText)) {
        // If it contains "@module", treat as module; otherwise region.
        return /@module/.test(defLineText) ? 'operator' : 'keyword';
    } else if (/^\s*\.defreg/.test(defLineText)) {
        return 'typeParameter';
    } else if (/^\s*\.defnum/.test(defLineText)) {
        return 'number';
    } else if (/^\s*\.def(?!reg|num)/.test(defLineText)) {
        return 'number';
    }
    return 'string';
}

/**
 * Semantic tokens provider that colors identifier usages based on their resolved definition.
 * For each identifier usage (that is not itself a definition), it calls your findIdentifierDefinition method.
 * Then it inspects the definition line (from the resolved document) to decide which token type to assign.
 */
export class IdentifierSemanticTokensProvider implements vscode.DocumentSemanticTokensProvider {
    semanticLegend: vscode.SemanticTokensLegend;
    tokenTypes: string[];

    constructor(
        semanticLegend: vscode.SemanticTokensLegend,
        tokenTypes: string[]) {
        this.semanticLegend = semanticLegend;
        this.tokenTypes = tokenTypes;
    }

    public async provideDocumentSemanticTokens(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): Promise<vscode.SemanticTokens> {
        const builder = new vscode.SemanticTokensBuilder(this.semanticLegend);
        // Regex for identifiers with optional dotted segments.
        // (Each identifier must start with a letter and may include letters, digits, and underscores.)
        const identifierRegex = /[A-Za-z][A-Za-z0-9_]*(?:\.[A-Za-z][A-Za-z0-9_]*)*/g;

        // Process each line.
        for (let line = 0; line < document.lineCount; line++) {
            const lineText = document.lineAt(line).text;
            // Skip definition lines.
            if (isDefinitionLine(lineText)) {
                continue;
            }

            let match: RegExpExecArray | null;
            while ((match = identifierRegex.exec(lineText)) !== null) {
                const fullIdentifier = match[0];

                const segments = fullIdentifier.split('.');
                let cumulativeLength = 0;

                for (let segmentIndex = 0; segmentIndex < segments.length; segmentIndex++) {
                    const segment = segments[segmentIndex];
                    const startChar = match.index + cumulativeLength;

                    // To resolve the definition, we use a position in the middle of the match.
                    const pos = new vscode.Position(line, startChar + segment.length);

                    // Use your definition resolver to get the definition location.
                    const defLocation = await findIdentifierDefinition(document, pos);
                    if (defLocation) {
                        // Open the document where the definition was found.
                        let defDoc: vscode.TextDocument;
                        if (defLocation.uri.toString() === document.uri.toString()) {
                            defDoc = document;
                        } else {
                            defDoc = await vscode.workspace.openTextDocument(defLocation.uri);
                        }
                        const defLine = defDoc.lineAt(defLocation.range.start.line);
                        const type = getDefinitionType(defLine.text);
                        const tokenTypeIndex = this.tokenTypes.indexOf(type);
                        if (tokenTypeIndex >= 0) {
                            builder.push(line, startChar, segment.length, tokenTypeIndex);
                        }
                    }

                    cumulativeLength += segment.length + 1;
                }
            }
        }

        return builder.build();
    }
}