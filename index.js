const AssetSizePlugin = require('./lib/asset-size-plugin')

module.exports = ({ webpack = config => config, ...nextConfig } = {}) => ({
  // pass nextConfig
  ...nextConfig,

  // overwrite webpack config
  webpack: (config, options) => {
    const { isServer, buildId, config: { distDir } = {} } = options

    if (!isServer) {
      config.plugins.push(new AssetSizePlugin(buildId, distDir))
    }

    return webpack(config, options)
  }
})
