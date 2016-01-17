# DADI API

![Build Status](http://img.shields.io/badge/Release-1.2.1-green.svg?style=flat-square)&nbsp;![Coverage](https://img.shields.io/badge/Coverage-88%-yellow.svg?style=flat-square)

## Contents

* [Overview](#overview)
* [Requirements](#requirements)
* [Setup and installation](#setup-and-installation)
* [Rest API specification](#rest-api-specification)
* [Authorisation](#authorisation)
* [Working with endpoints](#working-with-endpoints)
* [Configuration notes](#configuration-notes)
* [Further reading](#further-reading)
* [Development](#development)

## Overview

DADI API is built on Node.JS and MongoDB. It is a high performance RESTful API layer designed in support of [API-first development and the principle of COPE](https://github.com/dadi/api/blob/master/docs/apiFirst.md).

You can consider it as the data layer within a platform (including the data model). It is designed to be plugged into a templating layer, a mobile application or to be used with any other data consumer.

Calls to a DADI API can contain your business/domain logic (the part of a platform that encodes the real-world business rules that determine how data is created, displayed, stored and changed). It has full support for searching, filtering, limiting, sorting, offsetting, input validation and data aggregation (through support for MongoDB's aggregation pipeline).

It has built in support for oAuth2, includes full collection-level ACL, can connect to multiple databases out of the box, provides native document versioning at collection level, supports static endpoints, includes automatic indexing, has a caching layer and can be run in a clustered configuration.

DADI API provides a starting point that's further advanced than a framework. It allows you to get a complete data layer up and running in minutes.

It is part of DADI, a suite of components covering the full development stack, built for performance and scale.

## Requirements

* Node.js (latest)
* MongoDB (latest)

## Setup and installation

`$ [sudo] git clone https://github.com/dadi/api.git`

`$ cd serama`

### Installing dependencies

To ensure your system has all the required dependencies, run the following command:

`$ [sudo] npm install`



### Running tests

[Mocha](http://mochajs.org/) is used for unit and acceptance tests. Tests can be run using the following command. _**Note**: for tests to run you will need standalone `mongod` instances running at `localhost:27017` and `localhost:27018`_

**Warning:** Running `npm test` or using `mocha` to test an individual module will cause a pre-test script to run which will check that your configuration has specified a `test` database. If a `test` database is not configured the tests will not run. Ensure you have a configuration file for the test environment at `config/config.test.json`.

_**Please ensure you have configured Serama to use a test database before continuing.**_

```
$ [sudo] npm test
$ [sudo] mocha test/acceptance/app.js
```

### Starting the server

To start the API server, issue the following command. This will start the server using the configuration settings found in the `config.json` file.

`$ [sudo] npm start`

Before you really start using the API you will need to create an API client, enabling you to send authenticated requests to the API. This is described in the next section.

##### Creating an API client

An API client is simply a document in the database representing a consumer of your data. An API client requires two fields, `clientId` and `secret`. Your first API client can be created automatically by running the following script:

`$ node utils/create-client.js`

This will create a new API client in the database and collection specified by the `config.json` file.

```
{ "clientId": "testClient", "secret": "superSecret" }
```

#### Running the server in the background

Pro tip: to run the server in the background, install [Forever](https://github.com/nodejitsu/forever) and [Forever-service](https://github.com/zapty/forever-service)

`[sudo] npm install forever -g`

`[sudo] npm install -g forever-service`

Install the API as a service and ensure it loads on boot:

`[sudo] forever-service install -s main.js serama --start`

You can then interact with Serama as a service using the following command:

- Start: `[sudo] start serama`
- Stop: `[sudo] stop serama`
- Status: `[sudo] status serama`
- Restart `[sudo] restart serama`

### Additional reading

You can see a complete installation guide for Serama under Ubuntu [here](https://github.com/dadi/api/blob/master/docs/install.ubuntu.md).

## Rest API specification

DADI API accepts GET, POST, PUT, PATCH and DELETE requests.

### Examples

#### 1.

**GET** *http(s)://{url}/{version number}/{database name}/{collection name}*

Returns a JSON object with all results from the *{collection name}* collection and *{database name}* database. The result set will be paginated and limited to a number of records as defined as the default view in the collection schema file in *./workspace/collections/{version number}/{database name}/collection.{collection name}.json*.

Default views can be overridden using parameters at the point of API request.

You can read more about this and about the collection schema [here](https://github.com/dadi/api/blob/master/docs/endpoints.md).

#### 2.

**GET** *http(s)://{url}/{version number}/{database name}/{collection name}/{:id}*

Returns the record with the id of *{:id}* in the *{collection name}* collection and *{database name}* database.

#### 3.

**GET** *http://{url}/{version number}/{endpoint name}*

Returns a JSON object. Parameters and return are completely customisable. The output is generated using the file:

*workspace/endpoints/{version number}/endpoint.{endpoint name}.js*

See `test/acceptance/workspace/endpoints/v1/endpoint.test-endpoint.js` for a "Hello World" example.

#### 4.

**GET** *http://{url}/{version number}/{database name}/{collection name}/config*

Returns a JSON object of the schema file:

*./workspace/collections/v{version number}/{database name}/collection.{collection name}.json*


#### 5.

**POST** *http://{url}/{version number}/{database name}/{collection name}/config*

Updates the specified collection config file, or creates it if it doesn't exist. This operation requires client credentials with `accessType: "admin"`.

```
{
  clientId: 'clientX-admin',
  secret: 'secret',
  accessType: 'admin'
}
```

See [Authorisation](https://github.com/dadi/api/blob/master/docs/auth.md) for more information regarding the client credentials record, and [Endpoints](https://github.com/dadi/api/blob/master/docs/endpoints.md) for more information regarding endpoint configuration requests.


#### 6.

**GET** *http://{url}/api/config*

Returns a JSON object of the main config file:

*./config.json*

You can read more about this [here](https://github.com/dadi/api/blob/master/docs/configApi.md).

#### 7.

**POST** *http://{url}/api/config*

Updates the main config file:

*./config.json*

You can read more about this [here](https://github.com/dadi/api/blob/master/docs/configApi.md).

#### 8.

**POST** *http://{url}/{version number}/{database name}/{collection name}*

Adds a new record to the collection specified by *{collection name}* in the *{database name}* database.

If the record passes validation it is inserted into the collection.

The following additional fields are saved alongside with every record:

* *created_at*: timestamp of creation
* *created_by*: user id of creator
* *api_version*: api version number passed in the url ({version number}). i.e. v1

#### 9.

**POST** *http://{url}/{version number}/{database name}/{collection name}/{:id}*

Updates an existing record with the id of *{:id}* in the *{collection name}* collection and *{database name}* database.

If the record passes validation it will be updated.

The following additional fields are added/updated alongside every passed field:

* *last_modified_at*: timestamp of modification
* *last_modified_by*: user id of updater

#### 10.

**DELETE** *http://{url}/{version number}/{database name}/{collection name}/{:id}*

Deletes the record with the id of *{:id}* in the *{collection name}* collection and *{database name}* database.

### Authorisation

You can get a bearer token as follows:

    POST /token HTTP/1.1
    Host: localhost:3000
    content-type: application/json
    Cache-Control: no-cache

    { "clientId": "testClient", "secret": "superSecret" }

Once you have the token, each request to the api should include a header similar to the one below (of course use your specific token):

    Authorization: Bearer 171c8c12-6e9b-47a8-be29-0524070b0c65

### Working with endpoints

You can read about collections and custom endpoints in detail [here](https://github.com/dadi/api/blob/master/docs/endpoints.md). If you just want to jump right in, here are some sample API requests:

_You may want to look at a handy QA testing tool called [Postman](http://www.getpostman.com/)_

#### Collections POST request

    POST /vtest/testdb/test-schema HTTP/1.1
    Host: localhost:3000
    content-type: application/json
    Authorization: Bearer 171c8c12-6e9b-47a8-be29-0524070b0c65

    { "field_1": "hi world!", "field_2": 123293582345 }


#### Endpoint GET request

This will return a "Hello World" example:

    GET /test-endpoint HTTP/1.1
    Host: localhost:3000
    content-type: application/json
    Authorization: Bearer 171c8c12-6e9b-47a8-be29-0524070b0c65

## Configuration notes

The `server.host` config is passed to node's `server.listen` function
http://nodejs.org/api/http.html#http_server_listen_port_hostname_backlog_callback

You should be able to set it to your IP as well, but depending on your hosting, that may be tricky. For example, on AWS you would have to use your private IP instead of your public IP.

The proper name should always resolve correctly. Alternately, you can set it to null, to accept connections on any IPv4 address.

## Further reading

The `docs/` directory contains additional documentation on the component parts of the system:

* [API module](https://github.com/dadi/api/blob/master/docs/api.md)
* [Authorisation middleware](https://github.com/dadi/api/blob/master/docs/auth.md)
* [Caching](https://github.com/dadi/api/blob/master/docs/cache.md)
* [Config API](https://github.com/dadi/api/blob/master/docs/configApi.md)
* [Connection module](https://github.com/dadi/api/blob/master/docs/connection.md)
* [Endpoints](https://github.com/dadi/api/blob/master/docs/endpoints.md)
* [Extension API](https://github.com/dadi/api/blob/master/docs/extensionApi.md)
* [Logging](https://github.com/dadi/api/blob/master/docs/logger.md)
* [Model module](https://github.com/dadi/api/blob/master/docs/model.md)
* [Monitor module](https://github.com/dadi/api/blob/master/docs/monitor.md)
* [Querying a collection](https://github.com/dadi/api/blob/master/docs/querying.md)
* [Validation](https://github.com/dadi/api/blob/master/docs/validation.md)

Feel free to contact the Bantam core development team on team@bant.am with questions.

## Development

DADI API was conceived, developed and is maintained by the engineering team at DADI+ ([https://dadi.co](https://dadi.co)).

Core contributors:

* Joseph Denne
* Joe Wagner
* Viktor Fero
* James Lambie
* Dave Allen
* Niklas Iversen

### Roadmap

We will capture planned updates and additions here. If you have anything to contribute in terms of future direction, please add as an enhancement request within [issues](https://github.com/dadi/api/issues).

Planned additions:

* Auto documentator

### Versioning

Semantic Versioning 2.0.0

Given a version number MAJOR.MINOR.PATCH, increment the:

* MAJOR version when you make incompatible API changes,
* MINOR version when you add functionality in a backwards-compatible manner, and
* PATCH version when you make backwards-compatible bug fixes.

_Additional labels for pre-release and build metadata are available as extensions to the MAJOR.MINOR.PATCH format._

### Contributing

Very daring.

Fork, hack, possibly even add some tests, then send a pull request :)

## Licence

DADI is a data centric development and delivery stack, built specifically in support of the principles of API first and COPE.

Copyright notice<br />
(C) 2016 DADI+ Limited <support@dadi.tech><br />
All rights reserved

This product is part of DADI.<br />
DADI is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as
published by the Free Software Foundation; either version 2 of
the License, or (at your option) any later version ("the GPL").
**If you wish to use DADI outside the scope of the GPL, please
contact us at info@dadi.co for details of alternative licence
arrangements.**

**This product may be distributed alongside other components
available under different licences (which may not be GPL). See
those components themselves, or the documentation accompanying
them, to determine what licences are applicable.**

DADI is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

The GNU General Public License (GPL) is available at
http://www.gnu.org/copyleft/gpl.html.<br />
A copy can be found in the file GPL distributed with
these files.

This copyright notice MUST APPEAR in all copies of the product!
