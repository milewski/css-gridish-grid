import * as path from 'path'
import * as webpack from 'webpack'

export default {
    context: path.resolve(__dirname, 'source'),
    devtool: 'source-map',
    entry: {
        'gridish': './Gridish.ts',
        'gridish.min': './Gridish.ts'
    },
    output: {
        path: path.resolve(__dirname, 'distribution'),
        library: 'Gridish',
        libraryTarget: 'commonjs2',
        filename: '[name].js'
    },
    resolve: {
        extensions: [ '.ts' ]
    },
    module: {
        rules: [
            { test: /\.ts$/, loader: 'ts-loader' }
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({ include: /\.min\.js$/, minimize: true })
    ]
}
