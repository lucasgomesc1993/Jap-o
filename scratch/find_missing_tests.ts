import fs from 'fs';
import path from 'path';

const srcDir = 'c:/Users/lucas/OneDrive/Desktop/JP/src';

function getFiles(dir: string, allFiles: string[] = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, allFiles);
    } else {
      allFiles.push(name);
    }
  }
  return allFiles;
}

const files = getFiles(srcDir);
const sourceFiles = files.filter(f => (f.endsWith('.ts') || f.endsWith('.tsx')) && !f.endsWith('.test.ts') && !f.endsWith('.test.tsx') && !f.includes('node_modules'));

const missingTests = sourceFiles.filter(f => {
  const testFileTs = f.replace(/\.ts$/, '.test.ts');
  const testFileTsx = f.replace(/\.tsx$/, '.test.tsx');
  return !fs.existsSync(testFileTs) && !fs.existsSync(testFileTsx);
});

console.log('Files missing tests:');
missingTests.forEach(f => console.log(f));
