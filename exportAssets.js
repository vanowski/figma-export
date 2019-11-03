import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as yrags from "yargs";
import * as Figma from 'figma-api';
import {formatVariable} from './utils';
import FigmaWalker from './figmaWalker';

const argv = yrags.argv;

function createColorsVariables(vars, fileNamePath) {
  let varsKeys = Object.keys(vars.fills);

  varsKeys.forEach(varsKey => {
    const variable = formatVariable(varsKey);
    const value = `${variable}: ${vars.fills[varsKey]};\n`;

    fs.appendFile(fileNamePath, value, (err) => {
      if (err) {
        throw err;
      }
    });
  });
}

function createTypographyMixins(vars, fileNamePath) {
  const textVars = Object.keys(vars.textStyles);

  textVars.forEach(textKey => {
    const mixinName = textKey.replace(/[^A-Za-z0-9\-]/g, '');
    const value = `@mixin ${mixinName} {\n`;

    fs.appendFileSync(fileNamePath, value);

    const rules = Object.keys(vars.textStyles[textKey]);

    rules.forEach(cssRule => {
      let cssRuleValue = vars.textStyles[textKey][cssRule];

      if (cssRule === 'font-family') {
        cssRuleValue = `\'${cssRuleValue}\'`;
      }

      const val = `\t${cssRule}: ${cssRuleValue};\n`;

      fs.appendFileSync(fileNamePath, val);
    });

    fs.appendFileSync(fileNamePath, '}\n');
  });
}

export default async function exportAssets({exportBlocks = false, exportVariables = true}) {
  dotenv.config();

  const apiToken = process.env.DEV_TOKEN;
  const fileId = argv.fileId;

  if (!apiToken) {
    console.error('Please add personal access token in .env file');
    process.exit(0);
  }

  if (!fileId) {
    console.error('Please provide fileId');
    process.exit(0);
  }

  const api = new Figma.Api({
    personalAccessToken: apiToken,
  });

  try {
    console.log('Fetching project file');

    const [err, file] = await api.getFile(fileId);

    if (file) {
      console.log('Project file fetched');

      const path = 'styles/';

      let figmaWalker = new FigmaWalker(file, {autoBlocks: argv.autoBlocks, entryPoint: argv.entryPoint});

      console.log('Parsing document tree');

      figmaWalker.analyze();

      if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
      }

      const generateMixins = (style) => {
        if (style.type === 'text') {
          return '@include ' + style.name.replace(/[^A-Za-z0-9\-]/g, '') + '();'
        } else if (style.type === 'fill') {
          return 'color: ' + formatVariable(style.name) + ';';
        }
      };

      if (exportBlocks) {
        Object.entries(figmaWalker.blocks).map(([blockName, {styles, elements}]) => {
          const filePath = `${path}${blockName}.scss`;
          const fileContents =
            `.${blockName} {\n
          ${styles.map(generateMixins).join('\n')}
          \n
          ${elements.map((element) => (
              '  .' + element.className + ' {\n' + element.styles.map(generateMixins).join('\n') + '\n\}'
            )).join('\n\n')
              }\n}\n`;

          fs.writeFile(filePath, fileContents, function(err) {
            if (err) {
              console.error(err);
            }

            console.log(`Created ${filePath}`);
          });
        });
      }

      if (exportVariables) {
        console.log('Generating color variables & typography mixins');

        const colorsFilePath = `${path}colors.scss`;
        const typograpyFilePath = `${path}typography.scss`;

        fs.writeFileSync(`${colorsFilePath}`, '');
        fs.writeFileSync(`${typograpyFilePath}`, '');

        createColorsVariables(figmaWalker.vars, `${colorsFilePath}`);
        createTypographyMixins(figmaWalker.vars, `${typograpyFilePath}`);
      }
    }

    if (err) {
      console.error(err);
    }
  } catch (e) {
    console.error(e);
  }
}

