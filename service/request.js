const http = require('http')
const https = require('https')
const url = require('url')
const qs = require('querystring')

const filters = []

/*
settings => {
 url: '/sync/list'
 , data: { a,b,c } / stream
 , type: 'qs' / 'json'
 , dataType: 'json' / 'qs' / 'raw' / 'stream'
}

cb => (err, res, {})
*/
const request = function (settings, cb) {
  if (typeof settings == 'string') {
    settings = { url: settings }
  }

  settings.headers = settings.headers || {}

  const data = settings.data || settings.body || settings.json
  const dataType = settings.dataType
  let stream, rawData

  if (data && data.pipe) {
    stream = data
    // rawData = data
  } else if (typeof data == 'object') {
    if (settings.type == 'qs') {
      rawData = qs.stringify(data)
    } else {
      rawData = JSON.stringify(data)
      settings.headers['content-type'] = 'application/json'
    }
  } else if (data) {
    rawData = data
  }

  if (rawData) {
    rawData = Buffer.from(rawData)
    settings.headers['content-length'] = rawData.length
  }

  const reqUrl = settings.url
  const urlObj = url.parse(reqUrl)

  const options = {
    hostname: urlObj.hostname
    , port: urlObj.port
    , path: urlObj.path
    , method: settings.method || ((stream || rawData) ? 'POST' : 'GET')
    , headers: settings.headers
  }

  for (const i = 0; i < filters.length; i++) {
    const filter = filters[i]
    filter(settings, options)
  }

  const requestHandler = function (res) {
    const receives = []
    const err = null
    const statusCode = res.statusCode
    const headers = res.headers

    //重定向
    if ((statusCode == 302 || statusCode == 301) && headers.location) {
      options.url = headers.location
      request(options, cb)
      return
    }

    if (statusCode > 300) {
      err = new Error('Request Failed. Status Code: ' + res.statusCode + ' ' + reqUrl)
    }

    //doesn't parse data
    if (dataType == 'stream' || settings.stream) {
      cb && cb(err, res, {})
      return
    }

    res.on('data', function (chunk) {
      receives.push(chunk)
    })

    res.on('end', function () {
      const resData = Buffer.concat(receives).toString()
      if (dataType != 'raw') {
        try {
          resData = dataType == 'qs'
            ? qs.parse(resData)
            : JSON.parse(resData)
        } catch (e) { }
      }

      cb && cb(err, res, resData)
    })
  }

  const req = urlObj.protocol == 'https:'
    ? https.request(options, requestHandler)
    : http.request(options, requestHandler)

  req.on('error', function (e) {
    cb && cb(e, null, {})
  })

  if (stream) {
    stream.pipe(req)
  } else {
    rawData && req.write(rawData)
    req.end()
  }
}

const addFilter = function (filter) {
  if (typeof filter == 'function') {
    filters.push(filter)
  } else {
    console.log('request middware is not a function')
  }
}

module.exports = {
  request: request
  , use: addFilter
}