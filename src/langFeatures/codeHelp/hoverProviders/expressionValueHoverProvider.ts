import * as vscode from 'vscode';

/**
 * A simple recursive descent parser for numeric expressions.
 * It supports:
 * - decimal, hexadecimal (0x...), binary (0b...) literals
 * - arithmetic operators: +, -, *, /
 * - grouping via parentheses (non‑nested inside other parentheses is allowed)
 * - optional unary +/– (only allowed on numbers, not on hex/binary)
 * 
 * If useFloating is false, division is done as integer division (truncated toward zero).
 */
class ExpressionParser {
    private expr: string;
    private pos: number;
    private useFloating: boolean;

    constructor(expr: string, useFloating: boolean) {
        this.expr = expr;
        this.pos = 0;
        this.useFloating = useFloating;
    }

    private skipWhitespace() {
        while (this.pos < this.expr.length && /\s/.test(this.expr[this.pos])) {
            this.pos++;
        }
    }

    private parseNumber(): number {
        this.skipWhitespace();
        let negative = false;
        if (this.expr[this.pos] === '+' || this.expr[this.pos] === '-') {
            if (this.expr[this.pos] === '-') {
                negative = true;
            }
            this.pos++;
        }
        this.skipWhitespace();
        if (this.pos >= this.expr.length) {
            throw new Error("Expected number");
        }
        // Check for hexadecimal or binary literal.
        if (this.expr[this.pos] === '0' && this.pos + 1 < this.expr.length &&
            (this.expr[this.pos + 1] === 'x' || this.expr[this.pos + 1] === 'X' ||
                this.expr[this.pos + 1] === 'b' || this.expr[this.pos + 1] === 'B')) {
            const prefix = this.expr[this.pos + 1];
            this.pos += 2;
            const start = this.pos;
            if (prefix === 'x' || prefix === 'X') {
                while (this.pos < this.expr.length && /[0-9a-fA-F]/.test(this.expr[this.pos])) {
                    this.pos++;
                }
                const hexStr = this.expr.substring(start, this.pos);
                if (hexStr.length === 0) {
                    throw new Error("Invalid hexadecimal literal");
                }
                const value = parseInt(hexStr, 16);
                return negative ? -value : value;
            } else {
                while (this.pos < this.expr.length && /[01]/.test(this.expr[this.pos])) {
                    this.pos++;
                }
                const binStr = this.expr.substring(start, this.pos);
                if (binStr.length === 0) {
                    throw new Error("Invalid binary literal");
                }
                const value = parseInt(binStr, 2);
                return negative ? -value : value;
            }
        } else {
            // Parse a decimal number.
            const start = this.pos;
            while (this.pos < this.expr.length && /[0-9]/.test(this.expr[this.pos])) {
                this.pos++;
            }
            if (this.pos === start) {
                throw new Error("No digits found");
            }
            const value = parseInt(this.expr.substring(start, this.pos), 10);
            return negative ? -value : value;
        }
    }

    private parseFactor(): number {
        this.skipWhitespace();
        if (this.pos < this.expr.length && this.expr[this.pos] === '(') {
            this.pos++; // consume '('
            const value = this.parseExpression();
            this.skipWhitespace();
            if (this.pos >= this.expr.length || this.expr[this.pos] !== ')') {
                throw new Error("Missing closing parenthesis");
            }
            this.pos++; // consume ')'
            return value;
        }
        return this.parseNumber();
    }

    private parseTerm(): number {
        let value = this.parseFactor();
        this.skipWhitespace();
        while (this.pos < this.expr.length && (this.expr[this.pos] === '*' || this.expr[this.pos] === '/')) {
            const op = this.expr[this.pos];
            this.pos++;
            const next = this.parseFactor();
            if (op === '*') {
                value *= next;
            } else {
                if (next === 0) {
                    throw new Error("Division by zero");
                }
                if (this.useFloating) {
                    value /= next;
                } else {
                    value = Math.trunc(value / next);
                }
            }
            this.skipWhitespace();
        }
        return value;
    }

