# DADI API

## Endpoints

Endpoints in DADI API can be either be mapped directly to collections in MongoDB or custom based on a wider requirements set.

### Collections

#### Collection specification

Collections are defined within `/workspace/collections` as JSON files named inline with the MongoDB collection and stored within a verison and database directory -

`{version}/{database}/{collection.NAME.json}`

DADI API handles the creation and modification of collections in MongoDB directly. All that is required in order to setup a new collection and collection endpoint is the creation of the collection schema file.

Collection schemas take the following format -

	{
	    "fields": {
	        "field1": {
	            "type": "String",
	            "label": "Title",
	            "comments": "The title of the entry",
	            "limit": "",
	            "placement": "Main content",
	            "validationRule": "",
	            "required": false,
	            "message": "",
	            "display": {
	                "index": true,
	                "edit": true
	            }
	        },
	        "field2": {
	            "type": "Number",
	            "label": "Title",
	            "comments": "The title of the entry",
	            "limit": "",
	            "placement": "Main content",
	            "validationRule": "",
	            "required": false,
	            "message": "",
	            "display": {
	                "index": true,
	                "edit": true
	            }
	        }
	    },
	    "settings": {
	        "cache": true,
	        "cacheTTL": 300,
	        "authenticate": true,
	        "callback": null,
	        "defaultFilters": null,
	        "fieldLimiters": null,
	        "allowExtension": false,
	        "count": 40,
          "sort": "field1",
	        "sortOrder": 1
	    }
	}

There is an example collection endpoint included in the `workspace` directory.

##### Field Definitions

Fields that can be passed into a record are defined in the collection schema in *./workspace/collections/{version number}/{database name}/collection.{collection name}.json*

Each field is defined in the following way:

        "field_name": {
            "type": "String",
            "label": "Title",
            "comments": "The title of the entry",
            "limit": "",
            "placement": "Main content",
            "validationRule": "",
            "required": false,
            "message": "",
            "default": "0"
            "display": {
                "index": true,
                "edit": true
            }
        }

 Parameter       | Description        |  Default                                  | Example
:----------------|:-------------------|:------------------------------------------|:-------
field_name | The name of the field | | ```"title"```
type | The type of the field. Possible values `String`, `Number`, `Boolean`, `Mixed`, `Object`, `ObjectID`, `Reference`  | | ```"String"```
label | The label for the field | | ```"Title"```
comments | The description of the field | | ```"The article title"```
limit | Length limit for the field | unlimited | ```"20"```
placement | Determines where to display the field in the backend interface (planned functionality) | | ```"Main content"```
validationRule | Regex validation rule. Field is be validated against this | | ```[A-Z]*```
required | Defines if field is required. Field is be validated against this | ```false``` | ```true```
message | The message to return if field validation fails. | ```"is invalid"``` | ```"must contain uppercase letters only"```
default | (optional) The value to use as a default if no value is supplied for this field | | "0"
display | Determines in which view states the field should be visible within the backend interface (planned functionality) | | ```{ "index": true, "edit": false } ```

##### Default response

Default values for the collection endpoint are set the following way -

    "settings": {
        "cache": true,
        "cacheTTL": 300,
        "authenticate": true,
        "callback": null,
        "defaultFilters": null,
        "fieldLimiters": null,
        "allowExtension": false,
        "count": 40,
        "sortOrder": 1
    }

