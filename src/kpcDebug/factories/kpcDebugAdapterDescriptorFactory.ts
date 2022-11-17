import {
    DebugAdapterDescriptor,
    DebugAdapterDescriptorFactory,
    DebugAdapterExecutable,
    DebugAdapterServer,
    DebugSession,
    ProviderResult
    } from 'vscode';

export class KpcDebugAdapterDescriptorFactory implements DebugAdapterDescriptorFactory {
    createDebugAdapterDescriptor(session: DebugSession, executable: DebugAdapterExecutable | undefined): ProviderResult<DebugAdapterDescriptor> {
        if (session.configuration.request == "attach") {
            return new DebugAdapterServer(session.configuration.debuggerPort, session.configuration.debuggerAddress);
        }

        if (session.configuration.request == "launch") {
            const args = ["debug", "--src-path", session.configuration.sourceFilePath, "--pause-at-entry", session.configuration.pauseAtEntry];
            return new DebugAdapterExecutable(session.configuration.kpc8PlayerPath, args);
        }

        return executable;
    }
}
