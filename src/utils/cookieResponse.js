export const cookiesResponse=function(res,statusCode,refreshToken,accessToken,options,message){
    return res
          .status(statusCode)
          .cookie("accessToken",accessToken,options)
          .cookie("refreshToken",refreshToken,options)
          .json(new ApiResponse(statusCode,{
            accessToken,refreshToken
          },message))



}
