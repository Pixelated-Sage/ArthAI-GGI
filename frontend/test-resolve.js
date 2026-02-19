const resolve = require('enhanced-resolve');
const fs = require('fs');

const myResolver = resolve.create.sync({
  fileSystem: fs,
  extensions: ['.js', '.json', '.node', '.ts', '.mjs'],
  modules: ['node_modules'] // strict module resolution
});

console.log('Testing resolution from:', __dirname);

try {
  const result = myResolver(__dirname, 'tailwindcss');
  console.log('Resolved tailwindcss:', result);
} catch (err) {
  console.error('Error resolving tailwindcss:', err.message);
}

try {
    const result = myResolver(__dirname, '@tailwindcss/postcss');
    console.log('Resolved @tailwindcss/postcss:', result);
} catch (err) {
    console.error('Error resolving @tailwindcss/postcss:', err.message);
}
