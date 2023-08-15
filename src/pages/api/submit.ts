import axios from 'axios';
import { NextApiHandler } from 'next';
import { PrismaClient } from "@prisma/client";
import {
  ChatCompletionRequestMessage,
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
  console.log('Trying to get the most relevant article chunk');
  let data = JSON.stringify({
    "question": question,
    "temperature": 0.5
  });

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: process.env.EMBEDDING_SERVER_URL,
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
  };

  const response = await axios.request(config)
    .then((response) => {
      //console.log(JSON.stringify(response.data.context));
      return JSON.stringify(response.data.context);
    })
    .catch((error) => {
      console.log(error);
    });

  // print out the chunks
  console.log("References:\n")
  console.log(response)

  return response;
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
    const messages: ChatCompletionRequestMessage[] = [
      { role: "system", content: "You are a helpful academic agent, you answer questions regarding urban planning in professional, academic, accurate ways" },
      { role: "system", content: JSON.stringify(contexts) }
    ];

    messages.push({ role: "user", content: prompt });

    const response = await openai.createChatCompletion({
      //model: "gpt-3.5-turbo",
      model: "gpt-4-0613",
      messages: messages,
      max_tokens: 4000
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
