import { useState, ChangeEvent } from 'react'
import Image from 'next/image';


const Home = () => {
  const [file, setFile] = useState<File | null>(null)
  const [prediction, setPrediction] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0]
    setFile(uploadedFile || null)

    if (uploadedFile) {
      const formData = new FormData()
      formData.append('file', uploadedFile)

      try {

        console.log('send request to upload')
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          console.log('File uploaded successfully')
        } else {
          console.error('Failed to upload file')
        }
      } catch (error) {
        console.error('Failed to upload file', error)
      }
    }
  }

  const handlePredict = async (event: React.MouseEvent<HTMLButtonElement>) => {
    setIsLoading(true); // Start loading
    const model = (event.target as HTMLElement).dataset.model;

    if (!file) {
      setIsLoading(false); // End loading
      return;
    }

    try {
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename: file.name, model: model }),
      });
      //{ prediction } = response.body;
      const data = await response.json();
      setPrediction(data.prediction);

      if (response.ok) {
        console.log('Prediction requested successfully');
      } else {
        console.error('Failed to request prediction');
      }
    } catch (error) {

      console.error('Failed to request prediction', error);
    } finally {
      setIsLoading(false);
    }
  }

  const renderPredictionText = () => {
    if (!prediction) {
      return null;
    }

    // eslint-disable-next-line no-useless-escape
    const msg = prediction?.split(';')[1].replace(/[\[\]]/g, '');
    return msg;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-4">Sherpa Space</h1>
      <div className="border border-gray-300 rounded p-4 mb-4">
        <label className="text-sm font-semibold">
          {file ? 'File uploaded: ' + file.name : 'Upload plant data csv file'}
          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            accept=".csv"
          />
        </label>
      </div>
      <div className="flex space-x-4">
        <button
          data-model="cnn"
          className={`bg-blue-500 text-white px-4 py-2 rounded ${file ? '' : 'opacity-50 cursor-not-allowed'
            }`}
          disabled={!file}
          onClick={handlePredict}
        >
          Predict using CNN
        </button>
        <button
          data-model="lstm"
          className={`bg-blue-500 text-white px-4 py-2 rounded ${file ? '' : 'opacity-50 cursor-not-allowed'
            }`}
          disabled={!file}
          onClick={handlePredict}
        >
          Predict using LSTM
        </button>
      </div>
      {isLoading && (
        <div className="border-t-4 border-blue-500 rounded-full h-12 w-12 animate-spin"></div>
      )}

      {renderPredictionText() && <p className="mt-4">{renderPredictionText()}</p>}
      <div className="mt-8 overflow-x-scroll h-40 w-3/4">
        <div className="min-w-max">
          <Image
            src="/example.JPG" // path to your image
            alt="A descriptive alt text"
            layout="responsive"
            width={1789}
            height={243}
          />
        </div>
      </div>
    </div>
  )
}

export default Home
