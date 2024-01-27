const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require('cookie-parser');

const app = express();
const port = 9000;

app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json()); 

const authentication = require("./router/authentication")
const appointment = require("./router/appointment")
const Services = require("./router/servicesRoute")
const AvailableTime = require("./router/dateValidator")


app.use("/", authentication, appointment, Services, AvailableTime)

app.listen(port, () => {
    console.log("Listening on port", port);
});
