/*
 * Copyright (c) 2020 Cynthia K. Rey, All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

const { join } = require('path')
const { existsSync, readdirSync, unlinkSync, writeFileSync } = require('fs')
const { createHash } = require('crypto')

const PreactRefresh = require('@prefresh/webpack')
const MiniCSS = require('mini-css-extract-plugin')
const CssMinimizer = require('css-minimizer-webpack-plugin')
const FriendlyErrors = require('friendly-errors-webpack-plugin')
const { WebpackManifestPlugin: Manifest } = require('webpack-manifest-plugin')
const { DefinePlugin, HotModuleReplacementPlugin, optimize: { LimitChunkCountPlugin } } = require('webpack')

// Env vars
const COMMIT_HASH = require('child_process').execSync('git rev-parse HEAD').toString().trim()
const IS_DEV = process.env.NODE_ENV === 'development'
const SRC = join(__dirname, 'src')
const OUT = join(__dirname, '..', 'dist', 'dist')

const baseConfig = {
  mode: IS_DEV ? 'development' : 'production',
  context: SRC,
  entry: './main.ts',
  output: {
    path: OUT,
    filename: IS_DEV ? '[name].js' : '[contenthash].js',
    chunkFilename: IS_DEV ? '[name].chk.js' : '[contenthash].js',
    crossOriginLoading: 'anonymous',
    chunkLoadingGlobal: 'w',
    publicPath: '/dist/'
  },
  resolve: {
    extensions: [ '.js', '.ts', '.tsx' ],
    alias: {
      '@components': join(SRC, 'components'),
      '@assets': join(SRC, 'assets'),
      '@constants': join(SRC, 'constants.ts'),
      '@shared': join(__dirname, '..', 'extension', 'shared.ts')
    }
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /\.(js|ts)x?/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [ '@babel/react', { pragma: 'h', pragmaFrag: 'Fragment' } ],
                [ '@babel/typescript', { isTSX: true, allExtensions: true, jsxPragma: 'h' } ]
              ],
              plugins: [
                '@babel/syntax-dynamic-import',
                '@babel/proposal-object-rest-spread',
                IS_DEV ? '@prefresh/babel-plugin' : null
              ].filter(Boolean)
            }
          }
        ]
      },
      {
        test: /\.s?css$/,
        use: [
          IS_DEV ? 'style-loader' : MiniCSS.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: { postcssOptions: { plugins: [ 'autoprefixer' ] } }
          },
          'sass-loader'
        ]
      },
      {
        test: /\.(svg|mp4|webm|woff2?|eot|ttf|otf|wav|ico)$/,
        use: [
          {
            loader: 'file-loader',
            options: { name: '[hash:20].[ext]' }
          }
        ]
      },
      {
        test: /\.(png|jpe?g|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: { name: '[hash:20].[ext]' }
          },
          {
            loader: 'image-webpack-loader',
            options: {
              disable: IS_DEV,
              mozjpeg: {
                progressive: true,
                quality: 95
              },
              optipng: { enabled: false },
              pngquant: {
                quality: [ 0.9, 1 ],
                speed: 4
              },
              gifsicle: {
                interlaced: true,
                optimizationLevel: 2
              }
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new DefinePlugin({ 'process.env.BUILD_SIDE': JSON.stringify('client') }),
    new Manifest({ writeToFileEmit: true, fileName: join(OUT, '..', 'manifest.webpack.json') }),
    !IS_DEV && {
      apply: (compiler) =>
        compiler.hooks.emit.tap('emitIntegrity', (compilation) => {
          const stats = compilation.getStats().toJson({ all: false, assets: true })
          const integrity = {}
          for (const [ chk, files ] of Object.entries(stats.assetsByChunkName)) {
            for (const file of files) {
              const sauce = compilation.assets[file].source()
              const sha256 = createHash('sha256').update(sauce, 'utf8').digest('base64')
              const sha512 = createHash('sha512').update(sauce, 'utf8').digest('base64')
              integrity[`${chk}.${file.split('.').pop()}`] = `sha256-${sha256} sha512-${sha512}`
            }
          }

          const file = join(OUT, '..', 'integrity.webpack.json')
          writeFileSync(file, JSON.stringify(integrity, null, 2), 'utf8')
        })
    },
    new DefinePlugin({ GIT_REVISION: JSON.stringify(COMMIT_HASH) })
  ].filter(Boolean),
  optimization: {
    minimize: !IS_DEV,
    minimizer: [ '...', new CssMinimizer() ],
    splitChunks: {
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /\.s?css$/,
          chunks: 'all',
          enforce: true
        }
      }
    }
  },
  devServer: {
    port: 8080,
    hot: true,
    quiet: true,
    publicPath: '/dist/',
    contentBase: __dirname,
    historyApiFallback: true,
    proxy: { '/api': `http://localhost:${require('../config.json').port}/` }
  }
}

if (IS_DEV) {
  baseConfig.plugins.push(new HotModuleReplacementPlugin(), new FriendlyErrors(), new PreactRefresh())
  module.exports = baseConfig
} else {
  baseConfig.plugins.push(
    new MiniCSS({ filename: '[contenthash].css', chunkFilename: '[contenthash].css' }),
    {
      apply: (compiler) =>
        compiler.hooks.compile.tap('cleanBuild', () => {
          if (existsSync(compiler.options.output.path)) {
            for (const filename of readdirSync(compiler.options.output.path)) {
              unlinkSync(join(compiler.options.output.path, filename))
            }
          }
        })
    }
  )

  const nodeCfg = {
    ...baseConfig,
    entry: './components/Html.tsx',
    target: 'node',
    output: {
      filename: 'html.js',
      chunkFilename: '[name].chk.js',
      libraryTarget: 'commonjs2',
      path: join(OUT, '..', 'build'),
      publicPath: '/dist/'
    },
    plugins: [
      ...baseConfig.plugins.slice(3), // Slice manifest, build side, sri
      new LimitChunkCountPlugin({ maxChunks: 1 }),
      new DefinePlugin({ 'process.env.BUILD_SIDE': JSON.stringify('server') })
    ],
    optimization: { minimize: false },
    externals: [ require('webpack-node-externals')() ]
  }

  module.exports = [ baseConfig, nodeCfg ]
}
