function errorHandler( err, req ,res , next){
    //for jwt token authentication
    if(err.name==='UnauthorizedError')
    return res.status(401).json({msg:"The user is not authorized"})

    if(err.name==='ValidationError')
    return res.status(401).json({msg:err})

    //default server error 500
    return res.status(401).json({msg:err})
}

module.exports = errorHandler;