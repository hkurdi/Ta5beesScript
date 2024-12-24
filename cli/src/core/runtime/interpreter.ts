// deno-lint-ignore-file
import {
    MK_PROMISE,
    MK_STRING,
    NumberValue,
    RuntimeValue,
    StringValue,
    PromiseValue,
  } from "./values.js";
  import {
    NumericLiteral,
    Program,
    BinaryExpression,
    Statement,
    Identifier,
    VariableDeclaration,
    AssignmentExpression,
    ObjectLiteral,
    CallExpression,
    FunctionDeclaration,
    StringLiteral,
    ArrayLiteral,
    IfStatement,
    ForStatement,
    TryCatchStatement,
    ReturnStatement,
    MemberExpression,
    ArrowFunctionExpression,
    ThrowStatement,
    ContinueStatement,
    BreakStatement,
    AwaitExpression,
    AsyncExpression,
  } from "../frontend/ast.js";
  import Environment from "./environment.js";
  import {
    evaluateIdentifier,
    evaluateBinaryExpressions,
    evaluateAssignment,
    evaluateObjectExpression,
    evaluateCallExpression,
    evaluateArrayExpression,
    evaluateMemberExpression,
    evaluateArrowFunctionExpression,
    evaluateAwaitExpression,
    evaluateAsyncExpression,
  } from "./eval/expressions.js";
  import {
    evaluateProgram,
    evaluateVariableDeclaration,
    evaluateFunctionDeclaration,
    evaluateIfStatement,
    evaluateForStatement,
    evaluateTryCatchStatement,
    evaluateReturnStatement,
    evaluateThrowStatement,
    evaluateContinueStatement,
    evaluateBreakStatement,
  } from "./eval/statements.js";
  
  export function evaluate(astNode: Statement, env: Environment): RuntimeValue {
      switch (astNode.kind) {
          case "Program":
              return evaluateProgram(astNode as Program, env);
          case "NumericLiteral":
              return {
                  value: (astNode as NumericLiteral).value,
                  type: "number",
              } as NumberValue;
          case "StringLiteral":
              return {
                  value: (astNode as StringLiteral).value,
                  type: "string",
              } as StringValue;
          case "Identifier":
              return evaluateIdentifier(astNode as Identifier, env);
          case "ObjectLiteral":
              return evaluateObjectExpression(astNode as ObjectLiteral, env);
          case "ArrayLiteral":
              return evaluateArrayExpression(astNode as ArrayLiteral, env);
          case "AssignmentExpression":
              return evaluateAssignment(astNode as AssignmentExpression, env);
          case "MemberExpression":
              return evaluateMemberExpression(astNode as MemberExpression, env);
          case "BinaryExpression":
              return evaluateBinaryExpressions(astNode as BinaryExpression, env);
          case "CallExpression":
              const callExpression = evaluateCallExpression(astNode as CallExpression, env);
              if (callExpression instanceof Promise) {
                  return MK_PROMISE(callExpression); 
              }
              return callExpression;
          case "IfStatement":
              return evaluateIfStatement(astNode as IfStatement, env);
          case "ForStatement":
              return evaluateForStatement(astNode as ForStatement, env);
          case "TryCatchStatement":
              return evaluateTryCatchStatement(astNode as TryCatchStatement, env);
          case "ReturnStatement":
              return evaluateReturnStatement(astNode as ReturnStatement, env);
          case "VariableDeclaration":
              return evaluateVariableDeclaration(astNode as VariableDeclaration, env);
          case "FunctionDeclaration":
              return evaluateFunctionDeclaration(astNode as FunctionDeclaration, env);
          case "ThrowStatement":
              return evaluateThrowStatement(astNode as ThrowStatement, env);
          case "ContinueStatement":
              return evaluateContinueStatement(astNode as ContinueStatement, env);
          case "BreakStatement":
              return evaluateBreakStatement(astNode as BreakStatement, env);
          case "ArrowFunctionExpression":
              return evaluateArrowFunctionExpression(astNode as ArrowFunctionExpression, env);
          case "AwaitExpression":
              return evaluateAwaitExpression(astNode as AwaitExpression, env);
          case "AsyncExpression":
              const asyncResult = evaluateAsyncExpression(astNode as AsyncExpression, env);
              return MK_PROMISE(asyncResult);
          default:
              console.error(
                  "AST has yet to be implemented for interpretation: ",
                  astNode
              );
            process.exit(1); // Use process.exit for Node.js
          }
        }