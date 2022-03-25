const express=require('express');
const app=express();
const bodyParser=require('body-parser');
const morgan=require('morgan');
const mongoose=require('mongoose')

//middleware
app.use(bodyParser.json());
app.use(morgan('tiny'));

const productSchema=mongoose.Schema({
    name:String,
    image:String,
    countInStock:Number,
})

const Product= mongoose.model('Product',productSchema);

require('dotenv/config')

const api=process.env.API_URL;

app.get(`${api}/products`,(req,res)=>{
    const product={
        id:1,
        name:'Piyush',
        image:'some url',
    }
    res.send(product);
})

app.post(`${api}/products`,(req,res)=>{
    const product = new Product({
        name:req.body.name,
        image:req.body.image,
        countInStock:req.body.countInStock,
    })

    product.save().then((createdProduct)=>
    {
        res.status(201).json(createdProduct)
    })
    .catch((error)=>{
        res.status(500).json({
            error:error,
            success:false,
        })
    })
})

mongoose.connect(process.env.CONNECTION_STRING,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    dbname:'eshop_db',
})
.then(()=>{
    console.log("Db connection successful");
})
.catch((error)=>{
    console.log(error);
})


app.listen(3000,()=>{
    console.log('Server started at 3000')
})