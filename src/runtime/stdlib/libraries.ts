import { runtimeToJS } from "../../transpiler/transpiler.ts";
import Environment from "../environment.ts";
import { callFunction } from "../eval/statements.ts";
import {
  ArrayValue,
  BooleanValue,
  FunctionValue,
  MK_ARRAY,
  MK_BOOL,
  MK_NATIVE_FN,
  MK_NULL,
  MK_NUMBER,
  MK_OBJECT,
  MK_PROMISE,
  MK_STRING,
  NumberValue,
  ObjectValue,
  RuntimeValue,
  StringValue,
} from "../values.ts";

function isTruthy(value: RuntimeValue): boolean {
  switch (value.type) {
    case "boolean":
      return (value as BooleanValue).value;
    case "number":
      return (value as NumberValue).value !== 0;
    case "string":
      return (value as StringValue).value.length > 0;
    case "array":
      return (value as ArrayValue).values.length > 0;
    case "object":
      return (value as ObjectValue).properties.size > 0;
    case "null":
      return false;
    case "native-fn":
    case "fn":
    case "promise":
      return true;
    default:
      throw new Error(
        `Unknown value type '${value.type}' for truthiness check.`
      );
  }
}

function valueToString(value: RuntimeValue): string {
  switch (value.type) {
    case "string":
      return (value as StringValue).value;
    case "number":
      return (value as NumberValue).value.toString();
    case "boolean":
      return (value as BooleanValue).value ? "true" : "false";
    case "null":
      return "null";
    case "array":
      return `[${(value as ArrayValue).values.map(valueToString).join(", ")}]`;
    case "object": {
      const properties = Array.from(
        (value as ObjectValue).properties.entries()
      ).map(([key, val]) => `${key}: ${valueToString(val)}`);
      return `{ ${properties.join(", ")} }`;
    }
    case "native-fn":
      return "<native-fn>";
    case "fn":
      return "<function>";
    case "promise":
      return "<promise>";
    default:
      throw new Error(`Cannot convert unknown type '${value.type}' to string.`);
  }
}

function formatRuntimeValue(value: RuntimeValue): string {
  switch (value.type) {
    case "number":
      return (value as NumberValue).value.toString();
    case "string":
      return `"${(value as StringValue).value}"`;
    case "boolean":
      return (value as BooleanValue).value ? "true" : "false";
    case "null":
      return "null";
    case "array":
      return `[${(value as ArrayValue).values
        .map(formatRuntimeValue)
        .join(", ")}]`;
    case "object":
      const obj = value as ObjectValue;
      const entries = Array.from(obj.properties.entries()).map(
        ([key, val]) => `${key}: ${formatRuntimeValue(val)}`
      );
      return `{ ${entries.join(", ")} }`;
    case "native-fn":
      return "<native-fn>";
    case "fn":
      return `<function ${(value as FunctionValue).name || "anonymous"}>`;
    case "promise":
      return "<promise>";
    default:
      return `<unknown ${value.type}>`;
  }
}

export function addGoolMethod(env: Environment) {
  env.declareVar(
    "gool",
    MK_NATIVE_FN((args, _env) => {
      const formattedArgs = args.map(formatRuntimeValue);
      console.log(...formattedArgs);
      return MK_NULL();
    }),
    true
  );
 }

