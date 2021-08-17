const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

module.exports = {
  context: __dirname,
  entry: {
    main: "./src/main.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    clean: true, // 每次打包清空前一次打包内容
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  optimization: {
    splitChunks: {
      chunks: 'async',
      minSize: 20000,
      minRemainingSize: 0,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      enforceSizeThreshold: 50000,
      cacheGroups: {
        vendors: {
          chunks: 'initial',
          name: 'chunk-vendors',
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
        },
        common: {
          chunks: 'initial',
          name: 'chunk-common',
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
  module: {
    rules: [
      /* 处理图像 */
      {
        test: /\.(png|svg|jpg|jpeg|gif|webp)(\?.*)?$/,
        type: "asset", // 小于 8kb 的文件，将会视为 inline 模块类型，否则会被视为 resource 模块类型。
        generator: {
          filename: "img/[name].[hash:8][ext]",
        },
      },
      /* 处理字体 */
      {
        test: /\.(woff|woff2|eot|ttf|otf)(\?.*)?$/,
        type: "asset",
        generator: {
          filename: "fonts/[name].[hash:8][ext]",
        },
      },
      /* 处理媒体 */
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        type: "asset",
        generator: {
          filename: "media/[name].[hash:8][ext]",
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Production",
      template: path.resolve(__dirname, "public/index.html"),
      inject: "body",
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "public"),
          to: path.resolve(__dirname, "dist"),
          globOptions: {
            dot: true,
            gitignore: true,
            ignore: ["**/index.html"],
          },
        },
      ],
    }),
    new FriendlyErrorsWebpackPlugin(),
    new CaseSensitivePathsPlugin()
  ],
};
