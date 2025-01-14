const Doctor =require('../Models/Signup.models');
const  {SignupInvationmail, sendotp}=require('../Service/signup.mail')
const bcryptjs=require('bcryptjs');
const { otpcreate } = require('../Service/signup.otp');
const jwt =require('jsonwebtoken')

//doctor signup logic 
let doctorsignup = async (req, res,next)=>{
try{

    let {name, email, password}=req.body;

    let isDoctor = await  Doctor.findOne({email})
 
    if(!isDoctor){
        
        
      
        let createDoctor = await Doctor.create({name,email, password})
        SignupInvationmail(email, name)
       
         
       return  res.status(201).json({error:false, message:"doctor created sucessfully", data: {name:createDoctor.name,age:createDoctor.age,email:createDoctor.email}})
    }
    return res.status(404).json({error:true, message:"doctor already exists"})

}
catch(err){
    next(err)
}

}

//doctor login logic
let doctorlogin = async (req,res,next)=>{

    
    try{

        let { name, email, password}=req.body;

        let isavailable = await Doctor.findOne({email})

        if( !isavailable){

            return res.status(300).json({error:true, message:"Given email id not found any Doctor", data:null})
        }



        let haspassword = await isavailable .compareMypassword(password )
      
        if(haspassword ){
            
       // OTP sending 
            let {hashotp,otp} = await otpcreate();

            let user = await Doctor.findOneAndUpdate({email},
                {hashotp}, {new:true, runValidators:true})
               sendotp(email, otp, user.name)

            let tokengenerator = jwt.sign({email:isavailable.email , name:isavailable.name},
                process.env.JWT_KEY ,{expiresIn:process.env.JWT_EXPIRESIN})
            return res.status(201).json({error:false, message:"Doctor login sucessfuly", data:tokengenerator})
        }
        else{
            return res.status(401).json({error:true, message:"invalied password" })
        }

    }

    catch(err){
        next(err)  
    }

}

let getalldocotr = async (req, res, next)=>{

    try{
        let alldoctors = await Doctor.find({},{_id:0})
        res.status(200).json({error:false, message:" sucessfully getting all doctor details", data:alldoctors})

    }
    catch(err){
        next(err)
    }
}

module.exports={
    doctorsignup,
    doctorlogin,
    getalldocotr
}