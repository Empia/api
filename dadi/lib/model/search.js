'use strict'
const _ = require('underscore')
const path = require('path')
const fs = require('fs')
const config = require(path.join(__dirname, '/../../../config'))

const Search = function (model) {
  this.model = model
  this.analysers = this.loadAll()
  this.applyFieldNames()
  this.acceptedFields = this.reduceToValid(model.schema)
}

Search.prototype.index = function (docs, model) {
  this.model = model
  this.docs = _.isArray(docs) ? docs : [docs]
  this.analyseDocuments(model)
}

Search.prototype.analyseDocuments = function () {
  _.each(this.docs, (doc) => {
    this.analyseFields(this.getValidFields(doc), doc._id)
  })
}

Search.prototype.getValidFields = function (doc) {
  return _.filter(_.map(this.acceptedFields, (field) => {
    field.value = (doc[field.fieldName] && !_.isUndefined(doc[field.fieldName])) ? doc[field.fieldName] : null
    return field
  }), (field) => {
    return field.value
  })
}

Search.prototype.reduceToValid = function (schema, filterFields) {
  return _.filter(_.map(
    _.filter(schema, (field, key) => {
      return field.search && field.search.indexed && (filterFields ? _.contains(filterFields, key) : true)
    }),
    (field) => {
      field.analyser = this.findAnalyser(field.type, field.search.analyser || null)
      return field
    }), (field) => {
    return !_.isUndefined(field.analyser)
  })
}

Search.prototype.applyFieldNames = function () {
  _.each(this.model.schema, (field, key) => {
    field.fieldName = key
  })
}

Search.prototype.findAnalyser = function (type, name) {
  return _.find(this.analysers, (analyser) => {
    return (analyser.type === type && analyser.default) && (name ? (analyser.name === name) : true)
  })
}

Search.prototype.removePrevious = function (documentId) {
  return new Promise((resolve, reject) => {
    this.model.connection.db.collection(this.model.searchCollection).remove({doc: documentId}, (err, results) => {
      if (err) return reject(err.json)
      return resolve()
    })
  })
}

Search.prototype.analyseFields = function (fields, documentId) {
  return this.removePrevious(documentId).then(() => {
    _.each(fields, (field) => {
      // Force promise resolution
      Promise.resolve(field.analyser.parse(field, documentId)).then((entries) => {
        _.each(entries, (entry) => {
          entry.doc = documentId
          entry.analyser = field.analyser.name
        })
        this.model.connection.db.collection(this.model.searchCollection).insert(entries, (err, doc) => {
          if (err) return err
          console.log('Search entries', doc)
        })
      })
    })
  })
}

Search.prototype.loadAll = function () {
  let files = fs.readdirSync(config.get('paths.analysers'))
  return _.map(files, (file) => {
    return require(path.resolve(config.get('paths.analysers'), file))
  })
}

// Search.prototype.findWhere = function (query) {
//   // this.getResults(this.formatWithOperand(query))
//   this.formatWithOperand(query)
// }

// Search.prototype.formatWithOperand = function(query) {
//   if (query.)
// }

Search.prototype.buildFieldQueries = function () {
  var validFields = this.reduceToValid(this.model.schema, this.queries.fields || null)
  return _.map(validFields, (field) => {
    return field.analyser.prepare(field, this.queries)
  })
}

Search.prototype.queryCollection = function (queries) {
  return _.map(queries, (query) => {
    return new Promise((resolve, reject) => {
      // query.apiVersion = this.apiVersion //Needs to be added to save first
      this.model.connection.db.collection(this.model.searchCollection).find(query, {fields: {}, compose: true}, (err, cursor) => {
        if (err) reject(err.json)
        cursor.toArray((err, results) => {
          if (err) reject(err.json)
          if (cursor.isClosed()) {
            resolve(results)
          }
        })
      })
    })
  })
}

Search.prototype.buildQuery = function () {
  return _.map(this.buildFieldQueries(), (fieldQuery) => {
    return Promise.all(this.queryCollection(fieldQuery))
  })
}

Search.prototype.query = function (apiVersion, queries) {
  this.queries = queries
  this.apiVersion = apiVersion
  return Promise.all(this.buildQuery()).then((results) => {
    // Before this, get the documents and return
    return {
      results: results,
      query: this.queries
    }
  })
}

module.exports = function (model) {
  return new Search(model)
}

module.exports.Search = Search
