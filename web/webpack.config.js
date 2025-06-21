const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin"); //自动生成html打包文件
const MiniCSSExtractPlugin = require("mini-css-extract-plugin"); //将css单独放置一个文件
const CssMinimizerWebpackPlugin = require("css-minimizer-webpack-plugin"); //使用cssnano优化和压缩CSS
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

const WebpackBar = require("webpackbar");

module.exports = {
  output: {
    filename: "[name]-[chunkhash:5].js",
    path: path.resolve(__dirname, `dist`),
    clean: true,
  },
  devtool: "inline-source-map",
  plugins: [
    new HtmlWebpackPlugin({
      title: "管理输出",
      filename: "index.html",
      template: "./index.html",
    }),
    new WebpackBar({ color: "#9c27b0" }),
    new MiniCSSExtractPlugin(),
    new ReactRefreshWebpackPlugin({
      overlay: false,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.bcmap$/,
        type: 'asset/resource',
      },
      {
        test: /pdf\.worker\.min\.mjs$/,
        type: 'asset/resource',
        use: { loader: 'worker-loader' },
        generator: {
          filename: 'pdf.worker.min.mjs'
        }
      },
      {
        test: /\.worker\.ts$/,
        use: [
          {
            loader: "worker-loader",
            options: {
              inline: "fallback",
            },
          },
          {
            loader: "ts-loader",
          },
        ],
      },
      //
      {
        test: /\.css|scss$/i,
        use: [
          MiniCSSExtractPlugin.loader,
          // 'style-loader',
          {
            loader: "css-loader",
            options: {
              esModule: false,
              modules: {
                localIdentName: "[local]_[hash:base64:5]",
              },
            },
          },
          "sass-loader",
          "postcss-loader",
        ],
      },
      //css 放置在header的style中
      // use: [MiniCSSExtractPlugin.loader, 'css-loader','sass-loader'], // 单独一个文件存放css
      //babel-loader Es6 -> Es5
      {
        test: /\.(js|jsx|tsx)$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            // jsx->Es5
            presets: ["@babel/preset-env", "@babel/preset-react"],
            plugins: [
              //regeneratorRuntime 兼容async-await
              ["@babel/plugin-transform-runtime"],
            ],
          },
        },
      },
      //ts-loader 编译ts
      {
        test: /\.(ts|tsx)$/,
        exclude: /(node_modules)/,
        use: {
          loader: "ts-loader",
        },
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: "url-loader",
            options: {
              name: "[name].[ext]",
              outputPath: "assets/images",
            },
          },
        ],
      },
    ],
  },
  resolveLoader: {
    alias: {},
  },
  //优化
  optimization: {
    //覆盖默认压缩工具
    minimizer: [new CssMinimizerWebpackPlugin()],
    usedExports: true,
  },
  //dev HMR
  devServer: {
    hot: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
};
