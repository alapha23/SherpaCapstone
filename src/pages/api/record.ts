// pages/api/upload-audio.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { promises as fs } from 'fs';
import { exec } from 'child_process';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(500).json({ error: 'Error parsing the files' });
      return;
    }

    // Assuming the field name for the audio file is 'audio'
    const audioFile = files.audio as formidable.File;

    // Process the file or send it to Hugging Face API
    try {
      const response = await processAudioFile(audioFile.filepath);
      res.status(200).json({ message: 'File processed successfully', response });
    } catch (error) {
      res.status(500).json({ error: 'Error processing the file' });
    }
  });
}


async function processAudioFile(filePath: string) {
  try {
    const transcription = await runPythonInference(filePath);
    return transcription;
  } catch (error) {
    throw new Error('Error in Python inference script: ' + error);
  }
}

function runPythonInference(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(`python3 /home/zgao/Documents/WhisperWeb/inference.py ${filePath}`, (error, stdout, stderr) => {
      if (error) {
        console.error('Error: ', stderr);
        reject(error);
      }
      resolve(stdout.trim());
    });
  });
}
