export async function watchFile(
    path: string,
    callback: () => void | Promise<void>
  ) {
    const watcher = Deno.watchFs(path);
    console.log(`Watching ${path} for changes...`);
    
    for await (const event of watcher) {
      if (event.kind === "modify") {
        console.log(`\nFile changed, recompiling...`);
        try {
          await callback();
        } catch (error: any) {
          console.error("Error:", error.message);
        }
      }
    }
  }

  export async function watchDirectory(
    dir: string,
    callback: () => void | Promise<void>,
    extensions = [".ta5bees"]
  ) {
    const watcher = Deno.watchFs(dir);
    const debounceTime = 100;
    let timeout: number | undefined;
  
    console.log(`Watching ${dir} for changes...`);
    
    async function handleChange(path: string) {
      if (!extensions.some(ext => path.endsWith(ext))) {
        return;
      }
  
      if (timeout) {
        clearTimeout(timeout);
      }
  
      timeout = setTimeout(async () => {
        console.log(`\nFile changed: ${path}`);
        try {
          await callback();
        } catch (error: any) {
          console.error("Error:", error.message);
        }
      }, debounceTime);
    }
  
    for await (const event of watcher) {
      if (event.kind === "modify") {
        await handleChange(event.paths[0]);
      }
    }
  }