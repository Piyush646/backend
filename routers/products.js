const express = require("express");
//const { default: mongoose } = require("mongoose");
const { Product } = require("../models/product");
const { Category } = require("../models/category");
const router = express.Router();
const mongoose=require('mongoose');


router.get(`/`, async (req, res) => {
  const productList = await Product.find()
    .select("name image category")
    .populate("category");

  if (!productList) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(productList);
});

router.get(`/:id`, async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");

  if (!product) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(product);
});

router.post(`/`, async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid Category");

  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: req.body.image,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });

  product = await product.save();

  if (!product) return res.status(500).send("The product can not be created");

  res.send(product);
});

router.put("/:id", async (req, res) => {

  if(!mongoose.isValidObjectId(req.params.id))
  return  res.status(400).send("Invalid Product Id");

  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid Category");

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    { new: true }
  );
  if (!product) {
    res.status(500).json({ msg: "Product was not found" });
  }

  res.status(200).send(product);
});


router.delete('/:id',async(req,res)=>
{
    try{
    let product;
    product=await Product.findByIdAndRemove(req.params.id)
    if(product)
    return res.status(200).json({success:true,msg:"product deleted"})
    else if(!product)
    return res.status(404).json({success:false,msg:"product not found"})
    }
    catch(error)
     {
        return res.send({success:false,error:error})
    }
     //else
    // return res.send.json({success:false,msg:'Some invalid format of id'})
})

router.get(`/count`, async (req, res) => {
  const productCount = await Product.countDocuments((count)=>{
    return count
  });

  if (!productCount) {
    res.status(500).json({
      success: false,
    });
  }
  res.send({
    count:productCount
  });
});

module.exports = router;