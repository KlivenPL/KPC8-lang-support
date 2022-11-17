import * as vscode from 'vscode';
import { DebugValueFormat, IChangeFormatRequestArguments } from '../interfaces/customRequests/ChangeFormatRequest';
import { KpcDebugAdapterDescriptorFactory } from './factories/kpcDebugAdapterDescriptorFactory';
import { KpcDebugConfigurationProvider } from './providers/kpcDebugConfigurationProvider';
import { KpcEvaluatableExpressionProvider } from './providers/kpcEvaluatableExpressionProvider';
import { KpcInlineValuesProvider } from './providers/kpcInlineValuesProvider';
'use strict';

export function activateKpcDebug(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('extension.kpc8-lang-support.changeFormatRequest.binary', (variable) => sendChangeFormatRequest(DebugValueFormat.Binary)),
		vscode.commands.registerCommand('extension.kpc8-lang-support.changeFormatRequest.hexWord', (variable) => sendChangeFormatRequest(DebugValueFormat.HexWord)),
		vscode.commands.registerCommand('extension.kpc8-lang-support.changeFormatRequest.hexTwoBytes', (variable) => sendChangeFormatRequest(DebugValueFormat.HexTwoBytes)),
		vscode.commands.registerCommand('extension.kpc8-lang-support.changeFormatRequest.decWordUnsigned', (variable) => sendChangeFormatRequest(DebugValueFormat.DecWordUnsigned)),
		vscode.commands.registerCommand('extension.kpc8-lang-support.changeFormatRequest.decWordSigned', (variable) => sendChangeFormatRequest(DebugValueFormat.DecWordSigned)),
		vscode.commands.registerCommand('extension.kpc8-lang-support.changeFormatRequest.decTwoBytesUnsigned', (variable) => sendChangeFormatRequest(DebugValueFormat.DecTwoBytesUnsigned)),
		vscode.commands.registerCommand('extension.kpc8-lang-support.changeFormatRequest.decTwoBytesSigned', (variable) => sendChangeFormatRequest(DebugValueFormat.DecTwoBytesSigned)),

		vscode.debug.registerDebugConfigurationProvider('kpcdbg', new KpcDebugConfigurationProvider()),
		vscode.debug.registerDebugAdapterDescriptorFactory('kpcdbg', new KpcDebugAdapterDescriptorFactory()),

		vscode.languages.registerEvaluatableExpressionProvider('kpc', new KpcEvaluatableExpressionProvider()),
		vscode.languages.registerInlineValuesProvider('kpc', new KpcInlineValuesProvider()),
	);

	const sendChangeFormatRequest = (format: DebugValueFormat) => {
		const ds = vscode.debug.activeDebugSession;
		if (ds) {
			const args: IChangeFormatRequestArguments = { Format: format };
			ds.customRequest('ChangeFormatRequest', args);
		}
	}
}
