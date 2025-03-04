import * as vscode from 'vscode';

/**
 * Returns the indent string for the given level based on the formatting options.
 */
function getIndentation(options: vscode.FormattingOptions, level: number): string {
    const unit = options.insertSpaces ? " ".repeat(options.tabSize) : "\t";
    return unit.repeat(level);
}

export class KpcDocumentFormattingEditProvider implements vscode.DocumentFormattingEditProvider {
    public provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions,
        token: vscode.CancellationToken
    ): vscode.TextEdit[] {
        let formattedText = '';
        // State variables to track the current context.
        let inModule = false;
        let inRegion = false;
        let inLabel = false;

        for (let i = 0; i < document.lineCount; i++) {
            const originalLine = document.lineAt(i).text;
            // Remove trailing whitespace.
            let line = originalLine.replace(/\s+$/, '');
            const trimmed = line.trim();
            let indentLevel = 0;

            if (trimmed.length === 0) {
                // Preserve empty lines.
                formattedText += "";
            } else if (trimmed.startsWith("*@module")) {
                // Module marker: level 0.
                indentLevel = 0;
                inModule = true;
                // Reset region/label states.
                inRegion = false;
                inLabel = false;
            } else if ((trimmed.startsWith("*") && !trimmed.startsWith("*@module")) ||
                trimmed.startsWith(".exportregion")) {
                // Region marker: level 1.
                indentLevel = 1;
                inRegion = true;
                // Reset label state.
                inLabel = false;
            } else if (trimmed.startsWith(":")) {
                // Label marker: level 2.
                indentLevel = 2;
                inLabel = true;
            } else {
                // For instructions, definitions, and comments:
                // Everything under a module (if not in region/label) is level 1.
                // Under a region is level 2.
                // Under a label is level 3.
                if (inLabel) {
                    indentLevel = 3;
                } else if (inRegion) {
                    indentLevel = 2;
                } else if (inModule) {
                    indentLevel = 1;
                } else {
                    indentLevel = 0;
                }
            }

            // Build the indentation string using the user's settings.
            const indent = getIndentation(options, indentLevel);
            const formattedLine = indent + trimmed;
            formattedText += formattedLine;
            if (i < document.lineCount - 1) {
                formattedText += "\n";
            }
        }

        // Replace the entire document with the formatted text.
        const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(document.getText().length)
        );
        return [vscode.TextEdit.replace(fullRange, formattedText)];
    }
}
