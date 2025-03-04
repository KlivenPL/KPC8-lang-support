import * as vscode from 'vscode';
import { findIdentifierDefinition } from '../common/definitionFinder';
import { getClickedIdentifierSegment } from '../common/getClickedIdentifierSegment';

/**
 * Extracts the marker name from a marker line.
 * For example, "*@module moduleA" or "*regionA" returns "moduleA" or "regionA".
 */
function extractMarkerName(lineText: string): string | undefined {
    const markerRegex = /^\s*\*(?:@module\s+)?(\S+)\s*$/;
    const match = markerRegex.exec(lineText);
    return match ? match[1] : undefined;
}

/**
 * Scans the document for a module marker (a line like "*@module moduleName")
 * and returns the module name.
 */
function getModuleName(document: vscode.TextDocument): string | undefined {
    const moduleRegex = /^\s*\*@module\s+(\S+)\s*$/m;
    const match = moduleRegex.exec(document.getText());
    return match ? match[1] : undefined;
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

/**
 * Searches all *.kpc files for occurrences of a reference that exactly matches
 * the expected qualification determined by the definition’s context.
 *
 * If the file’s module is different from defModule, the reference must be fully qualified:
 *    defModule.defRegion.defIdentifier
 * If the file’s module is the same but its region is different from defRegion, then:
 *    defRegion.defIdentifier
 * If the file’s region is the same, then unqualified:
 *    defIdentifier
 *
 * A negative lookbehind is prepended so that extra qualifications are ignored.
 */
async function findReferencesForIdentifier(
    defModule: string | undefined,
    defRegion: string | undefined,
    defIdentifier: string,
    originRange: vscode.Range
): Promise<(vscode.Location | vscode.LocationLink)[]> {
    const results: (vscode.Location | vscode.LocationLink)[] = [];
    // Search only in *.kpc files (ignoring node_modules)
    const files = await vscode.workspace.findFiles('**/*.kpc');

    for (const fileUri of files) {
        const doc = await vscode.workspace.openTextDocument(fileUri);
        const fileModule = getModuleName(doc);

        for (let line = 0; line < doc.lineCount; line++) {
            const lineText = doc.lineAt(line).text;
            const regionInfo = getCurrentRegion(doc, new vscode.Position(line, 0));
            const fileRegion = regionInfo ? extractMarkerName(doc.lineAt(regionInfo.start).text) : undefined;

            let expectedPattern = "";
            const negLookbehind = "(?<!\\.)";
            if (fileModule !== defModule) {
                // Different module – expect fully qualified.
                if (defModule && defRegion) {
                    expectedPattern = `${negLookbehind}\\b${defModule}\\.${defRegion}\\.${defIdentifier}\\b`;
                } else {
                    expectedPattern = `${negLookbehind}\\b${defIdentifier}\\b`;
                }
            } else {
                // Same module.
                if (fileRegion !== defRegion) {
                    // Different region – expect partially qualified.
                    if (defRegion) {
                        expectedPattern = `${negLookbehind}\\b${defRegion}\\.${defIdentifier}\\b`;
                    } else {
                        expectedPattern = `${negLookbehind}\\b${defIdentifier}\\b`;
                    }
                } else {
                    // Same region – unqualified reference.
                    expectedPattern = `${negLookbehind}\\b${defIdentifier}\\b`;
                }
            }
            const regex = new RegExp(expectedPattern, 'g');
            let match: RegExpExecArray | null;
            while ((match = regex.exec(lineText)) !== null) {
                const startPos = new vscode.Position(line, match.index);
                const endPos = new vscode.Position(line, match.index + match[0].length);
                results.push({
                    ...new vscode.Location(fileUri, new vscode.Position(line, match.index)),
                    originSelectionRange: originRange,
                    targetUri: fileUri,
                    targetRange: new vscode.Range(startPos, endPos),
                    targetSelectionRange: new vscode.Range(startPos, endPos)
                });
            }
        }
    }
    return results;
}

/**
 * ReferenceProvider that:
 * 1. Finds the definition of the clicked identifier.
 * 2. Extracts its context (module and region).
 * 3. Determines the appropriate qualified reference format.
 * 4. Searches all *.kpc files for occurrences that exactly match that format.
 */
export class IdentifierReferenceProvider implements vscode.ReferenceProvider {
    async provideReferences(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: vscode.ReferenceContext,
        token: vscode.CancellationToken
    ): Promise<any[]> {
        // 1. Find the definition.
        const defLocation = await findIdentifierDefinition(document, position);
        if (!defLocation) {
            return [];
        }
        const defDoc = (defLocation.uri.toString() === document.uri.toString())
            ? document
            : await vscode.workspace.openTextDocument(defLocation.uri);

        // 2. Get context from the definition.
        const defRegionInfo = getCurrentRegion(defDoc, defLocation.range.start);
        const defRegion = defRegionInfo ? extractMarkerName(defDoc.lineAt(defRegionInfo.start).text) : undefined;
        const defModule = getModuleName(defDoc);

        // 3. Determine the identifier (last segment).
        const clickedInfo = getClickedIdentifierSegment(document, position);
        if (!clickedInfo) {
            return [];
        }
        const defIdentifier = clickedInfo.segments[clickedInfo.segments.length - 1];

        // 4. Search for references using the constructed qualified reference.
        const references = await findReferencesForIdentifier(defModule, defRegion, defIdentifier, clickedInfo.range);
        // Cast the array to vscode.Location[] to satisfy the type definition.
        return references;
    }
}
