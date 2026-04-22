import {Args} from '@oclif/core';
import inquirer = require('inquirer');
import path = require('path');
import {exec} from 'child_process';
import {promises as fs} from 'fs';

import {BaseCommand, type ConfigFieldRequirement} from '../../Base';
import {type ComponentInstallContext, type ComponentInstallScript, type SoraComponentManifest} from '../../lib/ComponentInstallerTypes';
import {InstallHelpersImpl} from '../../lib/InstallHelpers';

export default class AddComponent extends BaseCommand {
  static description = 'Add a component package to the project';

  static args = {
    package: Args.string({description: 'Component package name (e.g., @sora-soft/database-component)'}),
  };

  protected requiredConfigFields(): ConfigFieldRequirement[] {
    return [
      {field: 'root'},
      {field: 'componentNameEnum', format: 'path#name'},
      {field: 'comClass', format: 'path#name'},
    ];
  }

  async run() {
    const {args} = await this.parse(AddComponent);

    let packageName: string | undefined = args.package as string | undefined;
    if (!packageName) {
      const pkgAnswer = await inquirer.prompt<{package: string}>([
        {name: 'package', message: 'Component package name?'},
      ]);
      packageName = pkgAnswer.package;
    }

    await this.loadConfig();

    // TODO: Support pnpm add
    // this.log(`Installing ${packageName}...`);
    // await this.execCommand(`npm install --save ${packageName}`);
    // this.log(`${packageName} installed`);

    const packageRoot = await this.resolvePackageRoot(packageName);

    const manifest = await this.loadManifest(packageRoot, packageName);

    const installScript = await this.loadInstallScript(path.resolve(packageRoot, manifest.installScript));

    const packageVersion = await this.getPackageVersion(packageRoot);

    const ctx: ComponentInstallContext = {
      projectRoot: process.cwd(),
      soraRoot: this.soraConfig.soraRoot,
      soraConfig: this.soraConfig.sora,
      packageVersion,
      packageName,
    };

    await this.checkDuplicateInstall(packageName);

    const questions = await installScript.prepare(ctx);
    const answers: Record<string, any> = {};
    if (questions.length > 0) {
      const inquirerQuestions = questions.map(q => ({
        ...q,
        type: q.type === 'select' ? 'list' : q.type,
      }));
      const responses = await inquirer.prompt(inquirerQuestions);
      Object.assign(answers, responses);
    }

    const helpers = new InstallHelpersImpl(
      this.fileTree,
      this.soraConfig,
      (msg) => this.log(msg),
      (msg) => this.warn(msg)
    );

    try {
      await installScript.action(answers, ctx, helpers);
      await this.fileTree.commit();
      this.printSummary();
      this.log(`\nComponent ${packageName} added successfully`);
    } catch (err: any) {
      this.error(`Install script failed: ${err.message}\nAll file operations have been rolled back.`);
    }
  }

  private async execCommand(command: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(command, {cwd: process.cwd()}, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Command failed: ${command}\n${stderr || error.message}`));
          return;
        }
        resolve();
      });
    });
  }

  private async resolvePackageRoot(packageName: string): Promise<string> {
    const cwd = process.cwd();
    const candidates = [
      path.join(cwd, 'node_modules', packageName),
      path.join(cwd, 'node_modules', '.pnpm', `${packageName}@*`, 'node_modules', packageName),
    ];

    for (const candidate of candidates) {
      try {
        await fs.access(candidate);
        return candidate;
      } catch {
        // Try next
      }
    }

    // Fallback: use require.resolve
    try {
      const resolved = require.resolve(`${packageName}/package.json`, {paths: [cwd]});
      return path.dirname(resolved);
    } catch {
      throw new Error(`Cannot locate package root for '${packageName}'. Ensure it was installed correctly.`);
    }
  }

  private async loadManifest(packageRoot: string, packageName: string): Promise<SoraComponentManifest> {
    const manifestPath = path.join(packageRoot, 'sora-component.json');
    try {
      const content = await fs.readFile(manifestPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      throw new Error(`Package '${packageName}' does not contain sora-component.json`);
    }
  }

  private async loadInstallScript(scriptPath: string): Promise<ComponentInstallScript> {
    try {
      await fs.access(scriptPath);
    } catch {
      this.error(`Install script not found: ${scriptPath}`);
    }

    let module: any;
    try {
      module = await import(scriptPath);
    } catch (err: any) {
      this.error(`Failed to load install script: ${err.message}`);
    }

    if (!module.prepare || typeof module.prepare !== 'function') {
      this.error(`Install script must export a 'prepare' function: ${scriptPath}`);
    }
    if (!module.action || typeof module.action !== 'function') {
      this.error(`Install script must export an 'action' function: ${scriptPath}`);
    }
    return module as ComponentInstallScript;
  }

  private async getPackageVersion(packageRoot: string): Promise<string> {
    try {
      const pkg = await fs.readFile(path.join(packageRoot, 'package.json'), 'utf-8');
      return JSON.parse(pkg).version || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  private async checkDuplicateInstall(packageName: string): Promise<void> {
    const [comFilePath] = this.soraConfig.sora.comClass.split('#');
    const comFileExtPath = comFilePath + '.ts';
    const comFile = this.fileTree.getFile(comFileExtPath);
    if (!comFile) return;

    await (comFile as any).load();
    const content = (comFile as any).getContent() as string;
    if (content.includes(`'${packageName}'`) || content.includes(`"${packageName}"`)) {
      this.error(`Package '${packageName}' is already installed in this project.`);
    }
  }

  private printSummary(): void {
    const changes = this.fileTree.changes;
    if (changes.size === 0) return;

    this.log('\nChanges:');
    for (const file of changes) {
      const status = 'A';
      const relativePath = file.path;
      const content = (file as any).getContent?.();
      let lineCount = 0;
      if (typeof content === 'string') {
        lineCount = content.split('\n').length;
      } else if (Buffer.isBuffer(content)) {
        lineCount = content.toString().split('\n').length;
      }
      this.log(` ${status}  ${relativePath}${lineCount > 0 ? ` (+${lineCount})` : ''}`);
    }
  }
}
