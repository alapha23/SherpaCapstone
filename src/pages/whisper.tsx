import { useState, useRef } from 'react';
import styles from '../styles/RecordAudio.module.css';

const RecordAudio = () => {
  const [recording, setRecording] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (error) {
      console.error('Error accessing the microphone: ', error);
      // You can set a state variable here to show an error message to the user
    }
  };


  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const sendAudioToServer = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
    const formData = new FormData();
    formData.append('audio', audioBlob);

    try {
      const response = await fetch('/api/record', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResponseMessage(data.message || 'Success: No response message');
    } catch (error) {
      console.error('Error sending audio to server: ', error);
      setResponseMessage('Error sending audio to server');
    }
  };

  return (
    <div className={styles.container}>
      <p>{recording ? 'Recording...' : 'Recording stopped.'}</p>
      <button
        onClick={recording ? stopRecording : startRecording}
        className={styles.button}
      >
        {recording ? 'Stop Recording' : 'Start Recording'}
      </button>
      {!recording && (
        <button onClick={sendAudioToServer} className={styles.button}>
          Send to Server
        </button>
      )}
      <textarea
        value={responseMessage}
        readOnly
        className={styles.textarea}
      />
    </div>
  );
};

export default RecordAudio;