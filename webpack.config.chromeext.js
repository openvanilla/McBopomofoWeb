const path = require("path");

module.exports = {
  entry: "./src/chromeos_ime.ts",
  devtool: "cheap-source-map",
  module: {
    rules: [
      {
        test: /\.ts$/,
        include: [path.resolve(__dirname, "src")],
        exclude: [
          path.resolve(__dirname, "src/index.ts"),
          path.resolve(__dirname, "src/mcp.ts"),
          path.resolve(__dirname, "src/pime.ts"),
          path.resolve(__dirname, "src/pime_keys.ts"),
        ],
        use: "ts-loader",
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "output/chromeos"),
    devtoolModuleFilenameTemplate: "[absolute-resource-path]",
  },
};
