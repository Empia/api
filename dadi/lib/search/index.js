// let _ = require('underscore')
// let path = require('path')
// let url = require('url')
// let help = require(path.join(__dirname, '/../help'))
// let model = require(path.join(__dirname, '/../model'))
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
//     let method = req.method && req.method.toLowerCase()
//     if (method !== 'get') {
//       return next()
//     }

//     let path = url.parse(req.url, true)
//     let options = path.query

//     // no collection and no query params
//     if (!(options.collections && options.query)) {
//       return help.sendBackJSON(400, res, next)(null, {'error': 'Bad Request'})
//     }

//     // split the collections param
//     let collections = options.collections.split(',')

//     // extract the query from the querystring
//     let query = help.parseQuery(options.query)

//     // determine API version
//     let apiVersion = path.pathname.split('/')[1]

//     // no collections specfied
//     if (collections.length === 0) {
//       return help.sendBackJSON(400, res, next)(null, {'error': 'Bad Request'})
//     }

//     let results = {}
//     let idx = 0

//     _.each(collections, function (collection) {
//       // get the database and collection name from the
//       // collection parameter
//       let parts = collection.split('/')
//       let database, name, mod

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

/*

@example 1

//Contains a word like lorem
{
  "where": {
    "like": "lorem"
  }
}

{
  "where": {
    "contains": "lorem"
  }
}

{
  "where": {
    "is": "lorem"
  }
}

{
  "where": {
    "fields": ["title"],
    "like": "lorem"
  }
}

*/

'use strict'
const path = require('path')
const model = require(path.join(__dirname, '/../model'))
const help = require(path.join(__dirname, '/../help'))

const Search = require(path.join(__dirname, '/../model/search'))

const SearchController = function (server) {
  if (!server) return
  this.server = server
  this.addRoutes()
  return this
}

SearchController.prototype.addRoutes = function () {
  this.server.app.use('/:version/:database/:collectionName/search', (req, res, next) => {
    var method = req.method && req.method.toLowerCase()
    if (method === 'get') {
      return this.find(req.params).then((resp) => {
        return help.sendBackJSON(200, res, next)(null, resp)
      })
    } else if (method === 'post') {
      return this.find(req.params, req.body).then((resp) => {
        return help.sendBackJSON(200, res, next)(null, resp)
      })
    }
    return next()
  })
}

SearchController.prototype.getSearchModel = function (params) {
  this.database = params.database
  this.name = params.collectionName
  this.apiVersion = params.version
  let docModel = model(this.name, null, null, this.database)
  if (docModel && docModel.storeSearch) {
    return docModel
  }
}

SearchController.prototype.find = function (params, body) {
  var searchModel = this.getSearchModel(params)
  if (!searchModel) return {err: 'Search not enabled for this collection'}
  return new Search(searchModel).query(this.apiVersion, body || params.search)
  // return {}
}

module.exports = function (server) {
  return new SearchController(server)
}

module.exports.SearchController = SearchController
