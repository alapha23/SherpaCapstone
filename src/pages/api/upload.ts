/* eslint-disable */
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
    // @ts-ignore
    form.uploadDir = path.resolve(__dirname, '../../../../storage/');
    
    // @ts-ignore
    form.parse(req, (err: { message: any; }, _fields: any, files: { file: any; }) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      const file = files.file as File;
      // @ts-ignore
      const newPath = path.resolve(form.uploadDir, file.name);
      
      // @ts-ignore
      fs.rename(file.path, newPath, (err) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        // @ts-ignore
        res.status(200).json({ status: 'success', data: file.name });
      });
    });
    return res
  } else {
    res.status(405).json({ error: 'Method not allowed. Please POST.' });
  }
}
