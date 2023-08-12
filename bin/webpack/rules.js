import MiniCssExtractPlugin from 'mini-css-extract-plugin'
export default [
  {
    test: /\.jsx?$/,
    exclude: /node_modules/,
    use: ['babel-loader?cacheDirectory']
  },
  {
    test: /\.styl$/,
    use: [
      {
        loader: MiniCssExtractPlugin.loader,
        options: {
          // you can specify a publicPath here
          // by default it use publicPath in webpackOptions.output
          publicPath: '../'
        }
      },
      'css-loader',
      'stylus-loader'
    ]
  },
  {
    test: /\.css$/,
    use: [
      {
        loader: MiniCssExtractPlugin.loader,
        options: {
          // you can specify a publicPath here
          // by default it use publicPath in webpackOptions.output
          publicPath: '../'
        }
      },
      {
        loader: 'css-loader'
      }
    ]
  },
  {
    test: /\.(png|jpg|svg)$/,
    use: ['url-loader?limit=1&name=images/[name].bundle.[ext]']
  }
]
