/**
 * 
 * @param {String} string   original string like "./[Search]/[block-search]"
 * @param {String} substr   searched string? like "search"
 * @param {String} newSubstr replacement string like "component"
 * @return {String} returned "./Component/block-component"
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