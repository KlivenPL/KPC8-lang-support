import * as vscode from 'vscode';

/**
 * Helper: Determines which segment of a dotted identifier was clicked.
 * The identifier must start with a letter and can contain letters and numbers.
 */
export function getClickedIdentifierSegment(
    document: vscode.TextDocument,
    position: vscode.Position): { segment: string; segmentIndex: number; fullIdentifier: string; segments: string[]; range: vscode.Range; } | undefined {
    // Identifier must start with a letter and can include letters, digits, and underscores.
    const wordRange = document.getWordRangeAtPosition(position, /[A-Za-z][A-Za-z0-9_]*(?:\.[A-Za-z][A-Za-z0-9_]*)*/);
    if (!wordRange) {
        return undefined;
    }
    const fullIdentifier = document.getText(wordRange);

    let segments = fullIdentifier.split('.');
    // if (segments.length > 0 && segments[0].toLowerCase() == "@const") {
    //     segments = ["@MainModule", ...segments];
    // }
    const offset = position.character - wordRange.start.character;

    let cumulative = 0;
    for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        const start = cumulative;
        const end = cumulative + seg.length;
        // Use <= to include clicks right at the end of the segment.
        if (offset >= start && offset <= end) {
            return { segment: seg, segmentIndex: i, fullIdentifier, segments, range: wordRange };
        }
        cumulative = end + 1; // Skip the dot separator.
    }
    return undefined;
}
