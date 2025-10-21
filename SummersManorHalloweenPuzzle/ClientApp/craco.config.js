const path = require('path');
const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Keep any WASM settings you need; remove adapter aliases/replacement
      webpackConfig.experiments = {
        ...(webpackConfig.experiments || {}),
        asyncWebAssembly: true,
        topLevelAwait: true
      };

      webpackConfig.module.rules.push({
        test: /\.wasm$/i,
        type: 'webassembly/async'
      });

      webpackConfig.resolve = webpackConfig.resolve || {};
      webpackConfig.resolve.fallback = {
        ...(webpackConfig.resolve.fallback || {}),
        fs: false,
        path: false,
        crypto: false,
        stream: false
      };

      // Remove any webrtc-adapter aliases and NormalModuleReplacementPlugin
      webpackConfig.resolve.alias = {
        ...(webpackConfig.resolve.alias || {})
      };

      webpackConfig.plugins = (webpackConfig.plugins || []).filter(
        (p) => !(p instanceof webpack.NormalModuleReplacementPlugin)
      );

      return webpackConfig;
    }
  },
  devServer: {
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) throw new Error('webpack-dev-server is not defined');
      return middlewares;
    }
  }
};