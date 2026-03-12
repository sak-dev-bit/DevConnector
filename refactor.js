const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'client/src/App.css');
let cssContent = fs.readFileSync(cssPath, 'utf-8');

// Replace ANY hex code with a variable if it's not already dynamic
// Let's use a regex to find all hex colors and replace them with closest variable.

const cssVars = {
  textPrimary: 'var(--text-primary)',     // #C9D1D9
  textSecondary: 'var(--text-secondary)', // #8B949E
  darkBg: 'var(--dark-bg)',               // #0D1117
  cardBg: 'var(--card-bg)',               // #161B22
  borderColor: 'var(--border-color)',     // #30363D
  primary: 'var(--primary-color)',        // #58A6FF
  success: 'var(--success-color)',        // #238636
  error: 'var(--error-color)'             // #ef4444
};

// Replace specific colors
cssContent = cssContent.replace(/#([0-9a-fA-F]{3,6})/g, (match) => {
  const m = match.toLowerCase();
  if (['#fff', '#ffffff', '#333', '#333333', '#222', '#222222', '#000', '#000000'].includes(m)) return cssVars.textPrimary;
  if (['#666', '#666666', '#777', '#888', '#999', '#999999'].includes(m)) return cssVars.textSecondary;
  if (['#f4f4f4', '#f8f9fa', '#e9ecef', '#f1f3f4', '#fdfdfd', '#fafafa'].includes(m)) return cssVars.darkBg;
  if (['#ddd', '#dddddd', '#eee', '#eeeeee', '#ccc', '#cccccc', '#adb5bd'].includes(m)) return cssVars.borderColor;
  if (m.startsWith('#1da1f2') || m.startsWith('#3b599') || m.startsWith('#0077b') || m.startsWith('#667ee') || m.startsWith('#764ba')) return cssVars.primary;
  if (m.startsWith('#dc354') || m.startsWith('#c8233') || m.startsWith('#f8d7d') || m.startsWith('#f5c6c') || m.startsWith('#721c2') || m.startsWith('#ff000') || m.startsWith('#e4405')) return cssVars.error;
  if (m.startsWith('#10b98') || m.startsWith('#23863') || m.startsWith('#17a2b')) return cssVars.success;
  return match;
});

// Fix backgrounds of cards
cssContent = cssContent.replace(/background:\s*white;/gi, 'background: var(--card-bg);');
cssContent = cssContent.replace(/background-color:\s*white;/gi, 'background-color: var(--card-bg);');
cssContent = cssContent.replace(/background:\s*#fff;/gi, 'background: var(--card-bg);');
cssContent = cssContent.replace(/background-color:\s*#fff;/gi, 'background-color: var(--card-bg);');

// Clean up rgb and rgba using generic variable where background is bright
cssContent = cssContent.replace(/rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.8\s*\)/g, 'rgba(22, 27, 34, 0.8)');
cssContent = cssContent.replace(/rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.1\s*\)/g, 'var(--border-color)');
cssContent = cssContent.replace(/rgb\(\s*244\s*,\s*244\s*,\s*244\s*\)/g, 'var(--dark-bg)');
cssContent = cssContent.replace(/rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)/g, 'var(--card-bg)');

fs.writeFileSync(cssPath, cssContent, 'utf-8');
console.log('App.css fully updated');
