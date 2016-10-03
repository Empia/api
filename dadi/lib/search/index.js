// var _ = require('underscore')
// var path = require('path')
// var url = require('url')
// var help = require(path.join(__dirname, '/../help'))
// var model = require(path.join(__dirname, '/../model'))
// /*

// Search middleware allowing cross-collection querying

// Search query URI format:

// http://host[:port]/version/search?collections=database/collection[,database2/collection2,...[,databaseN/collectionN]]&query={"title":{"$regex":"brother"}}

// Example search query:

// http://api.example.com/1.0/search?collections=library/books,library/films&query={"title":{"$regex":"brother"}}

// */
// module.exports = function (server) {
//   server.app.use('/:version/search', function (req, res, next) {
//     // sorry, we only process GET requests at this endpoint
//     var method = req.method && req.method.toLowerCase()
//     if (method !== 'get') {
//       return next()
//     }

//     var path = url.parse(req.url, true)
//     var options = path.query

//     // no collection and no query params
//     if (!(options.collections && options.query)) {
//       return help.sendBackJSON(400, res, next)(null, {'error': 'Bad Request'})
//     }

//     // split the collections param
//     var collections = options.collections.split(',')

//     // extract the query from the querystring
//     var query = help.parseQuery(options.query)

//     // determine API version
//     var apiVersion = path.pathname.split('/')[1]

//     // no collections specfied
//     if (collections.length === 0) {
//       return help.sendBackJSON(400, res, next)(null, {'error': 'Bad Request'})
//     }

//     var results = {}
//     var idx = 0

//     _.each(collections, function (collection) {
//       // get the database and collection name from the
//       // collection parameter
//       var parts = collection.split('/')
//       var database, name, mod

//       query.apiVersion = apiVersion

//       if (_.isArray(parts) && parts.length > 1) {
//         database = parts[0]
//         name = parts[1]
//         mod = model(name, null, null, database)
//       }

//       if (mod) {
//         // query!
//         mod.find(query, function (err, docs) {
//           if (err) {
//             return help.sendBackJSON(500, res, next)(err)
//           }

//           // add data to final results array, keyed
//           // on collection name
//           results[name] = docs

//           idx++

//           // send back data
//           if (idx === collections.length) {
//             return help.sendBackJSON(200, res, next)(err, results)
//           }
//         })
//       }
//     })
//   })
// }

'use strict'
const _ = require('underscore')
const path = require('path')
const fs = require('fs')

const config = require(path.join(__dirname, '/../../../config'))

const SearchController = function() {
  this.analysers = this.loadAll()
  return this
}

SearchController.prototype.findAnalyser = function(type, name) {
  return _.find(this.analysers, (analyser) => {
    return _.contains(analyser.types, type) && name ? (analyser.name === name) : true
  })
}

SearchController.prototype.analyseFields = function(doc, documentId, model) {
  _.each(doc, (field) => {
    field.analyser.parse(field, documentId, model)
  })
}

SearchController.prototype.loadAll = function() {
  var files = fs.readdirSync(config.get('paths.analysers'))
  return _.map(files, (file) => {
    return require(path.resolve(config.get('paths.analysers'), file))
  })
}

module.exports = function() {
  return new SearchController()
}

module.exports.SearchController = SearchController
