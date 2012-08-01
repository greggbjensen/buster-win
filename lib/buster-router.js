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
            tokens: null,
            methods: {}
        }
    };

    exports.matchRoute = function (uri) {


        //Iterate over each route and if the request is a match assign route
        var matchedRoute = null;

        var i = 0;
        for(matchedRoute, i; i < routesArray.length && !matchedRoute; i++) {
            var route = routesArray[i];
            if(route.regexPath.test(uri)) {
                matchedRoute = route;
            }
        }

        return matchedRoute;
    };

    exports.extractParams = function (uri, matchedRoute) {

        var params;

        var matches = matchedRoute.regexPath.exec(uri);

        // If there are tokens; return named parameters; otherwise return an array.
        if (matchedRoute.tokens && matchedRoute.tokens.length > 0) {
            params = {};

            // Skip the first entry as it is the whole string matched.
            for (var i = 1; i < matches.length; i++) {
                params[matchedRoute.tokens[i - 1]] = matches[i];
            }
        }
        else {
            params = [];
            for (var i = 1; i < matches.length; i++) {
                params.push(matches[i]);
            }
        }

        return params;
    };

    exports.extractQuery = function (query) {
        if (!query) {
            return {};
        }

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
    var listRouteTokens = function (route) {

        // TODO: Figure out better way to check for Regex.
        var routeTokens;
        var isRegex = route.indexOf(')') !== -1;
        if (!isRegex) {
            var parts = route.split(':');

            if (parts.length > 0) {
                routeTokens = parts.map(function(part) {
                    part.split('/')[0];
                })
            }
        }

        return routeTokens;
    };

    var compareRoute = function (routeTokens, request) {
        var requestTokens = listRouteTokens(request);
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
        return new RegExp('^' + result + '$', 'i');
    };

    /**
     * Sets up the default route and creates routes from the config
     * @param config the config object
     * @param options any additional variables or parameters that need to be passed
     * @private
     */
    exports.initializeRoutes = function (config, options) {

        var scriptUris = config.uris || [];

        //Generate the default route
        var defaultRoute = new Route();
        defaultRoute.path = '/';
        defaultRoute.regexPath = convertRouteToRegex('/');
        defaultRoute.tokens = listRouteTokens(defaultRoute.path);
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
                        path.relative(config.fullRootPath, file) + '"></script>\n';
                }, '');

                // Output route script uris.
                var uriScripts = _(scriptUris).reduce(function(memo, uri){
                    return memo + '        <script type="text/javascript" src="' + uri + '"></script>\n';
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
                        uriScripts +
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
            r.tokens = listRouteTokens(route);
            r.methods = assignRouteMethodCallbacks(func);
            routesArray.push(r);
        });
    };
})(module.exports)