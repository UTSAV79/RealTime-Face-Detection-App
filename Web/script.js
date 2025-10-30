let video = document.getElementById('videoInput');
let canvas = document.getElementById('canvasOutput');
let ctx = canvas.getContext('2d');

// Access webcam
navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
  video.srcObject = stream;
});

// Wait until OpenCV.js is ready
function onOpenCvReady() {
  console.log('OpenCV.js is ready');

  const cap = new cv.VideoCapture(video);
  const faceCascade = new cv.CascadeClassifier();

  // Load the pre-trained face detection model (Haar Cascade)
  let utils = new Utils('errorMessage');
  utils.createFileFromUrl(
    'haarcascade_frontalface_default.xml',
    'https://raw.githubusercontent.com/opencv/opencv/master/data/haarcascades/haarcascade_frontalface_default.xml',
    () => {
      faceCascade.load('haarcascade_frontalface_default.xml');
      startDetection();
    }
  );

  function startDetection() {
    const frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    const gray = new cv.Mat();

    function processVideo() {
      cap.read(frame);
      cv.cvtColor(frame, gray, cv.COLOR_RGBA2GRAY, 0);

      let faces = new cv.RectVector();
      faceCascade.detectMultiScale(gray, faces, 1.1, 3, 0);

      ctx.drawImage(video, 0, 0);
      for (let i = 0; i < faces.size(); ++i) {
        let face = faces.get(i);
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.strokeRect(face.x, face.y, face.width, face.height);
      }

      requestAnimationFrame(processVideo);
    }

    processVideo();
  }
}
