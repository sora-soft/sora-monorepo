import * as ts from 'typescript';

const SORA_TAGS = new Set(['soraExport', 'soraTargets', 'soraIgnore']);

export function stripSoraTagsFromComment(commentText: string): string {
  const lines = commentText.split('\n');
  const filtered = lines.filter(line => {
    let trimmed = line.trim();
    if (trimmed.startsWith('* ')) {
      trimmed = trimmed.slice(2).trim();
    } else if (trimmed === '*') {
      trimmed = '';
    }
    for (const tag of SORA_TAGS) {
      if (trimmed === `@${tag}` || trimmed.startsWith(`@${tag} `)) {
        return false;
      }
    }
    return true;
  });
  return filtered.join('\n').trim();
}

function processJsDocComment(commentText: string): string | null {
  const cleaned = stripSoraTagsFromComment(commentText);
  if (!cleaned) return null;

  const innerContent = cleaned
    .replace(/^\/\*\*?/, '')
    .replace(/\*\/$/, '')
    .replace(/\*/g, '')
    .trim();
  if (!innerContent) return null;

  let content = cleaned;
  if (content.startsWith('/*')) {
    content = content.slice(2);
  }
  if (content.endsWith('*/')) {
    content = content.slice(0, -2);
  }
  return content;
}

export function transferJSDoc(sourceNode: ts.Node, targetNode: ts.Node, sourceFile: ts.SourceFile): ts.Node {
  let result = targetNode;

  const commentRanges = ts.getLeadingCommentRanges(sourceFile.text, sourceNode.pos);

  if (commentRanges && commentRanges.length > 0) {
    (result as any).jsDoc = undefined;
    ts.setTextRange(result, {pos: -1, end: -1});

    for (let i = commentRanges.length - 1; i >= 0; i--) {
      const range = commentRanges[i];
      const commentText = sourceFile.text.substring(range.pos, range.end);

      if (commentText.startsWith('/**')) {
        const content = processJsDocComment(commentText);
        if (!content) continue;
        result = ts.addSyntheticLeadingComment(
          result,
          ts.SyntaxKind.MultiLineCommentTrivia,
          content,
          true
        );
      } else if (range.kind === ts.SyntaxKind.SingleLineCommentTrivia) {
        const content = commentText.replace(/^\/\/\s?/, '');
        result = ts.addSyntheticLeadingComment(
          result,
          ts.SyntaxKind.SingleLineCommentTrivia,
          content,
          range.hasTrailingNewLine ?? true
        );
      } else {
        let content = commentText;
        if (content.startsWith('/*')) {
          content = content.slice(2);
        }
        if (content.endsWith('*/')) {
          content = content.slice(0, -2);
        }
        result = ts.addSyntheticLeadingComment(
          result,
          ts.SyntaxKind.MultiLineCommentTrivia,
          content,
          range.hasTrailingNewLine ?? true
        );
      }
    }

    return result;
  }

  const jsDocs: ts.JSDoc[] | undefined = (sourceNode as any).jsDoc;
  if (!jsDocs || jsDocs.length === 0) return targetNode;

  (result as any).jsDoc = undefined;
  ts.setTextRange(result, {pos: -1, end: -1});

  for (const jsDoc of jsDocs) {
    const rawText = sourceFile.text.substring(jsDoc.pos, jsDoc.end).trim();
    const content = processJsDocComment(rawText);
    if (!content) continue;

    result = ts.addSyntheticLeadingComment(
      result,
      ts.SyntaxKind.MultiLineCommentTrivia,
      content,
      true
    );
  }

  return result;
}
