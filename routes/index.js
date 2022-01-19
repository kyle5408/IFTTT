const express = require('express')
const router = express.Router()
const endpoint = require('./modules/endpoint')
const request = require('../service/request').request
const webhooksKey = process.env.WEBHOOKS_KEY


router.use('/ifttt/v1', endpoint)

//getNumber
router.post('/getNumber', (req, res) => {
  request({ url: `https://maker.ifttt.com/trigger/getNumber/with/key/${webhooksKey}`, data: req.body }, function (err, response, data) {
    req.flash('success_messages', data + ' by sending number: ' + req.body.value1 )
    res.redirect('/')
  })
})

router.get('/', (req, res) => {
  res.render('index')
})

module.exports = router