import * as vscode from 'vscode';
import {
	CancellationToken,
	DebugConfiguration,
	ProviderResult,
	WorkspaceFolder
	} from 'vscode';
import { DebugValueFormat, IChangeFormatRequestArguments } from './interfaces/customRequests/ChangeFormatRequest';
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/*
 * activateMockDebug.ts containes the shared extension code that can be executed both in node.js and the browser.
 */

'use strict';

export function activateMockDebug(context: vscode.ExtensionContext, factory?: vscode.DebugAdapterDescriptorFactory) {

	context.subscriptions.push(
		vscode.commands.registerCommand('extension.kpc8-tools.changeFormatRequest.binary', (variable) => sendChangeFormatRequest(DebugValueFormat.Binary)),
		vscode.commands.registerCommand('extension.kpc8-tools.changeFormatRequest.hexWord', (variable) => sendChangeFormatRequest(DebugValueFormat.HexWord)),
		vscode.commands.registerCommand('extension.kpc8-tools.changeFormatRequest.hexTwoBytes', (variable) => sendChangeFormatRequest(DebugValueFormat.HexTwoBytes)),
		vscode.commands.registerCommand('extension.kpc8-tools.changeFormatRequest.decWordUnsigned', (variable) => sendChangeFormatRequest(DebugValueFormat.DecWordUnsigned)),
		vscode.commands.registerCommand('extension.kpc8-tools.changeFormatRequest.decWordSigned', (variable) => sendChangeFormatRequest(DebugValueFormat.DecWordSigned)),
		vscode.commands.registerCommand('extension.kpc8-tools.changeFormatRequest.decTwoBytesUnsigned', (variable) => sendChangeFormatRequest(DebugValueFormat.DecTwoBytesUnsigned)),
		vscode.commands.registerCommand('extension.kpc8-tools.changeFormatRequest.decTwoBytesSigned', (variable) => sendChangeFormatRequest(DebugValueFormat.DecTwoBytesSigned)),
	);

	const sendChangeFormatRequest = (format: DebugValueFormat) => {
		const ds = vscode.debug.activeDebugSession;
		if (ds) {
			const args: IChangeFormatRequestArguments = { Format: format };
			ds.customRequest('ChangeFormatRequest', args);
		}
	}

	context.subscriptions.push(vscode.commands.registerCommand('extension.kpc8-tools.getProgramName', config => {
		return vscode.window.showInputBox({
			placeHolder: "Please enter the name of a markdown file in the workspace folder",
			value: "readme.md"
		});
	}));

	// register a configuration provider for 'kpcdbg' debug type
	const provider = new MockConfigurationProvider();
	context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('kpcdbg', provider));

	// register a dynamic configuration provider for 'kpcdbg' debug type
	context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('kpcdbg', {
		provideDebugConfigurations(folder: WorkspaceFolder | undefined): ProviderResult<DebugConfiguration[]> {
			return [
				{
					name: "Dynamic Launch",
					request: "launch",
					type: "mock",
					program: "${file}"
				},
				{
					name: "Another Dynamic Launch",
					request: "launch",
					type: "mock",
					program: "${file}"
				},
				{
					name: "Mock Launch",
					request: "launch",
					type: "mock",
					program: "${file}"
				}
			];
		}
	}, vscode.DebugConfigurationProviderTriggerKind.Dynamic));

	// override VS Code's default implementation of the debug hover
	// here we match only Mock "variables", that are words starting with an '$'
	context.subscriptions.push(vscode.languages.registerEvaluatableExpressionProvider('kpc', {
		provideEvaluatableExpression(document: vscode.TextDocument, position: vscode.Position): vscode.ProviderResult<vscode.EvaluatableExpression> {
			const registerRegex = /(\$[a-z][a-z0-9]*)/ig
			const VARIABLE_REGEXP = /([a-z][a-z0-9]*)/ig;
			const line = document.lineAt(position.line).text;
			const separator = ":/?";

			let m: RegExpExecArray | null;

			while (m = registerRegex.exec(line)) {
				const varName = `${m[1]}`;
				const varRange = new vscode.Range(position.line, m.index, position.line, m.index + m[0].length);

				if (varRange.contains(position)) {
					return new vscode.EvaluatableExpression(varRange, `${varName}${separator}${position.line}${separator}${document.fileName}`);
				}
			}

			while (m = VARIABLE_REGEXP.exec(line)) {
				const varName = `${m[1]}`;
				const varRange = new vscode.Range(position.line, m.index, position.line, m.index + m[0].length);

				if (varRange.contains(position)) {
					return new vscode.EvaluatableExpression(varRange, `${varName}${separator}${position.line}${separator}${document.fileName}`);
				}
			}
			return undefined;
		}
	}));

	// override VS Code's default implementation of the "inline values" feature"
	context.subscriptions.push(vscode.languages.registerInlineValuesProvider('kpc', {
		provideInlineValues(document: vscode.TextDocument, viewport: vscode.Range, context: vscode.InlineValueContext): vscode.ProviderResult<vscode.InlineValue[]> {

			//const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
			const usedVariables: Array<string> = []
			const allValues: vscode.InlineValue[] = [];

			for (let l = context.stoppedLocation.end.line - 1; l >= viewport.start.line; l--) {
				const line = document.lineAt(l);
				var regExp = /\$([a-z][a-z0-9]*)/ig;	// variables are words starting with '$'
				do {
					var m = regExp.exec(line.text);
					if (m) {
						const varName = `${m[1]}`;
						const varRange = new vscode.Range(l, m.index, l, m.index + varName.length);

						// some literal text
						//allValues.push(new vscode.InlineValueText(varRange, `${varName}: ${viewport.start.line}`));

						// value found via variable lookup
						if (!usedVariables.includes(varName)) {
							allValues.push(new vscode.InlineValueVariableLookup(varRange, varName, false));
							usedVariables.push(varName);
						}

						// value determined via expression evaluation
						//	allValues.push(new vscode.InlineValueEvaluatableExpression(varRange, `${varName}@${l}`));
					}
				} while (m);
			}

			return allValues;
		}
	}));

	if (factory) {
		context.subscriptions.push(vscode.debug.registerDebugAdapterDescriptorFactory('kpcdbg', factory));
		if ('dispose' in factory) {
			context.subscriptions.push(factory);
		}
	}
}

