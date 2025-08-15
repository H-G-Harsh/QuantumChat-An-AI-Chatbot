import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fix the gopd case sensitivity issue
const gopdDir = path.join(__dirname, 'node_modules', 'gopd');
const gOPDFile = path.join(gopdDir, 'gOPD.js');

if (fs.existsSync(gopdDir) && fs.existsSync(gOPDFile)) {
  // Create the lowercase version that the require statement is looking for
  const content = fs.readFileSync(gOPDFile, 'utf8');
  fs.writeFileSync(path.join(gopdDir, 'gopd.js'), content);
  console.log('Fixed gopd case sensitivity issue');
} else {
  console.log('gopd fix not needed or files not found');
}