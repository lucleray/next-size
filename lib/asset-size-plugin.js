const { gzip: _gzip } = require('zlib')
const { relative: pathRelative } = require('path')
const { promisify } = require('util')
const chalk = require('chalk')
const {
  IS_BUNDLED_PAGE_REGEX,
  BUILD_MANIFEST,
  REACT_LOADABLE_MANIFEST,
  CLIENT_STATIC_FILES_PATH
} = require('next/constants')

const gzip = promisify(_gzip)

const UNITS = ['B', 'kB', 'MB']
const prettyBytes = number => {
  const exponent = Math.min(
    Math.floor(Math.log10(number) / 3),
    UNITS.length - 1
  )
  number = Number((number / Math.pow(1000, exponent)).toPrecision(3))
  const unit = UNITS[exponent]
  return number + ' ' + unit
}

const color = size =>
  size > 100 * 1024
    ? 'red'
    : size > 40 * 1024
    ? 'yellow'
    : size > 10 * 1024
    ? 'cyan'
    : 'green'

const filterFiles = filename => {
  // filter .map files
  if (filename.endsWith('.map')) {
    return false
  }

  // filter loadable manifest, build manifest
  return filename !== REACT_LOADABLE_MANIFEST && filename !== BUILD_MANIFEST
}

class AssetsSizePlugin {
  constructor({ buildId, distDir }, { printRawSize = false } = {}) {
    this.buildId = buildId
    this.distDir = distDir ? pathRelative(process.cwd(), distDir) + '/' : ''
    this.printRawSize = printRawSize
  }

  formatFilename(rawFilename) {
    let filename = rawFilename

    // dim static folder
    if (filename.indexOf(CLIENT_STATIC_FILES_PATH) === 0) {
      filename = filename.replace(
        CLIENT_STATIC_FILES_PATH + '/',
        chalk.gray(CLIENT_STATIC_FILES_PATH + '/')
      )
    }

    // add distDir
    filename = chalk.gray(this.distDir) + filename

    // shorten buildId
    if (this.buildId) {
      filename = filename.replace(
        this.buildId + '/',
        chalk.gray(this.buildId.substring(0, 4) + '****/')
      )
    }

    // shorten hashes
    filename = filename.replace(
      /(.*[-.])([0-9a-f]{8,})((\.chunk)?(\.js|\.css))/,
      (_, c1, hash, c2) => c1 + chalk.gray(hash.substring(0, 4) + '****') + c2
    )

    return filename
  }

  async printAssetsSize(assets) {
    const sizes = await Promise.all(
      Object.keys(assets)
        .filter(filterFiles)
        .sort((a, b) => {
          // put pages at the top, then the rest
          const [pa, pb] = [a, b].map(x => IS_BUNDLED_PAGE_REGEX.exec(x))
          if (pa && !pb) return -1
          if (pb && !pa) return 1
          if (a > b) return 1
          return -1
        })
        .map(async filename => {
          const asset = assets[filename]
          const size = this.printRawSize
            ? asset.source().length
            : (await gzip(asset.source())).length

          return {
            filename,
            size,
            prettySize: prettyBytes(size)
          }
        })
    )

    // find longest prettySize string size
    const longestPrettySize = Math.max(
      ...sizes.map(({ prettySize }) => prettySize.length)
    )

    let message = this.printRawSize
      ? '\nBrowser assets sizes:\n\n'
      : '\nBrowser assets sizes after gzip:\n\n'

    for (let { filename, size, prettySize } of sizes) {
      const padding = ' '.repeat(longestPrettySize - prettySize.length)
      const formattedSize = chalk[color(size)].bold(prettySize)
      const formattedFilename = this.formatFilename(filename)

      message += `   ${padding}${formattedSize}  ${formattedFilename}\n`
    }

    // eslint-disable-next-line
    console.log(message)
  }

  async apply(compiler) {
    compiler.hooks.afterEmit.tapPromise('AssetsSizePlugin', compilation =>
      // eslint-disable-next-line
      this.printAssetsSize(compilation.assets).catch(console.error)
    )
  }
}

module.exports = AssetsSizePlugin
