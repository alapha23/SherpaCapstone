// pages/api/upload.ts

import { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const form = new formidable.IncomingForm();
    form.uploadDir = path.resolve(__dirname, '../../../../storage/');
    console.log('upload to', form.uploadDir)
    
    form.parse(req, (err: { message: any; }, _fields: any, files: { file: any; }) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      const file = files.file as File;
      const newPath = path.resolve(form.uploadDir, file.name);
      
      fs.rename(file.path, newPath, (err) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
      
        res.status(200).json({ status: 'success', data: file.name });
      });
    });
    return res
  } else {
    res.status(405).json({ error: 'Method not allowed. Please POST.' });
  }
}
