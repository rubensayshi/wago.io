define({ "api": [
  {
    "type": "get",
    "url": "/data/categories/:apikey",
    "title": "Categories",
    "sampleRequest": [
      {
        "url": "https://wago.io/api/v1/data/categories"
      }
    ],
    "name": "Categories",
    "group": "Data",
    "version": "1.0.0",
    "description": "<p>Retrieves data on categories used by WAGO.</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "apikey",
            "description": "<p>Your API key.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Unique ID for the category.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of the category.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "url",
            "description": "<p>path of the category on WAGO.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "NoAuth",
            "description": "<p>Invalid API Key provided.</p>"
          }
        ]
      }
    },
    "filename": "app/api/api-routes.js",
    "groupTitle": "Data"
  },
  {
    "type": "get",
    "url": "/aura/:apikey/:id",
    "title": "Aura information",
    "sampleRequest": [
      {
        "url": "https://wago.io/api/v1/aura"
      }
    ],
    "name": "Aura_Information",
    "group": "Lookups",
    "version": "1.0.0",
    "description": "<p>Retrieves information for an aura given an ID.</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "apikey",
            "description": "<p>Your API key.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Aura's ID.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "auraID",
            "description": "<p>Aura's ID.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of aura.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "description",
            "description": "<p>Description of aura.</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "hidden",
            "description": "<p>True if this aura is hidden by the creator; not searchable. Note that private auras are not acessible through the API.</p>"
          },
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "categories",
            "description": "<p>Array of category IDs this aura belongs to. See /data/categories.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user",
            "description": "<p>Username of aura creator; blank if imported as guest.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "stars",
            "description": "<p>Number of users that have starred this aura.</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "lastUpdate",
            "description": "<p>Date of last modification to aura code.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "importString",
            "description": "<p>encoded import/export string.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "lua",
            "description": "<p>Lua table of the aura.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data",
            "description": "<p>JSON representation of the lua table.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n \"id\": \"Ey33GEoNZ\",\n \"name\": \"API Example\",\n \"description\": \"This is a model type aura.\",\n \"hidden\": true,\n \"categories\": [\n   \"gen3\"\n ],\n \"user\": \"Ora\",\n \"stars\": 12,\n \"lastUpdate\": \"2016-06-16T06:13:47.192Z\",\n \"importString\": \"dSIUbaqlK [truncated...]\",\n \"lua\": \"lua_table = {\\n   [\\\"m\\\"] = \\\"d\\\";\\n [truncated...] \"\n \"data\": { \"m\": \"d\", \"d\": \"[truncated...]\" }\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "NoAuraFound",
            "description": "<p>No aura found.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "NoAuth",
            "description": "<p>Invalid API Key provided.</p>"
          }
        ]
      }
    },
    "filename": "app/api/api-routes.js",
    "groupTitle": "Lookups"
  },
  {
    "type": "get",
    "url": "/user/:apikey/:username",
    "title": "User information",
    "sampleRequest": [
      {
        "url": "https://wago.io/api/v1/user"
      }
    ],
    "name": "User_Information",
    "group": "Lookups",
    "version": "1.0.0",
    "description": "<p>Retrieves information for a user given their username. Hidden and private auras not included.</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "apikey",
            "description": "<p>Your API key.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>The user's name.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of user.</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "auras",
            "description": "<p>Array of auras belonging to this user.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "auras.id",
            "description": "<p>ID of the aura.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "auras.name",
            "description": "<p>Name of the aura.</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "auras.lastUpdate",
            "description": "<p>Date of last modification to aura code.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n \"user\": \"Ora\",\n \"auras\": [{\n     \"id\": \"Ey33GEoNZ\",\n     \"name\": \"API Example\",\n     \"lastUpdate\": \"2016-06-16T06:13:47.192Z\"\n     }\n  ]\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "NoUserFound",
            "description": "<p>No user found.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "NoAuth",
            "description": "<p>Invalid API Key provided.</p>"
          }
        ]
      }
    },
    "filename": "app/api/api-routes.js",
    "groupTitle": "Lookups"
  }
] });
