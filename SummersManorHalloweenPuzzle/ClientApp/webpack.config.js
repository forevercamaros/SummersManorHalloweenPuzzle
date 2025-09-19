const path = require('path');

module.exports = {
  devServer: {
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }

      // You can add custom middleware here if needed
      return middlewares;
    }
  }
};