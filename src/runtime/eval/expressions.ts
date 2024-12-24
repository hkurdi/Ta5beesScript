import {
    ArrayLiteral,
    ArrowFunctionExpression,
    AssignmentExpression,
    AsyncExpression,
    AwaitExpression,
    BinaryExpression,
    CallExpression,
    Identifier,
    MemberExpression,
    ObjectLiteral,
    Statement,
  } from "../../frontend/ast.ts";
  import Environment from "../environment.ts";
  import { evaluate } from "../interpreter.ts";
  import {
    NumberValue,
    RuntimeValue,
    MK_NULL,
    ObjectValue,
    ArrayValue,
    FunctionValue,
    BooleanValue,
    StringValue,
    MK_STRING,
    MK_NUMBER,
    MK_BOOL,
    MK_NATIVE_FN,
    MK_ARRAY,
    PromiseValue,
    MK_PROMISE,
    NativeFnValue,
    isPromiseValue,
  } from "../values.ts";
  import { callFunction } from "./statements.ts";
  
  /**
   * need to add explanations for each export functions
   * we'll see haha
   */
  
  
  function evaluateNumericBinaryExpression(
    left: NumberValue,
    right: NumberValue,
    operator: string
  ): RuntimeValue {
    switch (operator) {
      case "+":
        return MK_NUMBER(left.value + right.value);
      case "-":
        return MK_NUMBER(left.value - right.value);
      case "*":
        return MK_NUMBER(left.value * right.value);
      case "/":
        if (right.value === 0) {
          throw new Error(`Division by zero error`);
        }
        return MK_NUMBER(left.value / right.value);
      case "%":
        if (right.value === 0) {
          throw new Error(`Modulo by zero error`);
        }
        return MK_NUMBER(left.value % right.value);
      case ">":
        return MK_BOOL(left.value > right.value);
      case "<":
        return MK_BOOL(left.value < right.value);
      case ">=":
        return MK_BOOL(left.value >= right.value);
      case "<=":
        return MK_BOOL(left.value <= right.value);
      case "==":
        return MK_BOOL(left.value === right.value);
      case "!=":
        return MK_BOOL(left.value !== right.value);
      default:
        throw new Error(`Unknown operator ${operator}`);
    }
  }
  
  function valueToString(value: RuntimeValue): string {
    switch (value.type) {
      case "string":
        return (value as StringValue).value;
      case "number":
        return (value as NumberValue).value.toString();
      case "boolean":
        return (value as BooleanValue).value.toString();
      case "null":
        return "null";
      case "array":
        return (value as ArrayValue).values
          .map((v) => valueToString(v))
          .join(",");
      case "object":
        return "[object Object]";
      default:
        return "";
    }
  }
  
  function isTruthy(val: RuntimeValue): boolean {
    if (val.type === "boolean") return (val as any).value;
    if (val.type === "number") return (val as NumberValue).value !== 0;
    if (val.type === "string") return (val as any).value.length > 0;
    if (val.type === "null") return false;
    return true;
  }
  
  function getArrayMethod(methodName: string, array: ArrayValue): RuntimeValue {
    switch (methodName) {
      case "map":
        return MK_NATIVE_FN((args, env) => {
          const callback = args[0] as FunctionValue;
          const mappedValues = array.values.map((val) => {
            return callFunction(callback, [val], env);
          });
          return MK_ARRAY(mappedValues);
        });
  
      case "filter":
        return MK_NATIVE_FN((args, env) => {
          const callback = args[0] as FunctionValue;
          const filteredValues = array.values.filter((val) => {
            const result = callFunction(callback, [val], env);
            return isTruthy(result);
          });
          return MK_ARRAY(filteredValues);
        });
  
      case "reduce":
        return MK_NATIVE_FN((args, env) => {
          const callback = args[0] as FunctionValue;
          let accumulator = args[1];
          for (const val of array.values) {
            accumulator = callFunction(callback, [accumulator, val], env);
          }
          return accumulator;
        });
  
      case "forEach":
        return MK_NATIVE_FN((args, env) => {
          const callback = args[0] as FunctionValue;
          array.values.forEach((val) => {
            callFunction(callback, [val], env);
          });
          return MK_NULL();
        });
  
      case "push":
        return MK_NATIVE_FN((args, _env) => {
          array.values.push(args[0]);
          return MK_NUMBER(array.values.length);
        });
  
      case "pop":
        return MK_NATIVE_FN((_args, _env) => {
          if (array.values.length === 0) return MK_NULL();
          return array.values.pop() || MK_NULL();
        });
  
      case "length":
        return MK_NATIVE_FN((_args, _env) => {
          return MK_NUMBER(array.values.length);
        });
  
      case "slice":
        return MK_NATIVE_FN((args, _env) => {
          const start = (args[0] as NumberValue).value;
          const end = args[1] ? (args[1] as NumberValue).value : array.values.length;
          return MK_ARRAY(array.values.slice(start, end));
        });
  
      case "sort":
        return MK_NATIVE_FN((_args, _env) => {
          array.values.sort((a, b) => {
            if (a.type === "number" && b.type === "number") {
              return (a as NumberValue).value - (b as NumberValue).value;
            }
            return 0;
          });
          return array;
        });
  
      default:
        throw `Unknown array method: ${methodName}`;
    }
  }
  
  export function evaluateCallExpression(
    expr: CallExpression,
    env: Environment
  ): RuntimeValue | PromiseValue {
    const args = expr.args.map(arg => evaluate(arg, env));
    const fn = evaluate(expr.caller, env);
  
    // Handle native functions
    if (fn.type === "native-fn") {
      const result = (fn as NativeFnValue).call(args, env);
      // console.log("Result is not a Promise, returning directly");
      return result;
    }
  
    // Handle regular functions
    if (fn.type === "fn") {
      return callFunction(fn as FunctionValue, args, env);
    }
  
    // Handle promises
    if (fn.type === "promise") {
      return MK_PROMISE((async () => {
        const resolvedFn = await (fn as PromiseValue).promise;
        if (resolvedFn.type === "native-fn") {
          const result = (resolvedFn as NativeFnValue).call(args, env);
          // Handle potential Promise returns
          if (result instanceof Promise) {
            const awaitedResult = await result;
            return awaitedResult;
          }
          if (isPromiseValue(result)) {
            const awaitedResult = await result.promise;
            return awaitedResult;
          }
          return result;
        } else if (resolvedFn.type === "fn") {
          const result = callFunction(resolvedFn as FunctionValue, args, env);
          if (result instanceof Promise) {
            const awaitedResult = await result;
            return awaitedResult;
          }
          if (isPromiseValue(result)) {
            const awaitedResult = await result.promise;
            return awaitedResult;
          }
          return result;
        }
        throw new Error(
          `Resolved value is not callable: ${JSON.stringify(resolvedFn)}`
        );
      })());
    }
  
    throw new Error(`Cannot call value that is not a function: ${JSON.stringify(fn)}`);
  }
  export function evaluateBinaryExpressions(
    binOp: BinaryExpression,
    env: Environment
  ): RuntimeValue {
    if (binOp.operator === "&&") {
      const left = evaluate(binOp.left, env);
      if (!isTruthy(left)) return MK_BOOL(false);
      const right = evaluate(binOp.right, env);
      return MK_BOOL(isTruthy(right));
    }
  
    if (binOp.operator === "||") {
      const left = evaluate(binOp.left, env);
      if (isTruthy(left)) return MK_BOOL(true);
      const right = evaluate(binOp.right, env);
      return MK_BOOL(isTruthy(right));
    }
  
    const leftSide = evaluate(binOp.left, env);
    const rightSide = evaluate(binOp.right, env);
  
    if (binOp.operator === "+") {
      if (leftSide.type === "string" || rightSide.type === "string") {
        const leftStr = valueToString(leftSide);
        const rightStr = valueToString(rightSide);
        return MK_STRING(leftStr + rightStr);
      }
    }
  
    if (leftSide.type === "number" && rightSide.type === "number") {
      switch (binOp.operator) {
        case ">":
          return MK_BOOL(
            (leftSide as NumberValue).value > (rightSide as NumberValue).value
          );
        case "<":
          return MK_BOOL(
            (leftSide as NumberValue).value < (rightSide as NumberValue).value
          );
        case ">=":
          return MK_BOOL(
            (leftSide as NumberValue).value >= (rightSide as NumberValue).value
          );
        case "<=":
          return MK_BOOL(
            (leftSide as NumberValue).value <= (rightSide as NumberValue).value
          );
        case "==":
          return MK_BOOL(
            (leftSide as NumberValue).value === (rightSide as NumberValue).value
          );
        case "!=":
          return MK_BOOL(
            (leftSide as NumberValue).value !== (rightSide as NumberValue).value
          );
        default:
          return evaluateNumericBinaryExpression(
            leftSide as NumberValue,
            rightSide as NumberValue,
            binOp.operator
          );
      }
    }
  
    return MK_NULL();
  }
  
  export function evaluateIdentifier(
    identifier: Identifier,
    env: Environment
  ): RuntimeValue {
    const val = env.lookUpVar(identifier.symbol);
    return val;
  }
  
  export function evaluateObjectExpression(
    object: ObjectLiteral,
    env: Environment
  ): RuntimeValue {
    const obj = {
      type: "object",
      properties: new Map(),
    } as ObjectValue;
    for (const { key, value } of object.properties) {
      const runtimeVal =
        value === undefined ? env.lookUpVar(key) : evaluate(value, env);
      obj.properties.set(key, runtimeVal);
    }
    return obj;
  }
  
  export function evaluateArrayExpression(
    obj: ArrayLiteral,
    env: Environment
  ): RuntimeValue {
    const array = { type: "array", values: [] } as ArrayValue;
  
    for (const value of obj.values) {
      const runtimeVal = evaluate(value, env);
  
      array.values.push(runtimeVal);
    }
  
    return array;
  }
  
  
  
  function getStringMethod(methodName: string, str: string): RuntimeValue {
    switch (methodName) {
      case "length":
        return MK_NATIVE_FN((_args, _env) => {
          return MK_NUMBER(str.length);
        });
  
      case "substring":
        return MK_NATIVE_FN((args, _env) => {
          const start = (args[0] as NumberValue).value;
          const end = args[1] ? (args[1] as NumberValue).value : str.length;
          return MK_STRING(str.substring(start, end));
        });
  
      case "indexOf":
        return MK_NATIVE_FN((args, _env) => {
          const searchStr = (args[0] as StringValue).value;
          return MK_NUMBER(str.indexOf(searchStr));
        });
  
      case "toUpperCase":
        return MK_NATIVE_FN((_args, _env) => {
          return MK_STRING(str.toUpperCase());
        });
  
      case "toLowerCase":
        return MK_NATIVE_FN((_args, _env) => {
          return MK_STRING(str.toLowerCase());
        });
  
      case "includes":
        return MK_NATIVE_FN((args, _env) => {
          const searchStr = (args[0] as StringValue).value;
          return MK_BOOL(str.includes(searchStr));
        });
  
      case "trim":
        return MK_NATIVE_FN((_args, _env) => {
          return MK_STRING(str.trim());
        });
  
      case "startsWith":
        return MK_NATIVE_FN((args, _env) => {
          const searchStr = (args[0] as StringValue).value;
          return MK_BOOL(str.startsWith(searchStr));
        });
  
      case "endsWith":
        return MK_NATIVE_FN((args, _env) => {
          const searchStr = (args[0] as StringValue).value;
          return MK_BOOL(str.endsWith(searchStr));
        });
  
      default:
        throw `Unknown string method: ${methodName}`;
    }
  }
  
  function getObjectMethod(methodName: string, obj: ObjectValue): RuntimeValue {
    switch (methodName) {
      case "keys":
        return MK_NATIVE_FN((_args, _env) => {
          const keys = Array.from(obj.properties.keys());
          return MK_ARRAY(keys.map(key => MK_STRING(key)));
        });
  
      case "values":
        return MK_NATIVE_FN((_args, _env) => {
          const values = Array.from(obj.properties.values());
          return MK_ARRAY(values);
        });
  
      case "entries":
        return MK_NATIVE_FN((_args, _env) => {
          const entries = Array.from(obj.properties.entries());
          return MK_ARRAY(
            entries.map(([key, value]) => 
              MK_ARRAY([MK_STRING(key), value]))
          );
        });
  
      case "hasProperty":
        return MK_NATIVE_FN((args, _env) => {
          const key = (args[0] as StringValue).value;
          return MK_BOOL(obj.properties.has(key));
        });
  
      case "delete":
        return MK_NATIVE_FN((args, _env) => {
          const key = (args[0] as StringValue).value;
          return MK_BOOL(obj.properties.delete(key));
        });
  
      default:
        throw `Unknown object method: ${methodName}`;
    }
  }
  
  
  
  export function evaluateMemberExpression(
    expr: MemberExpression,
    env: Environment
  ): RuntimeValue | PromiseValue {
    const obj = evaluate(expr.object, env);
  
    if (obj.type === "promise") {
      return MK_PROMISE((async () => {
        const resolved = await (obj as PromiseValue).promise;
        return evaluateMemberExpressionForObject(resolved, expr, env);
      })());
    }
  
    return evaluateMemberExpressionForObject(obj, expr, env);
  }
  
  function evaluateMemberExpressionForObject(
    obj: RuntimeValue,
    expr: MemberExpression,
    env: Environment
  ): RuntimeValue {
    // Handle object-specific logic
    if (isObjectValue(obj)) {
      if (!expr.computed) {
        const prop = (expr.property as Identifier).symbol;
        return obj.properties.get(prop) || MK_NULL();
      } else {
        const key = (evaluate(expr.property, env) as StringValue).value;
        return obj.properties.get(key) || MK_NULL();
      }
    }
  
    // Handle string methods
    if (obj.type === "string" && !expr.computed) {
      const prop = (expr.property as Identifier).symbol;
      return getStringMethod(prop, (obj as StringValue).value);
    }
  
    // Handle array methods and access
    if (obj.type === "array") {
      if (!expr.computed) {
        const prop = (expr.property as Identifier).symbol;
        return getArrayMethod(prop, obj as ArrayValue);
      } else {
        const index = evaluate(expr.property, env) as NumberValue;
        const array = obj as ArrayValue;
        if (index.value < 0 || index.value >= array.values.length) {
          throw `Array index out of bounds: ${index.value}`;
        }
        return array.values[index.value];
      }
    }
  
    // Fallback for unsupported types
    return MK_NULL();
  }
  
  // Type guard for ObjectValue
  function isObjectValue(value: RuntimeValue): value is ObjectValue {
    return value.type === "object" && "properties" in value;
  }
  
  
  export function evaluateArrowFunctionExpression(
    arrowFunc: ArrowFunctionExpression,
    env: Environment
  ) {
    return {
      type: "fn",
      name: "<anonymous>",
      parameters: arrowFunc.parameters,
      declarationEnv: env,
      body: Array.isArray(arrowFunc.body)
        ? arrowFunc.body
        : [{ kind: "ReturnStatement", argument: arrowFunc.body }],
    } as FunctionValue;
  }
  
  export function evaluateAssignment(
    node: AssignmentExpression,
    env: Environment
  ): RuntimeValue {
    if (node.assignee.kind === "MemberExpression") {
      const member = node.assignee as MemberExpression;
      const obj = evaluate(member.object, env);
      const value = evaluate(node.value, env);
  
      if (obj.type === "array") {
        const index = (evaluate(member.property, env) as NumberValue).value;
        const arr = obj as ArrayValue;
        if (index < 0 || index >= arr.values.length) {
          throw `Array index out of bounds: ${index}`;
        }
        arr.values[index] = value;
        return value;
      }
  
      if (obj.type === "object") {
        const key = member.computed
          ? (evaluate(member.property, env) as StringValue).value
          : (member.property as Identifier).symbol;
        (obj as ObjectValue).properties.set(key, value);
        return value;
      }
    }
  
    if (node.assignee.kind === "Identifier") {
      return env.assignVar(
        (node.assignee as Identifier).symbol,
        evaluate(node.value, env)
      );
    }
  
    throw `Invalid assignment target`;
  }
  
  
  export async function evaluateAsyncExpression(
    astNode: Statement,
    env: Environment
  ): Promise<RuntimeValue> {
    const result = evaluate(astNode, env);
  
    if (isPromiseValue(result)) {
      return await result.promise; 
    }
    return result;
  }
  
  
  
  export function evaluateAwaitExpression(
    expr: AwaitExpression,
    env: Environment
  ): RuntimeValue {
    const awaitedValue = evaluate(expr.argument, env);
  
    if (!isPromiseValue(awaitedValue)) {
      return awaitedValue;
    }
  
    return MK_PROMISE((async () => {
      const resolved = await awaitedValue.promise;
      return resolved;
    })());
  }