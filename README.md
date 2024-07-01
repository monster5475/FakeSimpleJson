# JSON API Grafana Datasource

The JSON Datasource executes requests against arbitrary backends and parses JSON response into Grafana dataframes.

## Installation

To install this plugin using the `grafana-cli` tool:

```sh
 grafana-cli plugins install fake-simple-json
 ```

See [here](https://grafana.com/grafana/plugins/fake-simple-json/) for more information.

## Setup

When adding datasource add your API endpoint to the `URL` field. That's where datasource will make requests to.

If you want to add custom headers, keep Access set to `Server`.

## API

An OpenAPI definition is at [openapi.yaml](https://github.com/monster5475/FakeSimpleJson/blob/0.1.x/openapi.yaml). 
_You can explore it using [Swagger Editor](https://editor-next.swagger.io/)_.

To work with this datasource the backend needs to implement 4 endpoints:

- `GET /` with 200 status code response. Used for "Test connection" on the datasource config page.
- `POST /query` to return panel data or annotations.

Those 3 endpoints are optional:

- `POST /variable` to return data for Variable of type `Query`.
- `POST /tag-keys` returning tag keys for ad hoc filters.
- `POST /tag-values` returning tag values for ad hoc filters.

### /query

`POST /query`

Example request:

```json
{
  "panelId": 1,
  "range": {
    "from": "2016-10-31T06:33:44.866Z",
    "to": "2016-10-31T12:33:44.866Z",
    "raw": {
      "from": "now-6h",
      "to": "now"
    }
  },
  "rangeRaw": {
    "from": "now-6h",
    "to": "now"
  },
  "interval": "30s",
  "intervalMs": 30000,
  "maxDataPoints": 550,
  "targets": [
     { "target": "Packets", "refId": "A" },
     { "target": "Errors", "refId": "B" }
  ],
  "filters": [{
    "key": "City",
    "operator": "=",
    "value": "Berlin"
  }]
}
```

**Response body can contain anything that is or can be converted to a Grafana DataFrame using [this function](https://github.com/grafana/grafana/blob/1e024f22b8f767da01c9322f489d7b71aeec19c3/packages/grafana-data/src/dataframe/processDataFrame.ts#L284).
Returned data will be mapped to a DataFrame through that.**

Example response (metric value as a float , unix timestamp in milliseconds):

```json
[
  {
    "target":"pps in",
    "datapoints":[
      [622,1450754160000],
      [365,1450754220000]
    ]
  },
  {
    "target":"pps out",
    "datapoints":[
      [861,1450754160000],
      [767,1450754220000]
    ]
  },
  {
    "target":"errors out",
    "datapoints":[
      [861,1450754160000],
      [767,1450754220000]
    ]
  },
  {
    "target":"errors in",
    "datapoints":[
      [861,1450754160000],
      [767,1450754220000]
    ]
  }
]
```

```json
[
  {
    "columns":[
      {"text":"Time","type":"time"},
      {"text":"Country","type":"string"},
      {"text":"Number","type":"number"}
    ],
    "rows":[
      [1234567,"SE",123],
      [1234567,"DE",231],
      [1234567,"US",321]
    ],
    "type":"table"
  }
]
```

_The relation between `target` in request and response is 1:n. You can return multiple targets in response for one requested `target`._

#### Payload

Sending additional data for each metric is supported via the `Payload` input field that allows you to enter any JSON string.

For example, when `{ "additional": "optional json" }` is entered into `Payload` input, it is attached to the target data under `"payload"` key:

```json
{ "target": "upper_50", "refId": "A" }
```

You can also enter variables:

![Additional data variable input](https://raw.githubusercontent.com/simPod/grafana-json-datasource/0.6.x/docs/images/additional-data-variable-input.png)

### /search

`POST /search`

Example request body:

```json
{
  "range":{
    "from":"2022-02-14T08:09:32.164Z",
    "to":"2022-02-21T08:09:32.164Z",
    "raw":{"from":"now-7d","to":"now"}
  },
  "target": "",
}
```

`"payload"` is value from your input in Variable edit form.

Example response

```json
[
  {"text":"Label 1", "value":"Value1"},
  {"text":"Label 2", "value":"Value2"},
  {"text":"Label 3", "value":"Value3"}
]
```

DataFrame is also supported.

### /tag-keys

`POST /tag-keys`

Example request body

```json
{ }
```

The tag keys api returns:

```json
[
    {"type":"string","text":"City"},
    {"type":"string","text":"Country"}
]
```

### /tag-values

`POST /tag-values`

Example request body

```json
{"key": "City"}
```

The tag values api returns:

```json
[
    {"text": "Eins!"},
    {"text": "Zwei"},
    {"text": "Drei!"}
]
```
