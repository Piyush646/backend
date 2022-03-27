const {Category} =require('../models/category') ;
const express=require('express');
const router=express.Router();

router.get('/',async (req,res)=>{
    const categoryList=await Category.find();

    if(!categoryList)
    {
        res.status(500).json({success:false})
    }

    res.send(categoryList);
})

router.get('/:id',async (req,res)=>{
    const category=await Category.findById(req.params.id);

    if(!category)
    {
        res.status(500).json({msg:'Category was not found'})
    }

    res.status(200).send(category);
})

router.put('/:id', async(req,res)=>
{
    const category= await Category.findByIdAndUpdate(
        req.params.id,
        {
            name:req.body.name,
            icon:req.body.icon,
            color:req.body.color,
        },
        {new:true}    
    )
    if(!category)
    {
        res.status(500).json({msg:'Category was not found'})
    }

    res.status(200).send(category);
})

router.post('/',async (req,res)=>{
    let category=new Category({
        name:req.body.name,
        icon:req.body.icon,
        color:req.body.color,
    })

    category= await category.save();

    if(!category)
    return res.status(404).send('The category was not created');

    res.status(200).send(category)
})

router.delete('/:id',async(req,res)=>
{
    try{
    let category;
    category=await Category.findByIdAndRemove(req.params.id)
    if(category)
    return res.status(200).json({success:true,msg:"Category deleted"})
    else if(!category)
    return res.status(404).json({success:false,msg:"Category not found"})
    }
    catch(error)
     {
        return res.send({success:false,error:error})
    }
     //else
    // return res.send.json({success:false,msg:'Some invalid format of id'})
})

module.exports=router;