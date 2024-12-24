import { watch } from 'node:fs';

export function watchFile(path: string, callback: () => void) {
    let timeout: ReturnType<typeof setTimeout>;
    
    watch(path, (eventType) => {
        if (eventType === 'change') {
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(callback, 100);
        }
    });
}

export function watchDirectory(dir: string, callback: () => void) {
    let timeout: ReturnType<typeof setTimeout>;
    
    watch(dir, { recursive: true }, (eventType, filename) => {
        if (eventType === 'change' && filename?.endsWith('.ta5bees')) {
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(callback, 100);
        }
    });
}