import * as vscode from 'vscode';
import { signatureContext } from '../common/signatureContext';
import { TokenClassType } from '../docs/types/tokenClass';

// --- Types & Helper Functions ---

interface DefinitionSymbol {
    identifier: string;      // Unqualified name (e.g. "rA", "main", "mul", etc.)
    fullText: string;        // The full trimmed line
    type: 'module' | 'region' | 'label' | 'defreg' | 'number' | 'def' | 'other';
    context: {
        module?: string;
        region?: string;
        label?: string;
        subType?: string;
        command?: string;
        extra?: string;
    };
    range: vscode.Range;
    fileUri: vscode.Uri;
}

function mapTokenClassToShitType(tokenType: TokenClassType) {
    switch (tokenType) {
        case "None":
            return 'other';
        case "Identifier":
            return 'label';
        case "Register":
            return 'defreg';
        case "Number":
            return 'number';
        case "Char":
            return 'other';
        case "String":
            return 'other';
        case "Label":
            return 'label';
        case "Region":
            return 'region';
        case "Command":
            return 'other';
    }
}

export function parseDocumentForDefinitions(document: vscode.TextDocument): DefinitionSymbol[] {
    const defs: DefinitionSymbol[] = [];
    let currentModule: string | undefined = undefined;
    let currentRegion: string | undefined = undefined;
    let currentLabel: string | undefined = undefined;

    for (let i = 0; i < document.lineCount; i++) {
        const line = document.lineAt(i).text;
        const trimmed = line.trim();
        if (!trimmed) continue;
        let match: RegExpExecArray | null;

        // Handle @const special region 
        if ((match = /^\*@const/.exec(trimmed))) {
            currentRegion = "@const";
            currentLabel = undefined;
            defs.push({
                identifier: "@const",
                fullText: "@const special region",
                type: 'region',
                context: { module: "@const", region: "@const", extra: "@const" },
                range: document.lineAt(i).range,
                fileUri: document.uri
            });
            continue;
        }

        // Module marker: "*@module Math"
        if ((match = /^\*@module\s+(\S+)\s*(.*)$/.exec(trimmed))) {
            currentModule = match[1];
            currentRegion = undefined;
            currentLabel = undefined;
            defs.push({
                identifier: match[1],
                fullText: trimmed,
                type: 'module',
                context: { module: match[1], extra: match[2] || "" },
                range: document.lineAt(i).range,
                fileUri: document.uri
            });
            continue;
        }

        // Export region marker: ".exportregion <regionName>"
        if ((match = /^\.exportregion\s+(\S+)\s*(.*)$/.exec(trimmed))) {
            currentRegion = match[1];
            currentLabel = undefined;
            defs.push({
                identifier: match[1],
                fullText: trimmed,
                type: 'region',
                context: { module: currentModule, region: match[1], extra: match[2] || "" },
                range: document.lineAt(i).range,
                fileUri: document.uri
            });
            continue;
        }

        // Region marker: "*regionName" (if not an export region)
        if ((match = /^\*(?!@module)(\S+)\s*(.*)$/.exec(trimmed))) {
            currentRegion = match[1];
            currentLabel = undefined;
            defs.push({
                identifier: match[1],
                fullText: trimmed,
                type: 'region',
                context: { module: currentModule, region: match[1], extra: match[2] || "" },
                range: document.lineAt(i).range,
                fileUri: document.uri
            });
            continue;
        }

        // Label marker: ":labelName"
        if ((match = /^:(\S+)\s*(.*)$/.exec(trimmed))) {
            currentLabel = match[1];
            defs.push({
                identifier: match[1],
                fullText: trimmed,
                type: 'label',
                context: { module: currentModule, region: currentRegion, label: match[1], extra: match[2] || "" },
                range: document.lineAt(i).range,
                fileUri: document.uri
            });
            continue;
        }

        // .defreg definitions: ".defreg identifier value"
        if ((match = /^\.defreg\s+(\S+)\s+(.+)$/.exec(trimmed))) {
            defs.push({
                identifier: match[1],
                fullText: trimmed,
                type: 'defreg',
                context: { module: currentModule, region: currentRegion, label: currentLabel, extra: match[2] },
                range: document.lineAt(i).range,
                fileUri: document.uri
            });
            continue;
        }

        // .defnum definitions: ".defnum identifier value"
        if ((match = /^\.defnum\s+(\S+)\s+(.+)$/.exec(trimmed))) {
            defs.push({
                identifier: match[1],
                fullText: trimmed,
                type: 'number',
                context: { module: currentModule, region: currentRegion, label: currentLabel, extra: match[2] },
                range: document.lineAt(i).range,
                fileUri: document.uri
            });
            continue;
        }

        // Generic .def definitions: ".def<subtype> identifier value"
        if ((match = /^\.def(?!reg|num)(\w+)\s+(\S+)\s+(.+)$/.exec(trimmed))) {
            defs.push({
                identifier: match[2],
                fullText: trimmed,
                type: 'def',
                context: { module: currentModule, region: currentRegion, label: currentLabel, subType: match[1], extra: match[3] },
                range: document.lineAt(i).range,
                fileUri: document.uri
            });
            continue;
        }

        // Other dot-commands (e.g. ".asciiz identifier value")
        if ((match = /^\.(\w+)\s+(\S+)\s+(.+)$/.exec(trimmed))) {
            defs.push({
                identifier: match[2],
                fullText: trimmed,
                type: 'number',
                context: { module: currentModule, region: currentRegion, label: currentLabel, command: match[1], extra: match[3] },
                range: document.lineAt(i).range,
                fileUri: document.uri
            });
            continue;
        }
    }
    return defs;
}

