import axios from 'axios';
import { NextApiHandler } from 'next';
import { PrismaClient } from "@prisma/client";
import {
  Configuration, CreateChatCompletionResponse, CreateCompletionResponse, CreateEmbeddingResponse,
  OpenAIApi
} from "openai";

const configuration = new Configuration({
  organization: process.env.OPENAI_ORG,
  apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);
const prisma = new PrismaClient();


async function getMostRelevantArticleChunk(question: string) {
  const response = await axios.post('http://localhost:8000/search', {
    question: question,
  });

  return response.data;
}

async function initEmbeddingSearchEngine(concatenatedChunks: string) {
  const response = await axios.post('http://localhost:8000/init', {
    chunks_str: concatenatedChunks,
  });

  return response.data;
}


async function makeOpenAIChatCall(prompt: string): Promise<string> {
  const chunks = await prisma.chunk.findMany();
  const concatenatedChunks = chunks.map(item => item.chunk_text).join('\n');
  await initEmbeddingSearchEngine(concatenatedChunks);
  const contexts = await getMostRelevantArticleChunk(prompt);
  console.log('contexts', contexts);

  /*const embfilePath = './storage/1.emb';
  const embfileContent = fs.readFileSync(embfilePath, 'utf-8');
  const embRes: CreateEmbeddingResponse = JSON.parse(embfileContent);*/
  //console.log(embRes.data[0].embedding)

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          "role": "system", "content": contexts['context']
        },
        { "role": "user", "content": prompt }
      ]
    });
    const completionResponse: CreateChatCompletionResponse = response.data;
    const responseText = completionResponse.choices[0].message?.content;

    return responseText as string;
  } catch (error) {
    console.log(error)
  }
  return '';
}

// Usage example
const handler: NextApiHandler = (req, res) => {
  const { prompt } = req.body;
  console.log("prompt: ", prompt);
  switch (req.method) {
    case 'POST':
      makeOpenAIChatCall(prompt)
        .then((response) => {
          console.log('GPT API response:', response);
          res.status(200).json({ answer: response })
        })
        .catch((error) => {
          console.error('Error:', error);
          res.status(401).end('Request failed')
        });
      break;
    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default handler
