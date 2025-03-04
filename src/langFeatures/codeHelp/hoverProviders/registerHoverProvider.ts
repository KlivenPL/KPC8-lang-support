import * as vscode from 'vscode';

const registerMap: { [key: string]: { mnemonic: string; fullName: string } } = {
    "Zero": { mnemonic: "$zero", fullName: "Zero (readonly)" },
    "T4": { mnemonic: "$t4", fullName: "Temporary 4" },
    "Sp": { mnemonic: "$sp", fullName: "Stack Pointer" },
    "Fp": { mnemonic: "$fp", fullName: "Frame Pointer" },
    "T1": { mnemonic: "$t1", fullName: "Temporary 1" },
    "T2": { mnemonic: "$t2", fullName: "Temporary 2" },
    "T3": { mnemonic: "$t3", fullName: "Temporary 3" },
    "Ass": { mnemonic: "$ass", fullName: "Assembly (Reserved)" },
    "S1": { mnemonic: "$s1", fullName: "Saved 1" },
    "S2": { mnemonic: "$s2", fullName: "Saved 2" },
    "S3": { mnemonic: "$s3", fullName: "Saved 3" },
    "A1": { mnemonic: "$a1", fullName: "Argument 1" },
    "A2": { mnemonic: "$a2", fullName: "Argument 2" },
    "A3": { mnemonic: "$a3", fullName: "Argument 3" },
    "Rt": { mnemonic: "$rt", fullName: "Return (value)" },
    "Ra": { mnemonic: "$ra", fullName: "Return Address" }
};

export class RegisterHoverProvider implements vscode.HoverProvider {
    async provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): Promise<vscode.Hover | undefined> {
        // Regex: a non-word boundary, a '$', then one of the valid register names.
        // Using the "i" flag makes it case-insensitive.
        const range = document.getWordRangeAtPosition(
            position,
            /\B\$(Zero|T4|Sp|Fp|T1|T2|T3|Ass|S1|S2|S3|A1|A2|A3|Rt|Ra)/i
        );
        if (!range) {
            return;
        }
        const text = document.getText(range);
        // Remove the '$' character.
        const registerKey = text.slice(1);
        // Look up in our register map. Note: use the key in the case as defined in our map.
        // If needed, you can normalize the case.
        const info = registerMap[registerKey] || registerMap[registerKey.charAt(0).toUpperCase() + registerKey.slice(1)];
        if (!info) {
            return;
        }
        // Construct the hover text using markdown.
        const hoverText = `\`\t${info.mnemonic}\` - ${info.fullName}`;
        return new vscode.Hover(hoverText, range);
    }
}

