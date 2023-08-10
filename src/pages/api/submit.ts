import axios from 'axios';
import { NextApiHandler } from 'next';
import { PrismaClient } from "@prisma/client";
import {
  Configuration, CreateChatCompletionResponse, CreateCompletionResponse, CreateEmbeddingResponse,
  OpenAIApi
} from "openai";

var configuration;
if (process.env.OPENAI_ORG) {
  configuration = new Configuration({
    organization: process.env.OPENAI_ORG,
    apiKey: process.env.OPENAI_KEY,
  });
} else {
  configuration = new Configuration({
    apiKey: process.env.OPENAI_KEY,
  });
}
const openai = new OpenAIApi(configuration);
const prisma = new PrismaClient();


async function getMostRelevantArticleChunk(question: string) {
  const response = await axios.post('http://localhost:8000/search', {
    question: question,
    temperature: 0.5
  });

  return response.data['context'];
}

async function initEmbeddingSearchEngine() {
  const response = await axios.post('http://localhost:8000/init', {
    "file_path": ["../storage/data1.pdf", "../storage/data2.pdf", "../storage/data3.pdf", "../storage/data4.pdf", "../storage/data5.pdf", "../storage/data6.pdf"],
    "chunk_size": 500,
    "overlap_size": 50
  });

  return response.data;
}


async function makeOpenAIChatCall(prompt: string): Promise<string> {
  //const chunks = await prisma.chunk.findMany();
  //const concatenatedChunks = chunks.map(item => item.chunk_text).join('\n');

  //await initEmbeddingSearchEngine();

  const contexts = await getMostRelevantArticleChunk(prompt);
  //console.log('contexts', contexts);

  try {
    const messages = contexts.map((context: string) => ({
      role: "system",
      content: context,
    }));

    messages.push({ role: "user", content: prompt });

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      //model: "gpt-4-0613",
      messages: messages,
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
