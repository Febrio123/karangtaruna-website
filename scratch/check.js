import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

function walk(d) {
  const files = fs.readdirSync(d);
  for (const f of files) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) {
      if (f !== 'node_modules') walk(p);
    } else if (f.endsWith('.js')) {
      try {
        execSync(`node --check "${p}"`);
      } catch (e) {
        console.error('SYNTAX ERROR FOUND IN:', p);
        console.error(e.output ? e.output.toString() : e.message);
      }
    }
  }
}

walk('server');
console.log('Finished checking all server files.');
