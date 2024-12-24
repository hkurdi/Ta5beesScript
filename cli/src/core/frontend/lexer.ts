export enum TokenType {
    Number,
    String,
    Identifier,
    Keyword,
    Equals,
    Plus,
    Minus,
    Asterisk,
    Slash,
    Percent,
    OpenParen,
    CloseParen,
    OpenBrace,
    CloseBrace,
    OpenBracket,
    CloseBracket,
    GreaterThan,
    LessThan,
    GreaterThanEquals,
    LessThanEquals,
    EqualsEquals,
    NotEquals,
    Comma,
    Semicolon,
    Colon,
    Dot,
    And,
    Or,
    Not,
    EOF,
    Let,
    Const,
    Function,
    If,
    Else,
    For,
    Try,
    Catch,
    Return,
    Throw,
    Continue,
    Break,
    Await,
    Async,
    Arrow,
  }
  
  const KEYWORDS: Record<string, TokenType> = {
    "khalli": TokenType.Let,
    "thabit": TokenType.Const,
    "arrifli": TokenType.Function,
    "iza": TokenType.If,
    "willa": TokenType.Else,
    "la": TokenType.For,
    "raje3li": TokenType.Return,
    "hawel": TokenType.Try,
    "law_sar_ma_sar": TokenType.Catch,
    "irmi": TokenType.Throw,
    "kammil": TokenType.Continue,
    "iksir": TokenType.Break,
    "stanna": TokenType.Await,
    "tazamonan": TokenType.Async,
  };
  
  export interface Token {
    value: string;
    type: TokenType;
    line: number;
    column: number;
  }
  
  function createToken(
    value: string,
    type: TokenType,
    line: number,
    column: number
  ): Token {
    return { value, type, line, column };
  }
  
  function isAlpha(char: string): boolean {
    return /^[a-zA-Z_]$/.test(char);
  }
  
  function isDigit(char: string): boolean {
    return /^[0-9]$/.test(char);
  }
  
  function isFloat(value: string): boolean {
    return typeof value === 'number' && !Number.isInteger(value);
  }
  
  function isAlphanumeric(char: string): boolean {
    return /^[a-zA-Z0-9_]$/.test(char);
  }
  
  function isSkippable(char: string): boolean {
    return char === " " || char === "\t" || char === "\r";
  }
  
  function peek(src: string[], offset = 0): string | undefined {
    return src[offset];
  }
  
  export function tokenize(sourceCode: string): Token[] {
    const tokens: Token[] = [];
    const src: string[] = sourceCode.split("");
    let line = 1;
    let column = 0;
  
  
    while (src.length > 0) {
      let char: string = src.shift()!;
      column++;
  
      if (char === "\n") {
        line++;
        column = 0;
        continue;
      }
  
      if (isSkippable(char)) {
        continue;
      }
  
      if (char === "/" && peek(src) === "/") {
        src.shift();
        column++;
        while (src.length > 0 && peek(src) !== "\n") {
          src.shift();
        }
        continue;
      }
  
      if (isDigit(char)) {
        let num = char;
        while (src.length > 0 && isDigit(peek(src)!)) {
          num += src.shift();
          column++;
        }
  
        if(peek(src) === ".") {
          num += ".";
          src.shift();
          while(isDigit(peek(src)!)) {
            num += src.shift();
            column++;
          }
        }
  
        tokens.push(createToken(num, TokenType.Number, line, column));
        continue;
      }
  
      if (char === '"') {
        let str = "";
        while (src.length > 0) {
          const next = src.shift();
          column++;
          
          // Handle escaped characters
          if (next === '\\') {
            const escaped = src.shift();
            column++;
            if (escaped === '"') {
              str += '"';
            } else if (escaped === '\\') {
              str += '\\';
            } else {
              str += '\\' + escaped;
            }
            continue;
          }
          
          // End of string
          if (next === '"') {
            break;
          }
          
          if (!next) {
            throw new Error(`Unterminated string at line ${line}, column ${column}`);
          }
          
          str += next;
        }
        
        tokens.push(createToken(str, TokenType.String, line, column));
        continue;
      }
  
      if (isAlpha(char)) {
        let ident = char;
        while (src.length > 0 && isAlphanumeric(peek(src)!)) {
          ident += src.shift();
          column++;
        }
        if (KEYWORDS.hasOwnProperty(ident)) {
          tokens.push(createToken(ident, KEYWORDS[ident], line, column));
        } else {
          tokens.push(createToken(ident, TokenType.Identifier, line, column));
        }
        continue;
      }
  
      switch (char) {
        case "+":
          tokens.push(createToken(char, TokenType.Plus, line, column));
          break;
        case "-":
          tokens.push(createToken(char, TokenType.Minus, line, column));
          break;
        case "*":
          tokens.push(createToken(char, TokenType.Asterisk, line, column));
          break;
        case "/":
          tokens.push(createToken(char, TokenType.Slash, line, column));
          break;
        case "%":
          tokens.push(createToken(char, TokenType.Percent, line, column));
          break;
        case "(":
          tokens.push(createToken(char, TokenType.OpenParen, line, column));
          break;
        case ")":
          tokens.push(createToken(char, TokenType.CloseParen, line, column));
          break;
        case "{":
          tokens.push(createToken(char, TokenType.OpenBrace, line, column));
          break;
        case "}":
          tokens.push(createToken(char, TokenType.CloseBrace, line, column));
          break;
        case "[":
          tokens.push(createToken(char, TokenType.OpenBracket, line, column));
          break;
        case "]":
          tokens.push(createToken(char, TokenType.CloseBracket, line, column));
          break;
        case "=":
          if (peek(src) === "=") {
            src.shift();
            column++;
            tokens.push(createToken("==", TokenType.EqualsEquals, line, column));
          } else if (peek(src) === ">") {
            src.shift();
            column++;
            tokens.push(createToken("=>", TokenType.Arrow, line, column));
          } 
          else {
            tokens.push(createToken(char, TokenType.Equals, line, column));
          }
          break;
        case "!":
          if (peek(src) === "=") {
            src.shift();
            column++;
            tokens.push(createToken("!=", TokenType.NotEquals, line, column));
          } else {
            tokens.push(createToken(char, TokenType.Not, line, column));
          }
          break;
        case ">":
          if (peek(src) === "=") {
            src.shift();
            column++;
            tokens.push(
              createToken(">=", TokenType.GreaterThanEquals, line, column)
            );
          } else {
            tokens.push(createToken(char, TokenType.GreaterThan, line, column));
          }
          break;
        case "<":
          if (peek(src) === "=") {
            src.shift();
            column++;
            tokens.push(
              createToken("<=", TokenType.LessThanEquals, line, column)
            );
          } else {
            tokens.push(createToken(char, TokenType.LessThan, line, column));
          }
          break;
        case "&":
          if (peek(src) === "&") {
            src.shift();
            column++;
            tokens.push(createToken("&&", TokenType.And, line, column));
          } else {
            throw new Error(
              `Unexpected character '&' at line ${line}, column ${column}`
            );
          }
          break;
        case "|":
          if (peek(src) === "|") {
            src.shift();
            column++;
            tokens.push(createToken("||", TokenType.Or, line, column));
          } else {
            throw new Error(
              `Unexpected character '|' at line ${line}, column ${column}`
            );
          }
          break;
        case ";":
          tokens.push(createToken(char, TokenType.Semicolon, line, column));
          break;
        case ",":
          tokens.push(createToken(char, TokenType.Comma, line, column));
          break;
        case ":":
          tokens.push(createToken(char, TokenType.Colon, line, column));
          break;
        case ".":
          tokens.push(createToken(char, TokenType.Dot, line, column));
          break;
        default:
          throw new Error(
            `Unrecognized character '${char}' at line ${line}, column ${column}`
          );
      }
    }
  
    tokens.push(createToken("EOF", TokenType.EOF, line, column));
    return tokens;
  }