#!/usr/bin/env node
import { Command } from 'commander';
import { version } from "./version.js";
import { compile } from "./commands/compile.js";
import { run } from "./commands/run.js";
import { secret } from "./commands/secret.js"
import process from 'node:process';

const program = new Command();

program
  .version(`Ta5beesScript v${version}\n`)
  .description('Ta5beesScript CLI\nMade by Hamza Luay Ashraf Kurdi, 2024.\n');

program
  .command('compile')
  .description('Compile a .ta5bees file to JavaScript')
  .argument('<file>', 'Input file')
  .option('-o, --out <file>', 'Output file')
  .option('-w, --watch', 'Watch for file changes')
  .action(async (file, options) => {
    try {
      await compile(file, options.out, options.watch);
    } catch (error: any) {
      console.error("Error:", error.message);
      process.exit(1);
    }
  });

program
  .command('run')
  .description('Run a .ta5bees file directly')
  .argument('<file>', 'Input file')
  .option('-w, --watch', 'Watch for file changes')
  .action(async (file, options) => {
    try {
      await run(file, options.watch);
    } catch (error: any) {
      console.error("Error:", error.message);
      process.exit(1);
    }
  });

program
  .command('secret', { hidden: true })
  .description('You were not supposed to find this...')
  .action(() => {
    console.log(`Ta5beesScript v${version}\n${secret}`);
  });

program.parse(process.argv);


