import { IKpcSignature } from './types/kpcSignature';
import { KpcSignature } from './types/kpcSignatureType';

export const getAllSignatures = () => signatures;
export const getInstructionSignatures = () => signatures.filter(x => x.type === KpcSignature.Instruction);
export const getPseudoinstructionSignatures = () => signatures.filter(x => x.type === KpcSignature.Pseudoinstruction);
export const getCommandSignatures = () => signatures.filter(x => x.type === KpcSignature.Command);

// code generated automatically, do not edit manually.
const signatures: IKpcSignature[] =
  [
    {
      "name": "Nop",
      "type": "Instruction",
      "arguments": []
    },
    {
      "name": "Irrex",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Number"
        }
      ]
    },
    {
      "name": "Irrret",
      "type": "Instruction",
      "arguments": []
    },
    {
      "name": "Irren",
      "type": "Instruction",
      "arguments": []
    },
    {
      "name": "Irrdis",
      "type": "Instruction",
      "arguments": []
    },
    {
      "name": "Jr",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "Jro",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "Jas",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "JpcaddI",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Number"
        }
      ]
    },
    {
      "name": "JpcsubI",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Number"
        }
      ]
    },
    {
      "name": "Lbrom",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "Lbromo",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "Lwrom",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "Lwromo",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "Lbram",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "Lbramo",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "Lwram",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "Lwramo",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "Popb",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "Popw",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "Lbext",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "Not",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "Or",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "And",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "Xor",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "Sll",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "Srl",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "Add",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "AddI",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Number"
        }
      ]
    },
    {
      "name": "Sub",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "SubI",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Number"
        }
      ]
    },
    {
      "name": "Addw",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "Negw",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "Set",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "SetI",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Number"
        }
      ]
    },
    {
      "name": "Seth",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "SethI",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Number"
        }
      ]
    },
    {
      "name": "Setw",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "Setloh",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "Swap",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "Swaph",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "Swapw",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "Swaploh",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "Sbram",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "SbramI",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "Sbramo",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "Swram",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "Swramo",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "Pushb",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "Pushw",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "Sbext",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "Jwz",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "Jwnotz",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "Jwn",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "Jwnotn",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "Jzf",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "Jnf",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "Jcf",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "Jof",
      "type": "Instruction",
      "arguments": [
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "PushbI",
      "type": "Pseudoinstruction",
      "arguments": []
    },
    {
      "name": "PushwI",
      "type": "Pseudoinstruction",
      "arguments": []
    },
    {
      "name": "SbextI",
      "type": "Pseudoinstruction",
      "arguments": []
    },
    {
      "name": "SbramoI",
      "type": "Pseudoinstruction",
      "arguments": []
    },
    {
      "name": "SwramI",
      "type": "Pseudoinstruction",
      "arguments": []
    },
    {
      "name": "SwramoI",
      "type": "Pseudoinstruction",
      "arguments": []
    },
    {
      "name": "Getl",
      "type": "Pseudoinstruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Identifier"
        }
      ]
    },
    {
      "name": "SetwI",
      "type": "Pseudoinstruction",
      "arguments": []
    },
    {
      "name": "AddwI",
      "type": "Pseudoinstruction",
      "arguments": []
    },
    {
      "name": "AndI",
      "type": "Pseudoinstruction",
      "arguments": []
    },
    {
      "name": "AndwI",
      "type": "Pseudoinstruction",
      "arguments": []
    },
    {
      "name": "Andw",
      "type": "Pseudoinstruction",
      "arguments": []
    },
    {
      "name": "CmpAndI",
      "type": "Pseudoinstruction",
      "arguments": []
    },
    {
      "name": "CmpOrI",
      "type": "Pseudoinstruction",
      "arguments": []
    },
    {
      "name": "CmpSubI",
      "type": "Pseudoinstruction",
      "arguments": []
    },
    {
      "name": "CmpXorI",
      "type": "Pseudoinstruction",
      "arguments": []
    },
    {
      "name": "Notw",
      "type": "Pseudoinstruction",
      "arguments": []
    },
    {
      "name": "OrI",
      "type": "Pseudoinstruction",
      "arguments": []
    },
    {
      "name": "OrwI",
      "type": "Pseudoinstruction",
      "arguments": []
    },
    {
      "name": "Orw",
      "type": "Pseudoinstruction",
      "arguments": []
    },
    {
      "name": "XorI",
      "type": "Pseudoinstruction",
      "arguments": []
    },
    {
      "name": "XorwI",
      "type": "Pseudoinstruction",
      "arguments": []
    },
    {
      "name": "Xorw",
      "type": "Pseudoinstruction",
      "arguments": []
    },
    {
      "name": "LbextI",
      "type": "Pseudoinstruction",
      "arguments": []
    },
    {
      "name": "LbramI",
      "type": "Pseudoinstruction",
      "arguments": []
    },
    {
      "name": "LbramoI",
      "type": "Pseudoinstruction",
      "arguments": []
    },
    {
      "name": "LbromI",
      "type": "Pseudoinstruction",
      "arguments": []
    },
    {
      "name": "LbromoI",
      "type": "Pseudoinstruction",
      "arguments": []
    },
    {
      "name": "LwramI",
      "type": "Pseudoinstruction",
      "arguments": []
    },
    {
      "name": "LwramoI",
      "type": "Pseudoinstruction",
      "arguments": []
    },
    {
      "name": "LwromI",
      "type": "Pseudoinstruction",
      "arguments": []
    },
    {
      "name": "LwromoI",
      "type": "Pseudoinstruction",
      "arguments": []
    },
    {
      "name": "Jasl",
      "type": "Pseudoinstruction",
      "arguments": [
        {
          "tokenClass": "Identifier"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "Jcfl",
      "type": "Pseudoinstruction",
      "arguments": [
        {
          "tokenClass": "Identifier"
        }
      ]
    },
    {
      "name": "Jl",
      "type": "Pseudoinstruction",
      "arguments": [
        {
          "tokenClass": "Identifier"
        }
      ]
    },
    {
      "name": "Jnfl",
      "type": "Pseudoinstruction",
      "arguments": [
        {
          "tokenClass": "Identifier"
        }
      ]
    },
    {
      "name": "Jofl",
      "type": "Pseudoinstruction",
      "arguments": [
        {
          "tokenClass": "Identifier"
        }
      ]
    },
    {
      "name": "Jwnl",
      "type": "Pseudoinstruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Identifier"
        }
      ]
    },
    {
      "name": "Jwnotnl",
      "type": "Pseudoinstruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Identifier"
        }
      ]
    },
    {
      "name": "Jwnotzl",
      "type": "Pseudoinstruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Identifier"
        }
      ]
    },
    {
      "name": "Jwzl",
      "type": "Pseudoinstruction",
      "arguments": [
        {
          "tokenClass": "Register"
        },
        {
          "tokenClass": "Identifier"
        }
      ]
    },
    {
      "name": "Jzfl",
      "type": "Pseudoinstruction",
      "arguments": [
        {
          "tokenClass": "Identifier"
        }
      ]
    },
    {
      "name": "Ascii",
      "type": "Command",
      "arguments": [
        {
          "tokenClass": "Identifier"
        },
        {
          "tokenClass": "String"
        }
      ]
    },
    {
      "name": "Asciiz",
      "type": "Command",
      "arguments": [
        {
          "tokenClass": "Identifier"
        },
        {
          "tokenClass": "String"
        }
      ]
    },
    {
      "name": "Binfile",
      "type": "Command",
      "arguments": [
        {
          "tokenClass": "Identifier"
        },
        {
          "tokenClass": "Number"
        },
        {
          "tokenClass": "String"
        }
      ]
    },
    {
      "name": "DebugWrite",
      "type": "Command",
      "arguments": [
        {
          "tokenClass": "String"
        }
      ]
    },
    {
      "name": "DefcolorHEX",
      "type": "Command",
      "arguments": [
        {
          "tokenClass": "Identifier"
        },
        {
          "tokenClass": "String"
        }
      ]
    },
    {
      "name": "DefcolorRGB",
      "type": "Command",
      "arguments": [
        {
          "tokenClass": "Identifier"
        },
        {
          "tokenClass": "Number"
        },
        {
          "tokenClass": "Number"
        },
        {
          "tokenClass": "Number"
        }
      ]
    },
    {
      "name": "Defnum",
      "type": "Command",
      "arguments": [
        {
          "tokenClass": "Identifier"
        },
        {
          "tokenClass": "Number"
        }
      ]
    },
    {
      "name": "Defreg",
      "type": "Command",
      "arguments": [
        {
          "tokenClass": "Identifier"
        },
        {
          "tokenClass": "Register"
        }
      ]
    },
    {
      "name": "ExportRegion",
      "type": "Command",
      "arguments": [
        {
          "tokenClass": "Identifier"
        }
      ]
    },
    {
      "name": "InsertModule",
      "type": "Command",
      "arguments": [
        {
          "tokenClass": "String"
        }
      ]
    },
    {
      "name": "SetAddress",
      "type": "Command",
      "arguments": [
        {
          "tokenClass": "Number"
        }
      ]
    },
    {
      "name": "SetModuleAddress",
      "type": "Command",
      "arguments": [
        {
          "tokenClass": "Number"
        }
      ]
    }
  ]