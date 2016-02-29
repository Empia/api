# DADI API

## Status endpoint

An endpoint at /status would enable a finer-grained approach to platform monitoring.
This would enable you make decisions relating to load (e.g. at load balancer level) on the basis of much more than just whether or not an API instance is responding to ping on port XX; and would allow you to more easily visualise stack performance.

### Request using curl

```
curl -X GET -H "Content-Type: application/json" -H "Authorization: Bearer 4172bbf1-0890-41c7-b0db-477095a288b6" "http://api.example.com/status"

```

### Response

```
{
  "current_version":"1.2.2",
  "memory_usage": {
    "rss":78094336,
    "heapTotal":58658560,
    "heapUsed":28036288
  },
  "uptime":87.929,
  "load_avg":[
    0.07470703125,
    0.091796875,
    0.123046875
  ],
  "latest_version":"1.2.2",
  "health":[
    {
      "route":"/health",
      "pid":20948,
      "uptime":87.928,
      "memory":{
        "rss":78094336,
        "heapTotal":58658560,
        "heapUsed":28030192
      },
      "responseTime":0.015,
      "healthStatus":"Green"
    }
  ]
}
```
