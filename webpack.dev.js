const merge = require('webpack-merge')
const common = require('./webpack.common')

module.exports = merge(common, {
  mode: 'development',
  entry: {
    index: './src'
  },
  devServer: {
    contentBase: 'public',
    open: true
  }
})
