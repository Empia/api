const _ = require('underscore')

const Whitespace = function () {
  this.type = "String"
  this.default = true
  this.name = 'Whitespace'
  this.stopwords = ['a','about','above','after','again','against','all','am','an','and','any','are',"aren't",'as','at','be','because','been','before','being','below','between','both','but','by',"can't",'cannot','could',"couldn't",'did',"didn't",'do','does',"doesn't",'doing',"don't",'down','during','each','few','for','from','further','had',"hadn't",'has',"hasn't",'have',"haven't",'having','he',"he'd","he'll","he's",'her','here',"here's",'hers','herself','him','himself','his','how',"how's",'i',"i'd","i'll","i'm","i've",'if','in','into','is',"isn't",'it',"it's",'its','itself',"let's",'me','more','most',"mustn't",'my','myself','no','nor','not','of','off','on','once','only','or','other','ought','our','ours','ourselves','out','over','own','same',"shan't",'she',"she'd","she'll","she's",'should',"shouldn't",'so','some','such','than','that',"that's",'the','their','theirs','them','themselves','then','there',"there's",'these','they',"they'd","they'll","they're","they've",'this','those','through','to','too','under','until','up','very','was',"wasn't",'we',"we'd","we'll","we're","we've",'were',"weren't",'what',"what's",'when',"when's",'where',"where's",'which','while','who',"who's",'whom','why',"why's",'with',"won't",'would',"wouldn't",'you',"you'd","you'll","you're","you've",'your','yours','yourself','yourselves','zero']
}

Whitespace.prototype.parse = function (field, documentId) {
  this.documentId = documentId
  this.field = field
  this.field.value = this.formatValue(this.field.value)
  return this.analyse()
}

/**
* Format Value
*
* @param {Mixed} value
* @return {Array} value
*/

Whitespace.prototype.formatValue = function (value) {
  if (typeof value === "string") {
    value = [value]
  }
  return value
}

/**
* Remove Stop Words
*
* @param {Array} words
* @return Search
*/

Whitespace.prototype.isStopword = function (word) {
  return Boolean(this.stopwords.indexOf(word) + 1)
}

Whitespace.prototype.inverseFrequency = function (total, count) {
  return (Math.log(total/(count + 1)) / Math.LN10);
}

Whitespace.prototype.weight = function (inverseFrequency, count) {
   return inverseFrequency * count
}

Whitespace.prototype.norm = function () {

}

//For each document, analyse return the Math.sqrt of the total number of matches
Whitespace.prototype.termFrequency = function (terms, docs) {
  _.each(terms, (term) => {
    var match = _.filter(docs, (doc) => {
      //return only if the search result contains a match for the term
    })
  })
  //return Math.sqrt
}

Whitespace.prototype.prepare = function(field, query) {
  if (query.like) {
    return _.map(query.like.split(' '), (value) => {
      return {field: field.fieldName, word: {"$regex": value}}
    })
  }
}

Whitespace.prototype.analyse = function () {
  var words = []
  var wordCount = 0
  _.each(this.field.value, (fieldValue) => {
    var splitVal = fieldValue.split(" ")
    wordCount += splitVal.length
    var split = _.map(splitVal, (word, position) => {
      if (!this.isStopword(word)) {
        words.push({
          value: word.toLowerCase().trim(),
          field: this.field.fieldName,
          position: position
        })
      }
    })
    words = _.chain(words)
    .groupBy('value')
    .map((value, key)=> {
      return {
        field:  this.field.fieldName,
        count: value.length,
        positions: _.clone(_.pluck(value, 'position')),
        word: key
      }
    })
    .value()
  })
  return words
}

module.exports = new Whitespace()
