import {Args, Command, Flags} from '@oclif/core';
import inquirer = require('inquirer');
import ora = require('ora');
import chalk from 'chalk';
import path = require('path');
import fs = require('fs/promises');
import pacote = require('pacote');

const templates = [
  {pkg: '@sora-soft/http-server-template', desc: '单进程简单 HTTP 服务器'},
  {pkg: '@sora-soft/base-cluster-template', desc: '带网关与业务服务的通用集群模板'},
  {pkg: '@sora-soft/account-cluster-template', desc: '带完整网关与账号登录功能的集群模板项目'},
];

export default class NewProject extends Command {
  static description = '创建新的 sora 项目';

  static args = {
    name: Args.string({required: true, description: 'Project name'}),
    template: Args.string({required: false, description: 'npm package name of the template (e.g. @sora-soft/example-template)'}),
  };

  static flags = {
    help: Flags.help({char: 'h'}),
    registry: Flags.string({description: 'npm registry URL'}),
    token: Flags.string({description: 'auth token for private registry'}),
  };

  async run() {
    const {args, flags} = await this.parse(NewProject);
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

    const pacoteOpts: Record<string, unknown> = {};
    if (flags.registry) pacoteOpts.registry = flags.registry;
    if (flags.token) pacoteOpts.token = flags.token;

    await pacote.extract(templateSpec!, dir, pacoteOpts);

    loading.stop();

    const pkgPath = path.resolve(process.cwd(), name, 'package.json');
    const installedPkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'));

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
    this.log(chalk.cyan(`cd ${name} && npm install`));
  }
}
