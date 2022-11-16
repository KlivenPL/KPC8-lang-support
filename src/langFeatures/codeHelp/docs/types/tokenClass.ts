export enum TokenClass {
    None = "None",
    Identifier = "Identifier",
    Register = "Register",
    Number = "Number",
    Char = "Char",
    String = "String",
    Label = "Label",
    Region = "Region",
    Command = "Command",
}

export type TokenClassType = "None" | "Identifier" | "Register" | "Number" | "Char" | "String" | "Label" | "Region" | "Command";
