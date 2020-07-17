//

const path = require('path');


module.exports = {
  mode: 'development',
  entry: './src/App.jsx',
  output: {
    path: path.resolve(__dirname, 'static'),
    filename: 'app.bundle.js'
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
  }
};
