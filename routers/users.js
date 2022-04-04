const {User} =require('../models/user') ;
const express=require('express');
const router=express.Router();
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')

router.get('/',async (req,res)=>{
    const userList=await User.find().select('-passwordHash');

    if(!userList)
    {
        res.status(500).json({success:false})
    }

    res.send(userList);
})

router.get('/:id',async (req,res)=>{
    const user=await User.findById(req.params.id).select('-passwordHash');

    if(!user)
    {
        res.status(500).json({msg:'User was not found'})
    }

    res.status(200).send(user);
})

router.post('/',async (req,res)=>{
    let user=new User({
        name:req.body.name,
        email:req.body.email,
        passwordHash:bcrypt.hashSync(req.body.password,11),
        phone:req.body.phone,
        isAdmin:req.body.isAdmin,
        apartment:req.body.apartment,
        zip:req.body.zip,
        city:req.body.city,
        country:req.body.country,
    })

    user= await user.save();

    if(!user)
    return res.status(404).send('The user was not created');

    res.status(200).send(user)
})


router.post('/login',async(req,res)=>{
    const user= await User.findOne({email:req.body.email})
    const secret=process.env.secret;
    if(!user)
    return res.status(400).send('User was not found')

    if(user && bcrypt.compareSync(req.body.password, user.passwordHash))
    {
        const token=jwt.sign(
            {
                userId:user.id,
                isAdmin:user.isAdmin,
                isRevoked : isRevoked,
            },
            secret,
            {expiresIn:'1d'}
        )

        res.status(200).send({ user:user.email , token: token });
    }
    

    else
    return res.status(400).send('Wrong password');
    
   
})


router.post('/register',async (req,res)=>{
    let user=new User({
        name:req.body.name,
        email:req.body.email,
        passwordHash:bcrypt.hashSync(req.body.password,11),
        phone:req.body.phone,
        isAdmin:req.body.isAdmin,
        apartment:req.body.apartment,
        zip:req.body.zip,
        city:req.body.city,
        country:req.body.country,
    })

    user= await user.save();

    if(!user)
    return res.status(404).send('The user was not created');

    res.status(200).send(user)
})

router.delete('/:id',async(req,res)=>
{
    try{
    let user;
    user=await User.findByIdAndRemove(req.params.id)
    if(user)
    return res.status(200).json({success:true,msg:"user deleted"})
    else if(!user)
    return res.status(404).json({success:false,msg:"user not found"})
    }
    catch(error)
     {
        return res.send({success:false,error:error})
    }
     //else
    // return res.send.json({success:false,msg:'Some invalid format of id'})
})

router.get(`/get/count`, async (req, res) => {
    const userCount = await User.countDocuments();
  
    if (!userCount) {
      res.status(500).json({
        success: false,
      });
    }
  
    res.send({
      count:userCount
    });
  });

async function isRevoked( req , payload , done)
{
    if(!payload.isAdmin)
    {
        done(null,true)
    }

    done();
}

module.exports=router;