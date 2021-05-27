const merge = require('webpack-merge')
const common = require('./webpack.common')

module.exports = merge(common, {
  mode: 'development',
  entry: {
    index: './src'
  },
  devtool: 'eval-source-map',
  devServer: {
    contentBase: 'public',
    open: true
  }
})
