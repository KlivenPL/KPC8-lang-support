import { IKpcArgument } from './kpcArgument';
import { KpcSignatureType } from './kpcSignatureType';

export interface IKpcSignature {
    name: string;
    type: KpcSignatureType
    arguments: IKpcArgument[];
}