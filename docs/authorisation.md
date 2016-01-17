# DADI API

## Authorisation

You can get a bearer token as follows:

    POST /token HTTP/1.1
    Host: localhost:3000
    content-type: application/json
    Cache-Control: no-cache

    { "clientId": "testClient", "secret": "superSecret" }

Once you have the token, each request to the api should include a header similar to the one below (of course use your specific token):

    Authorization: Bearer 171c8c12-6e9b-47a8-be29-0524070b0c65
