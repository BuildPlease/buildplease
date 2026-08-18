import fs from 'node:fs';

import ts from 'typescript';

// MARK: - Import scanning

export interface ScannedImport {
  moduleSpecifier: string;
  kind: 'import' | 'export' | 'dynamic-import';
}

export function scanImports(filePath: string): ScannedImport[] {
  const source = ts.createSourceFile(filePath, fs.readFileSync(filePath, 'utf8'), ts.ScriptTarget.Latest, true);
  const imports: ScannedImport[] = [];

  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      imports.push({ moduleSpecifier: node.moduleSpecifier.text, kind: 'import' });
    }

    if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      imports.push({ moduleSpecifier: node.moduleSpecifier.text, kind: 'export' });
    }

    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      const [argument] = node.arguments;

      if (argument && ts.isStringLiteral(argument)) {
        imports.push({ moduleSpecifier: argument.text, kind: 'dynamic-import' });
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(source);
  return imports;
}

export function hasDefaultExport(filePath: string): boolean {
  const source = ts.createSourceFile(filePath, fs.readFileSync(filePath, 'utf8'), ts.ScriptTarget.Latest, true);
  let found = false;

  const visit = (node: ts.Node): void => {
    if (found) {
      return;
    }

    if (ts.isExportAssignment(node) && !node.isExportEquals) {
      found = true;
      return;
    }

    if (hasExportDefaultModifiers(node)) {
      found = true;
      return;
    }

    if (ts.isExportDeclaration(node) && node.exportClause && ts.isNamedExports(node.exportClause)) {
      for (const element of node.exportClause.elements) {
        const exportedName = element.name.text;
        const sourceName = element.propertyName?.text;

        if (exportedName === 'default' || sourceName === 'default') {
          found = true;
          return;
        }
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(source);
  return found;
}

// MARK: - AST scanning

function hasExportDefaultModifiers(node: ts.Node): boolean {
  const modifiers = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined;

  if (!modifiers) {
    return false;
  }

  const hasExport = modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
  const hasDefault = modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword);

  return hasExport && hasDefault;
}
