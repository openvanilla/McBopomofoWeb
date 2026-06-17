const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require("webpack");

// Patch RegExp so that the 's' (dotAll) flag does not throw on old Node.js.
// The snippet runs before any webpack module is evaluated.
// It wraps the native RegExp: when the 's' flag is requested, it strips the
// flag from the constructor call and replaces every unescaped '.' in the
// source with '[\s\S]' (which is what dotAll means).
const regexpPatchBanner = `
(function() {
  var NativeRegExp = RegExp;
  try { new NativeRegExp('.', 's'); } catch(e) {
    RegExp = function RegExp(pattern, flags) {
      if (typeof flags === 'string' && flags.indexOf('s') !== -1) {
        flags = flags.replace(/s/g, '');
        // Replace unescaped dots with [\\s\\S]
        if (typeof pattern === 'string') {
          var result = '', inClass = false;
          for (var i = 0; i < pattern.length; i++) {
            var ch = pattern[i];
            if (ch === '\\\\' && i + 1 < pattern.length) {
              result += ch + pattern[++i];
            } else if (ch === '[') {
              inClass = true; result += ch;
            } else if (ch === ']') {
              inClass = false; result += ch;
            } else if (ch === '.' && !inClass) {
              result += '[\\\\s\\\\S]';
            } else {
              result += ch;
            }
          }
          pattern = result;
        }
      }
      if (this instanceof RegExp) {
        return new NativeRegExp(pattern, flags);
      }
      return NativeRegExp(pattern, flags);
    };
    RegExp.prototype = NativeRegExp.prototype;
    Object.keys(NativeRegExp).forEach(function(k) { RegExp[k] = NativeRegExp[k]; });
  }
})();
`;

const babelES5Options = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: "ie 11",
        modules: "commonjs",
        useBuiltIns: "usage",
        corejs: 3,
      },
    ],
  ],
};

module.exports = {
  mode: "production",
  target: "node",
  entry: "./src/pime.ts",

  module: {
    rules: [
      {
        test: /\.ts$/,
        include: [path.resolve(__dirname, "src")],
        exclude: [
          path.resolve(__dirname, "src/index.ts"),
          path.resolve(__dirname, "src/chromeos_ime.ts"),
        ],
        use: [
          {
            loader: "babel-loader",
            options: babelES5Options,
          },
          {
            loader: "ts-loader",
            options: {
              compilerOptions: {
                target: "es5",
                module: "commonjs",
                downlevelIteration: true,
                ignoreDeprecations: "6.0",
              },
            },
          },
        ],
      },
      {
        test: /\.mjs$/,
        type: "javascript/auto",
        use: {
          loader: "babel-loader",
          options: babelES5Options,
        },
      },
    ],
  },

  resolve: {
    extensions: [".ts", ".js"],
  },

  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "output/pime"),
    libraryTarget: "commonjs2",
    environment: {
      arrowFunction: false,
      const: false,
      destructuring: false,
      dynamicImport: false,
      forOf: false,
      module: false,
      optionalChaining: false,
      templateLiteral: false,
      methodShorthand: false,
    },
  },

  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          ecma: 5,
          compress: {
            ecma: 5,
          },
          format: {
            ecma: 5,
          },
        },
      }),
    ],
  },

  plugins: [
    new webpack.BannerPlugin({
      banner: regexpPatchBanner,
      raw: true,
    }),
  ],
};
