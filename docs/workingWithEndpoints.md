# DADI API

## Working with endpoints

You can read about collections and custom endpoints in detail [here](https://github.com/dadi/api/blob/docs/docs/collections.md) and [here](https://github.com/dadi/api/blob/docs/docs/customEndpoints.md). If you just want to jump right in, here are some sample API requests:

_You may want to look at a handy QA testing tool called [Postman](http://www.getpostman.com/)_

### Collections POST request

    POST /vtest/testdb/test-schema HTTP/1.1
    Host: localhost:3000
    content-type: application/json
    Authorization: Bearer 171c8c12-6e9b-47a8-be29-0524070b0c65

    { "field_1": "hi world!", "field_2": 123293582345 }

### Endpoint GET request

This will return a "Hello World" example:

    GET /test-endpoint HTTP/1.1
    Host: localhost:3000
    content-type: application/json
    Authorization: Bearer 171c8c12-6e9b-47a8-be29-0524070b0c65
