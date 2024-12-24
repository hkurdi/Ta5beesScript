import { transpileToJS } from "../../transpiler/transpiler.ts";
import Parser from "../../frontend/parser.ts";
import { basename, dirname } from "https://deno.land/std/path/mod.ts";
import { watchDirectory, watchFile } from "./watch.ts";
import { SourceMap } from "../utils/sourcemap.ts";

export async function compile(
  inputFile: string, 
  outFile?: string, 
  watch = false,
  sourceMap = true
) {
  async function compileFile() {
    const source = await Deno.readTextFile(inputFile);
    const parser = new Parser();
    const sourceMapGenerator = new SourceMap();
    
    try {
      const ast = parser.produceAST(source);
      const { code, map } = transpileToJS(ast, {
        sourceMap: sourceMap,
        filename: inputFile,
        sourceMapGenerator,
      });

      const outputPath = outFile || `${basename(inputFile, ".ta5bees")}.js`;
      await Deno.writeTextFile(outputPath, code);

      if (map) {
        const mapPath = `${outputPath}.map`;
        await Deno.writeTextFile(mapPath, map);
        // Add sourceMappingURL to the JS file
        await Deno.writeTextFile(
          outputPath,
          `${code}\n//# sourceMappingURL=${basename(mapPath)}`
        );
      }

      console.log(`Compiled ${inputFile} -> ${outputPath}`);
    } catch (error) {
      reportError(error, source, inputFile);
    }
  }

  await compileFile();
  
  if (watch) {
    await watchDirectory(dirname(inputFile), compileFile);
  }
}

function reportError(error: any, source: string, filename: string) {
  if (error.line && error.column) {
    const lines = source.split('\n');
    const line = lines[error.line - 1];
    const pointer = ' '.repeat(error.column - 1) + '^';
    
    console.error(`Error in ${filename}:${error.line}:${error.column}`);
    console.error(line);
    console.error(pointer);
    console.error(error.message);
  } else {
    console.error(error.message || error);
  }
}