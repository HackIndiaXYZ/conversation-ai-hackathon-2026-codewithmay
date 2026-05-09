import React, { useRef, useEffect, useState } from 'react';
import { Camera, User } from 'lucide-react';

/**
 * Media View Component
 * Displays user camera feed and shared content
 */
const MediaView = ({ isCameraOn, className = '' }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let currentStream = null;

    const startCamera = async () => {
      if (isCameraOn) {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 }
            },
            audio: false
          });

          currentStream = mediaStream;
          setStream(mediaStream);
          setError(null);

          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        } catch (err) {
          console.error('Error accessing camera:', err);
          setError('Failed to access camera. Please check permissions.');
        }
      } else {
        // Stop camera
        if (currentStream) {
          currentStream.getTracks().forEach(track => track.stop());
          setStream(null);
        }
      }
    };

    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOn]);

  return (
    <div className={`relative bg-gray-950 rounded-2xl overflow-hidden ${className}`}>
      {isCameraOn && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
              {error ? (
                <Camera className="w-12 h-12 text-red-500" />
              ) : (
                <User className="w-12 h-12 text-gray-600" />
              )}
            </div>
            <p className="text-gray-500 text-sm">
              {error || 'Camera is off'}
            </p>
          </div>
        </div>
      )}

      {/* Camera indicator */}
      {isCameraOn && !error && (
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-white text-xs font-medium">LIVE</span>
        </div>
      )}
    </div>
  );
};

export default MediaView;
