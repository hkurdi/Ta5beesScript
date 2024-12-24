import { Parser, evaluate, createGlobalEnv } from '../types.js';
import { readFile } from 'node:fs/promises';
import { watchFile } from "./watch.js";

export async function run(inputFile: string, watch?: boolean): Promise<void> {
    async function executeFile() {
        try {
            const source = await readFile(inputFile, 'utf-8');
            const parser = new Parser();
            const env = createGlobalEnv();
            
            const program = parser.produceAST(source);
            evaluate(program, env);
        } catch (error) {
            console.error('Runtime error:', error);
        }
    }

    if (watch) {
        console.log(`Watching ${inputFile} for changes...`);
        watchFile(inputFile, executeFile);
    } else {
        await executeFile();
    }
}