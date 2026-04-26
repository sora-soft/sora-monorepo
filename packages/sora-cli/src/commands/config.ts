import template = require('art-template');
import path = require('node:path');
import fs = require('node:fs/promises');
import fsSync = require('node:fs');
import inquirer = require('inquirer');
import os = require('node:os');

import {BaseCommand, type ConfigFieldRequirement} from '../Base';

export default class ConfigCommand extends BaseCommand {
  static description = '从模板生成配置文件';

  static flags = {
    ...BaseCommand.flags,
  };

  protected requiredConfigFields() {
    return [] as ConfigFieldRequirement[];
  }

  async run() {
    await this.loadConfig();
    await this.runAll();
  }

  private async runAll() {
    const configTemplates: Array<{type: string; path: string}> | undefined = (this.soraConfig?.sora as any)?.configTemplates;
    if (!configTemplates || !Array.isArray(configTemplates) || configTemplates.length === 0) {
      this.error('sora.json 中未找到 configTemplates 配置。请添加 configTemplates 数组，例如：[{type: "server", path: "run/config.template.yml"}]');
    }

    for (const entry of configTemplates) {
      if (!entry.path || typeof entry.path !== 'string') continue;

      if (!entry.path.includes('.template.')) {
        this.error(`模板文件路径必须包含 '.template.'：${entry.path}`);
      }

      const distRelPath = entry.path.replace('.template.', '.');
      if (distRelPath === entry.path) {
        this.error(`生成的文件名与模板文件名相同：${entry.path}`);
      }

      const templatePath = path.resolve(process.cwd(), entry.path);
      if (!fsSync.existsSync(templatePath)) {
        this.warn(`模板文件不存在: ${entry.path}，跳过`);
        continue;
      }

      const distPath = path.resolve(process.cwd(), distRelPath);

      this.log(`生成 ${entry.type} 配置: ${entry.path} -> ${distRelPath}`);
      await generateConfigFile({
        template: templatePath,
        dist: distPath,
      });
    }
  }
}

export interface IGenerateConfigFile {
  template: string;
  dist: string;
}

function buildInquirerByVars(vars: {key: string; type: string; hint: string}[]) {
  const result = [];
  for (const v of vars) {
    const [type, arg] = v.type.split(':');
    switch(type) {
      case 'password':
      case 'number': {
        result.push({
          message: v.hint,
          type: v.type,
          name: v.key,
        });
        break;
      }
      case 'select': {
        const choices = arg.slice(1, -1).split('|');
        result.push({
          message: v.hint,
          type: 'list',
          name: v.key,
          choices,
        });
        break;
      }
      case 'string': {
        result.push({
          message: v.hint,
          type: 'input',
          name: v.key,
        });
        break;
      }
      case 'host-ip': {
        const choices: any[] = ['0.0.0.0'];
        const netInfo = os.networkInterfaces();
        for(const [key, value] of Object.entries(netInfo)) {
          if (!value)
            continue;
          for (const info of value) {
            choices.push({
              name: `${info.address}(${key})`,
              value: info.address,
            });
          }
        }
        choices.push({
          name: 'other',
          value: null,
        });
        result.push({
          message: v.hint,
          type: 'list',
          name: v.key,
          choices,
        });
        result.push({
          message: v.hint,
          type: 'input',
          name: v.key,
          askAnswered: true,
          when: (input: any) => {
            return input[v.key] === null ? true : false;
          },
        });
        break;
      }
    }
  }
  return result;
}

async function generateConfigFile(options: IGenerateConfigFile) {
  let preVar = {};
  const preVarFilePath = path.join(path.dirname(options.template), '.var.json');
  try {
    const preFile = await fs.readFile(preVarFilePath, {encoding: 'utf-8'});
    preVar = JSON.parse(preFile);
  } catch(_) {}

  const templateContent = await fs.readFile(options.template, {encoding: 'utf-8'});
  const vars: {key: string; type: string; hint: string}[] = [];
  template.defaults.rules = [{
    test: /\$\(([\w\W]*?)\)/,
    use(match: string, code: string) {
      return {
        code,
        output: 'escape',
      };
    },
  }, {
    test: /\#define\(([\w\W]*?)\)(\S*?)[\r\n]/,
    use(match: string, _: string) {
      const [key, type, ...hint] = match.slice(8, match.lastIndexOf(')')).split(',');
      vars.push({key: key.trim(), type: type.trim(), hint: hint.join(',').trim()});
      return {
        code: '',
        output: false,
      };
    },
  }];

  template.render(templateContent, {});
  const data = await inquirer
    .prompt(buildInquirerByVars(vars), preVar);
  const distContent = template.render(templateContent, data);
  await fs.writeFile(preVarFilePath, JSON.stringify(data, null, 2));
  await fs.writeFile(options.dist, distContent);
}
