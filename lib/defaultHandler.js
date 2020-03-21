const path = require('path')

/**
 * @param {String} string   original string like "./[Component]/[block-component]"
 * @param {String} substr   searched string? like "component"
 * @param {String} newSubstr replacement string like "search"
 * @return {String} returned "./Search/block-search"
 */
const convertPath = (string, substr, newSubstr) => {
  let RE = new RegExp('\\[([^\\]]*)(' + substr + ')\\]', 'ig');
  return string.replace(RE, (_, before, substr) => {
    if (!newSubstr) return ''
    before = before || ''
    const isPascal = /^[A-Z]/.test(substr)
    newSubstr = isPascal
      ? newSubstr.replace(/^[a-z]/, letter => letter.toUpperCase())
      : newSubstr.replace(/^[A-Z]/, letter => letter.toLowerCase())
    return before + newSubstr
  })
}

/**
 * Make from path template like ./[Prefix]/[Block]/[Block][Elem]
 * normal path like ./App/Page/PageHeader
 * @param {String} prefixPath template of path
 * @return {Function} 
 *  @param {String} rootPath path to dir of root svelte-file (App.svelte)
 *  @param {Object} tag has three keys {prefix, block, elem}
 *  @return {String} full path to svelte-component of tag  
 */
const defaultHandler = (prefixPath) => (rootPath, tag) => {
  let parsedPath = prefixPath
  const arr = ['prefix', 'block', 'elem']
  arr.forEach((search) => {
    parsedPath = convertPath(parsedPath, search, tag[search])
  })
  return path.join(rootPath, parsedPath).replace(/\\/g, '/')
}

module.exports = defaultHandler