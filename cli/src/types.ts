// Type imports
import type { Statement, Program } from "./core/frontend/ast";
import type { RuntimeValue, MK_BOOL, MK_NULL, MK_NATIVE_FN } from "./core/runtime/values";
import type { 
    addGoolMethod, 
    addArrayMethods, 
    addOtherArrayMethods, 
    addStringMethods, 
    addMathMethods, 
    addTypeMethods, 
    addFetchMethod, 
    addDocumentMethods 
} from "./core/runtime/stdlib/libraries.js";

// Implementation imports
import Parser from "./core/frontend/parser.js";
import { evaluate } from "./core/runtime/interpreter.js";
import Environment, { createGlobalEnv } from "./core/runtime/environment.js";
import { transpileToJS } from "./core/transpiler/transpiler.js";

// Export all the types
export type { 
    Statement, 
    Program, 
    RuntimeValue,
    MK_BOOL,
    MK_NULL,
    MK_NATIVE_FN,
    addGoolMethod,
    addArrayMethods,
    addOtherArrayMethods,
    addStringMethods,
    addMathMethods,
    addTypeMethods,
    addFetchMethod,
    addDocumentMethods
};

// Export the implementations
export {
    Parser,
    evaluate,
    createGlobalEnv,
    transpileToJS,
    Environment
};