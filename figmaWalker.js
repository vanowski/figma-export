import {createClassName, formatToCSS, getColorValue, camelCaseToDash} from './utils';

const nodeTypes = new Map([
  ['[E]', 'element'],
  ['[B]', 'block'],
  ['[X]', 'entry']
]);

export default class FigmaWalker {
  constructor(file, settings = {autoBlocks: false, entryPoint: false}) {
    this.document = file.document;
    this.blocks = [];
    this.vars = {fills: {}, textStyles: {}};
    this.styles = file.styles;
    this.settings = settings;
  }

  getNodeType(node) {
    if (Boolean(this.settings.autoBlocks) && (node.type === 'COMPONENT' || node.type === 'FRAME')) {
      return 'block';
    } else {
      return nodeTypes.get(node.name.substring(0, 3));
    }
  }

  analyze() {
    if (this.document) {
      const entryPoint = this.settings.entryPoint
        ? this.document.children.find(node => this.getNodeType(node) === 'entry')
        : this.document;

      this.walkFigmaTree(entryPoint);
    }
  }

  walkFigmaTree(node) {
    if (!node) {
      return;
    }

    const nodeType = this.getNodeType(node);

    if (nodeType && nodeType === 'block') {
      const blockName = createClassName(node.name);

      let block = {
        elements: [],
        styles: []
      };

      this.findElements(node.children, blockName, block.elements);
      this.findStyles(node.children, block.styles);

      this.blocks[blockName] = block;
    }

    if (node.styles && node.fills) {
      const fills = node.fills;
      const style = node.style;

      if (fills && fills.length) {
        fills.forEach(fill => {
          if (!fill.color) {
            return;
          }

          if (fill.opacity) {
            fill.color.a = Math.round(fill.opacity * 100) / 100;
          }

          const rgbaColor = getColorValue(fill.color);
          const styleKeys = Object.keys(node.styles);

          styleKeys.forEach((styleType) => {
            const styleRef = this.styles[node.styles[styleType]];

            if (styleRef && styleType === 'fill') {
              this.vars.fills[styleRef.name] = rgbaColor;
            }

            if (styleType === 'text') {
              if (style) {
                const textKey = camelCaseToDash(styleRef.name);

                this.vars.textStyles[textKey] = formatToCSS(style);
              }
            }
          });
        });
      }
    }

    if (!node.children) {
      return;
    }

    node.children.forEach((childNode) => this.walkFigmaTree(childNode));
  }

  findElements(nodes, blockName, elements) {
    if (nodes) {
      nodes.forEach((node) => {
        if (this.getNodeType(node) === 'element') {
          const elementName = createClassName(node.name);
          let styles = [];

          this.findStyles(node.children, styles);

          elements.push({
            className: `${blockName}__${elementName}`,
            styles
          });

          if (!node.children) {
            return;
          }
        }

        this.findElements(node.children, blockName, elements);
      });
    }
  }

  findStyles(nodes, styles) {
    if (nodes) {
      nodes.forEach((node) => {
        if (node.styles) {
          const styleKeys = Object.keys(node.styles);

          styleKeys.forEach((styleType) => {
            const styleRef = this.styles[node.styles[styleType]];

            if (styles.findIndex(i => i.name === styleRef.name) === -1) {
              styles.push({
                name: styleRef.name,
                type: styleType,
              });
            }
          });

          if (!node.children) {
            return;
          }
        }

        this.findStyles(node.children, styles);
      });
    }
  }
}
