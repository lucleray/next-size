# next-size

**Print the size of your assets when running `next build`.**

### Installation

```
yarn add next-size --dev
```

### Usage

Edit your next configuration :

```js
// next.config.js
const withSize = require('next-size')

module.exports = withSize()
```

The size of the assets created will be showed when you run `next-build`
