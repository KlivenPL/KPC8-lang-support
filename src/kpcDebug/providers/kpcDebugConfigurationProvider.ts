import * as fs from 'fs';
import {
    CancellationToken,
    DebugConfiguration,
    DebugConfigurationProvider,
    ProviderResult,
    window,
    WorkspaceFolder
    } from 'vscode';
import { KpcAttachConfiguration, KpcLaunchConfiguration } from '../../configuration/debugConfiguration';

export class KpcDebugConfigurationProvider implements DebugConfigurationProvider {
    resolveDebugConfigurationWithSubstitutedVariables(folder: WorkspaceFolder | undefined, config: KpcLaunchConfiguration | KpcAttachConfiguration, token?: CancellationToken): ProviderResult<DebugConfiguration> {
        const validationErrors: string[] = [];

        if (!config.request) {
            validationErrors.push("Request not specified");
        }

        if (config.type !== "kpcdbg") {
            validationErrors.push(`Invalid debug type: ${config.type}`);
        }

        if (config.request == "attach") {
            if (!config.debuggerAddress) {
                validationErrors.push(`Debugger address not specified`);
            }

            if (!config.debuggerPort) {
                validationErrors.push(`Debugger port not specified`);
            }
        }

        if (config.request == "launch") {
            if (!config.kpc8PlayerPath) {
                validationErrors.push(`KPC8 player path not specified`);
            } else {
                if (!this.checkIfFileExists(config.kpc8PlayerPath)) {
                    validationErrors.push(`Invalid KPC8 player path: ${config.kpc8PlayerPath}`);
                }
            }

            if (!config.sourceFilePath) {
                validationErrors.push("Source file path not specified");
            } else {
                if (!this.checkIfFileExists(config.sourceFilePath)) {
                    validationErrors.push(`Invalid source file path: ${config.sourceFilePath}`);
                }
            }
        }

        if (validationErrors.length > 0) {
            window.showErrorMessage(`Debug configuration errors: ${validationErrors.join(",")}`);
            return null;
        }

        return config;
    }

    private checkIfFileExists(path: string) {
        return fs.existsSync(path);
    }
}