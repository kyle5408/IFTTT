const express = require('express')
const router = express.Router()
const endpointTest = require('./modules/endpointTest')


router.use('/ifttt/v1', endpointTest)

require('dotenv').config()






router.get('/', (req, res) => {
  res.render('index')
})

module.exports = router