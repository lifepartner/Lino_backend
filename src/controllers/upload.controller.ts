import { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { User } from "../models/user.models";

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
const usersDir = path.join(uploadsDir, 'users');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(usersDir)) {
  fs.mkdirSync(usersDir, { recursive: true });
}

// Configure multer for file system storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.params.userId;
    const userDir = path.join(usersDir, userId);
    
    // Create user directory if it doesn't exist
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const filename = `${file.fieldname}_${timestamp}${extension}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Upload avatar image
export const uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    upload.single('avatar')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ 
          message: err.message,
          code: 'upload_error'
        });
      }

      if (!req.file) {
        return res.status(400).json({ 
          message: 'No image file provided',
          code: 'no_file'
        });
      }

      const { userId } = req.params;
      
      // Find user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          message: 'User not found',
          code: 'user_not_found'
        });
      }

      // Delete old avatar if it exists
      if (user.avatar && user.avatar.startsWith('/uploads/')) {
        const oldAvatarPath = path.join(__dirname, '../../', user.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }

      // Store file path in database
      const filePath = `/uploads/users/${userId}/${req.file.filename}`;
      user.avatar = filePath;
      await user.save();

      res.status(200).json({
        message: 'Avatar uploaded successfully',
        avatarUrl: filePath,
        filename: req.file.filename
      });

    });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    res.status(500).json({ 
      message: 'Internal server error',
      code: 'server_error'
    });
  }
};

// Upload gallery images
export const uploadGallery = async (req: Request, res: Response, next: NextFunction) => {
  try {
    upload.array('gallery', 5)(req, res, async (err) => { // Max 5 images
      if (err) {
        return res.status(400).json({ 
          message: err.message,
          code: 'upload_error'
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ 
          message: 'No image files provided',
          code: 'no_files'
        });
      }

      const { userId } = req.params;
      
      // Find user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          message: 'User not found',
          code: 'user_not_found'
        });
      }

      console.log(`Processing ${req.files.length} gallery images for user ${userId}`);

      // Delete old gallery images if they exist
      if (user.gallery && user.gallery.length > 0) {
        console.log(`Cleaning up ${user.gallery.length} old gallery images`);
        user.gallery.forEach(imagePath => {
          if (imagePath.startsWith('/uploads/')) {
            const oldImagePath = path.join(__dirname, '../../', imagePath);
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
              console.log(`Deleted old image: ${imagePath}`);
            }
          }
        });
      }

      // Process each image individually
      const filePaths = [];
      const errors = [];

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i] as any;
        
        try {
          // Validate file
          if (!file.mimetype.startsWith('image/')) {
            errors.push(`File ${i + 1} is not an image`);
            continue;
          }

          // Check file size (5MB limit)
          if (file.size > 5 * 1024 * 1024) {
            errors.push(`File ${i + 1} is too large (max 5MB)`);
            continue;
          }

          const filePath = `/uploads/users/${userId}/${file.filename}`;
          filePaths.push(filePath);
          console.log(`Successfully processed image ${i + 1}: ${filePath}`);
          
        } catch (fileError) {
          console.error(`Error processing image ${i + 1}:`, fileError);
          errors.push(`Failed to process image ${i + 1}`);
        }
      }

      // Store file paths in database
      user.gallery = filePaths;
      await user.save();

      console.log(`Successfully saved ${filePaths.length} gallery images to database`);

      res.status(200).json({
        message: 'Gallery images uploaded successfully',
        galleryUrls: filePaths,
        count: filePaths.length,
        errors: errors.length > 0 ? errors : undefined
      });

    });
  } catch (error) {
    console.error("Error uploading gallery:", error);
    res.status(500).json({ 
      message: 'Internal server error',
      code: 'server_error'
    });
  }
};

// Upload identity verification documents
export const uploadIdentityDocuments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    upload.fields([
      { name: 'frontImage', maxCount: 1 },
      { name: 'backImage', maxCount: 1 }
    ])(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ 
          message: err.message,
          code: 'upload_error'
        });
      }

      if (!req.files || !req.files.frontImage || !req.files.backImage) {
        return res.status(400).json({ 
          message: '前面と背面の画像が必要です',
          code: 'missing_images'
        });
      }

      const { userId } = req.params;
      
      // Find user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          message: 'ユーザーが見つかりません',
          code: 'user_not_found'
        });
      }

      console.log(`Processing identity documents for user ${userId}`);

      // Delete old identity documents if they exist
      if (user.identityVerification) {
        if (user.identityVerification.frontImage) {
          const oldFrontPath = path.join(__dirname, '../../', user.identityVerification.frontImage);
          if (fs.existsSync(oldFrontPath)) {
            fs.unlinkSync(oldFrontPath);
            console.log(`Deleted old front image: ${user.identityVerification.frontImage}`);
          }
        }
        if (user.identityVerification.backImage) {
          const oldBackPath = path.join(__dirname, '../../', user.identityVerification.backImage);
          if (fs.existsSync(oldBackPath)) {
            fs.unlinkSync(oldBackPath);
            console.log(`Deleted old back image: ${user.identityVerification.backImage}`);
          }
        }
      }

      // Process front image
      const frontFile = req.files.frontImage[0] as any;
      const frontImagePath = `/uploads/users/${userId}/identity_front_${Date.now()}.jpg`;
      
      // Process back image
      const backFile = req.files.backImage[0] as any;
      const backImagePath = `/uploads/users/${userId}/identity_back_${Date.now()}.jpg`;

      console.log(`Successfully processed identity documents for user ${userId}`);

      res.status(200).json({
        message: '本人確認書類が正常にアップロードされました',
        documents: {
          frontImage: frontImagePath,
          backImage: backImagePath
        }
      });

    });
  } catch (error) {
    console.error("Error uploading identity documents:", error);
    res.status(500).json({ 
      message: 'Internal server error',
      code: 'server_error'
    });
  }
};

// Serve static files
export const serveImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const imagePath = req.params[0]; // Get the full path from the route
    const fullPath = path.join(__dirname, '../../uploads', imagePath);
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ 
        message: 'Image not found',
        code: 'image_not_found'
      });
    }

    // Set appropriate headers
    const ext = path.extname(fullPath).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    // Stream the file
    const stream = fs.createReadStream(fullPath);
    stream.pipe(res);

  } catch (error) {
    console.error("Error serving image:", error);
    res.status(500).json({ 
      message: 'Internal server error',
      code: 'server_error'
    });
  }
};

// Delete user images (cleanup)
export const deleteUserImages = async (userId: string) => {
  try {
    const userDir = path.join(usersDir, userId);
    if (fs.existsSync(userDir)) {
      fs.rmSync(userDir, { recursive: true, force: true });
    }
  } catch (error) {
    console.error("Error deleting user images:", error);
  }
}; 