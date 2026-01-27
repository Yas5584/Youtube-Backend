// import multer from "multer";

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, "./public/temp")
//     },
//     filename: function (req, file, cb) {
      
//       cb(null, file.originalname)
//     }
//   })
  
// export const upload = multer({ 
//     storage, 
// })
// export {multer({storage})}

import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const safeName = file.originalname
      .replace(/\s+/g, "_")       // remove spaces
      .replace(/[^a-zA-Z0-9._-]/g, "");

    cb(null, `${Date.now()}-${safeName}`);
  }
});

export const upload = multer({ storage });
