const express = require("express");
//const { default: mongoose } = require("mongoose");
const { Product } = require("../models/product");
const { Category } = require("../models/category");
const router = express.Router();
const mongoose=require('mongoose');
const multer = require('multer');

const FILE_TYPE_MAP = {
  'image/png':'png',
  'image/jpg':'jpg',
  'image/jpeg':'jpeg'
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {

    const isValid=FILE_TYPE_MAP[file.mimetype];

    let uploadError=new Error('Invalid image type')

    if(isValid)
    {
      uploadError=null;
    }
    cb(uploadError, 'public/uploads')
  },
  filename: function (req, file, cb) {
    const fileName =file.originalname.replace(' ','-')
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`)
  }
})

const uploadOptions = multer({ storage: storage })  



router.get(`/`, async (req, res) => {
    let filter={};
  if(req.query.categories)
  {
    filter={category:req.query.categories.split(',')}
  }
  const productList = await Product.find({filter})
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

router.post(`/`,  uploadOptions.single('image') , async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid Category");

  const file =req.file;
  if (!file) return res.status(400).send("No images provided");

  const fileName= req.file.filename;
  const basePath= `${req.protocol}://${req.get('host')}/public/upload/`;

  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`,
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

router.get(`/get/count`, async (req, res) => {
  const productCount = await Product.countDocuments();

  if (!productCount) {
    res.status(500).json({
      success: false,
    });
  }

  res.send({
    count:productCount
  });
});

router.get('/get/featured/:count', async (req,res)=>{

  const count=req.params.count ? req.params.count :0;
   const products= await Product.find({isFeatured:true}).limit(+count)

   if(!products)
   res.status(500).json({success:false})

   res.send(products)
})


router.put('/gallery-images/:id', uploadOptions.array('images',10), async(req,res)=>{
  if(!mongoose.isValidObjectId(req.params.id))
  return  res.status(400).send("Invalid Product Id");

  const files =req.files;
  let imagesPaths=[];
  const basePath= `${req.protocol}://${req.get('host')}/public/upload/`;

  if(files)
  {
    files.map((file)=>{
      imagesPaths.push(`${basePath}${file.filename}`)
    })
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      images:imagesPaths
    },
    { new: true }
  );

  if (!product) {
    res.status(500).json({ msg: "Product was not found" });
  }

  res.status(200).send(product);

})

module.exports = router;