class MockConfigurationProvider implements vscode.DebugConfigurationProvider {

	/**
	 * Massage a debug configuration just before a debug session is being launched,
	 * e.g. add all missing attributes to the debug configuration.
	 */
	resolveDebugConfiguration(folder: WorkspaceFolder | undefined, config: DebugConfiguration, token?: CancellationToken): ProviderResult<DebugConfiguration> {

		// if launch.json is missing or empty
		if (!config.type && !config.request && !config.name) {
			const editor = vscode.window.activeTextEditor;
			if (editor && editor.document.languageId === 'kpc') {
				config.type = 'kpcdbg';
				config.name = 'Launch';
				config.request = 'launch';
				config.sourceFilePath = '${file}';
				config.pauseAtEntry = true;
			}
		}

		/* if (!config.sourceFilePath) {
			return vscode.window.showInformationMessage("Cannot find a program to debug").then(_ => {
				return undefined;	// abort launch
			});
		} */

		return config;
	}
}

export interface IFileAccessor {
	readFile(path: string): Promise<Uint8Array>;
	writeFile(path: string, contents: Uint8Array): Promise<void>;
}

export const workspaceFileAccessor: IFileAccessor = {
	async readFile(path: string): Promise<Uint8Array> {
		let uri: vscode.Uri;
		try {
			uri = pathToUri(path);
		} catch (e) {
			return new TextEncoder().encode(`cannot read '${path}'`);
		}

		return await vscode.workspace.fs.readFile(uri);
	},
	async writeFile(path: string, contents: Uint8Array) {
		await vscode.workspace.fs.writeFile(pathToUri(path), contents);
	}
};

function pathToUri(path: string) {
	try {
		return vscode.Uri.file(path);
	} catch (e) {
		return vscode.Uri.parse(path);
	}
}
