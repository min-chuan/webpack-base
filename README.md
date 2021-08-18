# 使用Webpack#手写基于webpack5并拥有合理配置的简单项目#

## 摘要
这两天认真学习了[webpack指南](https://webpack.docschina.org/concepts/)部分，结合之前自己的使用和对vue脚手架的理解，觉得有必要自己动手实现一个通用的webpack5配置。接下来我会根据不同生产环境给予相应配置并作出适当说明。

> #### Tip
> 对于不同的环境，我们的构建需求是不同的。开发环境下，我们追求方便的可调式代码和更快的构建速度。生产环境下，我们则更关注代码的体积和性能

## 准备
初始化package.json
```javascript
npm init -y
```
创建项目结构
```javascript
├── public
│   ├── favicon.ico
│   └── index.html
└── src
    └── main.js
```
安装webpack
```javascript
npm i -D webpack webpack-cli
```


## 通用配置
webpack通用配置
```javascript
# 安装
npm i -D html-webpack-plugin 
npm i -D copy-webpack-plugin 
npm i -D friendly-wrrors-webpack-plugin 
npm i -D case-sensitive-paths-webpack-plugin

# webpack.common.js
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

```

## 开发配置
postcss配置
```javascript
# 安装
npm i -D postcss autoprefixer
# postcss.config.js
module.exports = {
  plugins: [
    require('autoprefixer')
  ]
}
```
babel配置
```javascript
# 安装
npm i -D @babel/cli @babel/core @babel/preset-env
npm i -S core-js regenerator-runtime

# babel.config.json
{
  "presets": [
    [
      "@babel/env",
      {
        "targets": "defaults",
        "useBuiltIns": "entry",
        "corejs": "3.6.5"
      }
    ]
  ]
}

# main.js(入口)手动导入
import "core-js/stable";
import "regenerator-runtime/runtime";
...
```
webpack开发配置
```javascript
# 安装
npm i -D webpack-merge webpack-dev-server
npm i -D cache-loader babel-loader style-loader css-loader postcss-loader
# webpack.dev.js
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
```

## 生产配置
```javascript
# 安装
npm i -D mini-css-extract-plugin css-minimizer-webpack-plugin
npm i -D thread-loader
# webpack.prod.js
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

```
## 完善项目
src/main.js
```javascript
...
const printMe = () => {
  console.log('hello webpack')
}

function component() {
  const element = document.querySelector('#app');
  const btn = document.createElement('button');
  btn.innerHTML = 'Click me and check the console!';
  btn.onclick = printMe;
  element.appendChild(btn);
  return element;
}

document.body.appendChild(component());
```
package.json添加命令
```json
{
  "scripts": {
    "start": "webpack serve --open --config webpack.dev.js",
    "build:prod": "webpack --config webpack.prod.js",
    "build:dev": "webpack --config webpack.dev.js"
  }, 
}
```
运行
```javascript
npm run start
```
