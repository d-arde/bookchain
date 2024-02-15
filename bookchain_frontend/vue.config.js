const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  transpileDependencies: [
    "crypto-browserify",
    "stream-browserify",
    "@solana/wallet-adapter",
    "@solana/wallet-adapter-vue",
    "@solana/wallet-adapter-wallets",
    "@solana/wallet-adapter-react",
    // Add other dependencies if needed
  ],

  configureWebpack: {
    resolve: {
      fallback: {
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
      },
    },
  },
});
