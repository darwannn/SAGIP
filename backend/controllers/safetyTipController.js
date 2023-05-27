const safetyTipController = require("express").Router()
const SafetyTip = require("../models/SafetyTip")
const verifyToken = require('../middlewares/verifyToken')
const {isEmpty,isImage,isLessThanSize} = require('./functionController')

const express = require("express");
const multer = require("multer");
const path = require("path");

const fs = require('fs');


// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

safetyTipController.post('/add', verifyToken, upload.single('image'), async (req, res) => {
    const error = {};
    try {
      const { title, content, category } = req.body;
  
      if (isEmpty(title)) error["title"] = 'Required field';
      if (isEmpty(content)) error["content"] = 'Required field';
      if (isEmpty(category)) error["category"] = 'Required field';
      if (!req.file) error["image"] = 'Required field';
  
      // Multer file filter validation

  
      // Check file extension
   
  if (isImage(req.file)) {
    error["image"] = 'Only PNG, JPEG, and JPG files are allowed';
  }
 
      if (isLessThanSize(req.file,10 * 1024 * 1024)) {
        error["image"] = 'File size should be less than 10MB';
      }

      if (Object.keys(error).length === 0) {
        const safetyTip = await SafetyTip.create({
          title,
          content,
          category,
          image: req.file.filename,
          userId: req.user.id
        });
        if (safetyTip) {
        return res.status(200).json({
          success: true,
          message: "SafetyTip created successfully",
          safetyTip
        });
    } else {
        return res.status(500).json({
          success:false,
          message:"DB Error",
        })
      }
      }
  
      if (Object.keys(error).length !== 0) {
        error["success"] = false;
        error["message"] = "Input error";
        return res.status(400).json(error);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error" + error
      });
    }
  });


/* get all */
safetyTipController.get('/', async (req, res) => {
    try {
        const safetyTips = await SafetyTip.find({}).populate("userId", '-password')
        console.log("dasd");
        console.log(safetyTips);
        return res.status(200).json(safetyTips)
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Internal Server Error" + error,
          })
    }
})

/* get specific  */
safetyTipController.get('/:id', async (req, res) => {
    try {
        const safetyTip = await SafetyTip.findById(req.params.id).populate("userId", '-password')
        
        safetyTip.views += 1
        console.log(safetyTip);
        await safetyTip.save()
        return res.status(200).json(safetyTip)
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Internal Server Error" + error,
          })
    }
})


safetyTipController.put('/update/:id', verifyToken, upload.single('image'), async (req, res) => {
    const error = {};
    try {
      const { title, content, category, hasChanged } = req.body;
  console.log(hasChanged);
      if (isEmpty(title)) error["title"] = 'Required field';
      if (isEmpty(content)) error["content"] = 'Required field';
      if (isEmpty(category)) error["category"] = 'Required field';
  
      if (hasChanged == true) {
        if (!req.file) error["image"] = 'Required field';
        else {
          if (isImage(req.file)) {
            error["image"] = 'Only PNG, JPEG, and JPG files are allowed';
          }
        
          if (isLessThanSize(req.file, 10 * 1024 * 1024)) {
            error["image"] = 'File size should be less than 10MB';
          }
        }
      }
  
      if (Object.keys(error).length === 0) {
        const updateFields = { title, content, category, userId: req.user.id };
        if (hasChanged && req.file) {
          updateFields.image = req.file.filename;
        }
  
        const safetyTip = await SafetyTip.findByIdAndUpdate(req.params.id, updateFields, { new: true });
        if (safetyTip) {
          return res.status(200).json({
            success: true,
            message: "SafetyTip updated successfully",
            safetyTip
          });
        } else {
          return res.status(500).json({
            success: false,
            message: "DB Error",
          });
        }
      }
  
      if (Object.keys(error).length !== 0) {
        error["success"] = false;
        error["message"] = "Input error";
        return res.status(400).json(error);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error" + error
      });
    }
  });
  

safetyTipController.delete('/delete/:id', verifyToken, async (req, res) => {
    try {
     /*  const safetyTip = await SafetyTip.findById(req.params.id);
      if(safetyTip.userId.toString() !== req.user.id.toString()){
          throw new Error("You can delete only your own posts")
      } */
  
      const deletedSafetyTip = await SafetyTip.findByIdAndDelete(req.params.id);
  
      if (deletedSafetyTip) {
 
        const imagePath = `public/images/${deletedSafetyTip.image}`;
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              success: false,
              message: 'Error deleting the image ',
            });
          }
       
          return res.status(200).json({
            success: true,
            message: 'SafetyTip and image file deleted successfully',
          });
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'DB Error',
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error' + error,
      });
    }
  });
  


safetyTipController.put('/saves/:id', verifyToken, async (req, res) => {
    try {
        const safetyTip = await SafetyTip.findById(req.params.id)
        if(safetyTip.saves.includes(req.user.id)){
            safetyTip.saves = safetyTip.saves.filter((userId) => userId !== req.user.id)
            await safetyTip.save()

            return res.status(200).json({msg: 'Successfully unliked the safetyTip'})
        } else {
            safetyTip.saves.push(req.user.id)
            await safetyTip.save()

            return res.status(200).json({msg: "Successfully liked the safetyTip"})
        }

    } catch (error) {
        return res.status(500).json(error)
    }
})

safetyTipController.get('/saved/:userId', async (req, res) => {
    try {
      const likedSafetyTips = await SafetyTip.find({ saves: req.params.userId }).populate("userId", "-password");
      return res.status(200).json(likedSafetyTips);
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Internal Server Error" + error,
          })
    }
  });
  
module.exports = safetyTipController