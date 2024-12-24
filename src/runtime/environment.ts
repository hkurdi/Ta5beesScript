import { addGoolMethod, addArrayMethods, addOtherArrayMethods, addStringMethods, addMathMethods, addTypeMethods, addFetchMethod, addDocumentMethods } from "./stdlib/libraries.ts";
import {
  MK_BOOL,
  MK_NATIVE_FN,
  MK_NULL,
  RuntimeValue,
} from "./values.ts";

export default class Environment {
  private parent?: Environment;
  private variables: Map<string, RuntimeValue>;
  private constants: Set<string>;

  constructor(parentENV?: Environment) {
    const global = parentENV ? true : false;
    this.parent = parentENV;
    this.variables = new Map();
    this.constants = new Set();
  }

  public declareVar(varName: string, value: RuntimeValue, constant: boolean) {
    // console.log(varName, value);
    if (this.variables.has(varName)) {
      throw `Cannot declare variable ${varName}. As it already is defined.`;
    }

    this.variables.set(varName, value);

    if (constant) this.constants.add(varName);

    return value;
  }

  public assignVar(varName: string, value: RuntimeValue): RuntimeValue {
    const env = this.resolve(varName);

    if (env.constants.has(varName))
      throw `Cannot reassign to variable ${varName}, as it was declared as a constant.`;

    env.variables.set(varName, value);

    return value;
  }

  public lookUpVar(varName: string): RuntimeValue {
    const env = this.resolve(varName);
    return env.variables.get(varName) as RuntimeValue;
  }

  public resolve(varName: string): Environment {
    if (this.variables.has(varName)) return this;

    if (this.parent === undefined)
      throw `Cannot declare variable ${varName}. As it already is defined.`;

    return this.parent.resolve(varName);
  }
}

export function createGlobalEnv() {
  const env = new Environment();
  env.declareVar("true", MK_BOOL(true), true);
  env.declareVar("false", MK_BOOL(false), true);
  env.declareVar("null", MK_NULL(), true);

  addGoolMethod(env);
  addMathMethods(env);
  addTypeMethods(env);
  addFetchMethod(env);
  addArrayMethods(env);
  addOtherArrayMethods(env);
  addStringMethods(env);
  addDocumentMethods(env);
  
  return env;
}


