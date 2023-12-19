# infer.py
import torch
import torchaudio
import sys
from transformers import Wav2Vec2Processor, Wav2Vec2ForCTC
from pathlib import Path

token = "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"
def load_model(model_name):
    global token
    model = Wav2Vec2ForCTC.from_pretrained(model_name, token=token)
    processor = Wav2Vec2Processor.from_pretrained(model_name, token=token)
    return model, processor

def transcribe(audio_path, model, processor):
    waveform, _ = torchaudio.load(audio_path)
    inputs = processor(waveform, sampling_rate=16_000, return_tensors="pt", padding=True)

    with torch.no_grad():
        logits = model(inputs.input_values, attention_mask=inputs.attention_mask).logits

    predicted_ids = torch.argmax(logits, dim=-1)
    transcription = processor.batch_decode(predicted_ids)
    return transcription

def main():
    audio_path = sys.argv[1]
    #model_name = "/home/zgao/Documents/WhisperWeb/pytorch_model.bin"
    model_name = "alapha23/whisper-small-ko"

    model, processor = load_model(model_name)
    transcription = transcribe(audio_path, model, processor)
    print(transcription[0])  # Print the result to stdout

if __name__ == "__main__":
    main()

