import * as Net from 'net';
import * as vscode from 'vscode';
import activateCodeHelp from './langFeatures/activateCodeHelp';
import { activateMockDebug } from './activateMockDebug';
import { SignatureHelp } from 'vscode';
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/*
 * extension.ts (and activateMockDebug.ts) forms the "plugin" that plugs into VS Code and contains the code that
 * connects VS Code with the debug adapter.
 * 
 * extension.ts contains code for launching the debug adapter in three different ways:
 * - as an external program communicating with VS Code via stdin/stdout,
 * - as a server process communicating with VS Code via sockets or named pipes, or
 * - as inlined code running in the extension itself (default).
 * 
 * Since the code in extension.ts uses node.js APIs it cannot run in the browser.
 */

'use strict';


/*
 * The compile time flag 'runMode' controls how the debug adapter is run.
 * Please note: the test suite only supports 'external' mode.
 */

/* class GoSignatureHelpProvider implements vscode.SignatureHelpProvider {
	public provideSignatureHelp(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken):
		Promise<SignatureHelp> {
		return this.signatureProvider(document, position, token);
	}

	private signatureProvider(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Promise<vscode.SignatureHelp> {
		return new Promise<SignatureHelp>((resolve, reject) => {
			const line = document.lineAt(position.line).text;

			const xd: SignatureHelp = {
				activeParameter: 0,
				activeSignature: 0,
				signatures: [
					{
						activeParameter: 0,
						label: "xdddlabel",
						parameters: [
							{
								label: "firstLabel",
								documentation: "testdocumentation"
							}
						]
					}
				]
			}

			if (line.split(' ').filter(Boolean).length == 1) {
				resolve(xd);
			} else {

				reject();
			}

			resolve(xd);
		})
	}
} */
export function activate(context: vscode.ExtensionContext) {
	activateMockDebug(context, new DebugAdapterDescriptorFactory());
	activateCodeHelp(context);
}

class DebugAdapterDescriptorFactory implements vscode.DebugAdapterDescriptorFactory {
	createDebugAdapterDescriptor(session: vscode.DebugSession, executable: vscode.DebugAdapterExecutable | undefined): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
		if (session.configuration.request == "attach") {
			// make VS Code connect to debug server
			return new vscode.DebugAdapterServer(session.configuration["debuggerPort"], session.configuration["debuggerAddress"]);
		}

		if (executable) {
			//const args = ["debug", "--src-path", "P:/Random/KPC8/ExampleSourceFiles/FibonacciProgramSource.kpc"];
			const args = ["debug", "--src-path", session.configuration["program"], "--pause-at-entry", [session.configuration["pauseAtEntry"]]];
			return new vscode.DebugAdapterExecutable(executable.command, args, executable.options);
		}

		return executable;
	}
}

