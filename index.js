const AssetSizePlugin = require('./lib/asset-size-plugin')

module.exports = ({ webpack = config => config, ...nextConfig } = {}) => ({
  // pass nextConfig
  ...nextConfig,

  // overwrite webpack config
  webpack: (config, options) => {
    const { dev, isServer, buildId, config: { distDir } = {} } = options

    if (!dev && !isServer) {
      config.plugins.push(
        new AssetSizePlugin(
          {
            buildId,
            distDir
          },
          nextConfig.size || {}
        )
      )

      if (config.output.futureEmitAssets) {
        // next v8 uses `futureEmitAssets` which deactivates asset.size()
        // so we disable it when using this plugin
        config.output.futureEmitAssets = false
      }
    }

    return webpack(config, options)
  }
})
