rm -rf node_modules
npm ci
npm run build
rm -rf build
cp -R dist build
