/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs').promises;
const camelcase = require('camelcase');
const { promisify } = require('util');
const rimraf = promisify(require('rimraf'));

function svgToFast(svg, componentName) {
  return "export default `" + svg + "`";
}

console.log('Building Fast components...')

rimraf('./src/icons/outline/*')
  .then(() => {
    return rimraf('./src/icons/solid/*')
  })
  .then(() => {
    return Promise.all([
      fs.readdir('./node_modules/heroicons/solid').then((files) => {
        return Promise.all(
          files.map((file) => {
            const componentName = `${camelcase(file.replace(/\.svg$/, ''), { pascalCase: true })}`
            return fs
              .readFile(`./node_modules/heroicons/solid/${file}`, 'utf8')
              .then((content) => {
                return svgToFast(content, `${componentName}Icon`)
              })
              .then((component) => {
                const fileName = `${componentName}.ts`
                const content = component
                return fs.writeFile(`./src/icons/solid/${fileName}`, content).then(() => fileName)
              })
          })
        ).then((fileNames) => {
          const exportStatements = fileNames
            .map((fileName) => {
              const componentName = `${camelcase(fileName.replace(/\.ts$/, ''), {
                pascalCase: true,
              })}`
              return `export { default as ${componentName} } from './${fileName}';`
            })
            .join('\n')

          return fs.writeFile('./src/icons/solid/index.ts', exportStatements)
        })
      }),

      fs.readdir('./node_modules/heroicons/outline').then((files) => {
        return Promise.all(
          files.map((file) => {
            const componentName = `${camelcase(file.replace(/\.svg$/, ''), { pascalCase: true })}`
            return fs
              .readFile(`./node_modules/heroicons/outline/${file}`, 'utf8')
              .then((content) => {
                return svgToFast(content, `${componentName}Icon`)
              })
              .then((component) => {
                const fileName = `${componentName}.ts`
                const content = component
                return fs.writeFile(`./src/icons/outline/${fileName}`, content).then(() => fileName)
              })
          })
        ).then((fileNames) => {
          const exportStatements = fileNames
            .map((fileName) => {
              const componentName = `${camelcase(fileName.replace(/\.ts$/, ''), {
                pascalCase: true,
              })}`
              return `export { default as ${componentName} } from './${fileName}';`
            })
            .join('\n')

          return fs.writeFile('./src/icons/outline/index.ts', exportStatements)
        })
      }),
    ])
  })
  .then(() => console.log('Finished building Fast components.'))
