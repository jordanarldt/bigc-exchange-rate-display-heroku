/**
 * BigCommerce Express Currency Conversion Rate Display
 * created by Jordan Arldt
 *
 **/

const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const fs = require("fs-extra");
const BigCommerce = require("node-bigcommerce");
const cors = require("cors");

// App Routes ============================================
const auth = require("./routes/auth");
const load = require("./routes/load");
const uninstall = require("./routes/uninstall");
// ========================================================

const app = express();

var xbs = exphbs.create({
  partialsDir: "./views/partials",
  defaultLayout: "main"
});

app.use(cors());

app.engine("handlebars", xbs.engine);
app.set("view engine", "handlebars");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
//app.set("views", __dirname + "/views");

app.use("/", indexRouter);
app.use("/users", usersRouter);

// Post route to make the GET request to BigCommerce to send the conversion rate back to the theme
app.post("/api/getcurrency/:hash(*)/:id([0-9]{1})", (req, res) => {
  // Read the /storedata/ folder to verify the store hash and get the app access token for the store
  fs.readJSON("./storedata/" + req.params.hash + ".json")
    .then((packageObj) => {
      // Create a new BigCommerce object with the proper credentials
      let bcPostTest = new BigCommerce({
        accessToken: packageObj.access_token,
        storeHash: req.params.hash,
        clientId: process.env.client_id,
        responseType: "json",
        apiVersion: "v2"
      });

      // Make the request to BigCommerce, and send a JSON response
      bcPostTest
        .get("/currencies/" + req.params.id)
        .then((data) => {
          //console.log(data);
          var rate = parseFloat(data.currency_exchange_rate).toFixed(4);
          res.json(rate);
        })
        .catch((err) => {
          console.log("Error receiving currency exchange rate.");
          console.log(err);
          res.json(JSON.stringify(err));
        });
    })
    .catch((err) => {
      res.json("N/A");
    });
});

// App Routes ============================================+
app.use("/auth", auth);
app.use("/load", load);
app.use("/uninstall", uninstall);
// ========================================================

var listener = app.listen(process.env.PORT || 8080, function () {
  console.log("Listening on port " + listener.address().port);
});
