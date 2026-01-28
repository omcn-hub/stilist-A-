import React, { useRef, useEffect, useState } from 'react';
import { X, Camera } from 'lucide-react';

interface CameraViewProps {
  onCapture: (base64: string) => void;
  onClose: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        // Request camera with preference for the rear camera (environment)
        // Limit resolution to 1080p for performance
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 } 
          },
          audio: false
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied:", err);
        setError("Kameraya erişim sağlanamadı. Lütfen tarayıcı izinlerini kontrol edin veya 'Galeriden Seç' seçeneğini kullanın.");
      }
    };

    startCamera();

    // Cleanup function to stop the stream when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Calculate scaled dimensions (Max 1280 width)
      const MAX_WIDTH = 1280;
      let width = video.videoWidth;
      let height = video.videoHeight;
      
      if (width > MAX_WIDTH) {
          height = height * (MAX_WIDTH / width);
          width = MAX_WIDTH;
      }

      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw the video frame to the canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64 JPEG
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        
        // Pass the image data back to the app
        onCapture(dataUrl);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col animate-fade-in">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
        <button 
          onClick={onClose} 
          className="text-white bg-white/20 backdrop-blur-md p-2 rounded-full hover:bg-white/30 transition"
        >
          <X className="w-6 h-6" />
        </button>
        <span className="text-white font-medium drop-shadow-md">Fotoğraf Çek</span>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Video Preview */}
      <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
        {error ? (
          <div className="text-white text-center p-8 max-w-sm">
            <div className="bg-red-500/20 text-red-200 p-4 rounded-xl mb-6 backdrop-blur-sm">
               <Camera className="w-8 h-8 mx-auto mb-2 text-red-400" />
               <p>{error}</p>
            </div>
            <button onClick={onClose} className="bg-white text-gray-900 px-6 py-3 rounded-xl font-bold w-full">
              Geri Dön
            </button>
          </div>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Bottom Controls */}
      {!error && (
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center pb-10">
          <div className="relative group">
             {/* Shutter Button Ring */}
             <div className="absolute inset-0 rounded-full border-4 border-white opacity-50 scale-110 group-active:scale-100 transition-transform duration-200"></div>
             
             {/* Shutter Button */}
             <button 
                onClick={handleCapture}
                className="w-20 h-20 bg-white rounded-full border-4 border-transparent shadow-lg active:scale-90 transition-transform duration-150 flex items-center justify-center relative z-10"
             >
                <div className="w-16 h-16 rounded-full border-2 border-gray-300"></div>
             </button>
          </div>
        </div>
      )}

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraView;