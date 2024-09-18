const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { DefinePlugin } = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const dotenv = require("dotenv");

const mode = process.env.NODE_ENV || "production";

const envFile = `.env.${mode}`;
dotenv.config({ path: envFile });

// Define your multiple configurations with shared devServer settings
const combinedConfig = {
  entry: {
    staff: "./src/staff.tsx",
    department: "./src/department.tsx",
  },
  output: {
    path: path.resolve(__dirname, "apps"),
    filename: "[name]/dist/[name].js",
    publicPath: "/apps/",
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
        },
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
      },
      {
        test: /\.(woff(2)?|eot|ttf|otf|svg)$/,
        type: "asset/resource",
        generator: {
          filename: "[name][ext]",
          publicPath:
            mode === "development" ? "/fonts/" : `/apps/[name]/dist/fonts/`,
          outputPath: "fonts",
        },
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name]/dist/style.css",
    }),
    new DefinePlugin({
      // Only set custom environment variables, not NODE_ENV
      "process.env.API_URL": JSON.stringify(process.env.API_URL),
    }),
    new CopyWebpackPlugin({
      patterns: [
        // {
        //   from: "dev-apps/staff/plugin.php",
        //   to: "staff/plugin.php",
        //   context: path.resolve(__dirname),
        // },
        // {
        //   from: "dev-apps/department/plugin.php",
        //   to: "department/plugin.php",
        //   context: path.resolve(__dirname),
        // },
        {
          from: "dev-apps/staff",
          to: "staff/",
          noErrorOnMissing: true,
        },
        {
          from: "dev-apps/department",
          to: "department/",
          noErrorOnMissing: true,
        },
      ],
    }),
  ],
  devServer: {
    historyApiFallback: true,
    allowedHosts: "all",
    static: [
      {
        directory: path.resolve(__dirname, "apps/staff/dist"),
        publicPath: "/apps/staff/dist/",
      },
      {
        directory: path.resolve(__dirname, "apps/department/dist"),
        publicPath: "/apps/department/dist/",
      },
    ],
    hot: true,
    port: 3000,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers":
        "X-Requested-With, content-type, Authorization",
    },
  },
  mode,
  stats: {
    errorDetails: true,
  },
};

module.exports = combinedConfig;
