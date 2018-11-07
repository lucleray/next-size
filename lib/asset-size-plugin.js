const prettyBytes = require('pretty-bytes')
const gzipSize = require('gzip-size')
const chalk = require('chalk')

const {
  CLIENT_STATIC_FILES_PATH,
  IS_BUNDLED_PAGE_REGEX,
  CLIENT_STATIC_FILES_RUNTIME_PATH,
  BUILD_MANIFEST,
  REACT_LOADABLE_MANIFEST
} = require('next/constants')

const color = size =>
  size > 100 * 1024
    ? 'red'
    : size > 40 * 1024
    ? 'yellow'
    : size > 10 * 1024
    ? 'cyan'
    : 'green'

class AssetSizePlugin {
  constructor(buildId, distDir) {
    this.buildId = buildId
    this.distDir = distDir
    this.hashes = []
  }

  formatFilename(filename) {
    let _filename = filename

    // add distDir
    if (this.distDir) {
      _filename = chalk.gray(this.distDir + '/') + filename
    }

    // dim static folder
    if (filename.indexOf(CLIENT_STATIC_FILES_PATH) === 0) {
      _filename = _filename.replace(
        CLIENT_STATIC_FILES_PATH + '/',
        chalk.gray(CLIENT_STATIC_FILES_PATH + '/')
      )
    }

    // shorten/dim buildId
    if (this.buildId) {
      _filename = _filename.replace(
        this.buildId + '/',
        chalk.gray(this.buildId.substring(0, 4) + '****/')
      )
    }

    // shorten/dim hashes
    for (let hash of this.hashes) {
      // for each hash, search 8 first chars
      const pos = _filename.indexOf(hash.substring(0, 8))
      if (pos === -1) continue
      let length = 0
      while (_filename[pos + length] === hash[length]) length++
      _filename =
        _filename.substring(0, pos) +
        chalk.gray(hash.substring(0, 4) + '****') +
        _filename.substring(pos + length)
      break
    }

    return _filename
  }

  async printAssetsSize({ assets, chunks }) {
    chunks.forEach(chunk => {
      this.hashes.push(chunk.hash, ...Object.values(chunk.contentHash))
    })

    const sizes = await Promise.all(
      Object.keys(assets)
        .filter(
          filename =>
            filename !== REACT_LOADABLE_MANIFEST && filename !== BUILD_MANIFEST
        )
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
          const size = await gzipSize(asset.source())

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

    let message = '\nBrowser assets sizes after gzip:\n\n'

    for (let { filename, size, prettySize } of sizes) {
      const padding = ' '.repeat(longestPrettySize - prettySize.length)
      const formattedSize = chalk[color(size)].bold(prettySize)
      const formattedFilename = this.formatFilename(filename)

      message += `   ${padding}${formattedSize}  ${formattedFilename}\n`
    }

    console.log(message)
  }

  async apply(compiler) {
    compiler.hooks.afterEmit.tapPromise(
      'AssetsSizePlugin',
      (compilation, callback) => this.printAssetsSize(compilation)
    )
  }
}

module.exports = AssetSizePlugin
