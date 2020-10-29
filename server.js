const path = require("path");
const express = require("express");

const app = express()
const port = 3000;

app.use(express.static(path.join(__dirname, "public")))
app.use(express.json())

app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "jade");

const indexRouter = require("./routes/index");
app.use('/', indexRouter);

const shopRouter = require("./routes/shop")
app.use('/shop', shopRouter);


app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
})

