# next-size

**Next-size** is a next.js plugin to **print browser assets sizes** when running `next build`.

<div align="center">
<img  width="600px" alt="browser assets sizes appear magically when running next build ✨" src="demo.png" />
</div>

> 🎁 Check out the [**example folder**](example) folder if you want to try `next-size` (the example includes css and dynamic imports).

### Installation

```
yarn add next-size --dev
```

### Usage

Edit your next configuration and wrap you config with `withSize`.
Optionnally, you can provide an option to print actual asset sizes (defaults to gzipped sizes).

```js
// next.config.js
const withSize = require('next-size')

module.exports = withSize({
  // NextSizes config is optional
  nextSizeConfig: {
    printGzipSizes: true // Defaults to true
  }
})
```

The size of the assets created will be showed when you run `next-build`

### More

Inspired by :

- create-react-app's [FileSizeReporter](https://github.com/facebook/create-react-app/blob/master/packages/react-dev-utils/FileSizeReporter.js)
- [size-plugin](https://github.com/GoogleChromeLabs/size-plugin) by @developit
