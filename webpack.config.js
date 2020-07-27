//

const path = require('path');
const webpack = require('webpack');


module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    app: './src/App.jsx',
  },
  output: {
    path: path.resolve(__dirname, 'static'),
    filename: 'bundle.js'
  },
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.jsx$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      }
    ]
  },
  devServer: {
    port:8000,
    contentBase: 'static',
    proxy: {
      '/api/*': {
        target: 'http://localhost:3000'
      }
    }
  }

};