export function addStringMethods(env: Environment) {
  env.declareVar(
    "substring",
    MK_NATIVE_FN((args, _env) => {
      const str = args[0] as StringValue;
      const start = (args[1] as NumberValue).value;
      const end = args[2] ? (args[2] as NumberValue).value : str.value.length;
      return MK_STRING(str.value.substring(start, end));
    }),
    true
  );

  env.declareVar(
    "toUpperCase",
    MK_NATIVE_FN((args, _env) => {
      const str = args[0] as StringValue;
      return MK_STRING(str.value.toUpperCase());
    }),
    true
  );

  env.declareVar(
    "toLowerCase",
    MK_NATIVE_FN((args, _env) => {
      const str = args[0] as StringValue;
      return MK_STRING(str.value.toLowerCase());
    }),
    true
  );

  env.declareVar(
    "trim",
    MK_NATIVE_FN((args, _env) => {
      const str = args[0] as StringValue;
      return MK_STRING(str.value.trim());
    }),
    true
  );

  env.declareVar(
    "replace",
    MK_NATIVE_FN((args, _env) => {
      const str = args[0] as StringValue;
      const searchValue = args[1] as StringValue;
      const replaceValue = args[2] as StringValue;
      return MK_STRING(
        str.value.replace(searchValue.value, replaceValue.value)
      );
    }),
    true
  );

  env.declareVar(
    "includes",
    MK_NATIVE_FN((args, _env) => {
      const str = args[0] as StringValue;
      const searchStr = args[1] as StringValue;
      return MK_BOOL(str.value.includes(searchStr.value));
    }),
    true
  );

  env.declareVar(
    "startsWith",
    MK_NATIVE_FN((args, _env) => {
      const str = args[0] as StringValue;
      const searchStr = args[1] as StringValue;
      return MK_BOOL(str.value.startsWith(searchStr.value));
    }),
    true
  );

  env.declareVar(
    "endsWith",
    MK_NATIVE_FN((args, _env) => {
      const str = args[0] as StringValue;
      const searchStr = args[1] as StringValue;
      return MK_BOOL(str.value.endsWith(searchStr.value));
    }),
    true
  );

  env.declareVar(
    "split",
    MK_NATIVE_FN((args, _env) => {
      const str = args[0] as StringValue;
      const separator = args[1] as StringValue;
      return MK_ARRAY(
        str.value.split(separator.value).map((s) => MK_STRING(s))
      );
    }),
    true
  );
}

export function addArrayMethods(env: Environment) {
  // push method
  env.declareVar(
    "push",
    MK_NATIVE_FN((args, _scope) => {
      const arr = args[0] as ArrayValue;
      const value = args[1];
      arr.values.push(value);
      return MK_NUMBER(arr.values.length);
    }),
    true
  );

  // pop method
  env.declareVar(
    "pop",
    MK_NATIVE_FN((args, _scope) => {
      const arr = args[0] as ArrayValue;
      if (arr.values.length === 0) {
        return MK_NULL();
      }
      return arr.values.pop() || MK_NULL();
    }),
    true
  );

  // length property
  env.declareVar(
    "length",
    MK_NATIVE_FN((args, _scope) => {
      const arr = args[0] as ArrayValue;
      return MK_NUMBER(arr.values.length);
    }),
    true
  );
}

export function addOtherArrayMethods(env: Environment) {
  env.declareVar(
    "filter",
    MK_NATIVE_FN((args, env) => {
      const arr = args[0] as ArrayValue;
      const callback = args[1] as FunctionValue;
      return MK_ARRAY(
        arr.values.filter((value) =>
          isTruthy(callFunction(callback, [value], env))
        )
      );
    }),
    true
  );

  env.declareVar(
    "map",
    MK_NATIVE_FN((args, env) => {
      const arr = args[0] as ArrayValue;
      const callback = args[1] as FunctionValue;
      return MK_ARRAY(
        arr.values.map((value) => callFunction(callback, [value], env))
      );
    }),
    true
  );

  env.declareVar(
    "reduce",
    MK_NATIVE_FN((args, env) => {
      const arr = args[0] as ArrayValue;
      const callback = args[1] as FunctionValue;
      const initial = args[2];
      return arr.values.reduce(
        (acc, curr) => callFunction(callback, [acc, curr], env),
        initial
      );
    }),
    true
  );

  env.declareVar(
    "forEach",
    MK_NATIVE_FN((args, env) => {
      const arr = args[0] as ArrayValue;
      const callback = args[1] as FunctionValue;
      arr.values.forEach((value) => callFunction(callback, [value], env));
      return MK_NULL();
    }),
    true
  );

  env.declareVar(
    "find",
    MK_NATIVE_FN((args, env) => {
      const arr = args[0] as ArrayValue;
      const callback = args[1] as FunctionValue;
      const found = arr.values.find((value) =>
        isTruthy(callFunction(callback, [value], env))
      );
      return found || MK_NULL();
    }),
    true
  );

  env.declareVar(
    "some",
    MK_NATIVE_FN((args, env) => {
      const arr = args[0] as ArrayValue;
      const callback = args[1] as FunctionValue;
      return MK_BOOL(
        arr.values.some((value) =>
          isTruthy(callFunction(callback, [value], env))
        )
      );
    }),
    true
  );

  env.declareVar(
    "every",
    MK_NATIVE_FN((args, env) => {
      const arr = args[0] as ArrayValue;
      const callback = args[1] as FunctionValue;
      return MK_BOOL(
        arr.values.every((value) =>
          isTruthy(callFunction(callback, [value], env))
        )
      );
    }),
    true
  );

  env.declareVar(
    "join",
    MK_NATIVE_FN((args, _env) => {
      const arr = args[0] as ArrayValue;
      const separator = args[1] ? (args[1] as StringValue).value : ",";
      return MK_STRING(arr.values.map((v) => valueToString(v)).join(separator));
    }),
    true
  );
}

