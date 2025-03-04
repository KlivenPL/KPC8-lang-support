import * as vscode from 'vscode';
import { getClickedIdentifierSegment } from './getClickedIdentifierSegment';

/**
 * Helper: Checks if a module exports the given region.
 * It scans the module file (document) for export lines that match:
 *     .exportregion regionName
 * Leading whitespace is ignored.
 */
function isRegionExportedInModule(
    document: vscode.TextDocument,
    regionName: string
): boolean {
    const exportRegionRegex = /^\s*\.exportregion\s+(\S+)\s*$/;
    // Scan the entire document for exportregion lines.
    for (let line = 0; line < document.lineCount; line++) {
        const text = document.lineAt(line).text;
        const match = exportRegionRegex.exec(text);
        if (match && match[1] === regionName) {
            return true;
        }
    }
    return false;
}

/**
 * Helper: Scans upward from the current position to find the nearest marker line.
 * A marker line (ignoring leading whitespace) starts with '*' and then a non-empty identifier.
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

/**
 * Helper: Scans the document from the beginning to locate a region marker by name.
 */
function findRegionByName(
    document: vscode.TextDocument,
    regionName: string
): { start: number; end: number } | undefined {
    const markerRegex = /^\s*\*(\S+)\s*$/;
    for (let line = 0; line < document.lineCount; line++) {
        const lineText = document.lineAt(line).text;
        const match = markerRegex.exec(lineText);
        if (match && match[1] === regionName) {
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
 * Helper: Finds the position of a module marker in the document.
 * Assumes module markers look like "*moduleName" or "*@module moduleName".
 */
function findModulePosition(
    document: vscode.TextDocument,
    moduleName: string
): vscode.Position | undefined {
    const moduleRegex = /^\s*\*(@module\s+)?(\S+)\s*$/;
    for (let i = 0; i < document.lineCount; i++) {
        const text = document.lineAt(i).text;
        const match = moduleRegex.exec(text);
        if (match && match[2] === moduleName) {
            const index = text.indexOf(moduleName);
            return new vscode.Position(i, index);
        }
    }
    return undefined;
}

/**
 * Helper: Checks if the document contains a module declaration for the given module name.
 */
function containsModule(document: vscode.TextDocument, moduleName: string): boolean {
    const moduleRegex = new RegExp(`^\\s*\\*(@module\\s+)?${moduleName}\\s*$`, 'm');
    return moduleRegex.test(document.getText());
}

/**
 * Helper: Checks if the document contains a @const module declaration for the given module name.
 */
function containsConstModule(document: vscode.TextDocument): boolean {
    const moduleRegex = new RegExp(`^\\s*\\*@const\\s*$`, 'm');
    return moduleRegex.test(document.getText());
}

/**
 * Helper: Searches within a given region for a definition or label matching identifier.
 * Definitions have the form: .defxxx identifier value
 * Labels have the form: :identifier
 */
function findDefinitionInRegion(
    document: vscode.TextDocument,
    region: { start: number; end: number },
    identifier: string
): vscode.Position | undefined {
    const defRegex = /^\s*\.def\w+\s+(\S+)\s+(.+)$/;
    const labelRegex = /^\s*:(\S+)\s*$/;
    for (let line = region.start; line <= region.end; line++) {
        const lineText = document.lineAt(line).text;
        let match = defRegex.exec(lineText);
        if (match && match[1] === identifier) {
            const index = lineText.indexOf(identifier);
            return new vscode.Position(line, index);
        }
        match = labelRegex.exec(lineText);
        if (match && match[1] === identifier) {
            const index = lineText.indexOf(identifier);
            return new vscode.Position(line, index);
        }
    }
    return undefined;
}

function findDefinitionInConstRegion(
    document: vscode.TextDocument,
    region: { start: number; end: number },
    identifier: string
): vscode.Position | undefined {
    const defRegex = /^\s*\.\w+\s+(\S+)\s+(.+)$/;
    const labelRegex = /^\s*:(\S+)\s*$/;
    for (let line = region.start; line <= region.end; line++) {
        const lineText = document.lineAt(line).text;
        let match = defRegex.exec(lineText);
        if (match && match[1] === identifier) {
            const index = lineText.indexOf(identifier);
            return new vscode.Position(line, index);
        }
        match = labelRegex.exec(lineText);
        if (match && match[1] === identifier) {
            const index = lineText.indexOf(identifier);
            return new vscode.Position(line, index);
        }
    }
    return undefined;
}

export async function findIdentifierDefinition(
    document: vscode.TextDocument,
    position: vscode.Position): Promise<vscode.Location | undefined> {

    const clickedInfo = getClickedIdentifierSegment(document, position);
    if (!clickedInfo) {
        return;
    }
    const { segment, segmentIndex, segments } = clickedInfo;
    // console.log(`Full identifier: ${clickedInfo.fullIdentifier} | Clicked segment: "${segment}" at index ${segmentIndex}`);

    if (segments.length === 2 && segments[0] == "const") {
        const files = await vscode.workspace.findFiles('**/*.kpc');
        for (const fileUri of files) {
            const doc = await vscode.workspace.openTextDocument(fileUri);
            if (containsConstModule(doc)) {
                if (segmentIndex === 0) {
                    const region = findRegionByName(doc, "@const");
                    if (region) {
                        return new vscode.Location(fileUri, new vscode.Position(region.start, 0));
                    }
                } else if (segmentIndex === 1) {
                    const region = findRegionByName(doc, "@const");
                    if (region) {
                        const defPos = findDefinitionInConstRegion(doc, region, segments[1]);
                        if (defPos) {
                            return new vscode.Location(fileUri, defPos);
                        }
                    }
                }
            }
        }
    }

    if (segments.length === 1) {
        const currentRegion = getCurrentRegion(document, position);
        if (currentRegion) {
            const defPos = findDefinitionInRegion(document, currentRegion, segment);
            if (defPos) {
                return new vscode.Location(document.uri, defPos);
            }
        }
    } else if (segments.length === 2) {
        if (segmentIndex === 0) {
            const region = findRegionByName(document, segments[0]);
            if (region) {
                return new vscode.Location(document.uri, new vscode.Position(region.start, 0));
            }
        } else if (segmentIndex === 1) {
            const region = findRegionByName(document, segments[0]);
            if (region) {
                const defPos = findDefinitionInRegion(document, region, segments[1]);
                if (defPos) {
                    return new vscode.Location(document.uri, defPos);
                }
            }
        }
    } else if (segments.length === 3) {
        // Three segments: module.region.identifier.
        // Search only in *.kpc files.
        const files = await vscode.workspace.findFiles('**/*.kpc');
        for (const fileUri of files) {
            const doc = await vscode.workspace.openTextDocument(fileUri);
            if (containsModule(doc, segments[0])) {
                // Check if the region is exported in the module.
                if (!isRegionExportedInModule(doc, segments[1])) {
                    continue;
                }
                if (segmentIndex === 0) {
                    const modPos = findModulePosition(doc, segments[0]);
                    if (modPos) {
                        return new vscode.Location(fileUri, modPos);
                    }
                } else if (segmentIndex === 1) {
                    const region = findRegionByName(doc, segments[1]);
                    if (region) {
                        return new vscode.Location(fileUri, new vscode.Position(region.start, 0));
                    }
                } else if (segmentIndex === 2) {
                    const region = findRegionByName(doc, segments[1]);
                    if (region) {
                        const defPos = findDefinitionInRegion(doc, region, segments[2]);
                        if (defPos) {
                            return new vscode.Location(fileUri, defPos);
                        }
                    }
                }
            }
        }
    }
    return undefined;
}
