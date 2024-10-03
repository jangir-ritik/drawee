"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChevronRight, Pause, Play, StopCircle, Upload } from 'lucide-react'
import Image from 'next/image'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function DrawingPracticeTool() {
  const [images, setImages] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [sessionDuration, setSessionDuration] = useState(60)
  const [remainingTime, setRemainingTime] = useState(sessionDuration)
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchImages()
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [isSessionActive, isPaused, sessionDuration])

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    switch (event.code) {
      case 'Space':
        event.preventDefault()
        isSessionActive ? stopSession() : startSession()
        break
      case 'KeyP':
        if (isSessionActive) togglePause()
        break
      case 'ArrowLeft':
        if (isSessionActive) previousImage()
        break
      case 'ArrowRight':
        if (isSessionActive) nextImage()
        break
      case 'ArrowUp':
        setSessionDuration(prev => Math.min(prev + 10, 3600))
        break
      case 'ArrowDown':
        setSessionDuration(prev => Math.max(prev - 10, 10))
        break
    }
  }, [isSessionActive, isPaused, sessionDuration])

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  }

  const fetchImages = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/images`);
      if (!response.ok) {
        throw new Error('Failed to fetch images')
      }
      const data = await response.json();
      setImages(data.images);
    } catch (error) {
      console.error('Error fetching images:', error);
      setError('Failed to load images. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const startSession = useCallback(() => {
    if (images.length === 0) {
      setError('No images available. Please upload some images first.')
      return
    }
    setIsSessionActive(true)
    setIsPaused(false)
    setRemainingTime(sessionDuration)
    setError(null)
  }, [sessionDuration, images.length])

  const stopSession = useCallback(() => {
    setIsSessionActive(false)
    setIsPaused(false)
    setCurrentImageIndex(0)
    setRemainingTime(sessionDuration)
  }, [sessionDuration])

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev)
  }, [])

  const nextImage = useCallback(() => {
    setCurrentImageIndex(prev => (prev + 1) % images.length)
    setRemainingTime(sessionDuration)
  }, [sessionDuration, images.length])

  const previousImage = useCallback(() => {
    setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length)
    setRemainingTime(sessionDuration)
  }, [sessionDuration, images.length])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isSessionActive && !isPaused) {
      timer = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            nextImage()
            return sessionDuration
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isSessionActive, isPaused, sessionDuration, nextImage])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to upload images')
      }
      await fetchImages(); // Refresh the image list
    } catch (error) {
      console.error('Error uploading files:', error);
      setError('Failed to upload images. Please try again.')
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <div className="w-64 bg-gray-800 p-4 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-100">Toolbox</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="session-duration" className="text-gray-300">Session Duration (seconds)</Label>
            <Input
              id="session-duration"
              type="number"
              value={sessionDuration}
              onChange={(e) => setSessionDuration(Number(e.target.value))}
              min={1}
              className="bg-gray-700 text-gray-100 border-gray-600"
            />
          </div>
          <div className="flex justify-between">
            <Button onClick={previousImage} disabled={!isSessionActive} variant="outline" className="bg-gray-700 text-gray-100 hover:bg-gray-600">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button onClick={nextImage} disabled={!isSessionActive} variant="outline" className="bg-gray-700 text-gray-100 hover:bg-gray-600">
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          <div className="flex justify-between">
            {!isSessionActive ? (
              <Button onClick={startSession} className="bg-blue-600 hover:bg-blue-700 text-white">Start Session</Button>
            ) : (
              <>
                <Button onClick={togglePause} className="bg-yellow-600 hover:bg-yellow-700 text-white">
                  {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button onClick={stopSession} variant="destructive" className="bg-red-600 hover:bg-red-700 text-white">
                  <StopCircle className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              </>
            )}
          </div>
          <div>
            <Button
              onClick={triggerFileInput}
              variant="outline"
              className="w-full bg-gray-700 text-gray-100 hover:bg-gray-600"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Images
            </Button>
            <Input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
          {error && <div className="text-red-500">{error}</div>}
          <div className="text-sm text-gray-400">
            <h3 className="font-bold mb-2">Keyboard Shortcuts:</h3>
            <ul className="list-disc list-inside">
              <li>Space: Start/Stop session</li>
              <li>P: Pause/Resume session</li>
              <li>Left Arrow: Previous image</li>
              <li>Right Arrow: Next image</li>
              <li>Up Arrow: Increase duration</li>
              <li>Down Arrow: Decrease duration</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="flex-1 relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p>Loading images...</p>
          </div>
        ) : (
          <Canvas>
            <OrbitControls />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <Html center>
              <div className="w-[800px] h-[600px] rounded-2xl overflow-hidden flex items-center justify-center">
                {images.length > 0 ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={`${API_URL}/image/${images[currentImageIndex]}`}
                      alt={`Drawing reference ${currentImageIndex + 1}`}
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p>No images available. Please upload some images.</p>
                  </div>
                )}
              </div>
            </Html>
          </Canvas>
        )}
        {isSessionActive && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 px-4 py-2 rounded-full shadow-lg">
            <span className="text-2xl font-bold text-gray-100">{remainingTime}s</span>
          </div>
        )}
        {isLoading && <div className="text-blue-500 mt-2">Uploading...</div>}
      </div>
    </div>
  )
}