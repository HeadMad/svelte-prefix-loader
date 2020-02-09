
const HTMLParser = require('./lib/HTMLParser')
const path = require('path')


const getPrefixesTags = (prefixes, stack) => async ({content}) => {

  
  let tags = []
  
  await HTMLParser(content, {
    start: function ({ rawTagName }) {
      if (/(style|script)/.test(rawTagName)) return
      tags.push(rawTagName)
    }
  })

  prefixes.forEach(prefix => {
    tags = tags.filter(tag => {
      if (!tag.startsWith(prefix)) return true
      stack.add(tag)
    })
  })
}

const searchImports = (content, stack) => {
  const REImports = /import\s+(\S+)\s+from\s+/g
  let matches = content.matchAll(REImports)
  let imports = new Set([...matches].map(match => match[1]))
  
  return stack.filter(each => !imports.has(each))
}

const createImportsArray = (map, components) => {

  return components
    .map(comp => comp.replace(/\B([A-Z])/g, '|$1').split('|'))
    .map(([prefix, block, elem], i) => {
      let component = components[i]
      let importPath = map.get(component)
      if (block)  importPath = pathReplace(importPath, 'block', block)   // replace [block] or [Block](Pascal case)
      if (elem)   importPath = pathReplace(importPath, 'elem', elem)     // replace [elem] or [Elem](Pascal case)
      if (prefix) importPath = pathReplace(importPath, 'prefix', prefix) // replace [prefix] or [Prefix](Pascal case)
      return `import ${component} from "${importPath}.svelte"`
    })

}

const insertImportsOfComponents = (map, stack) => ({content}) => {

  let lostImports = searchImports(content, [...stack])
  let importsArray = createImportsArray(map, lostImports)

  let code = `\n  ${importsArray.join('\n  ')}\n${content}`
  console.log(code)
  return {code}
}


const prefixLoader = opts => {
  
  if (!opts) return {}

  let map = new Map(Object.entries(opts))
  let stack = new Set()

  let markup = getPrefixesTags([...map.keys()], stack)
  let script = insertImportsOfComponents(map, stack)

  return { markup, script }
}

module.exports = prefixLoader


/**
 * 
 * @param {String} string String fore replace serch substring
 * @param {String} search Search substring
 * @param {String} repl Replacement string
 */
function pathReplace(string, search, repl)
{
  // if empty repl
  if (!repl) return ''

  let regExp = new RegExp('\\[([^\\]]*)(' + search + ')\\]', 'ig');
  return string.replace(regExp, (_, pre, search) => {
    
    // if had no pre
    pre = pre ? pre : ''
    
    // if [Block] we use Pascal notacion
    let isPascal = /^[A-Z]/.test(search)
    let fill = isPascal ? repl : repl.toLowerCase()

    return pre + fill
  })
} 