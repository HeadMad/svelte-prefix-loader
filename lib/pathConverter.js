/**
 * 
 * @param {String} string   original string like "./[Component]/[block-component]"
 * @param {String} substr   searched string? like "component"
 * @param {String} newSubstr replacement string like "search"
 * @return {String} returned "./Search/block-search"
 */
 const pathConverter = (string, substr, newSubstr) => {
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

module.exports = pathConverter