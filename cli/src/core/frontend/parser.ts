// deno-lint-ignore-file
import {
  Statement,
  Program,
  Expression,
  BinaryExpression,
  NumericLiteral,
  Identifier,
  VariableDeclaration,
  AssignmentExpression,
  Property,
  ObjectLiteral,
  CallExpression,
  MemberExpression,
  FunctionDeclaration,
  IfStatement,
  ForStatement,
  ReturnStatement,
  TryCatchStatement,
  StringLiteral,
  ArrowFunctionExpression,
  ArrayLiteral,
  ThrowStatement,
  AwaitExpression,
  AsyncExpression,
} from "./ast.js";
import { tokenize, Token, TokenType } from "./lexer.js";

export default class Parser {
  private tokens: Token[] = [];

  private notEOF(): boolean {
    return this.tokens[0].type != TokenType.EOF;
  }

  private at() {
    return this.tokens[0] as Token;
  }

  private eat() {
    return this.tokens.shift() as Token;
  }

  private peek(offset: number = 0): Token {
    return this.tokens[offset];
  }

  private expect(type: TokenType, err: string) {
    const prev = this.eat();
    if (!prev || prev.type !== type) {
      throw new Error(
        `Parser Error: ${err} at line ${prev?.line}, column ${prev?.column}.`
      );
    }
    return prev;
  }

  public produceAST(sourceCode: string): Program {
    this.tokens = tokenize(sourceCode);

    const program: Program = {
      kind: "Program",
      body: [],
    };

    while (this.notEOF()) {
      program.body.push(this.parseStatement());
    }

    return program;
  }

  private parseStatement(requireSemicolon: boolean = true): Statement {
    switch (this.at().type) {
      case TokenType.Let:
      case TokenType.Const:
        return this.parseVariableDeclaration();
      case TokenType.Async:
        // console.log("parseStatement: Before Async Token:", this.at());
        this.eat(); // Consume 'tazamonan'
        // console.log("parseStatement: After Async Token:", this.at());
        this.expect(
          TokenType.Function,
          "Expected 'arrifli' after 'tazamonan'."
        );
        // console.log("parseStatement: After Function Keyword:", this.at());
        return this.parseFunctionDeclaration(true);
      case TokenType.Function:
        return this.parseFunctionDeclaration();
      case TokenType.If:
        return this.parseIfStatement();
      case TokenType.For:
        return this.parseForStatement();
      case TokenType.Return:
        return this.parseReturnStatement();
      case TokenType.Try:
        return this.parseTryCatchStatement();
      case TokenType.Throw:
        return this.parseThrowStatement();
      case TokenType.Continue:
        return this.parseContinueStatement();
      case TokenType.Break:
        return this.parseBreakStatement();
      default:
        const expr = this.parseExpression();
        if (expr.kind === "AssignmentExpression" || requireSemicolon) {
          this.expect(TokenType.Semicolon, "Expected ';' after expression");
        }
        return expr;
    }
  }

  private parseVariableDeclaration(): Statement {
    const isConst = this.eat().type === TokenType.Const;
    const identifier = this.expect(
      TokenType.Identifier,
      "Expected variable name"
    ).value;

    if (this.at().type === TokenType.Semicolon) {
      this.eat(); // Consume semicolon
      if (isConst) throw new Error("Constant variable must be initialized.");
      return {
        kind: "VariableDeclaration",
        identifier,
        const: false,
      } as VariableDeclaration;
    }

    this.expect(TokenType.Equals, "Expected '=' after variable name");
    const value = this.parseExpression();
    this.expect(
      TokenType.Semicolon,
      "Variable declaration must end with a semicolon"
    );

    return {
      kind: "VariableDeclaration",
      identifier,
      value,
      const: isConst,
    } as VariableDeclaration;
  }

  private parseFunctionDeclaration(isAsync: boolean = false): Statement {
    if (!isAsync) this.eat();
    // console.log("parseFunctionDeclaration: isAsync =", isAsync);
    // console.log("parseFunctionDeclaration: Before Function Name:", this.at());
    const name = this.expect(
      TokenType.Identifier,
      "Expected function name"
    ).value;
    // console.log("parseFunctionDeclaration: After Function Name:", this.at());
    this.expect(TokenType.OpenParen, "Expected '(' after function name");

    const parameters =
      this.at().type === TokenType.CloseParen ? [] : this.parseParameterList();
    this.expect(TokenType.CloseParen, "Expected ')' after function parameters");

    const body = this.parseBlock();

    const funcDecl = {
      kind: "FunctionDeclaration",
      name,
      parameters,
      body,
      async: isAsync,
    } as FunctionDeclaration;

    // console.log("parseFunctionDeclaration: Resulting AST =", funcDecl);
    return funcDecl;
  }