// Get all region markers in the current document (excluding module markers).
function getAllRegionMarkers(document: vscode.TextDocument): string[] {
    const regions = new Set<string>();
    for (let i = 0; i < document.lineCount; i++) {
        const text = document.lineAt(i).text;
        let match = /^\s*\*(?!@module)(\S+)\s*$/.exec(text);
        if (!match) {
            // Also match lines like ".exportregion <regionName>"
            match = /^\s*\.exportregion\s+(\S+)\s*(.*)$/.exec(text);
        }
        if (match) {
            regions.add(match[1]);
        }
    }
    return Array.from(regions);
}

// Get all module markers from the workspace.
async function getAllModuleMarkers(): Promise<string[]> {
    const modules = new Set<string>();
    modules.add("@const");
    const files = await vscode.workspace.findFiles('**/*.kpc');
    for (const fileUri of files) {
        try {
            const doc = await vscode.workspace.openTextDocument(fileUri);
            const match = /^\s*\*@module\s+(\S+)\s*$/m.exec(doc.getText());
            if (match) {
                modules.add(match[1]);
            }
        } catch (e) {
            // Ignore errors.
        }
    }
    return Array.from(modules);
}

// Get the module name from a document by scanning for "*@module ModuleName"
function getModuleName(document: vscode.TextDocument): string | undefined {
    const moduleRegex = /^\s*\*@module\s+(\S+)\s*$/m;
    const match = moduleRegex.exec(document.getText());
    if (match) {
        return match[1];
    }

    return undefined;
}

function containsConstModule(document: vscode.TextDocument) {
    const constModuleRegex = /^\s*\*@const\s*$/m;
    const constModuleMatch = constModuleRegex.exec(document.getText());
    if (constModuleMatch) {
        return true;
    }

    return false;
}
/**
 * Returns the current region in the document at the given position.
 */
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

// Get the current region name from the document at a given position.
function getCurrentRegionName(document: vscode.TextDocument, position: vscode.Position): string | undefined {
    const regionInfo = getCurrentRegion(document, position);
    if (regionInfo) {
        return extractMarkerName(document.lineAt(regionInfo.start).text);
    }
    return undefined;
}

// Extracts the marker name from a marker line.
function extractMarkerName(lineText: string): string | undefined {
    const markerRegex = /^\s*\*(?:@module\s+)?(\S+)\s*$/;
    const match = markerRegex.exec(lineText);
    return match ? match[1] : undefined;
}

// --- Completion Provider Implementation ---

