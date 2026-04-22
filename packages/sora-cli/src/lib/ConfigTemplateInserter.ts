import yaml = require('js-yaml');

class ConfigTemplateInserter {
  static extractDefines(content: string): { defines: string[]; defineKeys: Set<string>; yamlContent: string } {
    const lines = content.split('\n');
    const defines: string[] = [];
    const yamlLines: string[] = [];
    const defineKeys = new Set<string>();

    for (const line of lines) {
      if (/^#define\(/.test(line)) {
        defines.push(line);
        const match = line.match(/^#define\(\s*(\w+)/);
        if (match) defineKeys.add(match[1]);
      } else {
        yamlLines.push(line);
      }
    }

    return {defines, defineKeys, yamlContent: yamlLines.join('\n')};
  }

  static checkDuplicate(yamlContent: string, section: string, key: string): boolean {
    const parsed = yaml.load(yamlContent) as Record<string, any>;
    if (!parsed || typeof parsed !== 'object') return false;
    const sectionData = parsed[section];
    if (!sectionData || typeof sectionData !== 'object') return false;
    return key in sectionData;
  }

  static buildServiceConfigFragment(dashName: string, listeners: string[], defineKeys?: Set<string>): string {
    if (listeners.length === 0) {
      return `${dashName}: {}`;
    }

    const keys = defineKeys ?? new Set<string>();
    const portMin = keys.has('portRangeMin') ? '$(portRangeMin)' : '8000';
    const portMax = keys.has('portRangeMax') ? '$(portRangeMax)' : '9000';
    const host = keys.has('host') ? '$(host)' : '0.0.0.0';
    const exposeHost = keys.has('exposeHost') ? '$(exposeHost)' : '127.0.0.1';

    const parts: string[] = [`${dashName}:`];

    const pushListenerBlock = (name: string, extra?: string[]) => {
      parts.push(`    ${name}:`);
      parts.push('      portRange:');
      parts.push(`        - ${portMin}`);
      parts.push(`        - ${portMax}`);
      parts.push(`      host: ${host}`);
      parts.push(`      exposeHost: ${exposeHost}`);
      if (extra) parts.push(...extra);
    };

    if (listeners.includes('tcp')) {
      pushListenerBlock('tcpListener');
    }

    if (listeners.includes('http')) {
      pushListenerBlock('httpListener');
    }

    if (listeners.includes('websocket')) {
      pushListenerBlock('websocketListener', ['      entryPath: \'/ws\'']);
    }

    return parts.join('\n');
  }

  static buildWorkerConfigFragment(dashName: string): string {
    return `${dashName}: {}`;
  }

  static insertSectionEntry(content: string, section: string, fragment: string): string {
    const lines = content.split('\n');

    const sectionLineIdx = lines.findIndex((line) => {
      const trimmed = line.trim();
      return trimmed === `${section}:` || trimmed === `${section}: {}` || trimmed === `${section}:{}`
        || trimmed.startsWith(`${section}: `) && trimmed.endsWith('{}');
    });

    if (sectionLineIdx === -1) {
      const trimmed = content.replace(/\n+$/, '');
      return `${trimmed}\n\n${section}:\n  ${fragment}\n`;
    }

    const sectionLine = lines[sectionLineIdx].trim();
    const isEmptyInline = /:\s*\{\}\s*$/.test(sectionLine);

    if (isEmptyInline) {
      const beforeInline = lines.slice(0, sectionLineIdx);
      const afterInline = lines.slice(sectionLineIdx + 1);
      return [...beforeInline, `${section}:`, `  ${fragment}`, ...afterInline].join('\n');
    }

    const beforeBlock = lines.slice(0, sectionLineIdx + 1);
    const afterBlock = lines.slice(sectionLineIdx + 1);
    return [...beforeBlock, `  ${fragment}`, ...afterBlock].join('\n');
  }

  static appendDefines(content: string, newDefines: string[]): string {
    const {defines, defineKeys, yamlContent} = ConfigTemplateInserter.extractDefines(content);

    const additionalDefines: string[] = [];
    for (const defineLine of newDefines) {
      const match = defineLine.match(/^#define\(\s*(\w+)/);
      if (match && !defineKeys.has(match[1])) {
        additionalDefines.push(defineLine);
      }
    }

    if (additionalDefines.length === 0) {
      return content;
    }

    const allDefines = [...defines, ...additionalDefines];
    const defineLines = allDefines.join('\n');
    return defineLines ? `${defineLines}\n${yamlContent}` : yamlContent;
  }

  static async appendToConfigTemplateEntry(
    templatePath: string,
    entry: { section: string; defines: string[]; content: string },
    log: (msg: string) => void
  ): Promise<void> {
    const fs = require('fs/promises');
    let content: string;
    try {
      content = await fs.readFile(templatePath, {encoding: 'utf-8'});
    } catch {
      log(`Config template not found: ${templatePath}, skipping config insertion`);
      return;
    }

    const {yamlContent} = ConfigTemplateInserter.extractDefines(content);

    if (ConfigTemplateInserter.checkDuplicate(yamlContent, entry.section, entry.content.split(':')[0].trim())) {
      log(`Warning: entry already exists in ${entry.section} section of ${templatePath}, skipping`);
      return;
    }

    const withDefines = ConfigTemplateInserter.appendDefines(content, entry.defines);
    const {yamlContent: updatedYaml} = ConfigTemplateInserter.extractDefines(withDefines);

    const newContent = ConfigTemplateInserter.insertSectionEntry(updatedYaml, entry.section, entry.content);

    const {defines: finalDefines} = ConfigTemplateInserter.extractDefines(withDefines);
    const defineLines = finalDefines.join('\n');
    const finalContent = defineLines ? `${defineLines}\n${newContent}` : newContent;

    await fs.writeFile(templatePath, finalContent, {encoding: 'utf-8'});
    log(`Config entry added to ${entry.section} in ${templatePath}`);
  }

  static async insertConfig(
    templatePath: string,
    section: 'services' | 'workers',
    dashName: string,
    listeners: string[],
    log: (msg: string) => void
  ): Promise<void> {
    const fs = require('fs/promises');
    let content: string;
    try {
      content = await fs.readFile(templatePath, {encoding: 'utf-8'});
    } catch {
      log(`Config template not found: ${templatePath}, skipping config insertion`);
      return;
    }

    const {defines, defineKeys, yamlContent} = ConfigTemplateInserter.extractDefines(content);

    if (ConfigTemplateInserter.checkDuplicate(yamlContent, section, dashName)) {
      log(`Warning: ${section}.${dashName} already exists in ${templatePath}, skipping config insertion`);
      return;
    }

    const fragment = section === 'services'
      ? ConfigTemplateInserter.buildServiceConfigFragment(dashName, listeners, defineKeys)
      : ConfigTemplateInserter.buildWorkerConfigFragment(dashName);

    const newContent = ConfigTemplateInserter.insertSectionEntry(yamlContent, section, fragment);

    const defineLines = defines.join('\n');
    const finalContent = defineLines ? `${defineLines}\n${newContent}` : newContent;

    await fs.writeFile(templatePath, finalContent, {encoding: 'utf-8'});
    log(`Config entry ${section}.${dashName} added to ${templatePath}`);
  }
}

export {ConfigTemplateInserter};
