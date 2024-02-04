const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
const port = 9000;
const fs = require("fs")
const file = fs.readFileSync('./A1E35907E17CD7A8FEAC34292F26B235.txt')
const https = require("https")

app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());


const authentication = require("./router/authentication");
const appointment = require("./router/appointment");
const Services = require("./router/servicesRoute");
const AvailableTime = require("./router/dateValidator");
const UserProfile = require("./router/userProfile");
const dashboard = require("./router/dasbhoard");
const users = require("./router/users");

app.use(
  "/",
  authentication,
  appointment,
  Services,
  AvailableTime,
  UserProfile,
  dashboard,
  users
);
app.get('/.well-known/pki-validation/A1E35907E17CD7A8FEAC34292F26B235.txt', (req,res) =>{
  res.sendFile("./home/ubuntu/dental-BE/A1E35907E17CD7A8FEAC34292F26B235.txt")
})

app.listen(port, () => {
  console.log("Listening on port", port);
});
