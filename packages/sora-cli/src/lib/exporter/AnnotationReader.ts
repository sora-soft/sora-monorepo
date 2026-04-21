import * as ts from 'typescript';

import {type DiagnosticCollector, formatNodeLocation} from '../DiagnosticCollector';

export interface AnnotationInfo {
  type?: 'route' | 'entity';
  modes: string[];
}

const knownSoraTags = new Set(['soraExport', 'soraTargets', 'soraIgnore', 'soraPrefix']);

function getNodeTags(node: ts.Node): ts.JSDocTag[] {
  const jsDocs = (node as any).jsDoc as Array<{ tags?: ts.JSDocTag[] }> | undefined;
  if (!jsDocs) return [];

  const result: ts.JSDocTag[] = [];
  for (const jsDoc of jsDocs) {
    if (jsDoc.tags) {
      result.push(...jsDoc.tags);
    }
  }
  return result;
}

function getTagName(tag: ts.JSDocTag): string {
  return tag.tagName.text;
}

class AnnotationReader {
  static readPrefix(node: ts.Node): string[] | null {
    const tags = getNodeTags(node);
    for (const tag of tags) {
      if (getTagName(tag) === 'soraPrefix') {
        const comment = AnnotationReader.extractTagComment(tag);
        return comment.split(',').map(s => s.trim()).filter(s => s.length > 0);
      }
    }
    return null;
  }

  static readHttpMethod(node: ts.Node): string | null {
    const tags = getNodeTags(node);
    for (const tag of tags) {
      if (getTagName(tag) === 'method') {
        return AnnotationReader.extractTagComment(tag).trim();
      }
    }
    return null;
  }

  static readDeclaration(node: ts.Node, sourceFile?: ts.SourceFile, diagnostics?: DiagnosticCollector): AnnotationInfo | null {
    const tags = getNodeTags(node);

    AnnotationReader.detectUnknownTags(node, tags, sourceFile, diagnostics);

    const soraExportTags = tags.filter(tag => {
      return getTagName(tag) === 'soraExport';
    });

    if (soraExportTags.length === 0) return null;

    const declName = AnnotationReader.getDeclarationName(node);
    const location = sourceFile ? formatNodeLocation(node, sourceFile) : '<unknown>';

    if (ts.isClassDeclaration(node) && !node.name) {
      const err = `@soraExport cannot be used on anonymous class in ${location}. Please give the class a name.`;
      throw new Error(err);
    }

    if (soraExportTags.length > 1) {
      const err = `Multiple @soraExport annotations on '${declName}' in ${location}. Only one @soraExport is allowed per declaration.`;
      throw new Error(err);
    }

    const exportTag = soraExportTags[0];
    const comment = AnnotationReader.extractTagComment(exportTag);
    const trimmed = comment.trim();

    let type: 'route' | 'entity' | undefined;
    if (trimmed === 'route') {
      type = 'route';
    } else if (trimmed === 'entity') {
      type = 'entity';
    } else if (trimmed !== '') {
      const err = `Invalid @soraExport value '${trimmed}' on '${declName}' in ${location}. Valid values: 'route', 'entity', or leave empty for simple export.`;
      throw new Error(err);
    }

    const modes = AnnotationReader.readModes(tags, node, sourceFile, diagnostics);

    return {type, modes};
  }

  static readMemberIgnore(node: ts.Node, sourceFile?: ts.SourceFile, diagnostics?: DiagnosticCollector): string[] | null {
    const tags = getNodeTags(node);
    const ignoreTags = tags.filter(tag => {
      return getTagName(tag) === 'soraIgnore';
    });

    if (ignoreTags.length === 0) return null;

    const comment = AnnotationReader.extractTagComment(ignoreTags[0]);
    if (!comment.trim() && diagnostics && sourceFile) {
      const memberName = AnnotationReader.getDeclarationName(node);
      diagnostics.addWarning(
        `@soraIgnore on '${memberName}' in ${formatNodeLocation(node, sourceFile)} has no target specified. The member will be excluded from all targets.`
      );
    }
    return comment.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }

  static readModes(tags: readonly ts.JSDocTag[], node?: ts.Node, sourceFile?: ts.SourceFile, diagnostics?: DiagnosticCollector): string[] {
    for (const tag of tags) {
      if (getTagName(tag) === 'soraTargets') {
        const comment = AnnotationReader.extractTagComment(tag);
        if (!comment.trim() && diagnostics && node && sourceFile) {
          const declName = AnnotationReader.getDeclarationName(node);
          diagnostics.addWarning(
            `@soraTargets on '${declName}' in ${formatNodeLocation(node, sourceFile)} has no value. The declaration will be included in all targets. Did you mean to specify target names like @soraTargets web,admin?`
          );
        }
        return comment.split(',').map(s => s.trim()).filter(s => s.length > 0);
      }
    }
    return [];
  }

  static extractTagComment(tag: ts.JSDocTag): string {
    if (typeof tag.comment === 'string') {
      return tag.comment;
    }

    if (Array.isArray(tag.comment)) {
      return tag.comment
        .map(part => {
          if (typeof part === 'string') return part;
          if (part.text) return part.text;
          return '';
        })
        .join('')
        .trim();
    }

    return '';
  }

  private static detectUnknownTags(node: ts.Node, tags: ts.JSDocTag[], sourceFile: ts.SourceFile | undefined, diagnostics: DiagnosticCollector | undefined) {
    if (!diagnostics || !sourceFile) return;

    for (const tag of tags) {
      const name = getTagName(tag);
      if (name.startsWith('sora') && !knownSoraTags.has(name)) {
        const declName = AnnotationReader.getDeclarationName(node);
        diagnostics.addWarning(
          `Unknown annotation '@${name}' on '${declName}' in ${formatNodeLocation(node, sourceFile)}. Known annotations: @soraExport, @soraTargets, @soraIgnore, @soraPrefix`
        );
      }
    }
  }

  private static getDeclarationName(node: ts.Node): string {
    if (ts.isClassDeclaration(node) && node.name) return node.name.text;
    if (ts.isEnumDeclaration(node)) return node.name.text;
    if (ts.isInterfaceDeclaration(node)) return node.name.text;
    if (ts.isTypeAliasDeclaration(node)) return node.name.text;
    if (ts.isMethodDeclaration(node) && node.name) return node.name.getText();
    if (ts.isPropertyDeclaration(node) && node.name) return node.name.getText();
    return '<unknown>';
  }
}

export {AnnotationReader};
