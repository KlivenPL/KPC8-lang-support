import SignatureProvider from './signatureProvider';
import { getPseudoinstructionSignatures } from '../docs/kpcSignatures';
import { IKpcSignature } from '../docs/types/kpcSignature';
import { KpcPseudoinstructionType } from '../docs/kpcPseudoInstructionType';
import { TokenClass, TokenClassType } from '../docs/types/tokenClass';

class PseudoinstructionSignatureProvider extends SignatureProvider {
    protected signatures: IKpcSignature[] = getPseudoinstructionSignatures();
    protected descriptions: { label: string; details: string; }[] = Object.entries(KpcPseudoinstructionType).map(([label, details]) => ({ label: label.toLowerCase(), details: String(details) }));;

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
            default:
                return `${tokenClass}${i + 1}`;
        }
    }
}

export default PseudoinstructionSignatureProvider;