export function addMathMethods(env: Environment) {
  const mathObj = MK_OBJECT(new Map());
  const mathMethods = {
    max: MK_NATIVE_FN((args, _env) => {
      const nums = args.map((arg) => (arg as NumberValue).value);
      return MK_NUMBER(Math.max(...nums));
    }),

    min: MK_NATIVE_FN((args, _env) => {
      const nums = args.map((arg) => (arg as NumberValue).value);
      return MK_NUMBER(Math.min(...nums));
    }),

    round: MK_NATIVE_FN((args, _env) => {
      const num = (args[0] as NumberValue).value;
      return MK_NUMBER(Math.round(num));
    }),

    floor: MK_NATIVE_FN((args, _env) => {
      const num = (args[0] as NumberValue).value;
      return MK_NUMBER(Math.floor(num));
    }),

    ceil: MK_NATIVE_FN((args, _env) => {
      const num = (args[0] as NumberValue).value;
      return MK_NUMBER(Math.ceil(num));
    }),

    abs: MK_NATIVE_FN((args, _env) => {
      const num = (args[0] as NumberValue).value;
      return MK_NUMBER(Math.abs(num));
    }),

    pow: MK_NATIVE_FN((args, _env) => {
      const base = (args[0] as NumberValue).value;
      const exponent = (args[1] as NumberValue).value;
      return MK_NUMBER(Math.pow(base, exponent));
    }),

    sqrt: MK_NATIVE_FN((args, _env) => {
      const value = (args[0] as NumberValue).value;
      return MK_NUMBER(Math.sqrt(value));
    }),

    random: MK_NATIVE_FN((_, _env) => {
      return MK_NUMBER(Math.random());
    }),
  };

  for (const [key, func] of Object.entries(mathMethods)) {
    (mathObj as any).properties.set(key, func);
  }

  env.declareVar("Math", mathObj, true);
}

// Type conversion methods
export function addTypeMethods(env: Environment) {
  const typeObj = MK_OBJECT(new Map());
  const typeMethods = {
    toString: MK_NATIVE_FN((args, _env) => {
      const value = args[0];
      switch (value.type) {
        case "string":
          return value;
        case "number":
          return MK_STRING((value as NumberValue).value.toString());
        case "boolean":
          return MK_STRING((value as BooleanValue).value.toString());
        case "null":
          return MK_STRING("null");
        default:
          throw new Error(
            `TypeError: Cannot convert type '${value.type}' to string.`
          );
      }
    }),

    toNumber: MK_NATIVE_FN((args, _env) => {
      const value = args[0];
      switch (value.type) {
        case "string": {
          const num = Number((value as StringValue).value);
          if (isNaN(num))
            throw new Error(
              `TypeError: Cannot convert string '${
                (value as StringValue).value
              }' to a valid number.`
            );
          return MK_NUMBER(num);
        }
        case "boolean":
          return MK_NUMBER((value as BooleanValue).value ? 1 : 0);
        case "number":
          return value;
        case "null":
          return MK_NUMBER(0);
        default:
          throw new Error(
            `TypeError: Cannot convert type '${value.type}' to number.`
          );
      }
    }),

    toBoolean: MK_NATIVE_FN((args, _env) => {
      const value = args[0];
      switch (value.type) {
        case "string":
          return MK_BOOL((value as StringValue).value.length > 0);
        case "number":
          return MK_BOOL((value as NumberValue).value !== 0);
        case "boolean":
          return value;
        case "null":
          return MK_BOOL(false);
        default:
          throw new Error(
            `TypeError: Cannot convert type '${value.type}' to boolean.`
          );
      }
    }),
  };

  for (const [key, func] of Object.entries(typeMethods)) {
    (typeObj as any).properties.set(key, func);
  }

  env.declareVar("Type", typeObj, true);
}