  private parseParameterList(): string[] {
    const parameters = [
      this.expect(TokenType.Identifier, "Expected parameter name").value,
    ];
    while (this.at().type === TokenType.Comma) {
      this.eat();
      parameters.push(
        this.expect(TokenType.Identifier, "Expected parameter name").value
      );
    }
    return parameters;
  }

  private parseBlock(): Statement[] {
    this.expect(TokenType.OpenBrace, "Expected '{' to start block");
    const body: Statement[] = [];
    while (this.notEOF() && this.at().type !== TokenType.CloseBrace) {
      body.push(this.parseStatement());
    }
    this.expect(TokenType.CloseBrace, "Expected '}' to close block");
    return body;
  }

  private parseArrowFunction(params: string[]): Expression {
    console.log("parseArrowFunction: Received Params", params);

    if (params.length === 0) {
        if (this.at().type === TokenType.OpenParen) {
            this.eat(); // eat '('
            console.log("parseArrowFunction: Parsing Parameters inside ()");
            params = [];
            while (this.at().type !== TokenType.CloseParen) {
                params.push(
                    this.expect(TokenType.Identifier, "Expected parameter name").value
                );
                if (this.at().type === TokenType.Comma) {
                    this.eat();
                }
            }
            this.expect(TokenType.CloseParen, "Expected ')'");
        } else {
            params.push(
                this.expect(TokenType.Identifier, "Expected parameter name").value
            );
        }
    }

    this.expect(TokenType.Arrow, "Expected '=>'");

    console.log("parseArrowFunction: Parsing body");
    const body =
        this.at().type === TokenType.OpenBrace
            ? this.parseBlock()
            : [{ kind: "ReturnStatement", argument: this.parseExpression() }];

    console.log("parseArrowFunction: Final Body", body);

    return {
        kind: "ArrowFunctionExpression",
        parameters: params,
        body,
    } as ArrowFunctionExpression;
}


private getArrowFunctionParams(left: Expression): string[] {
  console.log("getArrowFunctionParams: Input", left);

  if (left.kind === "Identifier") {
      console.log("getArrowFunctionParams: Single Parameter", (left as Identifier).symbol);
      return [(left as Identifier).symbol];
  } else if (left.kind === "ArrayLiteral") {
      console.log("getArrowFunctionParams: ArrayLiteral Parameters", left);
      return (left as ArrayLiteral).values.map(
          (param) => {
              if (param.kind === "Identifier") {
                  return (param as Identifier).symbol;
              }
              throw new Error("Invalid parameter in arrow function");
          }
      );
  }
  throw new Error("Invalid left-hand side in arrow function parameters.");
}



  private parseExpression(): Expression {
    return this.parseAssignmentExpression();
  }

  private parseAssignmentExpression(): Expression {
    let assignee: Expression;

    if (this.at().type === TokenType.OpenParen) {
        // Handle parenthesized parameters (e.g., (x, y))
        this.eat(); // Consume '('
        const params: string[] = [];

        while (this.at().type !== TokenType.CloseParen) {
            params.push(
                this.expect(TokenType.Identifier, "Expected parameter name").value
            );
            if (this.at().type === TokenType.Comma) {
                this.eat(); // Consume ','
            }
        }

        this.expect(TokenType.CloseParen, "Expected ')' after parameter list");

        if (this.at().type === TokenType.Arrow) {
            this.eat(); // Consume '=>'
            // console.log("parseAssignmentExpression: Found '=>' after parameter list");

            const body =
                this.at().type === TokenType.OpenBrace
                    ? this.parseBlock()
                    : [{ kind: "ReturnStatement", argument: this.parseExpression() }];

            return {
                kind: "ArrowFunctionExpression",
                parameters: params,
                body,
            } as ArrowFunctionExpression;
        }

        throw new Error("Expected '=>' after parameter list");
    }

    // Handle regular assignment or single-parameter arrow function
    assignee = this.parseLogicalExpression();

    if (this.at().type === TokenType.Equals) {
        this.eat(); // Consume '='
        const value = this.parseExpression();
        return {
            kind: "AssignmentExpression",
            assignee,
            value,
        } as AssignmentExpression;
    }

    if (this.at().type === TokenType.Arrow) {
        this.eat(); // Consume '=>'
        console.log("parseAssignmentExpression: Found '=>' after single parameter");

        const params = this.getArrowFunctionParams(assignee);
        const body =
            this.at().type === TokenType.OpenBrace
                ? this.parseBlock()
                : [{ kind: "ReturnStatement", argument: this.parseExpression() }];

        return {
            kind: "ArrowFunctionExpression",
            parameters: params,
            body,
        } as ArrowFunctionExpression;
    }

    return assignee;
}


