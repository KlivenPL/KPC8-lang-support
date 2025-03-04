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

export class RegisterItemProvider implements vscode.CompletionItemProvider {
    public provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[]> {
        // Look for a word that starts with '$'
        const wordRange = document.getWordRangeAtPosition(position, /\$[A-Za-z0-9_]*/);
        const prefix = wordRange ? document.getText(wordRange) : '';
        if (!prefix.startsWith("$")) {
            return undefined;
        }

        const items: vscode.CompletionItem[] = [];
        Object.keys(registerMap).forEach(key => {
            const reg = registerMap[key];
            // Filter by checking if mnemonic starts with the current prefix (case-insensitive)
            if (reg.mnemonic.toLowerCase().startsWith(prefix.toLowerCase())) {
                const item = new vscode.CompletionItem(reg.mnemonic, vscode.CompletionItemKind.Variable);
                item.detail = reg.fullName;
                if (wordRange) {
                    // Replace the entire word range so that it doesn't duplicate the '$'
                    item.textEdit = vscode.TextEdit.replace(wordRange, reg.mnemonic);
                } else {
                    item.insertText = reg.mnemonic;
                }
                items.push(item);
            }
        });
        return items;
    }
}
