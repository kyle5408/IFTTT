const serviceKey = process.env.serviceKey;

module.exports = {
  serviceKeyCheck: function (req, res, next) {
    const key = req.get("serviceKey");
    if (key !== serviceKey) {
      res.status(401).send();
    }
    next();
  }
};