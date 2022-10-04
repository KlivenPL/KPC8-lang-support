export enum DebugValueFormat {
    Binary,
    HexWord,
    HexTwoBytes,
    DecWordUnsigned,
    DecWordSigned,
    DecTwoBytesUnsigned,
    DecTwoBytesSigned,
}

export interface IChangeFormatRequestArguments {
    Format: DebugValueFormat;
}

export interface IChangeFormatRequest {
    Arguments: IChangeFormatRequestArguments;
}