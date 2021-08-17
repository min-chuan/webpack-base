const path = require("path");
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',
  output: {
    filename: "js/[name].js",
    publicPath: '/',
  }, 
  devServer: {
    host: "127.0.0.1",
    port: 8080,
    contentBase: path.resolve(__dirname, 'dist'),
    quiet: true, // 关闭webpack错误日志
  },
  module: {
    rules: [
      /* 处理js */
      {
        test: /\.m?js$/,
        include: path.resolve(__dirname, 'src'),
        use: ["cache-loader", "babel-loader"],
      },
      /* 处理css */
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
    ]
  },
  plugins: [
    /* 配置全局/环境变量 */
    new webpack.DefinePlugin({
      BASE_URL: '/',
    }),
  ]
});