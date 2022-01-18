const express = require('express')
const router = express.Router()
const middleware = require('../service/middleware')
const helpers = require('../helpers')

require('dotenv').config()

const IFTTT_SERVICE_KEY = process.env.IFTTT_SERVICE_KEY


// The status
router.get('/ifttt/v1/status', middleware.serviceKeyCheck, (req, res) => {
  res.status(200).send()
});

// The test/setup endpoint
router.post('/ifttt/v1/test/setup', middleware.serviceKeyCheck, (req, res) => {
  console.log("test/setup endpoint")
  res.status(200).send({
    "data": {
      samples: {
        actionRecordSkipping: {
          create_new_thing: { invalid: "true" }
        }
      }
    }
  });
});

// Trigger endpoints
router.post('/ifttt/v1/triggers/new_thing_created', (req, res) => {
  console.log("Trigger endpoints")
  const key = req.get("IFTTT-Service-Key");
  if (key !== IFTTT_SERVICE_KEY) {
    res.status(401).send({
      "errors": [{
        "message": "Channel/Service key is not correct"
      }]
    });
  }
  let data = [],
    numOfItems = req.body.limit;
  // Setting the default if limit doesn't exist.
  if (typeof numOfItems === "undefined") {
    numOfItems = 3;
  }
  if (numOfItems >= 1) {
    for (let i = 0; i < numOfItems; i += 1) {
      data.push({
        "created_at": (new Date()).toISOString(), // Must be a valid ISOString
        "meta": {
          "id": helpers.generateUniqueId(),
          "timestamp": Math.floor(Date.now() / 1000) // This returns a unix timestamp in seconds.
        }
      });
    }
  } 
  console.log(req.body)
  console.log('===================with limit of================', numOfItems)
  res.status(200).send({
    "data": data
  });

});

// Query endpoints
router.post('/ifttt/v1/queries/list_all_things', (req, res) => {
  console.log("Query endpoints")
  const key = req.get("IFTTT-Service-Key");
  if (key !== IFTTT_SERVICE_KEY) {
    res.status(401).send({
      "errors": [{
        "message": "Channel/Service key is not correct"
      }]
    });
  }
  let data = [],
    numOfItems = req.body.limit;
  if (typeof numOfItems === "undefined") { // Setting the default if limit doesn't exist.
    numOfItems = 3;
  }
  if (numOfItems >= 1) {
    for (let i = 0; i < numOfItems; i += 1) {
      data.push({
        "created_at": (new Date()).toISOString(), // Must be a valid ISOString
        "meta": {
          "id": helpers.generateUniqueId(),
          "timestamp": Math.floor(Date.now() / 1000) // This returns a unix timestamp in seconds.
        }
      });
    }
  }
  let cursor = null
  if (req.body.limit == 1) {
    cursor = helpers.generateUniqueId()
  }
  res.status(200).send({
    "data": data,
    "cursor": cursor
  });
});

// Action endpoints
router.post('/ifttt/v1/actions/create_new_thing', (req, res) => {
  console.log("Action endpoints")
  const key = req.get("IFTTT-Service-Key");
  if (key !== IFTTT_SERVICE_KEY) {
    res.status(401).send({
      "errors": [{
        "message": "Channel/Service key is not correct"
      }]
    });
  }
  res.status(200).send({
    "data": [{
      "id": helpers.generateUniqueId()
    }]
  });
});

router.get('/', (req, res) => {
  res.render('index')
})

module.exports = router