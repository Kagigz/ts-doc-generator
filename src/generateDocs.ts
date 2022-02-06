import { getAbsolutePath, readFile } from './fileHelpers'

const getSampleValue = (attr: any, content: any) => {
  if (attr.default && attr.default !== '') {
    if (!attr.default.includes('$')) {
      return attr.default.replace(/'/g, '')
    }
  }

  switch (attr.type) {
    case 'string':
      if (attr.values && attr.values !== 'any') {
        const firstValue = attr.values.split(',')[0].replace(/'/g, '')
        return firstValue
      }
      return `<${attr.name.toUpperCase()}>`
    case 'number':
      if (attr.values && attr.values !== 'any') {
        const firstValue = attr.values.split(',')[0]
        return firstValue
      }
      return 0
    case 'boolean':
      return false
    case 'string[]':
      return []
    case 'number[]':
      return []
    case 'any':
      return {}
    case 'any[]':
      return []
    case 'void':
    case 'undefined':
    case 'unknown':
      return null
    default:
      const typeMatch = attr.type.match(/\[(.*)\]\(.*\)/)
      if (typeMatch) {
        const type = typeMatch[1]
        const strippedType = type.replace('[', '').replace(']', '')
        if (Object.keys(content).includes(strippedType)) {
          const attrValue: any = {}
          const typeDef = content[strippedType]
          Object.keys(typeDef).map((category: string) => {
            for (const attr of typeDef[category]) {
              const value = getSampleValue(attr, content)
              let attrName = attr.name
              if (attrName.includes('{{')) {
                attrName = attrName.replace('{{', '').replace('}}', '').toUpperCase()
                attrName = `<${attrName}>`
              }
              if (value) {
                if (attr.type.includes('[') && !(Array.isArray(value) && value.length === 0)) {
                  attrValue[attrName] = [value]
                } else {
                  attrValue[attrName] = value
                }
              }
            }
          })
          return attrValue
        }
      }
  }

  return null
}

const createJsonExample = (rootName: string, content: any) => {
  const root = content[rootName]
  const jsonExample: any = {}

  Object.keys(root).map((category: string) => {
    for (const attr of root[category]) {
      const value = getSampleValue(attr, content)
      if (value) {
        if (attr.type.includes('[') && !(Array.isArray(value) && value.length === 0)) {
          jsonExample[attr.name] = [value]
        } else {
          jsonExample[attr.name] = value
        }
      }
    }
  })

  return JSON.stringify(jsonExample, null, 2)
}

const parseTitle = (title: string, level: number = 1) => {
  return '#'.repeat(level) + ' ' + title + '\n\n'
}

const jsonToMDTable = (header: any, data: any) => {
  let mdTable = '|'
  for (const h of Object.keys(header)) {
    mdTable += ` ${header[h]} |`
  }
  mdTable += '\n|'
  mdTable += ' ---- |'.repeat(Object.keys(header).length)
  mdTable += '\n'
  for (const row of data) {
    mdTable += '|'
    for (const h of Object.keys(header)) {
      if (h in row) mdTable += ` ${row[h]} |`
      else mdTable += ' |'
    }
    mdTable += '\n'
  }
  mdTable += '\n\n'
  return mdTable
}

const parseMD = (rootName: string, content: any) => {
  let mdText = ''
  const header = {
    name: 'Attribute',
    description: 'Description',
    type: 'Type',
    values: 'Accepted values',
    default: 'Default value',
    optional: 'Optional',
    comment: 'Comment',
  }
  mdText += parseTitle(rootName)
  mdText += parseTitle('Definition', 2)
  const rootContent = content[rootName]
  if ('main' in rootContent) {
    mdText += jsonToMDTable(header, rootContent['main'])
  }
  if (Object.keys(rootContent).length > 1) {
    for (const category of Object.keys(rootContent)) {
      if (category !== 'main') {
        mdText += parseTitle(category, 3)
        mdText += jsonToMDTable(header, rootContent[category])
      }
    }
  }
  if (Object.keys(content).length > 1) {
    mdText += parseTitle('Sub Types Definition', 2)
    for (const key of Object.keys(content)) {
      if (key !== rootName) {
        mdText += parseTitle(key, 3)
        mdText += `<a name="${key}"></a>\n\n`
        const keyContent = content[key]
        if ('main' in keyContent) {
          mdText += jsonToMDTable(header, keyContent['main'])
        }
        if (Object.keys(keyContent).length > 1) {
          for (const category of Object.keys(keyContent)) {
            console.log(category)
            if (category !== 'main') {
              mdText += parseTitle(category, 4)
              mdText += jsonToMDTable(header, keyContent[category])
            }
          }
        }
      }
    }
  }

  mdText += parseTitle('Example', 2)
  mdText += '```\n\n'
  mdText += createJsonExample(rootName, content)
  mdText += '\n\n```\n\n'

  return mdText
}

const getImports = (content: string, path: string) => {
  const importsContent: any[] = []
  const imports = content.matchAll(/import .* from '(.*)'/g)
  for (const i of imports) {
    const importPath = getAbsolutePath(path, i[1])
    const importContent = readFile(importPath)
    if (importContent) importsContent.push({ path: importPath, content: importContent })
  }
  return importsContent
}

const parseValues = (line: string) => {
  let name = ''
  let type = ''
  // Type Maps
  if (line.match(/\[.*:.*\][ ]?:[ ]?.*/)) {
    const m = line.match(/\[(.*)[ ]?:[ ]?.*\]/)
    if (m) name = `\{\{${m[1]}\}\}`.replace('?', '')
    type = line.split(':').pop()?.replace(/ /g, '') ?? ''
  } else {
    const parts = line.replace(/ /g, '').split(':')
    name = parts[0].replace('?', '')
    type = parts[1]
  }
  let values = 'any'
  if (type.includes('|')) {
    values = type.split('|').join(', ')
    type = 'string'
  }
  const defaultTypes = ['any', 'string', 'boolean', 'number', 'Object', 'Array', 'unknown', 'void', 'null', 'undefined']
  if (!defaultTypes.includes(type.replace('[]', ''))) {
    type = `[${type}](#${type.replace('[]', '')})`
  }
  return {
    name,
    type,
    values,
  }
}

const parseParams = (text: string) => {
  const params: any = {
    optional: 'no',
    default: '',
    comment: '',
  }
  if (text.includes('(')) {
    if (text.includes('optional')) {
      params.optional = 'yes'
    }
    if (text.includes('default')) {
      const defaultValues = text.match(/default[ ]?[:=][ ]?(.*)[\),]+/)
      if (defaultValues) params.default = defaultValues[1]
    }
    const commentText = text.match(/\((.*)\)/)
    let comment = ''
    if (commentText) {
      comment = `(${commentText[1]})`
      comment = comment.replace(/optional[:,]?[ ]?/, '').replace(/default[ ]?[:=][ ]?.*[\),]+/, '')
      comment = comment.replace('(', '').replace(')', '').trim()
      params.comment = comment
    }
  }
  return params
}

