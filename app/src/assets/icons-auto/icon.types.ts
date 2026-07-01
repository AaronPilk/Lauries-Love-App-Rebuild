import type React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export type IconType = React.SVGProps<SVGSVGElement> & {
  width?: number;
  height?: number;
  fill?: string;
  style?: StyleProp<ViewStyle>;
  fillColor?: string;
  fillColor0?: string;
  fillColor1?: string;
  fillColor2?: string;
  fillColor3?: string;
  fillColor4?: string;
  fillColor5?: string;
  fillColor6?: string;
  strokeColor?: string;
  strokeColor0?: string;
  strokeColor1?: string;
  strokeColor2?: string;
  strokeColor3?: string;
  strokeColor4?: string;
  strokeColor5?: string;
  strokeColor6?: string;
};

export type CustomAttributesType = {
  type: 'JSXAttribute';
  name: {
    type: 'JSXIdentifier';
    name:
      | 'stroke'
      | 'strokeLinecap'
      | 'strokeLinejoin'
      | 'strokeWidth'
      | 'd'
      | 'fill';
  };
  value: {
    type: 'StringLiteral';
    value: string;
  };
};

export type CustomJSXType = {
  type: 'JSXElement';
  openingElement: {
    type: 'JSXOpeningElement';
    name: {
      type: 'JSXIdentifier';
      name: string;
    };
    attributes: Array<CustomAttributesType>;
    selfClosing: boolean;
  };
  closingElement: {
    type: 'JSXClosingElement';
    name: {
      type: 'JSXIdentifier';
      name: string;
    };
  };
  children: Array<{
    type: 'JSXElement';
    openingElement: {
      type: 'JSXOpeningElement';
      name: {
        type: 'JSXIdentifier';
        name: string;
      };
      attributes: Array<CustomAttributesType>;
      selfClosing: boolean;
    };
    closingElement: null;
    children: Array<{
      type: 'JSXElement';
      openingElement: {
        type: 'JSXOpeningElement';
        name: {
          type: 'JSXIdentifier';
          name: string;
        };
        attributes: Array<CustomAttributesType>;
        selfClosing: boolean;
      };
      closingElement: null;
      children: [];
      selfClosing: null;
    }>;
    selfClosing: null;
  }>;
  selfClosing: boolean;
};
