const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 9000;

app.use(cors());
app.use(bodyParser.json()); 

const authentication = require("./router/authentication")

// app.get("/", (req, res) => {
//     res.send("Received and processed JSON data");
// });

app.use("/", authentication)

app.listen(port, () => {
    console.log("Listening on port", port);
});
