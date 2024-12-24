import { Parser, transpileToJS } from '../types.js';
import { dirname, basename } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { watchDirectory, watchFile } from "./watch.js";
import { SourceMap } from "../utils/sourcemap.js";

export async function compile(
  inputFile: string,
  outputFile?: string,
  watch?: boolean
): Promise<void> {
  async function compileFile() {
    try {
      const source = await readFile(inputFile, 'utf-8');
      const ast = new Parser().produceAST(source);
      const sourceMap = new SourceMap();
      const { code, map } = transpileToJS(ast, {
        sourceMap: true,
        filename: inputFile,
        sourceMapGenerator: sourceMap
      });

      const dir = dirname(inputFile);
      const outputPath = outputFile || `${dir}/${basename(inputFile, '.ta5bees')}.js`;
      const mapPath = `${outputPath}.map`;

      await writeFile(outputPath, code, 'utf-8');

      if (map) {
        await writeFile(mapPath, map, 'utf-8');
        await writeFile(
          outputPath,
          code + '\n//# sourceMappingURL=' + basename(mapPath),
          'utf-8'
        );
      }

      console.log(`Compiled ${inputFile} to ${outputPath}`);
    } catch (error) {
      console.error('Compilation error:', error);
    }
  }

  if (watch) {
    console.log(`Watching ${inputFile} for changes...`);
    watchFile(inputFile, compileFile);
    watchDirectory(dirname(inputFile), compileFile);
  } else {
    await compileFile();
  }
}