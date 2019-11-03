const remBase = 16;

export function camelCaseToDash(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export function createClassName(str) {
  return camelCaseToDash(str.replace(/^\[.+]/g, '')).trim();
}

export function formatVariable(variable) {
  let res = variable
  .replace(/([a-zA-Z0-9\-\s]+\/)+([a-zA-Z0-9\-\s])/g, '$2')
  .replace(/\([a-zA-Z0-9]+\)/g, '')
  .replace(/[^A-Za-z0-9\-]/g, '');

  res = camelCaseToDash(res.replace(/[\.\s]/g, '-'));

  return '$' + res;
}

export function formatToCSS(style) {
  const keys = Object.keys(style);
  const mapRule = {
    'fontFamily': 'font-family',
    'fontWeight': 'font-weight',
    'fontSize': 'font-size',
    'lineHeightPx': 'line-height',
  };
  const rules = {};

  keys.forEach(key => {
    if (mapRule[key]) {
      let value = style[key];

      if (key === 'fontSize' || key === 'lineHeightPx') {
        let fontSizeRem = value / remBase;

        value = `${fontSizeRem % 1 === 0 ? fontSizeRem : Number(fontSizeRem.toFixed(3))}rem`;
      }

      rules[mapRule[key]] = value;
    }
  });

  return rules;
}

export function getColorValue({r, g, b, a}) {
  r = Math.round(r * 255);
  g = Math.round(g * 255);
  b = Math.round(b * 255);

  return a === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})`;
}
