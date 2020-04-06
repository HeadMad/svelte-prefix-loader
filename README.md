# svelte-prefix-loader

The plugin `svelte-prefix-loader` allows you to specify the directory from which you want to autoload the components, depending on the prefixes in the tag name.

```javascript
// rollup.config.js

import svelte from "rollup-plugin-svelte"
import prefixLoader from "svelte-prefix-loader"
import myHandler from "./plugins/myHandler.js"

// Other imports

const prefixLoaderConfig = {
  App: './[prefix]/[block]/[block][-elem].svelte',
  My: myHandler
}

module.exports = {
  ...
  plugins: [
    svelte({
      preprocess: [ prefixLoader(prefixLoaderConfig) ]
    })
  ]
  ...
}
```
- In path template, you can use PascalCase lettering. For example:
```
<MyHeaderLogo />

./[prefix]/[block][-elem].svelte => ./my/header-logo.svelte
./[Prefix]/[Block][Elem].svelte => ./My/HeaderLogo.svelte
```
- In square brackets, you can use any simbols **before** keyword (prefix, block, elem). For example:
```
<MyHeaderLogo />

./[prefix]/[block][__elem].svelte => ./my/header__logo.svelte
```
- If tag has no `Block` or `Elem` section, template just skip they in result. For example:
```
./bem/[block][/__elem][/block][__elem].svelte

<MyHeader /> => ./bem/header/header.svelte
<MyHeaderLogo /> => ./bem/header/__logo/header__logo.svelte
```



## Also
As a path you can specify a function that should return string - path to svelte-file



The sample code of the handler function:
```javascript
//myHandler.js
const path = require('path')

module.exports = function(rootDir, {prefix, block, elem}) {
    return path.join(rootDir, `/${prefix}/${block}${elem ? '-' + elem : ''}.svelte`)
}
```

## Parameters
- **rootDir**
<br> `String`. Path to dir of root svelte-file (App.svelte)
- **prefix**
<br> `String`. First word in tagName. Exemple, in tag `<AppPageHeader />`, prefix is "App"
- **block**
<br> `String`. Second word in tagName. Exemple, in tag `<AppPageHeader />`, block is "Page"
- **elem**
<br> `String`. Third word in tagName. Exemple, in tag `<AppPageHeader />`, elem is "Header"

