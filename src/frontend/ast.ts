export type NodeType =
  // statements
  | "Program"
  | "VariableDeclaration"
  | "FunctionDeclaration"
  | "IfStatement"
  | "ForStatement"
  | "TryCatchStatement"
  | "ReturnStatement"
  | "ThrowStatement"
  | "ContinueStatement"
  | "BreakStatement"
  | "ExpressionStatement"
  // expressions
  | "AssignmentExpression"
  | "MemberExpression"
  | "CallExpression"
  | "ArrowFunctionExpression"
  | "AwaitExpression"
  | "AsyncExpression"
  // literals
  | "Property"
  | "ObjectLiteral"
  | "NumericLiteral"
  | "StringLiteral"
  | "ArrayLiteral"
  | "Identifier"
  | "BinaryExpression";

export interface Statement {
  kind: NodeType;
}

export interface Program extends Statement {
  kind: "Program";
  body: Statement[];
}

export interface VariableDeclaration extends Statement {
  kind: "VariableDeclaration";
  const: boolean;
  identifier: string;
  value?: Expression;
}

export interface AsyncFunctionDeclaration extends FunctionDeclaration {
  async: boolean;
}


export interface IfStatement extends Statement {
  kind: "IfStatement";
  test: Expression;
  body: Statement[];
  alternate?: Statement[];
}

export interface TryCatchStatement extends Statement {
  kind: "TryCatchStatement";
  body: Statement[];
  alternate: Statement[];
  errorParam?: string; 
}

export interface ThrowStatement extends Statement {
  kind: "ThrowStatement";
  argument: Expression;
}

export interface BreakStatement extends Statement {
  kind: "BreakStatement";
}

export interface ReturnStatement extends Statement {
  kind: "ReturnStatement";
  argument: Expression | null;
}

export interface FunctionDeclaration extends Statement {
  kind: "FunctionDeclaration";
  parameters: string[];
  name: string;
  body: Statement[];
  async: boolean;
}

export interface ForStatement extends Statement {
  kind: "ForStatement";
  init: VariableDeclaration;
  test: Expression;
  update: AssignmentExpression;
  body: Statement[];
}

export interface ContinueStatement extends Statement {
  kind: "ContinueStatement";
}

export interface Expression extends Statement {}

export interface AssignmentExpression extends Expression {
  kind: "AssignmentExpression";
  assignee: Expression | MemberExpression;
  value: Expression;
}

export interface BinaryExpression extends Expression {
  kind: "BinaryExpression";
  left: Expression;
  right: Expression;
  operator: string;
}

export interface CallExpression extends Expression {
  kind: "CallExpression";
  args: Expression[];
  caller: Expression;
}

export interface MemberExpression extends Expression {
  kind: "MemberExpression";
  object: Expression;
  property: Expression;
  computed: boolean;
}

export interface ArrowFunctionExpression extends Expression {
  kind: "ArrowFunctionExpression";
  parameters: string[];
  body: Statement[] | Expression;
}

export interface Identifier extends Expression {
  kind: "Identifier";
  symbol: string;
}

export interface NumericLiteral extends Expression {
  kind: "NumericLiteral";
  value: number;
}

export interface Property extends Expression {
  kind: "Property";
  key: string;
  value?: Expression;
}

export interface StringLiteral extends Expression {
  kind: "StringLiteral";
  value: string;
}

export interface ObjectLiteral extends Expression {
  kind: "ObjectLiteral";
  properties: Property[];
}

export interface ArrayLiteral extends Expression {
  kind: "ArrayLiteral";
  values: Array<Expression>;
}

export interface AwaitExpression extends Expression {
  kind: "AwaitExpression";
  argument: Expression;
}

export interface AsyncExpression extends Expression {
  kind: "AsyncExpression";
  argument: Expression;
}

export interface ExpressionStatement extends Statement {
  kind: "ExpressionStatement";
  expression: Expression;
}