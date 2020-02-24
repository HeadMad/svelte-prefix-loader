
const HTMLParser = require('./lib/HTMLParser')
const path = require('path')
let firstFilePath
const fileImports = new Set()
const allPrefixedTags = new Map()

const convertPath = (string, search, repl) => {
  let regExp = new RegExp('\\[([^\\]]*)(' + search + ')\\]', 'ig');
  return string.replace(regExp, (_, pre, search) => {
    // if empty repl
    if (!repl) return ''
    // if had no pre
    pre = pre ? pre : ''
    // if [Block] we use Pascal notacion
    let isPascal = /^[A-Z]/.test(search)
    let fill = isPascal ? repl : repl.toLowerCase()
    return pre + fill
  })
}

const parseTagPath = (tag, prefixPath) => {
  const splitedTag = tag.replace(/\B([A-Z])/g, '|$1').split('|')
  let parsedPath = prefixPath;
  ['prefix', 'block', 'elem'].forEach((search, i) => {
    parsedPath = convertPath(parsedPath, search, splitedTag[i])
  })
  return path.join(firstFilePath, parsedPath).replace(/\\/g, '/') + '.svelte'
}

/**
 * 
 * @param {*} tags 
 * @param {*} prefixes 
 * @return {Map} [[tag, fullPath], ...]
 */
const sortTagsList = (tags, prefixes) => {
  const result = new Map();
  tags.forEach(tag => {
    prefixes.forEach(([prefix, prefixPath]) => {
      if (!tag.startsWith(prefix) || result.has(tag)) return
      if (allPrefixedTags.has(tag)) {
        result.set(tag, allPrefixedTags.get(tag))
      } else {
        let parsedPath = parseTagPath(tag, prefixPath)
        allPrefixedTags.set(tag, parsedPath)
        result.set(tag, parsedPath)
      }
    })
  })
  return result
}



/**
 * 
 * @param {*} content 
 * @param {*} prefixes 
 * @retun {Map} as [[tag, fullPath]]
 */
const getTagsList = (content, prefixes) => {
  const tags = new Set()
  HTMLParser(content, {
    start({rawTagName: tag}) {
      if (/(script|style)/.test(tag)) return
      tags.add(tag)
    }
  })
  return sortTagsList(tags, prefixes)
}

const addFileImports = (content, prefixes) => {
  fileImports.clear()
  const tagsList = getTagsList(content, prefixes)
  tagsList.forEach((fullPath, tag) => {
    fileImports.add(`import ${tag} from "${fullPath}"`)
  })
}

const findPrefixTags = (prefixes) => ({content, filename}) => {
  const filePath = path.dirname(filename)
  firstFilePath = firstFilePath || filePath
  addFileImports(content, prefixes)
}

const insertLostImports = ({content}) => {
  const code = `\n ${[...fileImports].join('\n')} \n ${content}`
  return {code}
}

const prefixLoader = (opts) => {
  if (!opts) return {}
  const prefixes = Object.entries(opts)
  const markup = findPrefixTags(prefixes)
  const script = insertLostImports
  return {markup, script}
}

const trowing = (handler) => (...args) => {
  try {
    return handler(...args)
  } catch (error) {
    console.log(error)
  }
}

module.exports = prefixLoader