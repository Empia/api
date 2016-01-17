# DADI API

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
