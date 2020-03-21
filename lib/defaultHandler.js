const path = require('path')
const convertPath = require('./pathConverter')

const defaultHandler = (prefixPath) => (rootPath, tag) => {
  let parsedPath = prefixPath
  const arr = ['prefix', 'block', 'elem']
  arr.forEach((search) => {
    parsedPath = convertPath(parsedPath, search, tag[search])
  })
  return path.join(rootPath, parsedPath).replace(/\\/g, '/') + '.svelte'
}

module.exports = defaultHandler