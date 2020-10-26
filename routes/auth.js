const express = require("express"),
  router = express.Router(),
  BigCommerce = require("node-bigcommerce");
const fs = require("fs-extra");

/**
 * sandoxes are public on the web by default
 * do not hard-code any credentials here
 * use codesandbox environment variables
 */
const bigCommerce = new BigCommerce({
  logLevel: "info",
  clientId: process.env.client_id, // set in  condesandbox server control panel
  secret: process.env.client_secret, // set in condesandbox server  control panel
  callback: process.env.callback, // set in condesandbox server control pannel
  responseType: "json",
  headers: { "Accept-Encoding": "*" },
  apiVersion: "v3"
});

router.get("/", (req, res, next) => {
  bigCommerce
    .authorize(req.query)
    .then((data) => {
      if (typeof data.access_token !== "undefined") {
        //===========================================================+
        // data.access_token
        //
        // If authorize successful, data object will contain access_token
        // store securely in DB; use to make API request to BigCOmmerce
        // ==========================================================+
        console.log("Injecting Script");

        const storeHash = data.context.split("/")[1];

        // create BigCommerce object with access token received
        let bcPostAPI = new BigCommerce({
          accessToken: data.access_token,
          storeHash: storeHash,
          clientId: process.env.client_id,
          responseType: "json",
          apiVersion: "v3"
        });

        const appScript =
          "<script src='https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js'></script><script>const app_currencyId = {{ currency_selector.active_currency_id }}; $(document).ready(function() { if(app_currencyId > 1) { $.post('" +
          process.env.app_url +
          "/api/getcurrency/" +
          storeHash +
          "/' + app_currencyId, function(data, status) { $('#exchangeRate_display').html(data); }); } else { $('#exchangeRate_display').html('1.0000'); } }); </script>";

        // create application script
        bcPostAPI
          .post("/content/scripts", {
            name: "Exchange Rate Display",
            description: "Build responsive websites",
            html: appScript,
            auto_uninstall: true,
            load_method: "default",
            location: "footer",
            visibility: "storefront",
            kind: "script_tag",
            consent_category: "essential"
          })
          .then((data) => {
            console.log("Script Created.");
            //console.log(data);
          })
          .catch((err) => {
            console.log("Error creating script");
            //console.log(err);
          });

        console.log("Access Token: " + data.access_token);

        // write authentication to file to store tokens
        fs.outputFile(
          "./storedata/" + storeHash + ".json",
          JSON.stringify(data),
          (err) => {
            if (err) {
              console.log(err);
            }
            console.log("File created.");
          }
        );

        res.render("auth", {
          authorized: true,
          title: "Authorization Successful",
          storeHash: storeHash
        });
      } else {
        res.render("auth", {
          authorized: false,
          title: "Authorization Failed"
        });
      }
    })
    .catch(next);
});

module.exports = router;
