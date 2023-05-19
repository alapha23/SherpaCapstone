import { useState, ChangeEvent } from 'react'

const Home = () => {
  const [file, setFile] = useState<File | null>(null)
  const [prediction, setPrediction] = useState<number | null>(null)

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0]
    setFile(uploadedFile || null)
  }

  const handlePredictCNN = () => {
    // Call the CNN API here and update the prediction state
    setPrediction(0.7) // Example prediction value
  }

  const handlePredictLSTM = () => {
    // Call the LSTM API here and update the prediction state
    setPrediction(0.3) // Example prediction value
  }

  const renderPredictionText = () => {
    if (prediction !== null) {
      if (prediction > 0.5) {
        const confidence = Math.round(prediction * 100)
        return `We are ${confidence}% confident that the plant is diseased.`
      } else {
        const confidence = Math.round((1 - prediction) * 100)
        return `We are ${confidence}% confident that the plant is healthy.`
      }
    }
    return null
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
          className={`bg-blue-500 text-white px-4 py-2 rounded ${
            file ? '' : 'opacity-50 cursor-not-allowed'
          }`}
          disabled={!file}
          onClick={handlePredictCNN}
        >
          Predict using CNN
        </button>
        <button
          className={`bg-blue-500 text-white px-4 py-2 rounded ${
            file ? '' : 'opacity-50 cursor-not-allowed'
          }`}
          disabled={!file}
          onClick={handlePredictLSTM}
        >
          Predict using LSTM
        </button>
      </div>
      {renderPredictionText() && <p className="mt-4">{renderPredictionText()}</p>}
    </div>
  )
}

export default Home
