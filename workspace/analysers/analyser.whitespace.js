const _ = require('underscore')

const Whitespace = function() {
  this.type = "String"
  this.default = true
  this.name = 'Whitespace'
  this.stopwords = ['a','about','above','after','again','against','all','am','an','and','any','are',"aren't",'as','at','be','because','been','before','being','below','between','both','but','by',"can't",'cannot','could',"couldn't",'did',"didn't",'do','does',"doesn't",'doing',"don't",'down','during','each','few','for','from','further','had',"hadn't",'has',"hasn't",'have',"haven't",'having','he',"he'd","he'll","he's",'her','here',"here's",'hers','herself','him','himself','his','how',"how's",'i',"i'd","i'll","i'm","i've",'if','in','into','is',"isn't",'it',"it's",'its','itself',"let's",'me','more','most',"mustn't",'my','myself','no','nor','not','of','off','on','once','only','or','other','ought','our','ours','ourselves','out','over','own','same',"shan't",'she',"she'd","she'll","she's",'should',"shouldn't",'so','some','such','than','that',"that's",'the','their','theirs','them','themselves','then','there',"there's",'these','they',"they'd","they'll","they're","they've",'this','those','through','to','too','under','until','up','very','was',"wasn't",'we',"we'd","we'll","we're","we've",'were',"weren't",'what',"what's",'when',"when's",'where',"where's",'which','while','who',"who's",'whom','why',"why's",'with',"won't",'would',"wouldn't",'you',"you'd","you'll","you're","you've",'your','yours','yourself','yourselves','zero']
}

Whitespace.prototype.parse = function(field, documentId) {
  this.documentId = documentId
  this.field = field
  this.field.value = this.formatValue(this.field.value)
  return this.createEntries(this.analyse())
}

/**
* Format Value
*
* @param {Mixed} value
* @return {Array} value
*/

Whitespace.prototype.formatValue = function(value) {
  if (typeof value === "string") {
    value = [value]
  }
  return value
}

// Whitespace.prototype.save = function(entries) {
  // console.log(this.model.connection.db)
  // var _done = function (database) {
    // model.connection.db.collection(model.revisionCollection).insert(revisionObj, function (err, doc) {
  //     if (err) return err

  //     database.collection(model.name).findAndModify(
  //       { _id: obj._id },
  //       [['_id', 'asc']],
  //       { $push: { 'history': revisionObj._id } },
  //       { new: true },
  //       function (err, doc) {
  //         if (err) return done(err, null)
  //         return done(null, doc)
  //       })
  //   })
  // }
// }

Whitespace.prototype.createEntries = function(results) {
  var queue = []
  _.each(results, (word) => {
    queue.push(new Promise((resolve, reject) => {
      var options = {apiVersion : "1.0"}
      var entry = {
        word: word[0],
        count: word[1],
        field: word[2],
        inverseFrequency: word[3],
        weight: word[4]
      }
      resolve(entry)
    }))
  })
  return Promise.all(queue)
}

/**
* Remove Stop Words
*
* @param {Array} words
* @return Search
*/

Whitespace.prototype.isStopword = function(word) {
  return Boolean(this.stopwords.indexOf(word) + 1)
}

Whitespace.prototype.inverseFrequency = function(total, count) {
  return (Math.log(total/(count + 1)) / Math.LN10);
}

Whitespace.prototype.weight = function(inverseFrequency, count) {
   return inverseFrequency * count
}


Whitespace.prototype.analyse = function() {
  var words = []
  var wordCount = 0
  _.each(this.field.value, (value) => {
    var splitVal = value.split(" ")
    wordCount += splitVal.length
    var split = _.map(splitVal, (word) => {
      if (!this.isStopword(word)) {
        words.push({
          value: word.toLowerCase().trim(),
          field: this.field.fieldName
        })
      }
    })

    words = _.chain(words)
      .countBy((i) => { return i.value })
      .pairs()
      .sortBy(1).reverse()
      .value()

    _.each(words, (word) => {
      word[2] = this.field.fieldName
      word[3] = this.inverseFrequency(wordCount, word[1])
      word[4] = this.weight(word[3], word[1])
    })
  })
  return words
}

module.exports = new Whitespace()