import { checkDir, readFile, writeFile } from './src/fileHelpers'
import { generate } from './src/generateDocs'

const getDefaultName = (path: string) => {
  try {
    if (path.includes('/')) return path.split('/').pop()?.split('.')[0]
    else return path.split('.')[0]
  } catch {
    return 'doc'
  }
}

const main = () => {
  const argv = require('minimist')(process.argv.slice(2))
  const path = argv.p ?? argv.path ?? null
  const dir = argv.d ?? argv.dir ?? 'docs'
  const fileName = argv.n ?? argv.name ?? getDefaultName(path)
  const parseImports = argv.i ?? argv.imports ?? false

  if (path) {
    console.log(`Generating docs for file ${path}...`)
    const fileContents = readFile(path)

    if (fileContents) {
      const doc = generate(fileContents, path, parseImports)

      if (doc) {
        let resultPath = dir
        if (dir !== '') {
          checkDir(dir)
          resultPath += '/'
        }
        resultPath += `${fileName}.md`

        console.log(`Saving result at ${resultPath}...`)
        writeFile(resultPath, doc)
      }
    }
  } else {
    console.error('Please provide a path: -p or --path argument')
  }
}

main()
