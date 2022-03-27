const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose=require('mongoose')
const cors=require('cors')
require("dotenv/config");

const api = process.env.API_URL;
const productsRouter=require('./routers/products')
const categoriesRouter=require('./routers/categories')

app.use(cors())
app.options('*',cors());

//middleware
app.use(bodyParser.json());
app.use(morgan("tiny"));

//Routers
app.use(`${api}/products`,productsRouter)
app.use(`${api}/categories`,categoriesRouter)










mongoose
  .connect(process.env.CONNECTION_STRING, {
    // useNewUrlParser:true,
    // useUnifiedTopology:true,
    // dbname:'eshop_db',
  })
  .then(() => {
    console.log("Db connection successful");
  })
  .catch((error) => {
    console.log(error);
  });

app.listen(3000, () => {
  console.log("Server started at 3000");
});
