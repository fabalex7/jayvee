// SPDX-FileCopyrightText: 2023 Friedrich-Alexander-Universitat Erlangen-Nurnberg
//
// SPDX-License-Identifier: AGPL-3.0-only

import { Command } from 'commander';

import { processOptions } from './run';

const program = new Command();
program
  .version('0.1.0')
  .description('Generating mermaid.js code from .jv-files')
  .argument('<file>', `path to the .jv source file`)
  .option(
    '-m, --mermaid-file <file>',
    'output file name for mermaid code',
    'mermaid-code.txt',
  )
  .option(
    '-s, --style-file <file>',
    'output file name for mermaid style',
    'mermaid-style.txt',
  )
  .option(
    '-c, --composite-blocks',
    'show building blocks of composite blocks',
    false,
  )
  .option('-p, --properties', 'show properties of blocks', false)
  .action(processOptions)
  .parse(process.argv);