export function addFetchMethod(env: Environment) {
  const fetchObj = MK_OBJECT(new Map());
  const fetchMethods = {
    fetch: MK_NATIVE_FN((args, _env) => {
      const url = (args[0] as StringValue).value;

      // Return a PromiseValue that resolves to the response object
      return MK_PROMISE(
        (async () => {
          try {
            const response = await fetch(url);
            const jsonText = await response.clone().text(); // Pre-fetch the JSON text

            return MK_OBJECT(
              new Map<string, RuntimeValue>([
                ["status", MK_NUMBER(response.status)],
                ["ok", MK_BOOL(response.ok)],
                [
                  "json",
                  MK_NATIVE_FN((_args, _env) => {
                    // Return string directly, no async
                    return MK_STRING(jsonText);
                  }),
                ],
                [
                  "text",
                  MK_NATIVE_FN((_args, _env) => {
                    // Return string directly, no async
                    return MK_STRING(jsonText);
                  }),
                ],
              ])
            );
          } catch (error: any) {
            throw MK_STRING(`Fetch error: ${error.message}`);
          }
        })()
      );
    }),
  };

  env.declareVar("jeeb", fetchMethods.fetch, true);
}


export function addDocumentMethods(env: Environment) {
  // Create document object
  const documentObj = MK_OBJECT(new Map());
  const documentMethods = {
    getElementById: MK_NATIVE_FN((args, _env) => {
      const id = (args[0] as StringValue).value;
      const element = document.getElementById(id);
      if (!element) return MK_NULL();
      return createElementObject(element);
    }),

    createElement: MK_NATIVE_FN((args, _env) => {
      const tagName = (args[0] as StringValue).value;
      const element = document.createElement(tagName);
      return createElementObject(element);
    }),

    querySelector: MK_NATIVE_FN((args, _env) => {
      const selector = (args[0] as StringValue).value;
      const element = document.querySelector(selector);
      if (!element) return MK_NULL();
      return createElementObject(element);
    }),

    querySelectorAll: MK_NATIVE_FN((args, _env) => {
      const selector = (args[0] as StringValue).value;
      const elements = document.querySelectorAll(selector);
      return MK_ARRAY(Array.from(elements).map(el => createElementObject(el)));
    }),
  };

  // Add methods to document object
  for (const [key, func] of Object.entries(documentMethods)) {
    documentObj.properties.set(key, func);
  }

  env.declareVar("document", documentObj, true);
}

function createElementObject(element: Element): ObjectValue {
  const elementObj = MK_OBJECT(new Map());
  
  // Basic properties
  elementObj.properties.set("innerHTML", MK_STRING((element as HTMLElement).innerHTML || ""));
  elementObj.properties.set("textContent", MK_STRING(element.textContent || ""));
  elementObj.properties.set("id", MK_STRING(element.id));
  elementObj.properties.set("className", MK_STRING((element as HTMLElement).className || ""));
  
  // Element methods
  elementObj.properties.set("appendChild", MK_NATIVE_FN((args, _env) => {
    const childObj = args[0] as ObjectValue;
    const childElement = childObj.properties.get("_element");
    if (childElement && '_element' in childElement) {
      element.appendChild(childElement._element as Element);
    }
    return MK_NULL();
  }));

  elementObj.properties.set("setAttribute", MK_NATIVE_FN((args, _env) => {
    const name = (args[0] as StringValue).value;
    const value = (args[1] as StringValue).value;
    element.setAttribute(name, value);
    return MK_NULL();
  }));

  elementObj.properties.set("addEventListener", MK_NATIVE_FN((args, env) => {
    const eventName = (args[0] as StringValue).value;
    const handler = args[1];
    
    element.addEventListener(eventName, async (event) => {
      if (handler.type === "fn") {
        await callFunction(handler as FunctionValue, [], env);
      }
    });
    
    return MK_NULL();
  }));

  // Store the actual DOM element
  elementObj.properties.set("_element", { _element: element } as unknown as RuntimeValue);

  return elementObj;
}