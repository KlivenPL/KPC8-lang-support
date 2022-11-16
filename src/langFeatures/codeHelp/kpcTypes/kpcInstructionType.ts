export enum KpcInstructionType {
    Nop = "No operation\n\nIdles for 16 clock cycles",
    Lbrom = "Load byte ROM\n\nLoads byte from ROM to a register at a given address\n\n$r1 - Destination register\n\n$r2 - Register containing 16-bit address value",
    Lbromo = "Load byte ROM offset\n\nLoads byte from ROM to a register at a given address with specified offset\n\n$r1 - Destination register\n\n$r2 - Register containing 16-bit address value\n\n$r3 - Register containing 16-bit offset value",
    Lwrom = "Load word ROM\n\nLoads word from ROM to a register at a given address\n\n$r1 - Destination register\n\n$r2 - Register containing 16-bit address value",
    Lwromo = "Load word ROM offset\n\nLoads word from ROM to a register at a given address with specified offset\n\n$r1 - Destination register\n\n$r2 - Register containing 16-bit address value\n\n$r3 - Register containing 16-bit offset value",
    Lbram = "Load byte RAM\n\nLoads byte from RAM to a register at a given address\n\n$r1 - Destination register\n\n$r2 - Register containing 16-bit address value",
    Lbramo = "Load byte RAM offset\n\nLoads byte from RAM to a register at a given address with specified offset\n\n$r1 - Destination register\n\n$r2 - Register containing 16-bit address value\n\n$r3 - Register containing 16-bit offset value",
    Lwram = "Load word RAM\n\nLoads word from RAM to a register at a given address\n\n$r1 - Destination register\n\n$r2 - Register containing 16-bit address value",
    Lwramo = "Load word RAM offset\n\nLoads word from RAM to a register at a given address with specified offset\n\n$r1 - Destination register\n\n$r2 - Register containing 16-bit address value\n\n$r3 - Register containing 16-bit offset value",
    Popb = "Pop byte",
    Popw = "Pop word",
    Lbext = "Load byte external",
    Sbram = "Store byte RAM",
    SbramI = "Store byte RAM immediate",
    Sbramo = "Store byte RAM offset",
    Swram = "Store word RAM",
    Swramo = "Store word RAM offset",
    Pushb = "Push byte",
    Pushw = "Push word",
    Sbext = "Store byte external",
    Add = "Add",
    AddI = "Add immediate",
    Sub = "Subtract",
    SubI = "Subtract immediate",
    Addw = "Add word with carry",
    Negw = "Negate word with carry",
    Not = "Bitwise NOT",
    Or = "Bitwise OR",
    And = "Bitwise AND",
    Xor = "Bitwise XOR",
    Sll = "Shift left logical",
    Srl = "Shift right logical",
    Set = "Set",
    SetI = "Set low immediate",
    Seth = "Set high",
    SethI = "Set high immediate",
    Setw = "Set word",
    Setloh = "Set low to high and high to low",
    Swap = "Swap low",
    Swaph = "Swap high",
    Swapw = "Swap word",
    Swaploh = "Swap low with high and high with low",
    Jr = "Jump register",
    Jro = "Jump register offset",
    Jas = "Jump and save",
    JpcaddI = "Jump program counter add immediate",
    JpcsubI = "Jump program counter sub immediate",
    Irrret = "Interrupt return",
    Irren = "Interrupt enable",
    Irrdis = "Interrupt disable",
    Jwz = "Jump word zero",
    Jwnotz = "Jump word not zero",
    Jwn = "Jump word negative",
    Jwnotn = "Jump word not negative",
    Jzf = "Jump zero flag (disable interrupts first!)",
    Jnf = "Jump negative flag (disable interrupts first!)",
    Jcf = "Jump carry flag (disable interrupts first!)",
    Jof = "Jump overflow flag (disable interrupts first!)",
}