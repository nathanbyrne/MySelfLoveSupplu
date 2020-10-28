const path = require("path");

const express = require("express");
const port = 3000;
const app = express()

app.use(express.static(path.join(__dirname, "public")))

app.get("/", (req, res) => {
	res.send("Hello, world!");
})

app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
})

