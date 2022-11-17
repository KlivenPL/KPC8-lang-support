import { DebugConfiguration } from 'vscode';

export interface KpcDebugBaseConfiguration extends DebugConfiguration {
    pauseAtEntry?: boolean;
}

export interface KpcLaunchConfiguration extends KpcDebugBaseConfiguration {
    kpc8PlayerPath: string;
    sourceFilePath: string;
}

export interface KpcAttachConfiguration extends KpcDebugBaseConfiguration {
    debuggerAddress: string;
    debuggerPort: string;
}