
const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    mode: 'production',
    devtool: 'source-map',
    entry: {
        server: './script.js',
    },
    output: {
        path: path.join(__dirname, 'build'),
        filename: 'index.js',
        library: 'app',
        libraryTarget: 'commonjs',
    },
    target: 'node',
    node: {
        __dirname: false,
        __filename: false,
    },
    externals: [nodeExternals()],
    module: {
        rules: [
            {
                // exclude: /node_modules/
            }
        ]
    }
};