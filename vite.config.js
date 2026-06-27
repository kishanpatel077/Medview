import { transformAsync } from '@babel/core';
import { defineConfig } from 'vite';

function jsxToReactCreateElement({ types: t }) {
  function tagName(node, inMemberExpression = false) {
    if (t.isJSXIdentifier(node)) {
      const name = node.name;
      return !inMemberExpression && /^[a-z]/.test(name) ? t.stringLiteral(name) : t.identifier(name);
    }

    if (t.isJSXMemberExpression(node)) {
      return t.memberExpression(tagName(node.object, true), tagName(node.property, true));
    }

    return t.stringLiteral(node.name?.name || 'div');
  }

  function attributeName(node) {
    return t.isJSXIdentifier(node.name) ? node.name.name : `${node.name.namespace.name}:${node.name.name.name}`;
  }

  function attributeValue(value) {
    if (!value) return t.booleanLiteral(true);
    if (t.isStringLiteral(value)) return value;
    if (t.isJSXExpressionContainer(value)) return value.expression || t.booleanLiteral(true);
    return value;
  }

  function propsExpression(attributes) {
    if (!attributes.length) return t.nullLiteral();

    const properties = attributes.map((attribute) => {
      if (t.isJSXSpreadAttribute(attribute)) return t.spreadElement(attribute.argument);
      const name = attributeName(attribute);
      const key = /^[A-Za-z_$][\w$]*$/.test(name) ? t.identifier(name) : t.stringLiteral(name);

      return t.objectProperty(key, attributeValue(attribute.value));
    });

    return t.objectExpression(properties);
  }

  function normalizeText(value) {
    return value
      .split(/\r?\n/)
      .map((line) => line.replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .join(' ');
  }

  function childExpression(child) {
    if (t.isJSXText(child)) {
      const text = normalizeText(child.value);
      return text ? t.stringLiteral(text) : null;
    }

    if (t.isJSXExpressionContainer(child)) {
      return t.isJSXEmptyExpression(child.expression) ? null : child.expression;
    }

    return child;
  }

  return {
    visitor: {
      Program: {
        enter(path, state) {
          state.hasJsx = false;
          state.hasReactImport = path.node.body.some(
            (node) =>
              t.isImportDeclaration(node) &&
              node.source.value === 'react' &&
              node.specifiers.some((specifier) => t.isImportDefaultSpecifier(specifier)),
          );
        },
        exit(path, state) {
          if (!state.hasJsx || state.hasReactImport) return;

          path.unshiftContainer(
            'body',
            t.importDeclaration([t.importDefaultSpecifier(t.identifier('React'))], t.stringLiteral('react')),
          );
        },
      },
      JSXFragment: {
        exit(path, state) {
          state.hasJsx = true;
          const children = path.node.children.map(childExpression).filter(Boolean);
          path.replaceWith(
            t.callExpression(t.memberExpression(t.identifier('React'), t.identifier('createElement')), [
              t.memberExpression(t.identifier('React'), t.identifier('Fragment')),
              t.nullLiteral(),
              ...children,
            ]),
          );
        },
      },
      JSXElement: {
        exit(path, state) {
          state.hasJsx = true;
          const opening = path.node.openingElement;
          const children = path.node.children.map(childExpression).filter(Boolean);

          path.replaceWith(
            t.callExpression(t.memberExpression(t.identifier('React'), t.identifier('createElement')), [
              tagName(opening.name),
              propsExpression(opening.attributes),
              ...children,
            ]),
          );
        },
      },
    },
  };
}

function reactJsxNoSpawn() {
  return {
    name: 'react-jsx-no-spawn',
    async transform(code, id) {
      const [filepath] = id.split('?');
      if (!/\.[jt]sx$/.test(filepath)) return null;

      const result = await transformAsync(code, {
        babelrc: false,
        configFile: false,
        filename: filepath,
        parserOpts: {
          plugins: ['jsx'],
        },
        plugins: [jsxToReactCreateElement],
        sourceMaps: true,
      });

      return {
        code: result.code,
        map: result.map,
      };
    },
  };
}

export default defineConfig({
  build: {
    minify: false,
  },
  esbuild: false,
  plugins: [reactJsxNoSpawn()],
  resolve: {
    preserveSymlinks: true,
  },
});
