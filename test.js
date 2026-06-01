const fs = require('fs');
const env = {};
const envPath = ".env.local";

fs.writeFileSync(envPath, "FOO=bar");
const dotenvContent = fs.readFileSync(envPath, 'utf8');
dotenvContent.split('\n').forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[match[1]] = value.trim();
  }
});

console.log(env.FOO);
