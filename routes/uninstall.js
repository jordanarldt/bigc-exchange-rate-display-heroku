/**
 * /uninstall
 *
 * called when the store owner clicks to uninstall the app.
 */

const express = require("express"),
  router = express.Router(),
  BigCommerce = require("node-bigcommerce"),
  fs = require("fs-extra");

const bigCommerce = new BigCommerce({
  secret: process.env.client_secret, // set in server control panel
  responseType: "json"
});

router.get("/", (req, next) => {
  console.log("Uninstall route called.");

  try {
    const data = bigCommerce.verify(req.query["signed_payload"]);
    if (typeof data.user !== "undefined") {
      const storeHash = data.store_hash;

      // ... code to remove user / store from app db ...
      fs.remove("./storedata/" + storeHash + ".json")
        .then(() => {
          console.log("Store data deleted for " + storeHash);
        })
        .catch((err) => {
          console.log(err);
        });
      console.log("User Removed At: " + data.timestamp);
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
