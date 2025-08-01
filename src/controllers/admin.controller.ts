import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { User } from "../models/user.models";

// POST /api/admin/fix-avatars
export const fixAvatars = async (req: Request, res: Response) => {
  // Simple admin check (replace with your real admin logic)
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Forbidden: Admins only' });
  }
  try {
    const users = await User.find({ avatar: { $regex: '^/uploads/users/[^/]+/?$' } });
    let updated = 0;
    for (const user of users) {
      const userDir = path.join(__dirname, '../../', user.avatar);
      if (fs.existsSync(userDir)) {
        const files = fs.readdirSync(userDir).filter(f => f.startsWith('avatar_'));
        if (files.length > 0) {
          const newAvatarPath = path.join(user.avatar, files[0]).replace(/\\/g, '/');
          user.avatar = newAvatarPath;
          await user.save();
          updated++;
        }
      }
    }
    res.status(200).json({ message: `Updated ${updated} user avatars.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 