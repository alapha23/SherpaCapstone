import whisper
import sys

def transcribe_audio(file_path):
    # Create an instance of the model
    model = whisper.load_model("tiny")

    # Load the audio file and transcribe
    audio = whisper.load_audio(file_path)
    audio = whisper.pad_or_trim(audio)
    mel = whisper.log_mel_spectrogram(audio).to(model.device)

    # Decode the audio to text
    options = whisper.DecodingOptions(fp16 = False)
    result = whisper.decode(model, mel, options)

    # Return the transcription text
    return result.text

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Please provide an audio file path.")
        sys.exit(1)

    file_path = sys.argv[1]
    try:
        transcription = transcribe_audio(file_path)
        print(transcription)
    except Exception as e:
        print(f"An error occurred: {e}")
