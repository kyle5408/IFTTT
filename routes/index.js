const express = require('express')
const router = express.Router()
const serviceKey = process.env.serviceKey
const serviceID = process.env.serviceID
const middleware = require('../service/middleware')


// The status
router.get('/ifttt/v1/status', middleware.serviceKeyCheck, (req, res) => {
  res.status(200).send();
});

router.get('/', (req, res) => {
  res.render('index')
})

router.post('/', (req, res, cb) => {
  res.redirect(`http://maker.ifttt.com/trigger/${serviceID}/with/key/${serviceKey})`)
  console.log(cb)
})

module.exports = router