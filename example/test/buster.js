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
    sources: [
        "lib/mylib.js",
        "lib/**/*.js"
    ],
    tests: [
        "test/*-test.js"
    ]
};