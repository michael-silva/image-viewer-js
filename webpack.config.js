const path = require('path');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  watch: true,
  devServer: {
    port: 3000,
    contentBase: path.join(__dirname, 'demo'),
  },
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js'
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};