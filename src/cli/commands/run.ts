import Parser from "../../frontend/parser.ts";
import { evaluate } from "../../runtime/interpreter.ts";
import { createGlobalEnv } from "../../runtime/environment.ts";
import { watchFile } from "./watch.ts";

export async function run(inputFile: string, watch = false) {

  async function runFile() {
    const source = await Deno.readTextFile(inputFile);
    const parser = new Parser();
    const env = createGlobalEnv();
    
    try {
      const ast = parser.produceAST(source);
      evaluate(ast, env);
    } catch (error: any) {
      console.error("Runtime Error:", error.message);
    }
  }

  await runFile();
  
  if (watch) {
    await watchFile(inputFile, runFile);
  }
}