  private parseLogicalExpression(): Expression {
    let left = this.parseComparisonExpression();

    while (
      this.at().type === TokenType.And ||
      this.at().type === TokenType.Or
    ) {
      const operator = this.eat().value;
      const right = this.parseComparisonExpression();
      left = {
        kind: "BinaryExpression",
        left,
        right,
        operator,
      } as BinaryExpression;
    }

    return left;
  }

  private parseComparisonExpression(): Expression {
    let left = this.parseAdditiveExpression();

    while (
      this.at().type === TokenType.GreaterThan ||
      this.at().type === TokenType.LessThan ||
      this.at().type === TokenType.EqualsEquals ||
      this.at().type === TokenType.NotEquals
    ) {
      const operator = this.eat().value;
      const right = this.parseAdditiveExpression();
      left = {
        kind: "BinaryExpression",
        left,
        right,
        operator,
      } as BinaryExpression;
    }

    return left;
  }

  private parseAdditiveExpression(): Expression {
    let left = this.parseMultiplicativeExpression();

    while (
      this.at().type === TokenType.Plus ||
      this.at().type === TokenType.Minus
    ) {
      const operator = this.eat().value;
      const right = this.parseMultiplicativeExpression();
      left = {
        kind: "BinaryExpression",
        left,
        right,
        operator,
      } as BinaryExpression;
    }

    return left;
  }

  private parseMultiplicativeExpression(): Expression {
    let left = this.parseCallMemberExpression();

    while (
      this.at().type === TokenType.Asterisk ||
      this.at().type === TokenType.Slash ||
      this.at().type === TokenType.Percent
    ) {
      const operator = this.eat().value;
      const right = this.parseCallMemberExpression();
      left = {
        kind: "BinaryExpression",
        left,
        right,
        operator,
      } as BinaryExpression;
    }

    return left;
  }

  private parseCallMemberExpression(): Expression {
    const member = this.parseMemberExpression();
    if (this.at().type === TokenType.OpenParen) {
      return this.parseCallExpression(member);
    }
    return member;
  }

  private parseMemberExpression(): Expression {
    let object = this.parsePrimaryExpression();

    while (
      this.at().type === TokenType.Dot ||
      this.at().type === TokenType.OpenBracket
    ) {
      const operator = this.eat();
      let property: Expression;
      let computed: boolean;

      if (operator.type === TokenType.Dot) {
        computed = false;
        // Make sure we properly parse the property name
        if (this.at().type !== TokenType.Identifier) {
          throw new Error(
            `Expected property name after dot at line ${
              this.at().line
            }, column ${this.at().column}`
          );
        }
        property = this.parsePrimaryExpression();
      } else {
        computed = true;
        property = this.parseExpression();
        this.expect(
          TokenType.CloseBracket,
          "Expected ']' for computed property"
        );
      }

      // Handle immediate function calls on properties
      let expr: Expression = {
        kind: "MemberExpression",
        object,
        property,
        computed,
      } as MemberExpression;

      // Check if this member expression is being called
      if (this.at().type === TokenType.OpenParen) {
        expr = this.parseCallExpression(expr);
      }

      object = expr;
    }

    return object;
  }

  private parseCallExpression(callee: Expression): Expression {
    let expr: Expression = {
      kind: "CallExpression",
      caller: callee,
      args: this.parseArgs(),
    } as CallExpression;

    // Handle chaining
    while (this.at().type === TokenType.Dot) {
      expr = this.parseMemberChain(expr);
    }

    return expr;
  }

