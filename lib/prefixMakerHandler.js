const fs = require('fs')
const defaultHandler = require('./defaultHandler')

class ComponentContent {
  constructor({block, elem}) {
    let name = elem ? block + '__' + elem : block
    this.name = name.toLowerCase()
    this.markup = ''
    this.styles = ''
  }
  addMarkup(string) {
    this.markup += string 
  }
  addStyle(string) {
    this.styles += string
  }
  getContent() {
    return `${this.markup}\n\n<script>\n</script>\n\n<style>\n  ${this.styles.replace(/\n/g, '\n  ')}\n</style>`
  }
}

const filling = (unparsedPath) => (rootPath, tag) => {
  const file = defaultHandler(unparsedPath)(rootPath, tag)

  const pathToFile = file.substring(0, file.lastIndexOf('/'))

  // если файл существует
  if (fs.existsSync(file))
    return file

  // creating content of svelte-component
  let component = new ComponentContent(tag)
  
  component.addMarkup(`<div class="${component.name}">\n  <slot />\n</div>`)
  component.addStyle(`.${component.name} {}`)

  try {
    fs.writeFileSync(file, component.getContent())
    return file

  } catch (err) {
    try {
      fs.mkdirSync(pathToFile, {recursive: true})
      fs.writeFileSync(file, component.getContent())
      return file
    } catch (e) {
      console.log('Error creating component: ', e)
      return file
    }
  }
}

module.exports = filling