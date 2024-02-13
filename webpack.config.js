const path = require("path");

module.exports = {
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /\.ts$/,
        include: [path.resolve(__dirname, "src")],
        use: "ts-loader",
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  target: "web",
  output: {
    filename: "bundle.js",
    library: "mcbopomofo",
    libraryTarget: "umd",
    path: path.resolve(__dirname, "output/example"),
  },
};