It is possible to override these values using parameters at the point of API query (see [Querying a collection](https://github.com/bantam-framework/serama/blob/master/docs/querying.md)).

##### Validation

Record validation is implemented at field level based on the rules defined in the collection schema.

If a record fails validation an errors collection should be returned with the reasons for validation failure. For example -

    {
      "success": false,
      "errors": {
        "error": {
          "field": "title",
          "message": "must contain uppercase letters only"
        },
        "error": {
          "field": "description",
          "message": "can't be blank"
        },
        "error": {
          "field": "start_date",
          "message": "is invalid"
        },
        "error": {
          "field": "extra_field",
          "message": "doesn't exist in the collection schema"
        }
      }
    }

**Note:** The default message for a field that fails validation rules is "is invalid". If a `required` field has been left blank the message returned is "can't be blank". A custom message can be specified using the `message` property of th field concerned.

##### Document "Composition" via Reference Fields

To reduce data duplication through document embedding, DADI API allows the use of reference fields/pointers to other documents.

Consider the following two collections, `book` and `person`. `Book` contains a Reference field `author` which is capable of loading documents from the `person` collection. By creating a `book` document and setting the `author` field to the _id value of a document from the `person` collection, the application is able to resolve this reference and return the `author` document within a result set for a `book` query.

###### Composed

An additional `composed` property is added to the `book` document when it is returned, indicating which fields have been expanded. The property contains the original _id value used for the reference field lookup.  

###### Enabling Composition

Composition is disabled by default.

To return a document with resolved Reference fields at the top level, you may send a parameter either in the querystring of your request or provide it as an option to the model's `find()` method:

```
GET /1.0/library/book?filter={"_id":"560a5baf320039f7d6a78d3b"}&compose=true
```

```
book.find({ title: "Harry Potter 2" }, { "compose": true }, function (err, result) {
  // do something with result
});
```

This setting will allow the first level of Reference fields to be resolved. To allow
Reference fields to resolve which are nested further within the document, add a `compose` property to the collection schema's settings block:

```
{
  "fields": {
  },
  "settings": {
    "compose": true
  }
}
```

###### Collection schema: collection.book.json

```
{
  "fields": {
    "title": {
      "type": "String",
      "required": true
    },
    "author": {
      "type": "Reference",
      "required": true,
      "settings": {
        "collection": "person"
      }
    },
    "booksInSeries": {
      "type": "Reference",
      "required": false
    }
  },
  "settings": {
  }
}
```

###### Collection schema: collection.person.json

```
{
  "fields": {
    "name": {
      "type": "String",
      "required": true
    },
    "occupation": {
      "type": "String",
      "required": false
    },
    "nationality": {
      "type": "String",
      "required": false
    },
    "education": {
      "type": "String",
      "required": false
    },
    "spouse": {
      "type": "Reference"
    }
  },
  "settings": {
  }
}

 ```

###### a `book` document

```
{
  "_id": "560a44b33a4d7de29f168ce4",
  "title": "Harry Potter 2",
  "author": "560a44b33a4d7de29f168ce0",
  "booksInSeries": ["560a44b33a4d7de29f168ce2"]
}
```

###### Query result: The result of a query for the above `book` document

```
{
  "_id": "560a44b33a4d7de29f168ce4",
  "title": "Harry Potter 2",
  "author": {
    "_id": "560a44b33a4d7de29f168ce0",
    "name": "J K Rowling",
    "spouse": {
      "_id": "560a44b33a4d7de29f168cd9",
      "name": "Neil Murray"
    },
    "composed": {
      "spouse": "560a44b33a4d7de29f168cd9"
    }
  },
  "booksInSeries": [
    {
      "_id": "560a44b33a4d7de29f168ce2",
      "title": "Harry Potter 1",
      "author": {
        "_id": "560a44b33a4d7de29f168ce0",
        "name": "J K Rowling",
        "spouse": {
          "_id": "560a44b33a4d7de29f168cd9",
          "name": "Neil Murray"
        },
        "composed": {
          "spouse": "560a44b33a4d7de29f168cd9"
        }
      },
      "composed": {
        "author": "560a44b33a4d7de29f168ce0"
      }
    }
  ],
  "composed": {
    "author": "560a44b33a4d7de29f168ce0",
    "booksInSeries": [
      "560a44b33a4d7de29f168ce2"
    ]
  }
}
```

### Collection list

A document containing information about the available collections can be retrieved by making a GET request to the API's `/api/collections` endpoint.

An example request:

    GET /api/collections HTTP/1.1
    Host: localhost:3000
    content-type: application/json
    Cache-Control: no-cache


An example response:

		{
		    "collections": [
		        {
		            "version": "1.0",
		            "database": "library",
		            "name": "books",
		            "slug": "books",
		            "path": "/1.0/library/books"
		        },
		        {
		            "version": "1.0",
		            "database": "library",
		            "name": "user",
		            "slug": "user",
		            "path": "/1.0/library/user"
		        },
		        {
		            "version": "1.0",
		            "database": "library",
		            "name": "author",
		            "slug": "author",
		            "path": "/1.0/library/author"
		        }
		    ]
		}

### Collection statistics

Collection statistics from MongoDB can be retrieved by making a GET request to a collection's `/stats` endpoint.

An example request:

    GET /1.0/library/books/stats HTTP/1.1
    Host: localhost:3000
    content-type: application/json
    Cache-Control: no-cache


An example response:

		{
			count: 2,
			size: 480,
			averageObjectSize: 240,
			storageSize: 8192,
			indexes: 1,
			totalIndexSize: 8176,
			indexSizes: { _id_: 8176 }
		}


### Custom endpoints

#### Overview

An endpoint must follow the naming convention `endpoint.{endpoint name}.js` and exist in a `version` folder within the application's endpoints path (typically `workspace/endpoints`). The corresponding URL will be /{version}/{endpoint name}. The Javascript file should export functions with all lowercase names that correspond to the HTTP method that the function is meant to handle.

Each function will recieve three arguments -

`(request, response, next)`

1. `request` is an instance of node's [http.IncomingMessage](http://nodejs.org/api/http.html#http_http_incomingmessage) as created internally by node
2. `response` is an instance of node's [http.ServerResponse](http://nodejs.org/api/http.html#http_class_http_serverresponse) as created internally by node
3. `next` is a function that can be passed an error, or called if this endpoint has nothing to do.  This will result in a 500, or 404 respectively.

There is an example custom endpoint included in the `workspace` directory.

##### Custom Endpoint Routing

It is possible to override the default endpoint route by including a `config` function in the endpoint file. The function should return a `config` object with a `route` property. The value of this property will be used for the endpoint's route.

The following example returns a config object with a route that specifies an optional request parameter, `id`.

```
module.exports.config = function () {
  return { "route": "/v1/example/:id([a-fA-F0-9]{24})?" }
}
```

This route will now respond to requests such as

```
http://api.example.com/v1/example/55bb8f688d76f74b1303a137
```

Without this custom route, the same could be achieved by requesting the default route with a querystring parameter.

```
http://api.example.com/v1/example?id=55bb8f688d76f74b1303a137
```

#### Authentication

Authentication can be bypassed for your custom endpoint by adding the following to your endpoint file:

```
module.exports.model = {}
module.exports.model.settings = { authenticate : false }
```

### List All Collections

http://api.example.com/api/collections

```
{
	"collections": [
		{
			"version": "1.0",
			"database": "library",
			"name": "authors",
			"slug": "authors",
			"path": "/1.0/library/authors"
		},
		{
			"version": "1.0",
			"database": "library",
			"name": "books",
			"slug": "books",
			"path": "/1.0/library/books"
		}
	]
}
```

### View Collection Statistics

http://api.example.com/1.0/library/books/stats

```
{
	"count": 34042,
	"size": 3599267936,
	"averageObjectSize": 105730,
	"storageSize": 3921256448,
	"indexes": 2,
	"totalIndexSize": 2714432,
	"indexSizes": {
		"_id_": 1111936,
		"title_1": 1602496
	}
}
```

### Collection Configuration Requests

#### Creating a new collection

A new collection can be created by sending a POST request to the `config` endpoint of a collection that doesn't already exist. The body of the request should be a JSON string specifying the collection schema.

This operation requires client credentials with `accessType: "admin"`.

```
POST http://api.example.com/:apiVersion/:database/:newCollection/config
```

#### Updating an existing collection

An existing collection can be updated by sending a POST request to the `config` endpoint of an existing collection. The body of the request should be a JSON string specifying the collection schema.

This operation requires client credentials with `accessType: "admin"`.

```
POST http://api.example.com/:apiVersion/:database/:existingCollection/config
```

#### Viewing a collection's schema

An existing collection's schema can be viewed by sending a GET request to the `config` endpoint of an existing collection. The body of the response will contain a JSON string containing the collection schema.

```
GET http://api.example.com/:apiVersion/:database/:existingCollection/config
```

#### Example Usage

See `test/acceptance/workspace/endpoints/v1/endpoint.test-endpoint.js` for a "Hello World" example.

### Example API requests

_You may want to look at a handy QA testing tool called [Postman](http://www.getpostman.com/)_

#### Collections POST request

```
    POST /vtest/testdb/test-schema HTTP/1.1
    Host: localhost:3000
    content-type: application/json
    Authorization: Bearer 171c8c12-6e9b-47a8-be29-0524070b0c65

    { "field1": "hi world!", "field2": 123293582345 }
```

#### Collections POST response

```
    {
      "results": [
        {
          "field1": "hi world!",
          "field2": 123293582345,
          "apiVersion": "vtest",
          "createdAt": 1441089951507,
          "createdBy": "testClient",
          "_id": "55e5499f83f997b7d1e63e93"
        }
      ]
    }
```

#### Endpoint GET request

This will return a "Hello World" example -

```
    GET /v1/test-endpoint HTTP/1.1
    Host: localhost:3000
    content-type: application/json
    Authorization: Bearer 171c8c12-6e9b-47a8-be29-0524070b0c65
```

#### Endpoint GET response

```
{ message: 'Hello World' }
```
