from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
import numpy as np
import faiss
import sys

engine = None
app = Flask(__name__)

# This will download and load a pre-trained model from Hugging Face's model hub
class EmbeddingSearchEngine:
    model = SentenceTransformer('all-MiniLM-L6-v2')
    # chunks of texts
    chunks = None
    # Embeddings for each article chunk
    embeddings = None

    index = None

    def __init__(self, chunks):
        self.chunks = chunks
        self.embeddings = np.array(self.model.encode(chunks))
        # Build a FAISS index
        self.index = faiss.IndexFlatL2(self.embeddings.shape[1])
        self.index.add(self.embeddings)
    
    def answer(self, question):
        # Generate an embedding for the question
        question_embedding = self.model.encode([question])[0]
        # Find the most similar article chunk
        D, I = self.index.search(np.array([question_embedding]), 1)
        print("Most similar article chunk to the question is:", self.chunks[I[0][0]])
        return self.chunks[I[0][0]]


@app.route('/init', methods=['POST'])
def init():
    print('embedding engine init')
    data = request.get_json()
    chunks_str = data.get('chunks_str')
    chunks = chunks_str.split('\n')
    #chunks = ['abc', 'def']
    global engine
    engine = EmbeddingSearchEngine(chunks)
    return jsonify({'message': 'Initialization successful'})


@app.route('/search', methods=['POST'])
def search():
    data = request.get_json()
    question = data.get('question')
    global engine
    answer = engine.answer(question)
    return jsonify({'context': answer})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)