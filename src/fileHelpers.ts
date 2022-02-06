import * as fs from 'fs'
import { relative } from 'path/posix'
const p = require('path')

export const readFile = (path: string) => {
  try {
    const f = fs.readFileSync(path, 'utf8')
    return f
  } catch (e: any) {
    console.error(`Error reading file: ${e}`)
    return null
  }
}

export const writeFile = (path: string, data: string) => {
  try {
    const f = fs.writeFileSync(path, data, 'utf8')
    console.log('File successfully created.')
  } catch (e: any) {
    console.error(`Error creating file: ${e}`)
  }
}

export const checkDir = (dir: string) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir)
}

export const getAbsolutePath = (path: string, relativePath: string) => {
  let parentDir = path.split('/').slice(0, -1).join('/')
  const absolutePath = p.format({
    root: p.resolve(parentDir, relativePath),
    ext: '.ts',
  })
  return absolutePath
}