    private parseExpression(): number {
        let value = this.parseTerm();
        this.skipWhitespace();
        while (this.pos < this.expr.length && (this.expr[this.pos] === '+' || this.expr[this.pos] === '-')) {
            const op = this.expr[this.pos];
            this.pos++;
            const next = this.parseTerm();
            value = op === '+' ? value + next : value - next;
            this.skipWhitespace();
        }
        return value;
    }

    public parse(): number {
        const result = this.parseExpression();
        this.skipWhitespace();
        if (this.pos !== this.expr.length) {
            throw new Error("Invalid characters in expression");
        }
        return result;
    }
}

/**
 * The hover provider for KPC files.
 * When hovering over a numeric expression (enclosed in { … } with optional trailing "f"),
 * it evaluates the expression, casts the result to a ushort (by truncation), and shows its value.
 */
export class ExpressionValueHoverProvider implements vscode.HoverProvider {
    public provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {
        // Use a regex to capture an expression of the form { ... } or { ... }f
        const expressionRegex = /\{[^}]+\}(?:f)?/g;
        const lineText = document.lineAt(position.line).text;
        let match: RegExpExecArray | null;
        while ((match = expressionRegex.exec(lineText)) !== null) {
            const startIndex = match.index;
            const endIndex = startIndex + match[0].length;
            const range = new vscode.Range(
                new vscode.Position(position.line, startIndex),
                new vscode.Position(position.line, endIndex)
            );
            if (range.contains(position)) {
                const text = match[0];
                // Confirm the text starts with '{' and ends with '}' or '}f'
                if (text.startsWith('{') && (text.endsWith('}') || text.endsWith('}f'))) {
                    // Remove the surrounding braces and an optional trailing "f"
                    let inner = text.slice(1, text.endsWith('}f') ? -2 : -1).trim();
                    const useFloating = text.endsWith('}f');
                    try {
                        const parser = new ExpressionParser(inner, useFloating);
                        let value = parser.parse();
                        // Cast to ushort by truncating the float value.
                        if (useFloating) {
                            value = Math.trunc(value);
                        }
                        const binStr = value.toString(2).padStart(16, '0');
                        const hexWord = '0x' + value.toString(16).toUpperCase().padStart(4, '0');
                        const highByte = (value >> 8) & 0xFF;
                        const lowByte = value & 0xFF;

                        const decWordUnsigned = value;
                        const decWordSigned = value >= 0x8000 ? value - 0x10000 : value;
                        const decHighUnsigned = highByte;
                        const decLowUnsigned = lowByte;
                        const decHighSigned = highByte >= 128 ? highByte - 256 : highByte;
                        const decLowSigned = lowByte >= 128 ? lowByte - 256 : lowByte;

                        // Default content: unsigned hex values.
                        const content = `
- **Hex (word):** \`${hexWord}\`
- **Decimal (word, unsigned):** \`${decWordUnsigned}\`
- **Decimal (word, signed):** \`${decWordSigned}\`
- **Binary (16-bit):** \`${binStr.slice(0, 4)}\` \`${binStr.slice(4, 8)}\` \`${binStr.slice(8, 12)}\` \`${binStr.slice(12, 16)}\`
- **Decimal (2 bytes, unsigned):** \`${decHighUnsigned}\` \`${decLowUnsigned}\`
- **Decimal (2 bytes, signed):** \`${decHighSigned}\` \`${decLowSigned}\``;

                        const hoverMessage = new vscode.MarkdownString(
                            `**${useFloating ? "Float" : "Integer"}** expression ${text} evaluates to:\n\n${content}`
                        );

                        return new vscode.Hover(hoverMessage, range);
                    } catch (error) {
                        // If parsing fails, no hover is provided.
                        return;
                    }
                }
            }
        }
        return;
    }
}

export default ExpressionValueHoverProvider;