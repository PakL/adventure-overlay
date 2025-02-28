module.exports = {
    entry: {
        main: "./src/index.mjs",
        receiver: "./src/receiver.mjs"
    },
    output: {
        path: __dirname + '/dist',
        filename: '[name].js'
    }
}