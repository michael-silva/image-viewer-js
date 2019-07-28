const path = require('path');
const config = require('./webpack.config');

module.exports = {
  ...config,
  devServer: {
    port: 3000,
    contentBase: path.join(__dirname, 'demo'),
  },
  entry: './demo/index.js',
  output: {
    path: path.resolve(__dirname, 'demo/dist'),
    filename: 'index.js',
  },
  resolve: {
    alias: {
      'image-viewer-js': path.resolve(__dirname, 'src'),
    },
  },
};
