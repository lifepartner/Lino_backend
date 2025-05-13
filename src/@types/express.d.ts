// types/express.d.ts  

import { Request } from 'express';
import { File } from 'multer';

declare global {
    namespace Express {
        export interface Request {
            file?: File;
        }
    }
}  