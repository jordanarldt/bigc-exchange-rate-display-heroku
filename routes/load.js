/**
 * /load
 *
 * Called when a store owner or user click to load the app
 */

const express = require("express");
const router = express.Router();
const BigCommerce = require("node-bigcommerce");
const fs = require("fs-extra");

const bigCommerce = new BigCommerce({
  clientId: process.env.client_id, // set in codesandbox server control panel
  secret: process.env.client_secret, // set in codesandbox server control panel
  responseType: "json",
  headers: { "Accept-Encoding": "*" },
  apiVersion: "v2"
});

router.get("/", (req, res, next) => {
  //console.log("App loading");
  try {
    // verify request came from BigCommerce
    const data = bigCommerce.verify(req.query["signed_payload"]);
    //console.log("Data: " + JSON.stringify(data));

    if (typeof data.user !== "undefined") {
      console.log("App loaded, authenticated user.");

      // When loading the app, make sure the store has their credentials saved
      fs.readJSON("./storedata/" + data.store_hash + ".json")
        .then((packageObj) => {
          res.render("appcontent", {
            credentialsFound: true
          });
        })
        .catch((err) => {
          res.render("appcontent", {
            credentialsFound: false
          });
        });
    }
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
