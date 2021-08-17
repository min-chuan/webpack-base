const path = require("path");
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const webpack = require('webpack');

module.exports = merge(common, {
  mode: "production",
  devtool: "cheap-module-source-map",
  output: {
    filename: "js/[name].[contenthash:8].js",
    publicPath: "/", // 根据项目实际路径来写
  },
  module: {
    rules: [
      /* 处理js */
      {
        test: /\.m?js$/,
        include: path.resolve(__dirname, "src"),
        use: ["cache-loader", "thread-loader", "babel-loader"], // thread-loader开启多线程打包
      },
      /* 处理css */
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: "css-loader", options: { sourceMap: false } }, // css不实用sourcemap
          "postcss-loader",
        ],
      },
    ],
  },
  plugins: [
    /* 配置全局/环境变量 */
    new webpack.DefinePlugin({
      BASE_URL: '/',
    }),
    /* css提取 */
    new MiniCssExtractPlugin({ filename: "css/[name].[contenthash:8].css" }),
    /* css压缩 */
    new CssMinimizerPlugin(),
  ],
});
