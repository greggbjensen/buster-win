(function (exports) {
    //Dependencies
    var path = require('path');
    var _ = require('underscore');


    var routesArray = [];
    var queryParams = [];

    /**
     * A Route object
     * @return returns a Route object
     * @constructor
     */
    var Route = function () {
        return {
            path: '',
            regexPath: '',
            params: null,
            tokens: null,
            methods: {}
        }
    };

    exports.matchRoute = function (route) {


        //Iterate over each route and if the request is a match assign route
        var matchedRoute = null;

        var i = 0;
        for(matchedRoute, i; i < routesArray.length && !matchedRoute; i++) {
            if(compareRoute(routesArray[i].tokens, route)) {
                matchedRoute = routesArray[i];
            }
        }

        return matchedRoute;
    };

    exports.extractParams = function (route, matchedRoute, req) {
        var reqTokens = tokenizeRoute(route);
        //create a key/value params object attached to request
        _.each(matchedRoute.params, function (position, name) {
            req.params[name] = reqTokens[position];
        });
    };

    exports.extractQueryParams = function (query) {
        var queryParams = {};
        var keyValPairs = query.match(/[^&]*/g);
        var keyAndValue;
        _.each(keyValPairs, function (pair) {
            if(pair != '') {
                keyAndValue = pair.match(/[^=]*/g);
                queryParams[keyAndValue[0]] = keyAndValue[2];
                keyAndValue = null;
            }
        });
        return queryParams;
    };

    /**
     * Break a route down into tokens
     * @param route the route
     * @return returns an array of tokens
     * @private
     */
    var tokenizeRoute = function (route) {
        var routeTokens = route.split('/');
        return routeTokens;
    };

    var compareRoute = function (routeTokens, request) {
        var requestTokens = tokenizeRoute(request);
        if(routeTokens.length != requestTokens.length) return false;
        else {
            var i = 0;
            var match = true;
            for(i; i<routeTokens.length; i++) {
                //only check if its not a ':param'
                if(!(routeTokens[i].charAt(0) == ':') && match == true) {
                    if(!(requestTokens[i] == routeTokens[i]) && match == true) match = false;
                }
            }
            return match;
        }
        //if it made it here something went wrong
        return false;
    };

    /**
     * Iterate over each routes method callbacks and add them to the appropriate route object
     * @param func an object of the given methods
     * @return an object containing each method and its callback
     * @private
     */
    var assignRouteMethodCallbacks = function (func) {
        var methods = {
            get: null,
            post: null,
            update: null,
            delete: null
        };
        if (func.get) methods.get = func.get;
        if (func.post) methods.post = func.post;
        if (func.update) methods.update = func.update;
        if (func.delete) methods.delete = func.delete;
        return methods;
    };

    /**
     * Convert the parameters in the passed in route to regular expressions
     * @param route the route to convert
     * @return a regex route
     * @private
     */
    var convertRouteToRegex = function (route) {
        var params = route.match(/:[A-Za-z]*/g);
        var result = route;
        _.each(params, function (param) {
            result = result.replace(param, '.+');
        });
        return result;
    };

    /**
     * Get the routes parameters and assign a key/val pair of the name and token position to an object
     * @param tokenizedRoute an array of tokens for a route
     * @return an object that contains the parameter name and token position
     * @private
     */
    var getParams = function (tokenizedRoute) {
        var params = {};
        _.each(tokenizedRoute, function (token) {
            if(token.charAt(0) == ':') {
                var name = token.slice(1);
                params[name] = tokenizedRoute.indexOf(token);
            }
        });
        return params;
    };

    /**
     * Sets up the default route and creates routes from the config
     * @param config the config object
     * @param options any additional variables or parameters that need to be passed
     * @private
     */
    exports.initializeRoutes = function (config, options) {
        //Generate the default route
        var defaultRoute = new Route();
        defaultRoute.path = '/';
        defaultRoute.regexPath = '/';
        defaultRoute.tokens = tokenizeRoute(defaultRoute.path);
        defaultRoute.methods = assignRouteMethodCallbacks({
            get: function (req, res) {
                // Output startup statement for phantomjs.
                if (config.autoRun !== false) {
                    console.log('\nRunning "' + config.configName + '" in browser environment.\n' +
                        '----------------------------------------------------\n');
                }

                // Output relative script tags for all test scripts.
                var testScripts = _(options.scriptFiles).reduce(function(memo, file){
                    return memo + '        <script type="text/javascript" src="' +
                        path.relative(options.rootPath, file) + '"></script>\n';
                }, '');

                var html =
                    '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">\n' +
                        '<html>\n' +
                        '   <head>\n' +
                        '       <meta http-equiv="content-type" content="text/html; charset=utf-8">' +
                        '       <title>Buster.js Test Runner</title>\n' +
                        '   </head>\n' +
                        '   <body>\n' +
                        '       <div id="fixture"></div>\n' +
                        '       <script type="text/javascript" src="buster-test.js"></script>\n' +
                        '       <script type="text/javascript" src="buster-win/reporters/console.js"></script>\n' +
                        '       <script type="text/javascript" src="buster-win/reporters/dots.js"></script>\n' +
                        '       <script type="text/javascript" src="buster-win/bootstrap.js"></script>\n' +
                        testScripts +
                        '   </body>\n' +
                        '</html>';
                res.end(html);
            }
        });
        routesArray.push(defaultRoute);
        //initialize all routes from the config file
        _.each(config.routes, function (func, route) {
            var r = new Route();
            r.path = route;
            r.regexPath = convertRouteToRegex(route);
            r.tokens = tokenizeRoute(route);
            r.params = getParams(r.tokens);
            r.methods = assignRouteMethodCallbacks(func);
            routesArray.push(r);
        });
    };
})(module.exports)