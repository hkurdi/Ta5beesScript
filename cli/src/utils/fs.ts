import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { watch } from 'node:fs';

export async function readTextFile(filepath: string): Promise<string> {
    return await fs.readFile(filepath, 'utf-8');
}

export async function writeTextFile(filepath: string, content: string): Promise<void> {
    await fs.writeFile(filepath, content, 'utf-8');
}

export function dirname(filepath: string): string {
    return path.dirname(filepath);
}

export function basename(filepath: string): string {
    return path.basename(filepath);
}

export function watchFs(filepath: string, callback: () => void): void {
    watch(filepath, (eventType) => {
        if (eventType === 'change') {
            callback();
        }
    });
}

export function exit(code: number): never {
    process.exit(code);
}