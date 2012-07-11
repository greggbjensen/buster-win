var config = module.exports;

config["Node tests"] = {
    environment: "node",
    tests: [
        "node/**/*-test.js"
    ]
};

config["Browser tests"] = {
    environment: "browser",
    rootPath: "../",
    libs: [
        "lib/*.js"
    ],
    sources: [
        "sources/core.js"
    ],
    tests: [
        "test/browser/**/*-test.js"
    ]
};