const parseDefinition = (name: string, content: string) => {
  const regxp = new RegExp(`${name} \{([^}]*)\}`, 's')
  const match = content.match(regxp)
  const definition: any = {}
  if (match) {
    const lines = match[1].split('\n')
    let description = ''
    let category = 'main'
    let params = {}
    for (const l of lines) {
      // One line comment: // {{comment}}
      if (l.match(/\/\/.*/)) {
        description = l.replace('//', '').split('(')[0].trim()
        params = parseParams(l)
      }
      // Multiline comment: /* {{comment}} */
      else if (l.match(/\/\*.*\*\//s)) {
        category = l.replace('/*', '').replace('*/', '').replace(/\\n/g, '').trim()
      }
      // Attribute definition
      else if (!l.includes('constructor') && !l.includes('this.') && l.match(/[\w\[\]\|\?]*[ ]?:[ ]?[\w\[\]\|\?]*/)) {
        const match = l.match(/[\w\[\]\|\?]*[ ]?:[ ]?[\w\[\]\|\?]*/)
        if (match) {
          const attr = match[0]
          if (attr.replace(/ /g, '') !== ':') {
            const val = parseValues(l)
            const attribute = {
              ...params,
              name: val.name,
              type: val.type,
              values: val.values,
              description: description,
            }
            if (category in definition) {
              definition[category].push(attribute)
            } else {
              definition[category] = [attribute]
            }
          } else {
            console.log(match)
          }
        }
        description = ''
        params = {}
      }
      // Constructor/Method definition
      else if (l.match(/.*\(.*\)[ ]?\{/)) break
    }
  }
  return definition
}

const parseElements = (content: string, path: string, parseImports: boolean = false, definitions: any = {}) => {
  const interfaces = content.matchAll(/interface (.*) {/g)
  for (const i of interfaces) {
    const name = i[1]
    definitions[name] = parseDefinition(name, content)
  }
  const classes = content.matchAll(/class (.*) {/g)
  for (const c of classes) {
    const name = c[1]
    definitions[name] = parseDefinition(name, content)
  }

  if (content.includes('import') && parseImports) {
    const foundImports = getImports(content, path)
    for (const i of foundImports) {
      parseElements(i.content, i.path, parseImports, definitions)
    }
  }
  return definitions
}

export const generate = (content: string, path: string, parseImports: boolean = false) => {
  const rootElement = content.match(/default class (.*) {/) || content.match(/default interface (.*) {/)
  if (rootElement) {
    const rootName = rootElement[1]
    console.log(`Creating definition for ${rootName}...`)
    const elementsDefinitions = parseElements(content, path, parseImports)
    const result = parseMD(rootName, elementsDefinitions)
    console.log('Done.')
    return result
  } else {
    console.error('Cannot find root object: make sure you have a default class or interface defined.')
    return null
  }
}
