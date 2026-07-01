const updateAttributes = (attr, listColors = []) => {
  if (['fill', 'stroke'].includes(attr.name.name))
    return {
      ...attr,
      value: {
        type: 'JSXExpressionContainer',
        expression: {
          type: 'ConditionalExpression',
          test: {
            type: 'LogicalExpression',
            operator: '||',
            left: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'props' },
              property: {
                type: 'Identifier',
                name: `${attr.name.name}Color${
                  listColors.length <= 1
                    ? ''
                    : listColors.indexOf(attr.value.value) >= 0
                    ? listColors.indexOf(attr.value.value)
                    : ''
                }`,
              },
            },
            right: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'props' },
              property: { type: 'Identifier', name: attr.name.name },
            },
          },
          consequent: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'props' },
            property: {
              type: 'Identifier',
              name: `${attr.name.name}`,
            },
          },
          alternate: attr.value,
        },
      },
    };

  if (attr.name.name === 'strokeWidth')
    return {
      ...attr,
      value: {
        type: 'JSXExpressionContainer',
        expression: {
          type: 'LogicalExpression',
          operator: '||',
          left: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'props' },
            property: {
              type: 'Identifier',
              name: 'strokeWidth',
            },
          },
          right: {
            type: 'StringLiteral',
            value: attr.value.expression.value || 2,
          },
        },
      },
    };

  return attr;
};

const updateJSX = (jsx, _componentName) => {
  const listColors = jsx.children.reduce((acc, child) => {
    const listColorsChild = child.openingElement.attributes.reduce(
      (acc, attr) => {
        if (
          ['fill', 'stroke'].includes(attr.name.name) &&
          acc.indexOf(attr.value.value) === -1
        )
          return [...acc, attr.value.value];

        return acc;
      },
      [],
    );
    const listColorsChildFiltered = listColorsChild.filter(
      color => acc.includes(color) === false,
    );
    return [...acc, ...listColorsChildFiltered];
  }, []);
  const children = jsx.children.map(child => {
    const UpdateAttributes = child.openingElement.attributes.map(attr =>
      updateAttributes(attr, listColors),
    );
    const UpdateChildren = child.children.map(child => {
      const UpdateAttributes = child.openingElement.attributes.map(attr =>
        updateAttributes(attr, listColors),
      );
      return {
        ...child,
        openingElement: {
          ...child.openingElement,
          attributes: UpdateAttributes,
        },
      };
    });

    return {
      ...child,
      openingElement: {
        ...child.openingElement,
        attributes: UpdateAttributes,
      },
      children: UpdateChildren,
    };
  });
  return {
    ...jsx,
    children,
  };
};

const template = (
  { imports, interfaces, componentName, props, jsx, exports },
  { tpl },
) => {
  return tpl`
import React from "react";
import { IconType } from '../icon.types';
import {
  Svg,
  Path,
  G,
  Defs,
  Polygon,
  Ellipse,
  Circle,
  Mask,
  Text,
  Stop,
  LinearGradient,
  ClipPath,
  RadialGradient,
  Rect
} from "react-native-svg";
${'\n'}
const ${componentName} = (originalProps: IconType) => {
  const { ...props } = originalProps;
  ${'\n'}
  return ${updateJSX(jsx, componentName)};
};
${'\n'}
export default ${componentName};
`;
};

export default template;
