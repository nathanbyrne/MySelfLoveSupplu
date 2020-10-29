var express = require("express");
var router = express.Router();

// Site homepage
router.get("/", function(req, res, next) {
  res.sendFile("index.html", {root: path.join(__dirname, "../public")});
});

module.exports = router;
