import { Statement } from "../frontend/ast.js";
import Environment from "./environment.js";

export type ValueType =
  | "null"
  | "number"
  | "boolean"
  | "object"
  | "promise"
  | "native-fn"
  | "fn"
  | "string"
  | "array"
  | "return"
  | "response";

export type FunctionCall = (
  args: RuntimeValue[],
  env: Environment
) => RuntimeValue | PromiseValue;

export interface RuntimeValue {
  type: ValueType;
}

export interface NullValue extends RuntimeValue {
  type: "null";
  value: null;
}

export interface NumberValue extends RuntimeValue {
  type: "number";
  value: number;
}

export interface BooleanValue extends RuntimeValue {
  type: "boolean";
  value: boolean;
}

export interface StringValue extends RuntimeValue {
  type: "string";
  value: string;
}

export interface ObjectValue extends RuntimeValue {
  type: "object";
  properties: Map<string, RuntimeValue>;
}

export interface ArrayValue extends RuntimeValue {
  type: "array";
  values: RuntimeValue[];
}

export interface NativeFnValue extends RuntimeValue {
  type: "native-fn";
  call: FunctionCall;
}

export interface FunctionValue extends RuntimeValue {
  type: "fn";
  name: string;
  parameters: string[];
  declarationEnv: Environment;
  body: Statement[];
  async: boolean;
}

export interface ReturnValue extends RuntimeValue {
  type: "return";
  value: RuntimeValue;
}

export interface PromiseValue extends RuntimeValue {
  type: "promise";
  promise: Promise<RuntimeValue>;
}

export interface ResponseValue extends RuntimeValue {
  type: "response";
  methods: Map<string, NativeFnValue>;
  data: string;
}

export function MK_NUMBER(n = 0) {
  return {
    type: "number",
    value: n,
  } as NumberValue;
}

export function MK_BOOL(bool = true) {
  return {
    type: "boolean",
    value: bool,
  } as BooleanValue;
}

export function MK_NULL() {
  return { type: "null", value: null } as NullValue;
}

export function MK_NATIVE_FN(call: FunctionCall) {
  return { type: "native-fn", call } as NativeFnValue;
}

export function MK_STRING(val: string): StringValue {
  return { type: "string", value: val } as StringValue;
}

export function MK_OBJECT(obj: Map<string, RuntimeValue>): ObjectValue {
  return { type: "object", properties: obj } as ObjectValue;
}

export function MK_ARRAY(arr: RuntimeValue[]): ArrayValue {
  return { type: "array", values: arr } as ArrayValue;
}

export function MK_PROMISE(promise: Promise<RuntimeValue>): PromiseValue {
  return { type: "promise", promise: promise };
}

// export function MK_RESPONSE(response: Response): ObjectValue {
//   const methods = new Map<string, NativeFnValue>();

//   // Add 'json' method
//   methods.set(
//     "json",
//     MK_NATIVE_FN(async (_args, _env) => {
//       const data = await response.json(); // Parse JSON
//       if (typeof data === "object") {
//         return MK_OBJECT(
//           new Map(
//             Object.entries(data).map(([key, value]) => [key, MK_STRING(String(value))])
//           )
//         ); // Wrap in MK_OBJECT for Ta5beesScript
//       }
//     })
//   );

//   // Add 'text' method
//   methods.set(
//     "text",
//     MK_NATIVE_FN(async (_args, _env) => {
//       const text = await response.text(); // Get raw text
//       return MK_STRING(text); // Wrap in MK_STRING for Ta5beesScript
//     })
//   );

//   return {
//     type: "object",
//     properties: methods, // Store methods in properties map
//   } as ObjectValue;
// }

export function isPromiseValue(value: any): value is PromiseValue {
  return value && value.type === "promise" && value.promise instanceof Promise;
}