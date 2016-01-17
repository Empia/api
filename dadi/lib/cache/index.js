var config = require(__dirname + '/../../../config.js');
var help = require(__dirname + '/../help');
var log = require(__dirname + '/../../../dadi/lib/log');
var fs = require('fs');
var path = require('path');
var url = require('url');
var crypto = require('crypto');
var mkdirp = require('mkdirp');
var _ = require('underscore');

var cacheEncoding = 'utf8';
var options = {};

var dir = config.get('caching.directory');

// create cache directory if it doesn't exist
help.mkdirParent(path.resolve(dir), '777', function() {});

function cachingEnabled(endpoints, requestUrl) {

    var endpointKey = _.find(_.keys(endpoints), function (k){ return k.indexOf(url.parse(requestUrl).pathname) > -1; });

    if (!endpointKey) return false;

    if (endpoints[endpointKey].model && endpoints[endpointKey].model.settings) {
        options = endpoints[endpointKey].model.settings;
    }

    return (config.get('caching.enabled') && options.cache);
}

module.exports = function (server) {

    server.app.use(function (req, res, next) {

        if (!cachingEnabled(server.components, req.url)) return next();

        var query = url.parse(req.url, true).query;

        // we build the filename with a hashed hex string so we can be unique
        // and avoid using file system reserved characters in the name
        var filename = crypto.createHash('sha1').update(req.url).digest('hex');
        var modelDir = crypto.createHash('sha1').update(url.parse(req.url).pathname).digest('hex');
        var cacheDir = path.join(dir, modelDir);
        var cachepath = path.join(cacheDir, filename + '.' + config.get('caching.extension'));

        // only cache GET requests
        if (!(req.method && req.method.toLowerCase() === 'get')) return next();

        fs.stat(cachepath, function (err, stats) {

            if (err) {
                if (err.code === 'ENOENT') {
                    return cacheResponse();
                }
                return next(err);
            }

            // check if ttl has elapsed
            var ttl = options.ttl || config.get('caching.ttl');
            var lastMod = stats && stats.mtime && stats.mtime.valueOf();
            if (!(lastMod && (Date.now() - lastMod) / 1000 <= ttl)) return cacheResponse();

            fs.readFile(cachepath, {encoding: cacheEncoding}, function (err, resBody) {
                if (err) return next(err);

                // there are only two possible types javascript or json
                var dataType = query.callback ? 'text/javascript' : 'application/json';

                if (resBody === "") {
                    return cacheResponse();
                }

                // allow query string param to bypass cache
                var noCache = query.cache && query.cache.toString().toLowerCase() === 'false';

                if (noCache) {
                    res.setHeader('X-Cache', 'MISS');
                    res.setHeader('X-Cache-Lookup', 'HIT');
                    return next();
                }

                res.statusCode = 200;

                res.setHeader('Server', config.get('server.name'));
                res.setHeader('X-Cache', 'HIT');
                res.setHeader('X-Cache-Lookup', 'HIT');
                res.setHeader('content-type', dataType);
                res.setHeader('content-length', Buffer.byteLength(resBody));

                // notice resBody is already a string
                res.end(resBody);
            });
        });

        function cacheResponse() {

            // file is expired or does not exist, wrap res.end and res.write to save to cache
            var _end = res.end;
            var _write = res.write;

            var data = '';

            res.write = function (chunk) {

                // with this line, we get cache files with duplicate content
                //if (chunk) data += chunk;

                _write.apply(res, arguments);
            };

            res.end = function (chunk) {

                res.setHeader('X-Cache', 'MISS');
                res.setHeader('X-Cache-Lookup', 'MISS');

                // respond before attempting to cache
                _end.apply(res, arguments);

                if (chunk) data += chunk;

                // if response is not 200 don't cache
                if (res.statusCode !== 200) return;

                // TODO: do we need to grab a lock here?
                mkdirp(cacheDir, {}, function (err, made) {
                    if (err) console.log(err.toString());

                    fs.writeFile(cachepath, data, {encoding: cacheEncoding}, function (err) {
                        if (err) console.log(err.toString());
                    });
                })

            };
            return next();
        }
    });
};
