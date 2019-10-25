const path = require('path');
const babelConfig = require('./babel.config');

module.exports = {
  entry: {
    index: './src/index.js',
    helpers: './src/helpers/index.js',
    adapters: './src/adapters/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  mode: 'development',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: babelConfig,
        },
      },
    ],
  },
};
