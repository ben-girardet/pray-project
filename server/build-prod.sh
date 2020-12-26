rm -rf node_modules
npm ci --also=dev
npm run build
rm -rf build
cp -R dist/server/src build
