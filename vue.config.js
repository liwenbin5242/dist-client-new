'use strict'
const path = require('path')
const defaultSettings = require('./src/settings.js')

function resolve(dir) {
  return path.join(__dirname, dir)
}

const name = defaultSettings.title || 'jmalCloud' // page title

//如果您的端口设置为80，
//使用管理员权限执行命令行。
//例如，Mac：sudo npm run
//您可以通过以下方法更改端口：
// port = 3100 npm run dev或npm run dev --port = 3100
const port = process.env.port || process.env.npm_config_port || 3101 // dev port

//所有配置项说明均可在https://cli.vuejs.org/config/中找到

const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

// let monacoLanguages = []
// const modulesFiles = require.context("monaco-languages/release/dev/", true, /\.js$/)
// modulesFiles.keys().reduce((modules, modulePath) => {
//   const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, "$1");
//   if(moduleName.indexOf('contribution') === -1){
//     monacoLanguages.push(moduleName.replace(/([/][^/]+)$/, ""))
//   }
//   // const value = modulesFiles(modulePath);
//   // modules[moduleName] = value.default;
//   // return modules;
// }, {});

module.exports = {

/**
  *如果您打算在子路径下部署网站，则需要设置publicPath，
  *例如GitHub Pages。如果您打算将网站部署到https://foo.github.io/bar/，
  *然后publicPath应该设置为“ / bar /”。
  *在大多数情况下，请使用'/'！
  *详细信息：https://cli.vuejs.org/config/#publicpath
*/
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: false,
  productionSourceMap: false,
  devServer: {
    port: port,
    open: false,
    overlay: {
      warnings: false,
      errors: true
    },
    proxy: {
      [process.env.VUE_APP_BASE_API]: {
        target: 'http://localhost:3101',
        changeOrigin: true,
      }
    }
  },
  configureWebpack: {
    //在webpack的名称字段中提供应用程序的标题，以便
    //可以在index.html中对其进行访问以注入正确的标题。
    name: name,
    resolve: {
      alias: {
        '@': resolve('src')
      }
    }
  },
  chainWebpack(config) {
    config.plugins.delete('preload') // TODO: need test
    config.plugins.delete('prefetch') // TODO: need test

    config.plugin('monaco-editor').use(MonacoWebpackPlugin, [
      {
        languages: [
          "json","abap", "apex", "azcli", "bat", "cameligo","clojure", "coffee", "cpp", "yaml",
          "csharp", "csp", "css","dockerfile", "fsharp", "go", "graphql", "handlebars","html", "ini",
          "java", "javascript", "kotlin", "less","lua", "markdown", "mips", "msdax", "mysql", "objective-c",
          "pascal", "pascaligo", "perl", "pgsql", "php", "postiats","powerquery", "powershell", "pug", "python",
          "r", "razor","redis", "redshift", "restructuredtext", "ruby", "rust","sb", "scheme", "scss",
          "shell", "solidity", "sophia", "sql","st", "swift", "tcl", "twig", "typescript", "vb",
          "xml",
        ]
      }
    ])

    // set svg-sprite-loader
    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()

    // set preserveWhitespace
    config.module
      .rule('vue')
      .use('vue-loader')
      .loader('vue-loader')
      .tap(options => {
        options.compilerOptions.preserveWhitespace = true
        return options
      })
      .end()

    config
      .when(process.env.NODE_ENV === 'development',
        config => config.devtool('cheap-source-map')
      )

    config
      .when(process.env.NODE_ENV !== 'development',
        config => {
          config
            .plugin('ScriptExtHtmlWebpackPlugin')
            .after('html')
            .use('script-ext-html-webpack-plugin', [{
            // `runtime` must same as runtimeChunk name. default is `runtime`
              inline: /runtime\..*\.js$/
            }])
            .end()
          config
            .optimization.splitChunks({
              chunks: 'all',
              cacheGroups: {
                libs: {
                  name: 'chunk-libs',
                  test: /[\\/]node_modules[\\/]/,
                  priority: 10,
                  chunks: 'initial' // only package third parties that are initially dependent
                },
                elementUI: {
                  name: 'chunk-elementUI', // split elementUI into a single package
                  priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
                  test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
                },
                commons: {
                  name: 'chunk-commons',
                  test: resolve('src/components'), // can customize your rules
                  minChunks: 3, //  minimum common number
                  priority: 5,
                  reuseExistingChunk: true
                }
              }
            })
          config.optimization.runtimeChunk('single')
        }
      )
  }
}
