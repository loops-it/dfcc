import { Request, Response } from 'express';
const bodyParser = require('body-parser');
const pdfParse = require('pdf-parse');
import multer from 'multer';
import OpenAI from "openai";
import { Pinecone } from '@pinecone-database/pinecone'
import "dotenv/config";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

interface UserDecodedToken extends JwtPayload {
  id: string;
  
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
if (!process.env.PINECONE_API_KEY || typeof process.env.PINECONE_API_KEY !== 'string') {
    throw new Error('Pinecone API key is not defined or is not a string.');
}
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

// const upload = multer({ dest: 'uploads/' });
const upload = multer({ storage: multer.memoryStorage() });

// Define the uploadDocuments middleware
export const uploadDocuments = async (req: Request, res: Response, next: Function) => {
  const decode = jwt.verify(req.cookies.adminLoggedIn, "lkasdh23123h2ljqwher31414l312423") as UserDecodedToken;
  //console.log(req.session.user.id)
    try {
      let title = req.body.title;
      let text = req.body.text;
      const timestamp = new Date().getTime();
      const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
      const uniqueId = `${timestamp}${randomDigits}`;
      const index = pc.index("dfccchatbot")

      if (!req.file) {
        const embedding = await openai.embeddings.create({
          model: "text-embedding-ada-002",
          input: text,
      });
      await index.namespace("dfcc-vector-db").upsert([
        {
          "id": uniqueId, 
          "values": embedding.data[0].embedding,
          "metadata": {"Title": title, "Text": text}
        }
      ]);
    let decode_id: number | undefined = parseInt(decode.id as string, 10);
    await prisma.file.create({
      data: {
        user_id: decode_id,
        file_id: uniqueId,
      },
    });
    res.send('PDF upload successful.');
      }
      // const parsedData = await pdfParse(req.file.path);
      else{
      const buffer = Buffer.from(req.file.buffer); // Convert buffer to Uint8Array
        const parsedData = await pdfParse(buffer);
      const pdfParcesData = parsedData.text
      const cleanedText = pdfParcesData.replace(/\n/g, '');

      console.log(cleanedText);


  
    const embedding = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: cleanedText+text,
    });
    //console.log(embedding.data[0].embedding);

    await index.namespace("dfcc-vector-db").upsert([
        {
          "id": uniqueId, 
          "values": embedding.data[0].embedding,
          "metadata": {"Title": title, "Text": cleanedText+text}
        }
      ]);

      let decode_id: number | undefined = parseInt(decode.id as string, 10);
    await prisma.file.create({
      data: {
        user_id: decode_id,
        file_id: uniqueId,
      },
    });
    res.send('PDF upload successful.');
    }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
    }
  };
  
  // Apply multer middleware to the uploadDocuments middleware
  export const handleFileUpload = upload.single('file');
  