export class IdentifierItemProvider implements vscode.CompletionItemProvider {
    public async provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): Promise<vscode.CompletionList | undefined> {
        // Get the full text of the current line.
        if (signatureContext.activeArgumentIndex === undefined) {
            return undefined;
        }

        if (signatureContext.dirty) {
            await new Promise(r => setTimeout(r, 300));
            if (signatureContext.dirty) {
                return undefined;
            }
        }

        const expectedTokenClass = signatureContext.kpcSignature?.arguments[signatureContext.activeArgumentIndex].tokenClass;
        const expectedShitType = mapTokenClassToShitType(expectedTokenClass ?? 'None');
        signatureContext.dirty = true;

        const lineText = document.lineAt(position.line).text;
        const trimmedLine = lineText.trim();

        // Only provide hints when the line starts with an instruction mnemonic (a letter).
        if (!/^@?[A-Za-z]/.test(trimmedLine)) {
            return undefined;
        }

        // Only trigger completions on instruction lines.
        // Skip lines starting with '*' (regions), '.' (directives), or ':' (labels).
        if (trimmedLine.startsWith('*') || trimmedLine.startsWith('.') || trimmedLine.startsWith(':')) {
            return undefined;
        }

        // Split the line by whitespace.
        const tokens = trimmedLine.split(/\s+/);
        if (tokens.length === 0) {
            return undefined;
        }
        // The first token is assumed to be the instruction mnemonic.
        const mnemonic = tokens[0];

        // Determine where the operand starts.
        const mnemonicIndex = lineText.indexOf(mnemonic);
        const operandStart = mnemonicIndex + mnemonic.length;
        // If the caret is still in the mnemonic, don't show completions.
        if (position.character <= operandStart) {
            return undefined;
        }

        // Now determine the operand prefix.
        // Use a regex that matches identifiers which may start with a colon (labels) or a dollar sign (registers)
        let prefix = "";
        const wordRange = document.getWordRangeAtPosition(position, /@?[:$A-Za-z][A-Za-z0-9_$.]*/);
        if (wordRange) {
            prefix = document.getText(wordRange);
        }
        // Remove a leading colon for labels.
        if (prefix.startsWith(':')) {
            prefix = prefix.slice(1);
        }

        // Allow empty operand prefix so that completion items can be offered as soon as an instruction operand is expected.
        // Split the operand by '.' to support multi-part tokens like "Math.mul16."
        let parts = prefix.split('.');
        if (parts[0].toLowerCase() === "@const") {
            parts = ["@const", ...parts]
        }

        // ... then continue with your existing logic for handling one-, two-, or three-part tokens.

        // For example, if parts.length === 1, show local definitions, region markers, and module names.
        let completionItems: vscode.CompletionItem[] = [];
        if (parts.length === 1) {
            // Local definitions in the current region.
            const currentRegion = getCurrentRegionName(document, position);
            const localDefs = parseDocumentForDefinitions(document).filter(def => {
                const defRegion = def.context.region;
                return defRegion && currentRegion &&
                    defRegion.toLowerCase() === currentRegion.toLowerCase() &&
                    (parts[0] === '' || def.identifier.toLowerCase().startsWith(parts[0].toLowerCase()));
            });
            const localItems = localDefs.filter(x => x.type == expectedShitType).map(def => {
                const item = new vscode.CompletionItem(def.identifier, vscode.CompletionItemKind.Variable);
                item.detail = def.type;
                item.documentation = `Defined in region ${def.context.region}`;
                item.sortText = "1_" + def.identifier;
                return item;
            });
            completionItems.push(...localItems);

            // Suggestions for other region markers in the file.
            const regions = getAllRegionMarkers(document);
            const regionItems = regions.filter(r => {
                return !currentRegion || r.toLowerCase() !== currentRegion.toLowerCase();
            }).filter(r => r.toLowerCase().startsWith(parts[0].toLowerCase()))
                .map(r => {
                    const item = new vscode.CompletionItem(r, vscode.CompletionItemKind.Folder);
                    item.detail = "Region (other)";
                    item.sortText = "2_" + r;
                    return item;
                });

            completionItems.push(...regionItems);

            // And suggestions for modules in the workspace.
            const moduleNames = await getAllModuleMarkers();
            const moduleItems = moduleNames.filter(m => m.toLowerCase().startsWith(parts[0].toLowerCase()))
                .map(m => {
                    const item = new vscode.CompletionItem(m, vscode.CompletionItemKind.Module);
                    item.detail = "Module";
                    item.sortText = "3_" + m;
                    return item;
                });
            completionItems.push(...moduleItems);
        }
        // Case 2: Two-part prefix: X.Y
        else if (parts.length === 2) {
            const first = parts[0];
            const second = parts[1];
            // Check if first part matches one of the region markers in the current file.
            const regions = getAllRegionMarkers(document).map(r => r.toLowerCase());
            if (regions.includes(first.toLowerCase())) {
                const localDefs = parseDocumentForDefinitions(document).filter(def => {
                    return def.context.region &&
                        def.context.region.toLowerCase() === first.toLowerCase() &&
                        def.identifier.toLowerCase().startsWith(second.toLowerCase());
                });
                const items = localDefs.filter(x => x.type == expectedShitType).map(def => {
                    const item = new vscode.CompletionItem(def.identifier, vscode.CompletionItemKind.Variable);
                    item.detail = def.type;
                    item.documentation = `Defined in region ${def.context.region}`;
                    item.sortText = "1_" + def.identifier;
                    return item;
                });
                completionItems.push(...items);
            } else {
                // Otherwise, treat the first part as a module.
                const modules = await getAllModuleMarkers();
                if (modules.some(m => m.toLowerCase() === first.toLowerCase())) {
                    if (!second.trim()) {
                        // We're in the situation where the user typed "Module." and we want to suggest regions.
                        const exportedRegions = new Set<string>();
                        // exportedRegions.add("@const");
                        const files = await vscode.workspace.findFiles('**/*.kpc');
                        for (const fileUri of files) {
                            const doc = await vscode.workspace.openTextDocument(fileUri);
                            const modName = getModuleName(doc);
                            if (modName && modName.toLowerCase() === first.toLowerCase()) {
                                // Parse the document and filter for .exportregion commands.
                                const defs = parseDocumentForDefinitions(doc);
                                defs.forEach(def => {
                                    if (def.type === 'region' && def.fullText.trim().startsWith('.exportregion')) {
                                        exportedRegions.add(def.identifier);
                                    }
                                });
                            }
                        }
                        // Compute a replacement range that only covers the text after the dot.
                        // For example, if the word under the cursor is "Game.", we want to replace only the empty part after the dot.
                        const dotIndex = prefix.lastIndexOf('.');
                        let regionRange: vscode.Range | undefined = undefined;
                        if (wordRange && dotIndex >= 0) {
                            const regionStart = wordRange.start.character + dotIndex + 1;
                            regionRange = new vscode.Range(
                                wordRange.start.line,
                                regionStart,
                                wordRange.end.line,
                                wordRange.end.character
                            );
                        }
                        const regionItems = Array.from(exportedRegions).map(region => {
                            const item = new vscode.CompletionItem(region, vscode.CompletionItemKind.Folder);
                            item.detail = `Exported region from module ${first}`;
                            // Use textEdit to replace only the portion after the dot.
                            if (regionRange) {
                                item.textEdit = vscode.TextEdit.replace(regionRange, region);
                            } else {
                                item.insertText = region;
                            }
                            item.sortText = "1_" + region;
                            return item;
                        });
                        completionItems.push(...regionItems);
                    } else {
                        // Suggest definitions from that module's region named second.
                        const files = await vscode.workspace.findFiles('**/*.kpc');
                        let defs: DefinitionSymbol[] = [];
                        for (const fileUri of files) {
                            const doc = await vscode.workspace.openTextDocument(fileUri);
                            const mod = getModuleName(doc);
                            if (mod && mod.toLowerCase() === first.toLowerCase()) {
                                defs.push(...parseDocumentForDefinitions(doc).filter(def => {
                                    return def.context.region &&
                                        def.context.region.toLowerCase() === second.toLowerCase();
                                }));
                            }
                        }
                        const items = defs.filter(x => x.type == expectedShitType).map(def => {
                            const item = new vscode.CompletionItem(def.identifier, vscode.CompletionItemKind.Variable);
                            item.detail = def.type;
                            item.documentation = `Defined in region ${def.context.region} of module ${first}`;
                            item.sortText = "1_" + def.identifier;
                            return item;
                        });
                        completionItems.push(...items);
                    }
                }
            }
        }
        // Case 3: Three-part prefix: Module.Region.Identifier
        else if (parts.length === 3) {
            const [mod, reg, identPrefix] = parts;
            // Find definitions in workspace where module equals mod and region equals reg,
            // and exclude definitions that are just region markers.
            const files = await vscode.workspace.findFiles('**/*.kpc');
            let defs: DefinitionSymbol[] = [];
            for (const fileUri of files) {
                const doc = await vscode.workspace.openTextDocument(fileUri);
                const modName = getModuleName(doc);
                if ((modName || mod == "@const") &&
                    ((mod == "@const" && !!containsConstModule(doc)) || modName && modName.toLowerCase() === mod.toLowerCase())) {
                    defs.push(...parseDocumentForDefinitions(doc).filter(def => {
                        return def.context.region &&
                            def.context.region.toLowerCase() === reg.toLowerCase() &&
                            def.identifier.toLowerCase().startsWith(identPrefix.toLowerCase()) &&
                            def.type !== 'region';
                    }));
                }
            }
            // Compute a replacement range for the identifier part only.
            const lastDotIndex = prefix.lastIndexOf('.');
            let identRange: vscode.Range | undefined = undefined;
            if (wordRange && lastDotIndex >= 0) {
                const identStart = wordRange.start.character + lastDotIndex + 1;
                identRange = new vscode.Range(
                    wordRange.start.line,
                    identStart,
                    wordRange.end.line,
                    wordRange.end.character
                );
            }
            const items = defs.filter(x => x.type == expectedShitType).map(def => {
                const item = new vscode.CompletionItem(def.identifier, vscode.CompletionItemKind.Variable);
                item.detail = def.type;
                item.documentation = `Defined in region ${reg} of module ${mod}`;
                item.sortText = "1_" + def.identifier;
                if (identRange) {
                    item.textEdit = vscode.TextEdit.replace(identRange, def.identifier);
                } else {
                    item.insertText = def.identifier;
                }
                return item;
            });
            completionItems.push(...items);
        }

        return new vscode.CompletionList(completionItems, false);
    }
}