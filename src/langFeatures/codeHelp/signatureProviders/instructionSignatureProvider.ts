import SignatureProvider from './signatureProvider';
import { getInstructionSignatures } from '../docs/kpcSignatures';
import { IKpcSignature } from '../docs/types/kpcSignature';
import { KpcInstructionType } from '../docs/kpcInstructionType';
import { TokenClass, TokenClassType } from '../docs/types/tokenClass';

class InstructionSignatureProvider extends SignatureProvider {
    protected signatures: IKpcSignature[] = getInstructionSignatures();
    protected descriptions: { label: string; details: string; }[] = Object.entries(KpcInstructionType).map(([label, details]) => ({ label: label.toLowerCase(), details: String(details) }));;

    protected tokenClassToParameterName(tokenClass: TokenClassType | undefined, i: number) {
        switch (tokenClass) {
            case undefined:
                return "";
            case TokenClass.Register:
                return `reg${i + 1}`;
            case TokenClass.Number:
                return `num`;
            default:
                return `${tokenClass}${i + 1}`;
        }
    }
}

export default InstructionSignatureProvider;
