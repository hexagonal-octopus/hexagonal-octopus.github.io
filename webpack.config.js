const path = require('path');

module.exports = {
   entry: {
      main: './src/js/main.js'
   },
   output: {
      filename: "[name].min.js",
      path: path.resolve(__dirname, "dist/js")
   },
   module: {
      rules: [
         {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: "babel-loader",
            options: {
               presets: [
                  ["@babel/preset-env", { targets: "defaults" }]
               ]
            }
         }
      ]
   },
   mode: process.env.NODE_ENV == "production" ? "production" : "development"
}