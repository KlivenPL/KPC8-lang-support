export enum KpcCommandType {
    SetAddress = "Set current ROM write address",
    Reserve = "(not implemented)",
    Ascii = "Write ASCII string to current ROM address",
    Asciiz = "Write null terminated ('\\0') ASCII string to current ROM address",
    Defnum = "Create an alias for a number",
    Defreg = "Create an alias for a register",
    DefcolorRGB = "Create an alias for RGB color value by providing RGB values",
    DefcolorHEX = "Create an alias for RGS color value by HEX code",
    Binfile = "Write file content to current ROM address",
    DebugWrite = "Write a debug string to debug console",
    InsertModule = "Insert module's source into current ROM address (imports module globally)",
    ExportRegion = "Make region public (visible to other modules)"
}