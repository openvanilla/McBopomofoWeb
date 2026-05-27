const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: "./src/cli.ts",
  module: {
    rules: [
      {
        test: /\.ts$/,
        include: [path.resolve(__dirname, "src")],
        exclude: [
          path.resolve(__dirname, "src/index.ts"),
          path.resolve(__dirname, "src/chromeos_ime.ts"),
          path.resolve(__dirname, "src/pime.ts"),
          path.resolve(__dirname, "src/pime_keys.ts"),
          path.resolve(__dirname, "src/LargeSync/LargeSync.ts"),
        ],
        use: "ts-loader",
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  target: "node",
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "output/cli"),
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: "#!/usr/bin/env node",
      raw: true,
    }),
  ],
};
