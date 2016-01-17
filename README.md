# DADI API

![Build Status](http://img.shields.io/badge/Release-1.2.1-green.svg?style=flat-square)&nbsp;![Coverage](https://img.shields.io/badge/Coverage-88%-yellow.svg?style=flat-square)

## Overview

DADI API is built on Node.JS and MongoDB. It is a high performance RESTful API layer designed in support of [API-first development and the principle of COPE](https://github.com/dadi/api/blob/master/docs/apiFirst.md).

You can consider it as the data layer within a platform (including the data model). It is designed to be plugged into a templating layer, a mobile application or to be used with any other data consumer.

Calls to a DADI API can contain your business/domain logic (the part of a platform that encodes the real-world business rules that determine how data is created, displayed, stored and changed). It has full support for searching, filtering, limiting, sorting, offsetting, input validation and data aggregation (through support for MongoDB's aggregation pipeline).

It has built in support for oAuth2, includes full collection-level ACL, can connect to multiple databases out of the box, provides native document versioning at collection level, supports static endpoints, includes automatic indexing, has a caching layer and can be run in a clustered configuration.

DADI API provides a starting point that's further advanced than a framework. It allows you to get a complete data layer up and running in minutes.

It is part of DADI, a suite of components covering the full development stack, built for performance and scale.

## Contents

* Overview (this document)
* [Requirements](https://github.com/dadi/api/blob/docs/docs/requirements.md)
* Setup, installation and use
	* [Setup and installation](https://github.com/dadi/api/blob/docs/docs/setupAndInstallation.md)
	* [Configuration](https://github.com/dadi/api/blob/docs/docs/configuration.md)
	* [Configuration notes](https://github.com/dadi/api/blob/docs/docs/configurationNotes.md)
	* [Complete guide: Ubuntu](https://github.com/dadi/api/blob/docs/docs/installGuide.ubuntu.md)
* The API
	* [Rest API specification](https://github.com/dadi/api/blob/docs/docs/restApiSpecification.md)
	* [Authorisation](https://github.com/dadi/api/blob/docs/docs/authorisation.md)
	* [Working with endpoints](https://github.com/dadi/api/blob/master/docs/workingWithEndpoints.md)
	* [Collections](https://github.com/dadi/api/blob/master/docs/collections.md)
	* [Custom endpoints](https://github.com/dadi/api/blob/docs/docs/customEndpoints.md)
	* [Config API](https://github.com/dadi/api/blob/master/docs/configApi.md)
	* [Validation](https://github.com/dadi/api/blob/master/docs/validation.md)
* Middleware
	* [API module](https://github.com/dadi/api/blob/master/docs/apiModule.md)
	* [Authorisation middleware](https://github.com/dadi/api/blob/master/docs/authMiddleware.md)
	* [Connection module](https://github.com/dadi/api/blob/master/docs/connectionModule.md)
	* [Extension API](https://github.com/dadi/api/blob/master/docs/extensionApi.md)
	* [Model module](https://github.com/dadi/api/blob/master/docs/modelModule.md)
	* [Logging](https://github.com/dadi/api/blob/master/docs/logging.md)
	* [Monitor module](https://github.com/dadi/api/blob/master/docs/monitorModule.md)
* [Development](https://github.com/dadi/cdn/blob/docs/docs/development.md)
* [License](https://github.com/dadi/cdn/blob/docs/docs/license.md)
* [GPL](https://github.com/dadi/cdn/blob/docs/docs/gpl.md)

Update/consolodate with config and then remove:

* [Caching](https://github.com/dadi/api/blob/master/docs/cache.md)
