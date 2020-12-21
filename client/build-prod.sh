rm -rf node_modules
npm ci --also=dev
npm run build:prod
rm -rf build
cp -R dist build
