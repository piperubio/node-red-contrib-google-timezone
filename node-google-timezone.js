var https = require("https");

var GOOGLE_TIMEZONE_API_URL =
  "https://maps.googleapis.com/maps/api/timezone/json?";

function httpsRequest(url, next) {
  var req = https.request(url, res => {
    res.on("data", responseData => {
      next(null, responseData);
    });
  });

  req.on("error", e => {
    next(e);
  });
  req.end();
}

function requestGoogleTimezone(
  googleTimezoneApiHost,
  googleApiKey,
  location,
  next
) {
  var options = {
    location: location || [],
    timestamp: timestamp || new Date(),
    language: "en"
  };
  var requestURL =
    googleTimezoneApiHost +
    "location=" +
    options.location[0] +
    "," +
    options.location[1] +
    "&timestamp=" +
    options.timestamp +
    "&key=" +
    googleApiKey;

  httpsRequest(requestURL, function(error, response) {
    if (error) {
      next(error);
    }
    next(null, response);
  });
}

// Encapsulate Node in a Nodejs Module
module.exports = function(RED) {
  // Execute Node Logic
  function GoogleTimezoneNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on("input", function(msg) {
      var newMsg = Object.assign({}, msg);
      var GOOGLE_API_KEY = node.GOOGLE_API_KEY;
      var location = msg.location;
      requestGoogleTimezone(
        GOOGLE_TIMEZONE_API_URL,
        GOOGLE_API_KEY,
        location,
        function(error, timezone) {
          if (error) {
            node.error(error, msg);
          }
          newMsg.payload = timezone;
          node.send(newMsg);
        }
      );
    });
  }

  // Register Node
  RED.nodes.registerType("google-timezone", GoogleTimezoneNode);
};
