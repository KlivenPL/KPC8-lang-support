import * as vscode from 'vscode';
import { getClickedIdentifierSegment } from '../common/getClickedIdentifierSegment';

// Helper: Get the module name from a document by scanning for a module marker like "*@module ModuleA"
function getModuleName(document: vscode.TextDocument): string | undefined {
    const moduleRegex = /^\s*\*@module\s+(\S+)\s*$/m;
    const match = moduleRegex.exec(document.getText());
    return match ? match[1] : undefined;
}

// Helper: Returns the current region in the document at the given position.
// A region is defined by a marker line that starts with '*' (ignoring leading whitespace)
function getCurrentRegion(
    document: vscode.TextDocument,
    position: vscode.Position
): { start: number; end: number } | undefined {
    const markerRegex = /^\s*\*(\S+)\s*$/;
    for (let line = position.line; line >= 0; line--) {
        const lineText = document.lineAt(line).text;
        if (markerRegex.test(lineText)) {
            const regionStart = line;
            let regionEnd = document.lineCount - 1;
            for (let i = regionStart + 1; i < document.lineCount; i++) {
                if (markerRegex.test(document.lineAt(i).text)) {
                    regionEnd = i - 1;
                    break;
                }
            }
            return { start: regionStart, end: regionEnd };
        }
    }
    return undefined;
}

/**
 * DocumentHighlightProvider that highlights references in the current file (and within the current region)
 * according to the qualification level of the clicked identifier.
 *
 * Examples:
 * - If you click on "labelA" (an unqualified reference) then all unqualified "labelA" in the current region are highlighted.
 * - If you click on "regionB.labelA" on the "labelA" part, then only occurrences that appear as "regionB.labelA" are highlighted.
 * - If you click on "regionB" in "regionB.labelA", then only occurrences of "regionB" are highlighted.
 */
export class IdentifierHighlightProvider implements vscode.DocumentHighlightProvider {
    async provideDocumentHighlights(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): Promise<vscode.DocumentHighlight[]> {
        const highlights: vscode.DocumentHighlight[] = [];
        const clickedInfo = getClickedIdentifierSegment(document, position);
        if (!clickedInfo) {
            return highlights;
        }
        // Get the full dotted parts from the clicked identifier
        const segments = clickedInfo.segments;
        // If there's more than one segment and the file's module equals the first segment, drop it.
        const fileModule = getModuleName(document);
        let effectiveParts: string[];
        if (segments.length > 1 && fileModule && segments[0] === fileModule) {
            effectiveParts = segments.slice(1);
        } else {
            effectiveParts = segments;
        }
        if (effectiveParts.length === 0) {
            return highlights;
        }

        // Determine the target name to match based on which segment was clicked.
        // - For a single segment (e.g. "labelA"), target is "labelA".
        // - For multiple segments:
        //    * If the clicked segment index is 0 (e.g. user clicks on "regionB" in "regionB.labelA"), then target is "regionB".
        //    * If the clicked segment index is > 0 (e.g. user clicks on "labelA" in "regionB.labelA"), then target is the full qualified
        //      reference (i.e. "regionB.labelA").
        let expectedIdentifier: string;
        if (effectiveParts.length === 1) {
            expectedIdentifier = effectiveParts[0];
        } else {
            if (clickedInfo.segmentIndex === 0) {
                expectedIdentifier = effectiveParts[0];
            } else if (clickedInfo.segmentIndex > 0) {
                // Concatenate the effectiveParts with a dot to form the fully qualified reference.
                expectedIdentifier = effectiveParts.slice(0, clickedInfo.segmentIndex + 1).join('.');
            } else {
                expectedIdentifier = effectiveParts[0];
            }
        }

        // Build the regex to match exactly the expected identifier.
        // We use \b to enforce word boundaries.
        const expectedPattern = `\\b${expectedIdentifier}\\b`;
        const regex = new RegExp(expectedPattern, 'g');

        // Optionally, restrict search to the current region if available.
        const regionInfo = getCurrentRegion(document, position);
        let startLine = 0, endLine = document.lineCount - 1;
        if (regionInfo) {
            startLine = regionInfo.start;
            endLine = regionInfo.end;
        }

        // Scan through the lines in the current document (or region).
        for (let line = startLine; line <= endLine; line++) {
            const lineText = document.lineAt(line).text;
            let match: RegExpExecArray | null;
            while ((match = regex.exec(lineText)) !== null) {
                const matchRange = new vscode.Range(
                    new vscode.Position(line, match.index),
                    new vscode.Position(line, match.index + match[0].length)
                );
                highlights.push(new vscode.DocumentHighlight(matchRange, vscode.DocumentHighlightKind.Text));
            }
        }

        return highlights;
    }
}