// deno-lint-ignore-file
import {
    RuntimeValue,
    StringValue,
    NumberValue,
    BooleanValue,
    ObjectValue,
    FunctionValue,
    ArrayValue,
    MK_NULL,
    MK_BOOL,
    MK_NUMBER,
    MK_OBJECT,
    MK_STRING,
    MK_ARRAY,
  } from "../runtime/values.ts";
  import {
    Statement,
    Program,
    VariableDeclaration,
    FunctionDeclaration,
    ReturnStatement,
    Expression,
    NumericLiteral,
    StringLiteral,
    BinaryExpression,
    CallExpression,
    Identifier,
    ObjectLiteral,
    IfStatement,
    ForStatement,
    TryCatchStatement,
    ArrayLiteral,
    MemberExpression,
    ArrowFunctionExpression,
    AssignmentExpression,
    ThrowStatement,
    AwaitExpression,
    AsyncExpression,
  } from "../frontend/ast.ts";
  import { SourceMap } from "../cli/utils/sourcemap.ts";
  
  interface JSObject {
    [key: string]: unknown;
  }
  
  export function runtimeToJS(arg: RuntimeValue): unknown {
    switch (arg.type) {
      case "string":
        return (arg as StringValue).value;
      case "number":
        return (arg as NumberValue).value;
      case "boolean":
        return (arg as BooleanValue).value;
      case "null":
        return null;
      case "object": {
        const obj: JSObject = {};
        const objValue = arg as ObjectValue;
        objValue.properties.forEach((value, key) => {
          obj[key] = runtimeToJS(value);
        });
        return obj;
      }
      case "array": {
        const arrayValue = arg as ArrayValue;
        return arrayValue.values.map(runtimeToJS);
      }
      case "fn": {
        const fnValue = arg as FunctionValue;
        return fnValue.name === "<anonymous>"
          ? "[Function (anonymous)]"
          : `[Function: ${fnValue.name}]`;
      }
      case "native-fn":
        return "[Native Function]";
      default:
        return arg;
    }
  }
  
  export function jsToRuntime(val: unknown): RuntimeValue {
    if (val === null || val === undefined) {
      return MK_NULL();
    }
    switch (typeof val) {
      case "boolean":
        return MK_BOOL(val);
      case "number":
        return MK_NUMBER(val);
      case "string":
        return MK_STRING(val);
      case "object": {
        if (Array.isArray(val)) {
          return MK_ARRAY(val.map(jsToRuntime));
        }
        const properties = new Map<string, RuntimeValue>();
        Object.entries(val as JSObject).forEach(([key, value]) => {
          properties.set(key, jsToRuntime(value));
        });
        return MK_OBJECT(properties);
      }
      default:
        return MK_NULL();
    }
  }
  
  interface TranspileOptions {
    sourceMap?: boolean;
    filename?: string;
    sourceMapGenerator?: SourceMap;
  }
  
  class CodeBuilder {
    private code = "";
    private indentLevel = 0;
    private readonly indentStr = "  ";
  
    constructor(
      private sourceMap: boolean,
      private filename: string,
      private sourceMapGenerator?: SourceMap
    ) {}
  
    indent(): void {
      this.indentLevel++;
    }
  
    dedent(): void {
      this.indentLevel = Math.max(0, this.indentLevel - 1);
    }
  
    addLine(str: string, node?: any): void {
      const trimmed = str.trim();
      if (!trimmed) {
        // Just skip if it's an empty line
        this.code += "\n";
        return;
      }
      const indentSpaces = this.indentStr.repeat(this.indentLevel);
      const lineIndex = this.code.split("\n").length; // For source map
      this.code += indentSpaces + trimmed + "\n";
  
      if (this.sourceMap && this.sourceMapGenerator && node?.line) {
        this.sourceMapGenerator.addMapping(
          {
            line: lineIndex + 1,
            column: indentSpaces.length,
          },
          { line: node.line, column: node.column },
          this.filename
        );
      }
    }
  
    addRaw(str: string): void {
      this.code += str;
    }
  
    getCode(): string {
      return this.code;
    }
  }
  
  export function transpileToJS(
    ast: Program,
    options: TranspileOptions = {}
  ): { code: string; map?: string } {
    const builder = new CodeBuilder(
      options.sourceMap ?? false,
      options.filename ?? "",
      options.sourceMapGenerator
    );
  
    for (let i = 0; i < ast.body.length; i++) {
      const stmt = ast.body[i];
      const out = transpileStatement(stmt, builder);
      builder.addLine(out, stmt);
      // Add a blank line except after the last statement
      if (i < ast.body.length - 1) {
        builder.addLine("");
      }
    }
  
    return {
      code: builder.getCode().trim(),
      map: options.sourceMap && options.sourceMapGenerator
        ? options.sourceMapGenerator.generate()
        : undefined,
    };
  }
  
  function transpileStatement(stmt: Statement, builder: CodeBuilder): string {
    switch (stmt.kind) {
      case "VariableDeclaration":
        return transpileVariableDeclaration(stmt as VariableDeclaration, builder);
      case "FunctionDeclaration":
        return transpileFunctionDeclaration(stmt as FunctionDeclaration, builder);
      case "ReturnStatement":
        return transpileReturnStatement(stmt as ReturnStatement, builder);
      case "IfStatement":
        return transpileIfStatement(stmt as IfStatement, builder);
      case "ForStatement":
        return transpileForStatement(stmt as ForStatement, builder);
      case "TryCatchStatement":
        return transpileTryCatchStatement(stmt as TryCatchStatement, builder);
      default:
        // If it's an expression-based statement
        if ((stmt as Expression).kind) {
          return transpileExpression(stmt as Expression, builder) + ";";
        }
        throw new Error(`Unsupported statement kind: ${stmt.kind}`);
    }
  }
  
  function transpileVariableDeclaration(
    decl: VariableDeclaration,
    builder: CodeBuilder
  ): string {
    const keyword = decl.const ? "const" : "let";
    const value = decl.value
      ? transpileExpression(decl.value, builder)
      : "undefined";
    return `${keyword} ${decl.identifier} = ${value};`;
  }
  
  function transpileFunctionDeclaration(
    func: FunctionDeclaration,
    builder: CodeBuilder
  ): string {
    const isAsync = func.async ? "async " : "";
    const params = func.parameters.join(", ");
  
    // We'll do multi-line: 
    // async function name(params) {
    //   ...
    // }
    builder.addLine(`${isAsync}function ${func.name}(${params}) {`);
    builder.indent();
    for (const bodyStmt of func.body) {
      builder.addLine(transpileStatement(bodyStmt, builder), bodyStmt);
    }
    builder.dedent();
    builder.addLine("}");
    return ""; // We used builder lines, so just return empty
  }
  
  function transpileReturnStatement(
    ret: ReturnStatement,
    builder: CodeBuilder
  ): string {
    const val = ret.argument
      ? transpileExpression(ret.argument, builder)
      : "undefined";
    return `return ${val};`;
  }
  
  function transpileIfStatement(ifStmt: IfStatement, builder: CodeBuilder): string {
    const test = transpileExpression(ifStmt.test, builder);
    let code = `if (${test}) {`;
    builder.addLine(code);
    builder.indent();
  
    for (const stmt of ifStmt.body) {
      builder.addLine(transpileStatement(stmt, builder), stmt);
    }
  
    builder.dedent();
    builder.addLine("}");
  
    // If there's an alternate block
    if (ifStmt.alternate && ifStmt.alternate.length > 0) {
      builder.addLine("else {");
      builder.indent();
      for (const stmt of ifStmt.alternate) {
        builder.addLine(transpileStatement(stmt, builder), stmt);
      }
      builder.dedent();
      builder.addLine("}");
    }
  
    return "";
  }
  
  function transpileForStatement(forStmt: ForStatement, builder: CodeBuilder): string {
    // For init, we might handle it as a separate statement,
    // but easiest is to transpile init as a single line with trailing semicolon removed.
    const initStr = transpileStatement(forStmt.init, builder).replace(/;$/, "");
    const testStr = transpileExpression(forStmt.test, builder);
    const updateStr = transpileExpression(forStmt.update, builder);
  
    builder.addLine(`for (${initStr}; ${testStr}; ${updateStr}) {`);
    builder.indent();
    for (const stmt of forStmt.body) {
      builder.addLine(transpileStatement(stmt, builder), stmt);
    }
    builder.dedent();
    builder.addLine("}");
    return "";
  }
  
  function transpileTryCatchStatement(
    tryStmt: TryCatchStatement,
    builder: CodeBuilder
  ): string {
    builder.addLine("try {");
    builder.indent();
    for (const stmt of tryStmt.body) {
      builder.addLine(transpileStatement(stmt, builder), stmt);
    }
    builder.dedent();
  
    // errorParam might be undefined, so fallback to "error"
    const errorParam = tryStmt.errorParam ?? "error";
    builder.addLine(`} catch (${errorParam}) {`);
    builder.indent();
    for (const stmt of tryStmt.alternate) {
      builder.addLine(transpileStatement(stmt, builder), stmt);
    }
    builder.dedent();
    builder.addLine("}");
    return "";
  }
  
  /** Transpile any Expression node to JS code. */
  function transpileExpression(expr: Expression, builder: CodeBuilder): string {
    switch (expr.kind) {
      case "NumericLiteral":
        return (expr as NumericLiteral).value.toString();
      case "StringLiteral":
        return JSON.stringify((expr as StringLiteral).value);
      case "Identifier": {
        const id = (expr as Identifier).symbol;
        if (id === "gool") return "console.log";
        if (id === "jeeb") return "fetch";
        return id;
      }
      case "BinaryExpression": {
        const binOp = expr as BinaryExpression;
        const left = transpileExpression(binOp.left, builder);
        const right = transpileExpression(binOp.right, builder);
        return `${left} ${binOp.operator} ${right}`;
      }
      case "CallExpression": {
        const callExpr = expr as CallExpression;
        const caller = transpileExpression(callExpr.caller, builder);
        const args = callExpr.args
          .map((arg) => transpileExpression(arg, builder))
          .join(", ");
        return `${caller}(${args})`;
      }
      case "MemberExpression": {
        const member = expr as MemberExpression;
        const obj = transpileExpression(member.object, builder);
        const prop = member.computed
          ? `[${transpileExpression(member.property, builder)}]`
          : `.${(member.property as Identifier).symbol}`;
        return `${obj}${prop}`;
      }
      case "ArrowFunctionExpression": {
        const arrowFn = expr as ArrowFunctionExpression;
        const params = arrowFn.parameters.join(", ");
  
        if (Array.isArray(arrowFn.body)) {
          // Multi-statement arrow function
          // e.g. (x) => { stmt1; stmt2; ... }
          let lines: string[] = [];
          lines.push(`(${params}) => {`);
          builder.indent();
          for (const stmt of arrowFn.body) {
            lines.push(transpileStatement(stmt, builder));
          }
          builder.dedent();
          lines.push("}");
          return lines.join("\n");
        } else {
          // Single-expression arrow function
          const bodyExpr = transpileExpression(arrowFn.body as Expression, builder);
          return `(${params}) => ${bodyExpr}`;
        }
      }
      case "ObjectLiteral": {
        const objLit = expr as ObjectLiteral;
        const properties = objLit.properties
          .map((prop) => {
            const key = prop.key;
            const val = transpileExpression(prop.value!, builder);
            return `${key}: ${val}`;
          })
          .join(", ");
        return `{ ${properties} }`;
      }
      case "ArrayLiteral": {
        const arrLit = expr as ArrayLiteral;
        const elements = arrLit.values
          .map((val) => transpileExpression(val, builder))
          .join(", ");
        return `[${elements}]`;
      }
      case "AwaitExpression": {
        const awaitExpr = expr as AwaitExpression;
        const awaited = transpileExpression(awaitExpr.argument, builder);
        return `await ${awaited}`;
      }
      case "AsyncExpression": {
        const asyncExpr = expr as AsyncExpression;
        const arg = transpileExpression(asyncExpr.argument, builder);
        return `async ${arg}`;
      }
      case "AssignmentExpression": {
        const assignExpr = expr as AssignmentExpression;
        const left = transpileExpression(assignExpr.assignee, builder);
        const right = transpileExpression(assignExpr.value, builder);
        return `${left} = ${right}`;
      }
      default:
        throw new Error(`Unsupported expression kind: ${expr.kind}`);
    }
  }