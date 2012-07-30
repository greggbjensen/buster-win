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
                res.writeHead(200, {"Content-Type": "text/plain"});
                res.write('Hi ' + req.params.name);
                res.end();
            }
        },
        '/test': {
            get: function (req, res) {
                res.writeHead(200, {"Content-Type": "text/plain"});
                res.write('hi ' + req.params.name);
                res.end();
            }
        },
        '/hello/:name/i/love/to/eat/:fruit': {
            get: function (req, res) {
                res.writeHead(200, {"Content-Type": 'text/plain'});
                res.write('Hi ' + req.params.name + '. Disco Stew loves to eat ' + req.params.fruit);
                res.end();
            }
        }
    },
    tests: [
        "test/browser/**/*-test.js"
    ]
};