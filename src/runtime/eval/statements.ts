import {
    BreakStatement,
    ForStatement,
    FunctionDeclaration,
    IfStatement,
    Program,
    ReturnStatement,
    Statement,
    ThrowStatement,
    TryCatchStatement,
    VariableDeclaration,
  } from "../../frontend/ast.ts";
  import Environment from "../environment.ts";
  import { evaluate } from "../interpreter.ts";
  import {
    BooleanValue,
    isPromiseValue,
    MK_PROMISE,
    MK_STRING,
    NumberValue,
    PromiseValue,
  } from "../values.ts";
  import { ReturnValue } from "../values.ts";
  import { FunctionValue, MK_NULL, RuntimeValue } from "../values.ts";
  // import { evaluateAssignment } from "./expressions.ts";
  
  function isTruthy(val: RuntimeValue): boolean {
    if (val.type === "boolean") return (val as any).value;
    if (val.type === "number") return (val as NumberValue).value !== 0;
    if (val.type === "string") return (val as any).value.length > 0;
    if (val.type === "null") return false;
    return true;
  }
  
  
  export function evaluateProgram(
    program: Program,
    env: Environment
  ): RuntimeValue {
    let lastEvaluated: RuntimeValue = MK_NULL();
  
    const executeProgram = async () => {
      for (const statement of program.body) {
        lastEvaluated = evaluate(statement, env);
        if (isPromiseValue(lastEvaluated)) {
          lastEvaluated = await lastEvaluated.promise;
        }
      }
      return lastEvaluated;
    };
  
    // Only wrap in Promise if we have async operations
    for (const statement of program.body) {
      if (statement.kind === "AwaitExpression" || 
          (statement.kind === "FunctionDeclaration" && (statement as FunctionDeclaration).async)) {
        return MK_PROMISE(executeProgram());
      }
    }
  
    // For synchronous code, execute normally
    for (const statement of program.body) {
      lastEvaluated = evaluate(statement, env);
    }
    return lastEvaluated;
  }
  
  export function evaluateVariableDeclaration(
    declaration: VariableDeclaration,
    env: Environment
  ): RuntimeValue {
    const value = declaration.value
      ? evaluate(declaration.value, env)
      : MK_NULL();
    return env.declareVar(declaration.identifier, value, declaration.const);
  }
  
  export function evaluateFunctionDeclaration(
    declaration: FunctionDeclaration,
    env: Environment
  ): RuntimeValue {
    const fn = {
      type: "fn",
      name: declaration.name,
      parameters: declaration.parameters,
      declarationEnv: env,
      body: declaration.body,
      async: declaration.async,
    } as FunctionValue;
  
    return declaration.name === "<anonymous>"
      ? fn
      : env.declareVar(declaration.name, fn, true);
  }
  
  export function callFunction(
    fn: FunctionValue,
    args: RuntimeValue[],
    env: Environment
  ): RuntimeValue | PromiseValue {
    const scopeEnv = new Environment(fn.declarationEnv);
  
    // Bind parameters to arguments
    fn.parameters.forEach((param, index) => {
      scopeEnv.declareVar(param, args[index] || MK_NULL(), false);
    });
  
    if (fn.async) {
      return MK_PROMISE((async () => {
        let result: RuntimeValue = MK_NULL();
        for (const stmt of fn.body) {
          result = evaluate(stmt, scopeEnv);
          if (isPromiseValue(result)) {
            result = await result.promise;
          }
          if (result.type === "return") {
            return (result as ReturnValue).value;
          }
        }
        return result;
      })());
    }
  
    // Regular synchronous execution
    let result: RuntimeValue = MK_NULL();
    for (const stmt of fn.body) {
      result = evaluate(stmt, scopeEnv);
      if (result.type === "return") {
        return (result as ReturnValue).value;
      }
    }
    return result;
  }
  
  function evaluateBody(
    body: Statement[],
    env: Environment,
    newEnv: boolean = true
  ): RuntimeValue {
    let scope: Environment;
  
    if (newEnv) {
      scope = new Environment(env);
    } else {
      scope = env;
    }
    let result: RuntimeValue = MK_NULL();
  
    for (const stmt of body) {
      result = evaluate(stmt, scope);
      if (result.type === "return") {
        return result;
      }
    }
  
    return MK_NULL();
  }
  
  export function evaluateIfStatement(
    declaration: IfStatement,
    env: Environment
  ): RuntimeValue {
    const test = evaluate(declaration.test, env);
  
    if ((test as BooleanValue).value === true) {
      return evaluateBody(declaration.body, env);
    } else if (declaration.alternate) {
      return evaluateBody(declaration.alternate, env);
    } else {
      return MK_NULL();
    }
  }
  
  export function evaluateForStatement(
    stmt: ForStatement,
    env: Environment
  ): RuntimeValue {
    // Create a new environment for the loop
    const loopEnv = new Environment(env);
    
    for (
      evaluate(stmt.init, loopEnv);
      isTruthy(evaluate(stmt.test, loopEnv));
      evaluate(stmt.update, loopEnv)
    ) {
      try {
        // Create new environment for each iteration
        const iterationEnv = new Environment(loopEnv);
        for (const statement of stmt.body) {
          evaluate(statement, iterationEnv);
        }
      } catch (error) {
        if (error === "break") {
          console.log("Breaking out of loop due to break.");
          break;
        } else if (error === "continue") {
          continue;
        }
        throw error;
      }
    }
    return MK_NULL();
  }
  
  export function evaluateContinueStatement(
    _stmt: Statement,
    _env: Environment
  ): RuntimeValue {
    throw "continue";
  }
  
  export function evaluateTryCatchStatement(
    stmt: TryCatchStatement,
    env: Environment
  ): RuntimeValue {
    try {
      let result: RuntimeValue = MK_NULL();
      for (const statement of stmt.body) {
        result = evaluate(statement, env);
      }
      return result;
    } catch (error: any) {
      const catchEnv = new Environment(env);
      if (stmt.errorParam) {
        const errorValue = (error as RuntimeValue).type
          ? (error as RuntimeValue)
          : MK_STRING(error.toString());
        catchEnv.declareVar(stmt.errorParam, errorValue, false);
      }
  
      let result: RuntimeValue = MK_NULL();
      for (const statement of stmt.alternate) {
        result = evaluate(statement, catchEnv);
      }
      return result;
    }
  }
  
  export function evaluateThrowStatement(
    statement: ThrowStatement,
    env: Environment
  ): RuntimeValue {
    const value = evaluate(statement.argument, env);
    throw value;
  }
  
  export function evaluateBreakStatement(
    _stmt: BreakStatement,
    _env: Environment
  ): RuntimeValue {
    throw "break";
  }
  
  export function evaluateReturnStatement(
    declaration: ReturnStatement,
    env: Environment
  ): ReturnValue {
    const value = declaration.argument
      ? evaluate(declaration.argument, env)
      : MK_NULL();
    return {
      type: "return",
      value,
    };
  }