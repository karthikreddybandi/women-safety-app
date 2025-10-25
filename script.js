document.getElementById('alert-btn').addEventListener('click', async () => {
  const status = document.getElementById('status');
  status.textContent = 'Getting location...';

  try {
    // Get current location
    const position = await getCurrentPosition();
    const { latitude, longitude } = position.coords;
    status.textContent = 'Location obtained. Recording media...';

    // Record audio and video
    const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    const videoElement = document.getElementById('video-preview');
    videoElement.srcObject = mediaStream;

    const mediaRecorder = new MediaRecorder(mediaStream);
    const chunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(chunks.filter(chunk => chunk.type.startsWith('audio')), { type: 'audio/webm' });
      const videoBlob = new Blob(chunks.filter(chunk => chunk.type.startsWith('video')), { type: 'video/webm' });

      status.textContent = 'Sending alert...';

      // Send data to backend
      const formData = new FormData();
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);
      if (audioBlob.size > 0) formData.append('audio', audioBlob, 'audio.webm');
      if (videoBlob.size > 0) formData.append('video', videoBlob, 'video.webm');

      const response = await fetch('/send-alert', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      status.textContent = result.message;

      // Stop media stream
      mediaStream.getTracks().forEach(track => track.stop());
    };

    // Record for 5 seconds
    mediaRecorder.start();
    setTimeout(() => {
      mediaRecorder.stop();
    }, 5000);

  } catch (error) {
    status.textContent = 'Error: ' + error.message;
  }
});

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}
