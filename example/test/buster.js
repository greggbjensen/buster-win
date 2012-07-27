var config = module.exports;

config["Node tests"] = {
    environment: "node",
    tests: [
       "node/**/*-test.js"
    ]
};

config["Browser tests"] = {
    autoRun: false,
    environment: "browser",
    rootPath: "../",
    libs: [
        "lib/*.js"
    ],
    sources: [
        "sources/core.js"
    ],
    routes: {
        '/hello/world': {
            get: function (req, res) {
                res.writeHead(200, {"Content-Type": "text/plain"});
                res.write('hello world');
                res.end();
            }
        },
        '/hello/:name': {
            get: function (req, res) {
                res.write('Hi ' + req.params[name]);
                res.end();
            }
        }
    },
    tests: [
        "test/browser/**/*-test.js"
    ]
};