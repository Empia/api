# DADI API

## Configuration

### Overview

DADI API's settings are defined in a configuration files mapped to environment variables. These are contained wihtin `/config`. An example file, containing all of the available configuration options can be found in `/config/config.development.json.sample`.

### Config options

#### server

The `server.host` config is passed to node's `server.listen` function
http://nodejs.org/api/http.html#http_server_listen_port_hostname_backlog_callback

You should be able to set it to your IP as well, but depending on your hosting, that may be tricky. For example, on AWS you would have to use your private IP instead of your public IP (or use `0.0.0.0`).

The proper name should always resolve correctly. Alternately, you can set it to null, to accept connections on any IPv4 address.

**Example**

	"server": {
		"host": "0.0.0.0",
		"port": 3000
	}

**_FULL CONFIG DOC TO BE COMPLETE_**
