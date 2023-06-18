import { NextApiHandler } from 'next';
import { AxiosResponse } from 'axios';
import fs from 'fs';
import {
  Configuration, OpenAIApi, CreateCompletionRequest, CreateCompletionResponse, CreateChatCompletionRequest,
  CreateAnswerResponse, CreateEmbeddingResponse
} from "openai";

const configuration = new Configuration({
  organization: process.env.OPENAI_ORG,
  apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);


async function makeOpenAICall(prompt: string): Promise<string> {
  // convert articles into embeddings
  // 

  // DB Fuzzy match
  // input: prompt
  // output: key words/phrases we wish to include in the prompt

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: "Write a better prompt based on this:" + prompt + "talk about the issue from ",
    max_tokens: prompt.length + 10,
    temperature: 0,
  });
  const completionResponse: CreateCompletionResponse = response.data;
  const responseText = completionResponse.choices[0].text;

  console.log(responseText);
  return responseText as string;
}

async function makeOpenAIChatCall(prompt: string): Promise<string> {
  const embfilePath = './storage/1.emb';
  const embfileContent = fs.readFileSync(embfilePath, 'utf-8');
  const embRes: CreateEmbeddingResponse = JSON.parse(embfileContent);
  //console.log(embRes.data[0].embedding)


  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        "role": "system", "content": JSON.stringify(embRes.data[0].embedding.slice(0, 100))
      },
      { "role": "user", "content": prompt }
    ]
  });
  const completionResponse: CreateCompletionResponse = response.data;
  const responseText = completionResponse.choices[0].text;

  console.log(responseText);
  return responseText as string;
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
