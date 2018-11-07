const withSize = require('next-size')
const withCss = require('@zeit/next-css')

module.exports = withSize(withCss())
