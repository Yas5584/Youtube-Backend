// import { v2 as cloudinary } from "cloudinary"
// import fs from "fs";


//  // Configuration
// cloudinary.config({ 
//         cloud_name: process.env.CLOUDINARY_NAME,
//         api_key: process.env.CLOUDINARY_API_KEY, 

//         api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
// });

// const uploadOnCloudinary= async (localFilePath)=>{

//     try {
//         console.log("local file path availabe",localFilePath)
//     //    if (!localFilePath) return null
       
//        const response= await cloudinary.uploader.upload(localFilePath,{resource_type:"auto"})
//     //    console.log("File uploading on Url",response.url)
//     console.log(response)
//     //    fs.unlinkSync(localFilePath)
//        return response
//     }
//     catch(error){
//         // remove the locally saved temporary file as the upload operation got failed
//         // fs.unlinkSync(localFilePath)
        
        
//         return null;


//     }

// }
// export {uploadOnCloudinary}

import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
//   if (fs.existsSync(localFilePath)) {
//       fs.unlinkSync(localFilePath);
//     }
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) 
        // // remove the locally saved temporary file as the upload operation got failed
       console.log("Error while uploading on cloudinary ", error);

        return null;
    }
}



export {uploadOnCloudinary}