import {flags} from '@oclif/command';
import path = require('path');

import {BaseCommand, type ConfigFieldRequirement} from '../../Base';
import {DiagnosticCollector} from '../../lib/DiagnosticCollector';
import {DocCollector} from '../../lib/doc/DocCollector';
import {DocTransformer} from '../../lib/doc/DocTransformer';
import {OpenApiEmitter} from '../../lib/doc/OpenApiEmitter';
import {SchemaResolver} from '../../lib/doc/SchemaResolver';
import {ProgramBuilder} from '../../lib/exporter/ProgramBuilder';

export default class ExportDoc extends BaseCommand {
  static description = 'Export OpenAPI documentation from route classes';

  static flags = {
    ...BaseCommand.flags,
    format: flags.string({
      description: 'Output format: yaml or json',
      options: ['yaml', 'json'],
      default: 'yaml',
    }),
    target: flags.string({
      multiple: true,
      description: 'Target modes to include (e.g., web, admin)',
    }),
  };

  protected requiredConfigFields(): ConfigFieldRequirement[] {
    return [
      {field: 'root'},
      {field: 'docOutput'},
    ];
  }

  async run() {
    const {flags: parsedFlags} = this.parse(ExportDoc);
    const format = (parsedFlags.format || 'yaml') as 'yaml' | 'json';
    const targets = parsedFlags.target;
    const diagnostics = new DiagnosticCollector();

    await this.loadConfig();
    this.log('Scanning source files...');

    const rootDir = this.soraConfig.soraRoot;
    const tsconfigPath = path.resolve(process.cwd(), 'tsconfig.json');

    const builder = new ProgramBuilder(rootDir, tsconfigPath, diagnostics);
    const program = builder.build();

    this.log('Collecting route classes...');

    const docCollector = new DocCollector();
    const fullPlan = docCollector.collect(program);
    const filteredPlan = docCollector.filterByTarget(fullPlan, targets);

    this.log(`Found ${filteredPlan.routes.length} route class(es)`);

    const checker = program.getTypeChecker();
    const resolver = new SchemaResolver(checker, diagnostics);

    const transformer = new DocTransformer(diagnostics);
    const result = transformer.transform(program, filteredPlan.routes, targets, resolver);

    const docOutput = this.soraConfig.sora.docOutput;

    const absoluteOutputPath = path.resolve(this.soraConfig.soraRoot, docOutput!);

    const emitter = new OpenApiEmitter(absoluteOutputPath, process.cwd(), diagnostics);
    emitter.emit(result.pathItems, resolver, program, filteredPlan.routes, targets, format);

    const ext = format === 'yaml' ? '.yml' : '.json';
    this.log(`Exported OpenAPI documentation: ${absoluteOutputPath}${ext}`);
    this.log(`Total paths: ${result.pathItems.length}`);

    diagnostics.reportTo(this.log.bind(this), this.warn.bind(this));
  }
}
