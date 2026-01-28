import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { cookiesResponse } from "../utils/cookieResponse.js";
const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessTokens()
        const refreshToken = user.generateRefreshTokens()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}




// const registerUser=asyncHandler(async (req,res)=>{

// // get the user details from frontend
// // validation like Empty 
// // check if user is already exists - username and email
// // check for images and check for avatar

// //  upload them on cloudinary
// // create user object - create entry in db
// //  remove password and refresh token feild from response
// // check user creation
// // return res


// const {userName,fullName,email,password}=req.body;


// // if (userName===""){
// //     throw new ApiError(
// //         statusCode=401,
// //         message="username required",
// //     )
// // } this is a logic for begineers

// if ([userName,fullName,email,password].some(
//     (feilds)=>feilds?.trim()==="")){
//         throw new ApiError(400,"All feilds required")
//     }


//   const existedUser=  await User.findOne({
//         $or:[{userName},{email}]
//     })

//     if (existedUser){
//         throw new ApiError(409,"User Already Exists")
//     }

      
//     const avatarLocalPath = req.files?.avatar[0]?.path
//     console.log(avatarLocalPath)
//     // const coverImageLocalPath= req.files?.coverImage[0]?.path

//     let coverImageLocalPath;

//     if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
//         coverImageLocalPath= req.files.coverImage[0].path
        
//     }


//     // if (!avatarLocalPath){
//     //     throw new ApiError(400,"Avatar is required")
//     // }

//     // if (!coverImageLocalPath){
//     //     throw new ApiError(400,"Cover Image is required")
//     // }

//     // upload on cloudinary
//     console.log(avatarLocalPath)
//    const avatar= await uploadOnCloudinary(avatarLocalPath)
//    console.log(avatar)
//    const coverImage= await uploadOnCloudinary(coverImageLocalPath)

//    if (!avatar){
//     throw new ApiError(400,"avatar is required")
//    }

//    const user=await User.create({
//        userName:userName.toLowerCase(),
//        avatar:avatar.url,
//        email,
//        password,
//        fullName:fullName,
//        coverImage:coverImage?.url
//  })

//    const createdUser = await User.findById(user._id).select(
//     "-password -refreshTokens"
//    )
    
//    if (!createdUser){
//     throw new ApiError(500,"Something went wrong while registering the user")
//    }


//    return res.status(201).json(
//     new ApiResponse(200,createdUser,"user registered successfully")
// )

   

// })
const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const {fullName, email, userName, password } = req.body
    //console.log("email: ", email);

    if (
        [fullName, email, userName, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ userName }, { email }]
    })
    console.log("existed user: ", existedUser);

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    //console.log(req.files);

    const avatarLocalPath = req.files?.avatar?.[0].path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;


    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    
    
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }
    console.log("avatar local path: ", avatarLocalPath);
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
   

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        userName: userName.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

} )




const loginUser = asyncHandler(async (req,res)=>{

    const {userName,email,password} = req.body;
    console.log(req.body)



    // todos
    // user req-> body
    // userName or email
   
    // find user in db
    // check password
    // access and refresh token
    // send cookies

    if (!userName && !email){
        throw new ApiError(400,"username and email required")
    }
//  checking that user is exist in db or not
   const user=await User.findOne({
        $or:[{userName},{email}]
    })
// if user is not found thrw error
    if (!user){
        throw new ApiError(404,"user not found")
    }

// checking the password is correct or not

    const matchPassword=await user.isPasswordCorrect(password)
    if (!matchPassword){
        throw new ApiError(401,"invalid credentials")
    }


    // generate access and refresh tokens
    const {accessToken,refreshToken}=await generateAccessAndRefereshTokens(user._id)
    console.log("access token is : ",accessToken)
    console.log("refresh token is  : ",refreshToken)

    
    const loggedInUser=await User.findOne(user._id).select("-password -refreshToken")
    
// Cookie options

    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200,{
        user:loggedInUser,accessToken,refreshToken
    },
    "user logged in successfully"))




})




const logoutUser=asyncHandler(async(req,res)=>{
    // 
    await User.findByIdAndUpdate(
        req.user._id,//Which to update
        // What to update
    {
        $set:{
        refreshTokens:undefined 
        }
    },
    {
        new:true
    }
)

        const options={
            httpOnly:true,
            secure:true

        }
    

    return res.status(200)
    .clearCookie("accessTokens",options)
    .clearCookie("refreshTokens",options)
    .json(new ApiResponse(200,"Successfully logged out"))
}
)


// Hit a  endpoint so regenerate refresh tokens


const refreshAccessTokens=asyncHandler(async(req,res)=>{
    // get refresh token from cookies
    const incomingrefreshTokens=req.cookies?.refreshToken || req.body.refreshToken
    console.l
    if (!incomingrefreshTokens){
        throw new  ApiError(401,"Unauthorized request")
    }

    // verify refresh token

try {
        const decodedTokens= jwt.verify(incomingrefreshTokens,process.env.REFRESH_TOKEN_SECRET)
        // find user by id
        const user= await User.findById(decodedTokens?._id)
        if (!user){
            throw new ApiError(401,"Unauthorized request - user not found")
        }
        if (incomingrefreshTokens!==user?.refreshToken){
            throw new ApiError(401,"Refresh token is expired  or used")
        }
        // generate new access and refresh tokens
        const {accessToken,newrefreshToken}=await generateAccessAndRefereshTokens(user._id)
        
                const options={
                httpOnly:true,
                secure:true
    
            }
    
    
        return res
              .status(200)
              .cookie("accessToken",accessToken,options)
              .cookie("refreshToken",newrefreshToken,options)
              .json(new ApiResponse(200,{
                accessToken,refreshToken:newrefreshToken
              },"Tokens regenerated successfully"))
} catch (error) {
    throw new ApiError(401,"Invalid refresh token")
    
}
          







}

)

const changecurrentPassword=asyncHandler(async(req,res)=>{

    const {oldPassword,newPassword}=req.body;

    if (!oldPassword || !newPassword){
        throw new ApiError(400,"old password and new password required")
    }

    // finding logged in user

    const user=await User.findById(req.user?._id)

    // check old password is correct or not
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)
    if (!isPasswordCorrect){
        throw new ApiError(401,"old password is incorrect")
    }

    user.password=newPassword
    await user.save({validateBeforeSave:false})

    return res
        .status(200)
        .json(new ApiResponse(200,"Password changed successfully"))
         

})

const getCurrentUser=asyncHandler(async(req,res)=>{
    return res 
           .status(200)
           .json(new ApiResponse(200,req.user,"Current user fetched successfully"))
})

const updateAccountDetails=asyncHandler(async(req,res)=>{

     const {fullName,email}=req.body;

     if (!fullName || !email){

        throw new ApiError(400,"fullName and email required")
     }


     const user=User.findByIdAndUpdate(req.user?._id,
        {
          $set:{
            fullName,
            email:email
          }
        }
        ,{ new:true}
     ).select("-password")
   

     return res
        .status(200)
        .json(new ApiResponse(200,"Account details updated successfully"))

}
)



export {registerUser,
        loginUser,
        logoutUser,
        refreshAccessTokens,
        changecurrentPassword,
        getCurrentUser,

    
    }





