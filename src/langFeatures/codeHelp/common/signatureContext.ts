import { IKpcSignature } from '../docs/types/kpcSignature';

export interface SignatureContext {
    activeArgumentIndex?: number;
    kpcSignature?: IKpcSignature;
    dirty: boolean;
}

// This global object holds the current signature context.
export const signatureContext: SignatureContext = {
    activeArgumentIndex: undefined,
    kpcSignature: undefined,
    dirty: false,
};