  private parseMemberChain(object: Expression): Expression {
    this.eat(); // eat the dot
    const property = this.parsePrimaryExpression();

    let expr: Expression = {
      kind: "MemberExpression",
      object,
      property,
      computed: false,
    } as MemberExpression;

    // Check for function call
    if (this.at().type === TokenType.OpenParen) {
      expr = this.parseCallExpression(expr);
    }

    return expr;
  }

  private parseArgs(): Expression[] {
    this.expect(TokenType.OpenParen, "Expected '('");
    const args: Expression[] = [];

    if (this.at().type !== TokenType.CloseParen) {
      do {
        args.push(this.parseExpression());
      } while (this.at().type === TokenType.Comma && this.eat());
    }

    this.expect(TokenType.CloseParen, "Expected ')'");
    return args;
  }

  private parsePrimaryExpression(): Expression {
    const token = this.at();
    switch (token.type) {
      case TokenType.Number:
        return {
          kind: "NumericLiteral",
          value: parseFloat(this.eat().value),
        } as NumericLiteral;
      case TokenType.String:
        return {
          kind: "StringLiteral",
          value: this.eat().value,
        } as StringLiteral;
      case TokenType.Identifier:
        return { kind: "Identifier", symbol: this.eat().value } as Identifier;
      case TokenType.OpenParen:
        this.eat();
        const expr = this.parseExpression();
        this.expect(TokenType.CloseParen, "Expected ')' after expression");
        return expr;
      case TokenType.OpenBracket:
        return this.parseArrayLiteral();
      case TokenType.OpenBrace:
        return this.parseObjectExpression();
      case TokenType.Await:
        return this.parseAwaitExpression();
      default:
        throw new Error(
          `Unexpected token '${token.value}' at line ${token.line}, column ${token.column}`
        );
    }
  }
  private parseArrayLiteral(): Expression {
    this.eat(); // Consume '['
    const elements: Expression[] = [];

    while (this.notEOF() && this.at().type !== TokenType.CloseBracket) {
      elements.push(this.parseExpression());
      if (this.at().type === TokenType.Comma) {
        this.eat(); // Consume ','
      } else {
        break;
      }
    }

    this.expect(TokenType.CloseBracket, "Expected ']' to close array literal");
    return { kind: "ArrayLiteral", values: elements } as ArrayLiteral;
  }

  private parseObjectExpression(): Expression {
    this.eat(); // Consume '{'
    const properties: Property[] = [];

    while (this.notEOF() && this.at().type !== TokenType.CloseBrace) {
      const key = this.expect(
        TokenType.Identifier,
        "Expected property name"
      ).value;
      this.expect(TokenType.Colon, "Expected ':' after property name");
      const value = this.parseExpression();
      properties.push({ kind: "Property", key, value });

      if (this.at().type === TokenType.Comma) {
        this.eat(); // Consume ','
      } else {
        break;
      }
    }

    this.expect(TokenType.CloseBrace, "Expected '}' to close object literal");
    return { kind: "ObjectLiteral", properties } as ObjectLiteral;
  }

  private parseTryCatchStatement(): Statement {
    this.eat(); // Consume 'try'
    const tryBody = this.parseBlock();

    this.expect(TokenType.Catch, "Expected 'catch' after 'try' block");
    const errorParam =
      this.at().type === TokenType.OpenParen ? this.parseErrorParam() : "error";

    const catchBody = this.parseBlock();

    return {
      kind: "TryCatchStatement",
      body: tryBody,
      alternate: catchBody,
      errorParam,
    } as TryCatchStatement;
  }

  private parseErrorParam(): string {
    this.eat(); // Consume '('
    const param = this.expect(
      TokenType.Identifier,
      "Expected error parameter in 'catch'"
    ).value;
    this.expect(TokenType.CloseParen, "Expected ')' after error parameter");
    return param;
  }

  private parseThrowStatement(): Statement {
    this.eat(); // Consume 'throw'
    const argument = this.parseExpression();
    this.expect(TokenType.Semicolon, "Expected ';' after throw statement");
    return { kind: "ThrowStatement", argument } as ThrowStatement;
  }

