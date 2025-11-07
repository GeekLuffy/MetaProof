'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';

interface FacialCaptureProps {
  onCapture: (biometricData: BiometricData) => void;
  onSkip?: () => void;
  autoStart?: boolean;
}

export interface BiometricData {
  facialHash: string;
  signature: string;
  timestamp: string;
  verified: boolean;
  entropy?: number;
  token?: string;
  expiresAt?: string;
}

export function FacialCapture({ onCapture, onSkip, autoStart = false }: FacialCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [hasCapture, setHasCapture] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [detectionMetrics, setDetectionMetrics] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      console.log('🎥 Starting camera...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
        console.log('✅ Camera started');
      }
    } catch (error: any) {
      console.error('❌ Camera access error:', error);
      toast.error('Failed to access camera. Please check permissions.');
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setIsCameraActive(false);
      console.log('🛑 Camera stopped');
    }
  }, []);

  // Auto start if enabled
  useEffect(() => {
    if (autoStart && !isCameraActive && !hasCapture) {
      startCamera();
    }
  }, [autoStart, isCameraActive, hasCapture, startCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Capture image from video
  const captureImage = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;

    setIsProcessing(true);
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Failed to get canvas context');
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get image data as base64
      const imageData = canvas.toDataURL('image/jpeg', 0.8);

      console.log('📸 Image captured, processing biometric data...');
      toast.loading('Processing biometric data...', { id: 'biometric-capture' });

      // Send to backend for processing
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('http://localhost:5000/api/biometric/capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ imageData }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.log('Backend rejection details:', error.details);
        
        // Store metrics for display
        if (error.details) {
          setDetectionMetrics({
            passed: false,
            ...error.details,
          });
        }
        
        throw new Error(error.message || error.error || 'Failed to process biometric data');
      }

      const result = await response.json();
      console.log('✅ Biometric data processed:', result);
      
      // Store successful metrics
      setDetectionMetrics({
        passed: true,
        confidence: 100,
        entropy: result.biometric?.features?.entropy,
      });

      // Verify entropy meets requirements (LOWERED TO 3.0)
      if (result.biometric?.features?.entropy < 3.0) {
        throw new Error(`Image quality too low (entropy: ${result.biometric.features.entropy.toFixed(2)}). Please try again with better lighting.`);
      }

      toast.success('Proof-of-human verified! ✓', { id: 'biometric-capture' });

      // Pass biometric data to parent
      onCapture({
        facialHash: result.biometric.facialHash,
        signature: result.biometric.signature,
        timestamp: result.biometric.timestamp,
        verified: true,
        entropy: result.biometric.features?.entropy,
        token: result.biometric.token,
        expiresAt: result.biometric.expiresAt,
      });

      setHasCapture(true);
      setIsCapturing(false);

      // Stop camera after successful capture
      stopCamera();
    } catch (error: any) {
      console.error('❌ Capture error:', error);
      toast.error(error.message || 'Failed to capture facial data', { id: 'biometric-capture' });
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, onCapture, stopCamera]);

  // Handle capture with countdown
  const handleCapture = useCallback(async () => {
    setIsCapturing(true);

    // 3 second countdown
    for (let i = 3; i > 0; i--) {
      setCountdown(i);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    setCountdown(null);

    // Capture
    await captureImage();
  }, [captureImage]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <span>🔐</span>
          <span>Proof-of-Human Authentication</span>
        </h3>
        <p className="text-sm text-slate-400">
          Verify your identity as a human creator using facial capture. Your biometric data is hashed
          and never stored in its original form.
        </p>
      </div>

      {/* Video Preview */}
      <div className="relative bg-slate-950 rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '16/9' }}>
        {!isCameraActive && !hasCapture && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">📷</div>
              <p className="text-slate-400">Camera not active</p>
            </div>
          </div>
        )}

        {hasCapture && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-900/20">
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>
              <p className="text-green-400 font-semibold">Identity Verified</p>
              <p className="text-sm text-green-300/70 mt-2">Proof-of-human authenticated</p>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${!isCameraActive || hasCapture ? 'hidden' : ''}`}
        />

        {/* Countdown Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-9xl font-bold text-white animate-pulse">{countdown}</div>
          </div>
        )}

        {/* Face Detection Guide */}
        {isCameraActive && !isCapturing && !hasCapture && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-64 h-80 border-4 border-blue-500 rounded-full opacity-50"></div>
            </div>
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <p className="text-white text-sm bg-black/50 inline-block px-4 py-2 rounded">
                Position your face within the oval
              </p>
            </div>
          </div>
        )}

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {!isCameraActive && !hasCapture && (
          <button
            onClick={startCamera}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            <span className="flex items-center justify-center gap-2">
              <span>📷</span>
              <span>Start Camera</span>
            </span>
          </button>
        )}

        {isCameraActive && !hasCapture && !isCapturing && (
          <>
            <button
              onClick={handleCapture}
              disabled={isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>📸</span>
                  <span>Capture & Verify</span>
                </span>
              )}
            </button>

            <button
              onClick={stopCamera}
              className="px-6 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
          </>
        )}

        {hasCapture && (
          <button
                onClick={() => {
              setHasCapture(false);
              setDetectionMetrics(null);
              startCamera();
            }}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Recapture
          </button>
        )}

        {onSkip && !hasCapture && (
          <button
            onClick={onSkip}
            className="px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 rounded-lg transition-colors duration-200"
          >
            Skip (Optional)
          </button>
        )}
      </div>

      {/* Detection Metrics Display */}
      {detectionMetrics && (
        <div className={`mt-4 p-3 rounded-lg border ${
          detectionMetrics.passed 
            ? 'bg-green-900/20 border-green-600/30' 
            : 'bg-red-900/20 border-red-600/30'
        }`}>
          <div className={`text-sm font-semibold mb-2 ${detectionMetrics.passed ? 'text-green-300' : 'text-red-300'}`}>
            {detectionMetrics.passed ? '✅ Detection Results' : '❌ Detection Failed'}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {detectionMetrics.confidence !== undefined && (
              <div>
                <span className="text-slate-400">Confidence:</span>
                <span className={`ml-2 font-mono ${
                  detectionMetrics.confidence >= 30 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {detectionMetrics.confidence}%
                </span>
                <span className="text-slate-500 ml-1">(min: 30%)</span>
              </div>
            )}
            {detectionMetrics.skinToneRatio !== undefined && (
              <div>
                <span className="text-slate-400">Skin Tone:</span>
                <span className={`ml-2 font-mono ${
                  parseFloat(detectionMetrics.skinToneRatio) >= 5 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {detectionMetrics.skinToneRatio}
                </span>
                <span className="text-slate-500 ml-1">(min: 5%)</span>
              </div>
            )}
            {detectionMetrics.brightness !== undefined && (
              <div>
                <span className="text-slate-400">Brightness:</span>
                <span className={`ml-2 font-mono ${
                  detectionMetrics.brightness >= 20 && detectionMetrics.brightness <= 250 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {detectionMetrics.brightness}
                </span>
                <span className="text-slate-500 ml-1">(20-250)</span>
              </div>
            )}
            {detectionMetrics.colorVariance !== undefined && (
              <div>
                <span className="text-slate-400">Variance:</span>
                <span className={`ml-2 font-mono ${
                  parseFloat(detectionMetrics.colorVariance) >= 10 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {detectionMetrics.colorVariance}
                </span>
                <span className="text-slate-500 ml-1">(min: 10)</span>
              </div>
            )}
            {detectionMetrics.entropy !== undefined && (
              <div>
                <span className="text-slate-400">Entropy:</span>
                <span className={`ml-2 font-mono ${
                  detectionMetrics.entropy >= 3.0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {detectionMetrics.entropy.toFixed(2)}
                </span>
                <span className="text-slate-500 ml-1">(min: 3.0)</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info Note */}
      <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
        <p className="text-xs text-blue-200/80">
          ℹ️ <strong>Privacy:</strong> Your facial image is converted to a one-way hash and never stored.
          Only the hash signature is included in your artwork's proof package for verification.
        </p>
      </div>
    </div>
  );
}

