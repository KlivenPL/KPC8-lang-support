import SignatureProvider from './signatureProvider';
import { getCommandSignatures } from '../docs/kpcSignatures';
import { IKpcSignature } from '../docs/types/kpcSignature';
import { KpcCommandType } from '../docs/kpcCommandType';
import { TokenClass, TokenClassType } from '../docs/types/tokenClass';

class CommandSignatureProvider extends SignatureProvider {
    protected signatures: IKpcSignature[] = getCommandSignatures();
    protected descriptions: { label: string; details: string; }[] = Object.entries(KpcCommandType).map(([label, details]) => ({ label: label.toLowerCase(), details: String(details) }));

    protected prettyPrintSignatureName(signatureName: string): string {
        return `.${signatureName}`;
    }

    protected tokenClassToParameterName(tokenClass: TokenClassType | undefined, i: number) {
        switch (tokenClass) {
            case undefined:
                return "";
            case TokenClass.Register:
                return `reg${i + 1}`;
            case TokenClass.Number:
                return `num${i + 1}`;
            case TokenClass.Identifier:
                return `idt${i + 1}`;
            case TokenClass.Char:
                return `chr${i + 1}`;
            case TokenClass.String:
                return `str${i + 1}`;
            default:
                return `${tokenClass}${i + 1}`;
        }
    }
}

export default CommandSignatureProvider;
