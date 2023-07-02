from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
import numpy as np
import faiss
import sys
import random
import PyPDF2

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
    isEmpty = True
    chunk_size = 0

    def __init__(self, chunks=[], chunk_size=0):
        if len(chunks) == 0:
            self.isEmpty = False
            return
        self.chunks = chunks
        self.embeddings = np.array(self.model.encode(chunks))
        # Build a FAISS index
        self.index = faiss.IndexFlatL2(self.embeddings.shape[1])
        self.index.add(self.embeddings)
        self.isEmpty = False
    
    def answer(self, question, k=10):
        # k: top few chunks
        # Generate an embedding for the question
        question_embedding = self.model.encode([question])[0]
        # Find the most similar article chunk
        D, I = self.index.search(np.array([question_embedding]), k)
        print("Most similar article chunk to the question is:", self.chunks[I[0][0]])
        return [self.chunks[i] for i in I[0]]

    def _extract_text_from_pdf(self, file_path):
        pdf_file = open(file_path, 'rb')
        reader = PyPDF2.PdfReader(pdf_file)
    
        text = ""
        for page_num in range(len(reader.pages)):
            page = reader.pages[page_num]
            text += page.extract_text()
        
        pdf_file.close()
        return text

    def _split_text_into_chunks(self, text, chunk_size, overlap_size):
        chunks = []
        start = 0
        while start < len(text):
            end = start + chunk_size
            if end > len(text):
                end = len(text)
            chunk = text[start:end]
            chunks.append(chunk)
            start += chunk_size - overlap_size
    
        return chunks

    # parse pdf
    def parse(self, file_path, chunk_size, overlap_size):
        extracted_text = self._extract_text_from_pdf(file_path)
        chunks = self._split_text_into_chunks(extracted_text, chunk_size, overlap_size)
    
        #for chunk in chunks:
        #    print(chunk)
        #    print("---")
        return chunks


class Temperature:
    temperature = 0

    def __init__(self, temperature=0):
        self.temperature = temperature

    def select_random_result(self, candidates, top_k=2):
        ## Example usage
        # candidates = ["result1", "result2", "result3", "result4", "result5", "result6", "result7", "result8"]
        # top_k = 5
        # temperature = 0.8
        # selected_results = select_random_results(candidates, top_k, temperature)
        # print("Selected Results:", selected_results)
        scores = list(range(len(candidates), 0, -1))
        probabilities = self._softmax(scores)
        selected_indices = self._weighted_random_choice(range(len(candidates)), probabilities, top_k)
        selected_results = [candidates[i] for i in selected_indices]
        return selected_results
    
    def _softmax(self, logits):
        exp_logits = [exp / self.temperature for exp in logits]
        sum_exp_logits = sum(exp_logits)
        probabilities = [exp_logit / sum_exp_logits for exp_logit in exp_logits]
        return probabilities
    
    def _weighted_random_choice(self, choices, probabilities, num_samples):
        weighted_choices = list(zip(choices, probabilities))
        cumulative_probabilities = [sum(probabilities[:i+1]) for i in range(len(probabilities))]
        selected_indices = []
        for _ in range(num_samples):
            random_value = random.random()
            for choice, cumulative_prob in zip(weighted_choices, cumulative_probabilities):
                if random_value < cumulative_prob:
                    selected_indices.append(choice[0])
                    break
        return selected_indices   
    
@app.route('/init', methods=['POST'])
def init():
    print('embedding engine init')
    data = request.get_json()
    all_files = data.get('file_path') #"../storage/data1.pdf" 
    chunk_size = data.get('chunk_size') #500
    overlap_size = 50
    #chunks_str = data.get('chunks_str')
    #chunks = chunks_str.split('\n')
    #e.g., chunks = ['abc', 'def']
    global engine
    engine = EmbeddingSearchEngine()
    chunks = []
    for file_path in all_files:
        chunks += engine.parse(file_path, chunk_size, overlap_size)
    engine = EmbeddingSearchEngine(chunks=chunks, chunk_size=chunk_size)
    return jsonify({'message': 'Initialization successful'})


@app.route('/search', methods=['POST'])
def search():
    data = request.get_json()
    question = data.get('question')
    temperature = float(data.get('temperature'))
    global engine
    answers = engine.answer(question)
    # use top 5 with temperature
    spice_temp = Temperature(temperature)
    answer = spice_temp.select_random_result(candidates=answers, top_k=5)

    return jsonify({'context': answer})

@app.route('/compare', methods= ['POST'])
def compare():
    data = request.get_json()
    question = data.get('question')
    answer1 = data.get('answer1')
    answer2 = data.get('answer2')
    engine = EmbeddingSearchEngine([answer1, answer2])
    close = engine.answer(question)
    return jsonify({'context': close})
  
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
