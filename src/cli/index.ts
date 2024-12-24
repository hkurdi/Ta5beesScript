import * as mod from "https://deno.land/std@0.224.0/flags/mod.ts";
import { version } from "./version.ts";
import { compile } from "./commands/compile.ts";
import { run } from "./commands/run.ts";
import { secret } from "./commands/secret.ts"

const HELP_TEXT = `
Ta5beesScript CLI v${version}

USAGE:
  ta5bees <command> [options] <file>

COMMANDS:
  compile   Compile a .ta5bees file to JavaScript
  run       Run a .ta5bees file directly
  help      Show this help message

OPTIONS:
  --out     Output file (for compile command)
  --watch   Watch for file changes
  --version Show version number
`;

async function main() {
  const args = mod.parse(Deno.args);
  const command = args._[0] as string;

  if (args.version) {
    console.log(`Ta5beesScript v${version}`);
    Deno.exit(0);
  }

  if (args.secret) {
    console.log(`Ta5beesScript v${version}\n${secret}`);
    Deno.exit(0);
  }

  if (!command || command === "help") {
    console.log(HELP_TEXT);
    Deno.exit(0);
  }

  const inputFile = args._[1] as string;
  if (!inputFile) {
    console.error("Error: No input file specified");
    Deno.exit(1);
  }

  try {
    switch (command) {
      case "compile":
        await compile(inputFile, args.out, args.watch);
        break;
      case "run":
        await run(inputFile, args.watch);
        break;
      default:
        console.error(`Unknown command: ${command}`);
        console.log(HELP_TEXT);
        Deno.exit(1);
    }
  } catch (error: any) {
    console.error("Error:", error.message);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  main();
}