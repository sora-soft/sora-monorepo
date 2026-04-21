import {Command, flags} from '@oclif/command';
import inquirer = require('inquirer');
import ora = require('ora');
import chalk from 'chalk';
import path = require('path');
import fs = require('fs/promises');
import pacote = require('pacote');
import libnpmconfig = require('libnpmconfig');

const templates = [
  {pkg: '@sora-soft/example-template', desc: 'Sora backend example project'},
];

export default class NewProject extends Command {
  static description = 'Create a new sora project';

  static args = [
    {name: 'name', required: true, description: 'Project name'},
    {name: 'template', required: false, description: 'npm package name of the template (e.g. @sora-soft/example-template)'},
  ];

  static flags = {
    help: flags.help({char: 'h'}),
  };

  async run() {
    const {args} = this.parse(NewProject);
    const name = args.name as string;

    const stat = await fs.stat(name).catch(err => {
      if (err.code === 'ENOENT')
        return null;
      throw err;
    });
    if (stat) {
      this.log(chalk.red(`${name} already exists!`));
      return;
    }

    let templateSpec = args.template as string | undefined;

    if (!templateSpec) {
      const choices = [
        ...templates.map(t => ({name: `${t.pkg} - ${t.desc}`, value: t.pkg})),
        {name: 'Custom (enter package name)', value: '__custom__'},
      ];

      const {selected} = await inquirer.prompt([{
        name: 'selected',
        message: 'Select a template',
        type: 'list',
        choices,
      }]);

      if (selected === '__custom__') {
        const {customPkg} = await inquirer.prompt([{
          name: 'customPkg',
          message: 'Enter npm package name (supports @scope/pkg@version):',
        }]);
        templateSpec = customPkg;
      } else {
        templateSpec = selected;
      }
    }

    const options = await inquirer
      .prompt([
        {
          name: 'projectName',
          message: 'Project name?',
          default: name,
        },
        {
          name: 'description',
          message: 'Description?',
        },
        {
          name: 'version',
          message: 'Version?',
          default: '1.0.0',
        },
        {
          name: 'author',
          message: 'Author?',
        },
        {
          name: 'license',
          message: 'License?',
          default: 'MIT',
        },
        {
          name: 'confirm',
          message: 'OK?',
          default: true,
          type: 'confirm',
        },
      ]);

    if (!options.confirm) {
      return;
    }

    const loading = ora(`Downloading ${templateSpec}`).start();
    const dir = path.join(process.cwd(), name);

    const config = libnpmconfig.read();
    const npmOpts = JSON.parse(JSON.stringify(config));

    await pacote.extract(templateSpec!, dir, npmOpts);

    loading.stop();

    const pkgPath = path.resolve(process.cwd(), name, 'package.json');
    const installedPkg = await import(pkgPath);

    installedPkg.name = options.projectName;
    installedPkg.description = options.description;
    installedPkg.version = options.version;
    installedPkg.author = options.author;
    installedPkg.license = options.license;

    delete installedPkg.repository;
    delete installedPkg.bugs;
    delete installedPkg.homepage;
    delete installedPkg.scripts.test;
    delete installedPkg.scripts.link;

    await fs.writeFile(pkgPath, JSON.stringify(installedPkg, null, 2));

    this.log(chalk.green('Project generated successfully'));
    this.log(chalk.cyan(`cd ${name} && pnpm install`));
  }
}
