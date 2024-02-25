const path = require("path");

module.exports = {
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /\.ts$/,
        include: [path.resolve(__dirname, "src")],
        exclude: [
          path.resolve(__dirname, "src/chromeos_ime.ts"),
          path.resolve(__dirname, "src/pime.ts"),
          path.resolve(__dirname, "src/LargeSync/LargeSync.ts"),
        ],
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
