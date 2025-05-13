import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from 'uuid';
import { User } from "../models/user.models";

var storagePhotos = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads');
        // Ensure the directory exists  
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        console.log(file, "upload");
        var filetype = '';
        if (file.mimetype === 'image/gif') {
            filetype = 'gif';
        }
        if (file.mimetype === 'image/png') {
            filetype = 'png';
        }
        if (file.mimetype === 'image/jpeg') {
            filetype = 'jpg';
        }
        cb(null, 'profile-' + uuidv4() + '.' + filetype);
    }
});

var uploadPhoto = multer({ storage: storagePhotos })

export const uploadFile = async (req, res) => {
    uploadPhoto.fields([{ name: 'avatar', maxCount: 1 }, { name: 'gallery', maxCount: 5 }]),
        async (req, res) => {
            try {
                // const profile = await User.findOne({
                //     userUid: req.params.userUid,
                // });
                // if (!profile) {
                //     return res.status(404).json({ message: "Profile not found" });
                // }

                console.log("called uploadPhoto");
                console.log(req.body, "called uploadPhoto body");
                console.log(req.file, "called uploadPhoto file");

                // var _uid = req.body.uid;
                // var file = req.file;

                // if (!file) {
                //   return res.status(400).send('No file uploaded.');
                // }

                // const resizedFilePath = path.resolve(__dirname, 'uploads', `300x300-${file.filename}`);

                // if (file) {
                //   sharp(file.path).resize(300, 300).toFile(resizedFilePath, (err) => {
                //     if (err) {
                //       console.log('sharp>>>', err);
                //     }
                //     else {
                //       console.log('resize ok !');
                //     }
                //   })
                // }
                // else throw 'error';
                // const updatedProfile = await profile.save();
                // res.status(200).json(updatedProfile);
                res.status(200).json("success");
            } catch (err) {
                res.status(500).json({ error: err });
            }
        }
}
