import { useState, ChangeEvent } from 'react'
import Image from 'next/image';


const Home = () => {
  const [answer, setAnswer] = useState<string | null>(null)
  const [prompt, setPrompt] = useState<string | ''>('')
  const [isLoading, setIsLoading] = useState(false);

  const handlePromptChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(event.target.value);
  };


  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    setIsLoading(true); // Start loading

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt }),
      });

      const data = await response.json();
      setAnswer(data.answer);

      if (response.ok) {
        console.log('GPT Answer requested successfully');
      } else {
        console.error('Failed to send prompt');
      }
    } catch (error) {
      console.error('Failed to send prompt', error);
    } finally {
      setIsLoading(false);
    }
  }

  const renderPredictionText = () => {
    if (!answer) {
      return null;
    }

    // eslint-disable-next-line no-useless-escape
    const msg = answer; //?.split(';')[1].replace(/[\[\]]/g, '');
    return msg;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-4">CEL GPT</h1>
      <div className="flex flex-col items-center space-y-4">
        <textarea
          value={prompt as string}
          onChange={handlePromptChange}
          className="border border-gray-300 rounded px-4 py-2 resize-none h-32 w-64 overflow-auto"
        ></textarea>
        <button
          data-model="lstm"
          className={`bg-blue-500 text-white px-4 py-2 rounded ${prompt ? '' : 'opacity-50 cursor-not-allowed'
            }`}
          disabled={!prompt}
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
      {isLoading && (
        <div className="border-t-4 border-blue-500 rounded-full h-12 w-12 animate-spin"></div>
      )}

      {renderPredictionText() && <p className="mt-4">{renderPredictionText()}</p>}
    </div>
  )
}

export default Home
