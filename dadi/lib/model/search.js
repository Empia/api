'use strict'
const _ = require('underscore')
const path = require('path')
const SearchController = require(path.join(__dirname, '/../search'))

const Search = function(model) {
  this.searchController = new SearchController()

  this.model = model

  this.applyFieldNames()
  this.acceptedFields = this.reduceToValid(this.model.schema)
}

Search.prototype.index = function(docs) {
  this.docs = _.isArray(docs) ? docs : [docs]
  this.analyseDocuments()
}

Search.prototype.analyseDocuments = function() {
  _.each(this.docs, (doc) => {
    this.searchController.analyseFields(this.getValidFields(doc), doc._id, this.model)
  })
}

Search.prototype.getValidFields = function(doc) {
  return _.filter(_.map(this.acceptedFields, (field) => {
    field.value = (doc[field.fieldName] && !_.isUndefined(doc[field.fieldName])) ? doc[field.fieldName] : null
    return field
  }), (field) => {
    return field.value
  })
}

Search.prototype.reduceToValid = function(schema) {
  return _.filter(_.map(
    _.filter(schema, (field, key) => {
      return field.search && field.search.indexed
    }), 
    (field) => {
      field.analyser = this.searchController.findAnalyser(field.type, field.search.analyser || null)
      return field
    }), (field) => {
      return !_.isUndefined(field.analyser)
  })
}

Search.prototype.applyFieldNames = function() {
  _.each(this.model.schema, (field, key) => {
    field.fieldName = key
  })
}

module.exports = function (model) {
  return new Search(model)
}

module.exports.Search = Search