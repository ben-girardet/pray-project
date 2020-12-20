rm -rf node_modules
npm ci
npm run build:prod
rm -rf build
cp -R dist build
