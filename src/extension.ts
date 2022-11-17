import * as vscode from 'vscode';
import activateLangFeatures from './langFeatures/activateLangFeaturesHelp';
import { activateKpcDebug } from './kpcDebug/activateKpcDebug';

'use strict';

export function activate(context: vscode.ExtensionContext) {
	activateKpcDebug(context);
	activateLangFeatures(context);
}

