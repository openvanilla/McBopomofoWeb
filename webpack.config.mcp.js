const path = require("path");

module.exports = {
  entry: "./src/mcp.ts",
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
    library: "mcbopomofo",
    libraryTarget: "umd",
    globalObject: "this",
    path: path.resolve(__dirname, "output/mcp"),
  },
};
