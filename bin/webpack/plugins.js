import webpack from 'webpack'
import { config } from 'dotenv'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

config()

export default [
  new MiniCssExtractPlugin({
    filename: '[name].bundle.css'
  }),
  new webpack.LoaderOptionsPlugin({
    test: /\.styl$/,
    stylus: {
      preferPathResolver: 'webpack'
    },
    'resolve url': false
  })
]
