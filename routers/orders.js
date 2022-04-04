const {Order} = require('../models/order');
const {OrderItem} = require('../models/orderItem')
const express = require('express');
const router = express.Router();

router.get('/',async (req,res)=>{
    const orderList=await Order.find().populate('user','name').sort({dateOrdered:-1});

    if(!orderList)
    {
        res.status(500).json({success:false})
    }

    res.send(orderList);
})

router.get('/:id',async (req,res)=>{
    const order=await Order.findById(req.params.id).populate('user','name')
    .populate({
        path:'orderItems', populate :{
            path :'product' ,populate : 'category'}
    })

    if(!order)
    {
        res.status(500).json({success:false})
    }

    res.send(order);
})

router.post('/',async (req,res)=>{

    const orderItemsIds = Promise.all(req.body.orderItems.map(async orderItem=>{
        let newOrderItem = new OrderItem({
            quantity :orderItem.quantity,
            product: orderItem.product
        })

        newOrderItem = await newOrderItem.save();
        return newOrderItem._id;
    }))

    const orderItemsIdsResolved = await orderItemsIds;

    const totalPrices= await Promise.all(orderItemsIdsResolved.map( async (orderItemId)=>{
        const orderItem = await OrderItem.findById(orderItemId).populate('product' , 'price')
        const totalPrice= orderItem.product.price * orderItem.quantity;
        return totalPrice;
    }))
    //console.log(totalPrices)
    //console.log(orderItemsIdsResolved);
    const totalPrice = totalPrices.reduce((a,b)=> a+b,0);

    let order=new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1 : req.body.shippingAddress1,
        shippingAddress2 : req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country : req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice:totalPrice,
        user : req.body.user,
    })

   order= await order.save();

    if(!order)
    return res.status(404).send('The order was not created');

    res.status(200).send(order)
})

router.put('/:id', async(req,res)=>
{
    const order= await Order.findByIdAndUpdate(
        req.params.id,
        {
           status:req.body.status,
        },
        {new:true}    
    )
    if(!order)
    {
        res.status(500).json({msg:'Order was not found'})
    }

    res.status(200).send(order);
})

router.delete('/:id',async(req,res)=>
{
    try{
    let order;
    order=await Order.findByIdAndRemove(req.params.id)
    if(order)
    {
        await order.orderItems.map( async orderItemId=>{
            await OrderItem.findByIdAndRemove(orderItemId)
        })
        return res.status(200).json({success:true,msg:"Order deleted"})
    }
    
    else if(!order)
    return res.status(404).json({success:false,msg:"Order not found"})
    }
    catch(error)
     {
        return res.send({success:false,error:error})
    }
     //else
    // return res.send.json({success:false,msg:'Some invalid format of id'})
})

router.get('/get/totalsales', async (req,res)=>{
    const totalSales = await Order.aggregate([
        {
            $group:{ _id :null, totalSales:{ $sum :'$totalPrice'}}
        }
    ])

    if(!totalSales){
        return res.status(400).send("The order sales can not be calculated")
    }
    return res.send({totalSales: totalSales[0].totalSales})
})


router.get(`/get/count`, async (req, res) => {
    const orderCount = await Order.countDocuments();
  
    if (!orderCount) {
      res.status(500).json({
        success: false,
      });
    }
  
    res.send({
      count:orderCount
    });
  });

module.exports =router;