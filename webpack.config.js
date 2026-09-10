import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Dotenv from 'dotenv-webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import {
  EXPOSED_APP,
  REMOTE_ENTRY_FILENAME,
  REMOTE_NAME,
  sharedDependencies,
} from './webpack/federation.js';

const { ModuleFederationPlugin } = webpack.container;
const root = path.dirname(fileURLToPath(import.meta.url));
const source = path.join(root, 'src');

export default (env = {}, argv = {}) => {
  const production = argv.mode === 'production';

  return {
    mode: production ? 'production' : 'development',
    entry: path.join(source, 'index.tsx'),
    devtool: production ? 'source-map' : 'eval-cheap-module-source-map',
    output: {
      path: path.join(root, 'build'),
      publicPath: 'auto',
      clean: true,
      filename: production
        ? 'assets/[name].[contenthash:8].js'
        : 'assets/[name].js',
      chunkFilename: production
        ? 'assets/[name].[contenthash:8].chunk.js'
        : 'assets/[name].chunk.js',
      assetModuleFilename: 'assets/[name].[contenthash:8][ext]',
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
      extensionAlias: { '.js': ['.ts', '.tsx', '.js'] },
      alias: { '@': source },
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          include: source,
          use: {
            loader: 'babel-loader',
            options: {
              // Jest compiles modules to CommonJS; production must keep ESM.
              configFile: false,
              presets: [
                ['@babel/preset-env', { modules: false, bugfixes: true }],
                [
                  '@babel/preset-react',
                  { runtime: 'automatic', development: !production },
                ],
                '@babel/preset-typescript',
              ],
            },
          },
        },
        {
          test: /\.css$/,
          use: [
            production ? MiniCssExtractPlugin.loader : 'style-loader',
            { loader: 'css-loader', options: { importLoaders: 1 } },
            'postcss-loader',
          ],
        },
        {
          test: /\.(png|jpe?g|gif|svg|woff2?)$/i,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({ template: path.join(source, 'index.html') }),
      new Dotenv({
        path: path.join(root, '.env'),
        defaults: path.join(root, '.env.defaults'),
        systemvars: true,
        silent: true,
      }),
      new ModuleFederationPlugin({
        name: REMOTE_NAME,
        filename: REMOTE_ENTRY_FILENAME,
        exposes: {
          [EXPOSED_APP]: path.join(source, 'remote/WatchLogApp.tsx'),
        },
        shared: sharedDependencies(),
      }),
      ...(production
        ? [
            new MiniCssExtractPlugin({
              filename: 'assets/[name].[contenthash:8].css',
              chunkFilename: 'assets/[name].[contenthash:8].chunk.css',
            }),
          ]
        : []),
      ...(env.analyze
        ? [
            new BundleAnalyzerPlugin({
              analyzerMode: 'static',
              reportFilename: '../reports/remote.html',
              statsFilename: '../reports/remote-stats.json',
              generateStatsFile: true,
              openAnalyzer: false,
            }),
          ]
        : []),
    ],
    optimization: {
      runtimeChunk: false,
      usedExports: true,
      sideEffects: true,
      minimizer: ['...', new CssMinimizerPlugin()],
      splitChunks: {
        chunks: 'async',
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            reuseExistingChunk: true,
          },
        },
      },
    },
    devServer: {
      port: 3001,
      historyApiFallback: true,
      hot: true,
      headers: { 'Access-Control-Allow-Origin': '*' },
    },
    performance: { hints: false },
    stats: 'errors-warnings',
  };
};
