
const HTMLParser = require('./lib/HTMLParser')
const convertPath = require('./lib/pathConverter')
const path = require('path')

let FIRST_FILE_PATH, HAS_SCRIPT_SECTION
const ALL_PREFIXED_TAGS = new Map()

/**
 * 
 * @param {String} tag 
 * @param {String} prefixPath
 * @return {String} Full path of .svelte file
 */
const parseTagPath = (tag, prefixPath) => {
  const splitedTag = tag.replace(/\B([A-Z])/g, '|$1').split('|')
  let parsedPath = prefixPath;
  ['prefix', 'block', 'elem'].forEach((search, i) => {
    parsedPath = convertPath(parsedPath, search, splitedTag[i])
  })
  return path.join(FIRST_FILE_PATH, parsedPath).replace(/\\/g, '/') + '.svelte'
}

/**
 * 
 * @param {Set} tags 
 * @param {Array} prefixes like [[prefix, path], ...]
 * @return {Map} [[tag, fullPath], ...]
 */
const sortTagsList = (tags, prefixes) => {
  const result = new Map();
  tags.forEach(tag => {
    prefixes.forEach(([prefix, prefixPath]) => {
      if (!tag.startsWith(prefix) || result.has(tag)) return
      if (ALL_PREFIXED_TAGS.has(tag)) {
        result.set(tag, ALL_PREFIXED_TAGS.get(tag))
      } else {
        let parsedPath = parseTagPath(tag, prefixPath)
        ALL_PREFIXED_TAGS.set(tag, parsedPath)
        result.set(tag, parsedPath)
      }
    })
  })
  return result
}

/**
 * 
 * @param {String} content 
 * @param {Array} prefixes  like [[prefix, path], ...]
 * @return {Map} as [[tag, fullPath]]
 */
const getTagsList = (content, prefixes) => {
  const tags = new Set()
  HTMLParser(content, {
    start({rawTagName: tag}) {
      if (tag === 'style') return
      if (tag === 'script') HAS_SCRIPT_SECTION = true
      tags.add(tag)
    }
  })
  return sortTagsList(tags, prefixes)
}

/**
 * 
 * @param {String} content 
 * @param {Array} prefixes  like [[prefix, path], ...]
 * @return {String} 
 */
const makeFileImports = (content, prefixes) => {
  let imports = '\n'
  const tagsList = getTagsList(content, prefixes)
  tagsList.forEach((fullPath, tag) => {
    imports += `import ${tag} from "${fullPath}"\n`
  })
  return imports
}

/**
 * 
 * @param {String} content 
 * @param {String} imports 
 */
const putImportsInMarkup = (content, imports) => {
  if (!HAS_SCRIPT_SECTION)
   return content + '<script>' + imports + '</script>'
  return content.replace(/(<script(\s+[^>]*)?>)/, '$1' + imports)
}

/**
 * 
 * @param {Array} prefixes  like [[prefix, path], ...]
 * @return {Function}
 */
const findPrefixTags = (prefixes) => ({content, filename}) => {
  const filePath = path.dirname(filename)
  FIRST_FILE_PATH = FIRST_FILE_PATH || filePath
  HAS_SCRIPT_SECTION = false
  const imports = makeFileImports(content, prefixes)
  const code = putImportsInMarkup(content, imports)
  return {code}
}

/**
 * 
 * @param {Object} opts like {prefix: path}
 */
const prefixLoader = (opts) => {
  if (!opts) return {}
  const prefixes = Object.entries(opts)
  const markup = findPrefixTags(prefixes)
  return {markup}
}

module.exports = prefixLoader