  private parseIfStatement(): Statement {
    this.eat(); // Consume 'if'
    this.expect(TokenType.OpenParen, "Expected '(' after 'if'");
    const test = this.parseExpression();
    this.expect(TokenType.CloseParen, "Expected ')' after condition");

    const consequent = this.parseBlock();

    let alternate: Statement[] | undefined;
    if (this.at().type === TokenType.Else) {
      this.eat(); // Consume 'else'
      alternate =
        this.at().type === TokenType.If
          ? [this.parseIfStatement()]
          : this.parseBlock();
    }

    return {
      kind: "IfStatement",
      test,
      body: consequent,
      alternate,
    } as IfStatement;
  }

  private parseForLoopInit(): VariableDeclaration | Expression | null {
    // console.log("parseForLoopInit: Start", this.at());
    let isConst = false;

    if (
      this.at().type === TokenType.Let ||
      this.at().type === TokenType.Const
    ) {
      isConst = this.eat().type === TokenType.Const;
      // console.log("parseForLoopInit: After 'khalli' or 'thabit'", this.at());

      const identifier = this.expect(
        TokenType.Identifier,
        "Expected variable name after 'khalli' or 'thabit'"
      ).value;
      // console.log("parseForLoopInit: After Identifier", this.at());

      if (this.at().type === TokenType.Equals) {
        this.eat(); // Consume '='
        // console.log("parseForLoopInit: After '='", this.at());

        const value = this.parseExpression();
        // console.log("parseForLoopInit: After Expression", this.at());

        return {
          kind: "VariableDeclaration",
          identifier,
          value,
          const: isConst,
        } as VariableDeclaration;
      }

      throw new Error(
        `Expected '=' after variable name at line ${this.at().line}, column ${
          this.at().column
        }`
      );
    }

    if (this.at().type !== TokenType.Semicolon) {
      // console.log("parseForLoopInit: Fallback to Expression", this.at());
      return this.parseExpression();
    }

    // console.log("parseForLoopInit: Null return", this.at());
    return null;
  }

  private parseForStatement(): Statement {
    this.eat(); // Consume 'la'
    this.expect(TokenType.OpenParen, "Expected '(' after 'for'");

    // console.log("parseForStatement: Before Init Parsing", this.at());
    let init: VariableDeclaration | Expression | null = this.parseForLoopInit();
    // console.log("parseForStatement: After Init Parsing", this.at());

    this.expect(TokenType.Semicolon, "Expected ';' after loop initialization");

    // console.log("parseForStatement: Before Condition Parsing", this.at());
    let test: Expression | null = null;
    if (this.at().type !== TokenType.Semicolon) {
      test = this.parseExpression();
    }
    // console.log("parseForStatement: After Condition Parsing", this.at());

    this.expect(TokenType.Semicolon, "Expected ';' after loop condition");

    // console.log("parseForStatement: Before Update Parsing", this.at());
    let update: Expression | null = null;
    if (this.at().type !== TokenType.CloseParen) {
      update = this.parseExpression();
    }
    // console.log("parseForStatement: After Update Parsing", this.at());

    this.expect(TokenType.CloseParen, "Expected ')' after loop update");

    // console.log("parseForStatement: Before Body Parsing");
    const body = this.parseBlock();

    // console.log("parseForStatement: After Body Parsing");
    return {
      kind: "ForStatement",
      init,
      test,
      update,
      body,
    } as ForStatement;
  }

  private parseReturnStatement(): Statement {
    this.eat(); // Consume 'return'
    const argument =
      this.at().type !== TokenType.Semicolon ? this.parseExpression() : null;
    this.expect(TokenType.Semicolon, "Expected ';' after return statement");
    return { kind: "ReturnStatement", argument } as ReturnStatement;
  }

  private parseBreakStatement(): Statement {
    this.eat(); // Consume 'break'
    this.expect(TokenType.Semicolon, "Expected ';' after 'break'");
    return { kind: "BreakStatement" };
  }

  private parseContinueStatement(): Statement {
    this.eat(); // Consume 'continue'
    this.expect(TokenType.Semicolon, "Expected ';' after 'continue'");
    return { kind: "ContinueStatement" };
  }

  private parseAwaitExpression(): Expression {
    this.eat(); // Consume 'await'
    const argument = this.parseExpression();
    return { kind: "AwaitExpression", argument } as AwaitExpression;
  }
}