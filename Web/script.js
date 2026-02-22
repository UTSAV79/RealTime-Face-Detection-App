let video = document.getElementById('videoInput');
let canvas = document.getElementById('canvasOutput');
let ctx = canvas.getContext('2d');

// Access webcam
navigator.mediaDevices.getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
  })
  .catch((err) => {
    console.error("Camera access error:", err);
  });

// Wait until OpenCV is fully loaded
cv['onRuntimeInitialized'] = () => {
  console.log("OpenCV.js is ready");

  const cap = new cv.VideoCapture(video);
  const faceCascade = new cv.CascadeClassifier();

  // Load Haar cascade file
  fetch('https://raw.githubusercontent.com/opencv/opencv/master/data/haarcascades/haarcascade_frontalface_default.xml')
    .then(res => res.arrayBuffer())
    .then(buffer => {
      cv.FS_createDataFile('/', 'haarcascade_frontalface_default.xml', new Uint8Array(buffer), true, false, false);
      faceCascade.load('haarcascade_frontalface_default.xml');
      startDetection();
    });

  function startDetection() {
    const frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    const gray = new cv.Mat();
    const faces = new cv.RectVector();

    function processVideo() {
      cap.read(frame);

      cv.cvtColor(frame, gray, cv.COLOR_RGBA2GRAY);
      faceCascade.detectMultiScale(gray, faces, 1.1, 3);

      // Draw video frame
      ctx.drawImage(video, 0, 0);

      // Draw bounding boxes
      for (let i = 0; i < faces.size(); i++) {
        let face = faces.get(i);
        ctx.strokeStyle = "#00ff00";
        ctx.lineWidth = 3;
        ctx.strokeRect(face.x, face.y, face.width, face.height);
      }

      requestAnimationFrame(processVideo);
    }

    processVideo();
  }
};
