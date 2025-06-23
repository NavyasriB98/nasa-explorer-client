import React, { useState, useEffect, useRef } from 'react';
import apiService, { getErrorMessage, logError, networkService, ErrorTypes } from '../services/api';

const APODViewer = () => {
  const [apodData, setApodData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isOnline, setIsOnline] = useState(networkService.isOnline());
  const [retryCount, setRetryCount] = useState(0);
  
  // Text-to-Speech state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(0);
  
  const speechSynthRef = useRef(null);
  const utteranceRef = useRef(null);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setError(null); // Clear network errors when back online
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setError('You are currently offline. Please check your internet connection.');
    };

    const removeOnlineListener = networkService.addOnlineListener(handleOnline);
    const removeOfflineListener = networkService.addOfflineListener(handleOffline);

    return () => {
      removeOnlineListener();
      removeOfflineListener();
    };
  }, []);

  // Initialize voices
  useEffect(() => {
    const loadVoices = () => {
      try {
        const voices = speechSynthesis.getVoices();
        setAvailableVoices(voices);
        
        // Try to find a good default voice (prefer English)
        const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
        const defaultVoice = englishVoices.find(voice => voice.name.includes('Natural')) ||
                            englishVoices.find(voice => voice.name.includes('Premium')) ||
                            englishVoices[0] || voices[0];
        
        setSelectedVoice(defaultVoice);
      } catch (error) {
        console.warn('Speech synthesis not supported:', error);
      }
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  const fetchAPOD = async () => {
    if (!isOnline) {
      setError('Cannot fetch data while offline. Please check your internet connection.');
      return;
    }

    setLoading(true);
    setError(null);
    stopSpeech(); // Stop any current speech when fetching new content
    
    try {
      // Validate date before making request
      apiService.validateDate(selectedDate);
      
      const data = await apiService.fetchAPOD(selectedDate);
      setApodData(data);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      setRetryCount(prev => prev + 1);
      
      // Log error for debugging
      logError(err, 'APODViewer.fetchAPOD');
      
      // Auto-retry for certain error types
      if (err.type === ErrorTypes.NETWORK || err.type === ErrorTypes.SERVER) {
        if (retryCount < 2) { // Max 3 attempts total
          setTimeout(() => {
            console.log(`Auto-retrying APOD fetch (attempt ${retryCount + 2})`);
            fetchAPOD();
          }, 2000 * (retryCount + 1)); // Exponential backoff
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setError(null); // Clear any previous errors when date changes
  };

  const prepareSpeechText = () => {
    if (!apodData) return '';
    
    // Create a natural reading experience
    let speechText = `Today's Astronomy Picture of the Day is titled: ${apodData.title}.`;
    
    if (apodData.copyright) {
      speechText += ` This image is by ${apodData.copyright}.`;
    }
    
    speechText += ` Here's the description: ${apodData.explanation}`;
    
    return speechText;
  };

  const startSpeech = () => {
    if (!apodData) return;
    
    try {
      stopSpeech(); // Stop any existing speech
      
      const text = prepareSpeechText();
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure voice settings
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.rate = playbackRate;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      // Event handlers
      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
      };
      
      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentPosition(0);
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsPlaying(false);
        setIsPaused(false);
        setError('Speech synthesis failed. Please try again or check your audio settings.');
      };
      
      utterance.onboundary = (event) => {
        setCurrentPosition(event.charIndex);
      };
      
      utteranceRef.current = utterance;
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Speech synthesis error:', error);
      setError('Speech synthesis is not supported in your browser.');
    }
  };

  const pauseSpeech = () => {
    try {
      if (speechSynthesis.speaking && !speechSynthesis.paused) {
        speechSynthesis.pause();
        setIsPaused(true);
      }
    } catch (error) {
      console.error('Error pausing speech:', error);
    }
  };

  const resumeSpeech = () => {
    try {
      if (speechSynthesis.paused) {
        speechSynthesis.resume();
        setIsPaused(false);
      }
    } catch (error) {
      console.error('Error resuming speech:', error);
    }
  };

  const stopSpeech = () => {
    try {
      speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentPosition(0);
    } catch (error) {
      console.error('Error stopping speech:', error);
    }
  };

  const handleVoiceChange = (voiceIndex) => {
    try {
      const voice = availableVoices[voiceIndex];
      setSelectedVoice(voice);
    } catch (error) {
      console.error('Error changing voice:', error);
    }
  };

  const handleRateChange = (rate) => {
    try {
      setPlaybackRate(rate);
      if (isPlaying && !isPaused) {
        // Restart with new rate
        const wasPlaying = isPlaying;
        stopSpeech();
        if (wasPlaying) {
          setTimeout(startSpeech, 100);
        }
      }
    } catch (error) {
      console.error('Error changing playback rate:', error);
    }
  };

  useEffect(() => {
    fetchAPOD();
  }, []);

  return (
    <div style={{ padding: '40px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Network Status Indicator */}
        {!isOnline && (
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            color: '#856404',
            padding: '12px 20px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '1.2rem' }}>📡</span>
            <span>You are currently offline. Some features may not work properly.</span>
          </div>
        )}
        
        {/* APOD Section Header */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '40px',
          marginBottom: '30px',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}>
          <div style={{ textAlign: 'center', color: 'white' }}>
            <div style={{
              fontSize: '4rem',
              marginBottom: '15px',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
            }}>
              🌌
            </div>
            <h2 style={{
              fontSize: '3rem',
              margin: '0 0 15px 0',
              fontWeight: '600',
              color: '#ffffff',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
            }}>
              Astronomy Picture of the Day
            </h2>
            <p style={{
              fontSize: '1.3rem',
              color: '#ffffff',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6',
              textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
            }}>
              Discover the cosmos through NASA's daily featured astronomical images and scientific explanations
            </p>
          </div>
        </div>

        {/* Controls Section */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '15px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            
            {/* Date Input */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <label style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#333',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                📅 Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                min="1995-06-16"
                disabled={loading}
                style={{
                  padding: '12px 15px',
                  borderRadius: '10px',
                  border: '2px solid #e0e0e0',
                  fontSize: '1rem',
                  color: '#333',
                  background: loading ? '#f5f5f5' : 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              />
            </div>

            {/* Fetch Button */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ height: '28px', marginBottom: '8px' }}></div>
              <button 
                onClick={fetchAPOD} 
                disabled={loading || !isOnline}
                style={{
                  padding: '12px 30px',
                  background: loading || !isOnline ? '#ccc' : 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: loading || !isOnline ? 'not-allowed' : 'pointer',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: loading || !isOnline ? 'none' : '0 4px 15px rgba(0,123,255,0.3)',
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? '🔄 Loading...' : !isOnline ? '📡 Offline' : '🚀 Fetch APOD'}
              </button>
            </div>

            {/* Info Card */}
            <div style={{
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              padding: '15px 20px',
              borderRadius: '10px',
              border: '1px solid #dee2e6',
              maxWidth: '200px'
            }}>
              <div style={{ fontSize: '0.85rem', color: '#666', textAlign: 'center' }}>
                <div style={{ fontWeight: '600', marginBottom: '5px' }}>📊 Data Source</div>
                <div>NASA APOD API</div>
                <div style={{ fontSize: '0.75rem', marginTop: '5px', color: '#888' }}>
                  Since June 16, 1995
                </div>
                {retryCount > 0 && (
                  <div style={{ fontSize: '0.75rem', marginTop: '5px', color: '#dc3545' }}>
                    Retries: {retryCount}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ fontSize: '1.1rem', color: '#333' }}>Fetching astronomy data...</p>
          {retryCount > 0 && (
            <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
              Retry attempt {retryCount + 1}
            </p>
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{
          color: '#d32f2f',
          backgroundColor: '#ffebee',
          border: '1px solid #f44336',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <p style={{ marginBottom: '10px' }}>❌ {error}</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={fetchAPOD}
              disabled={loading || !isOnline}
              style={{
                padding: '8px 16px',
                backgroundColor: loading || !isOnline ? '#ccc' : '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading || !isOnline ? 'not-allowed' : 'pointer'
              }}
            >
              Try Again
            </button>
            {!isOnline && (
              <button 
                onClick={() => window.location.reload()}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#2196f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Reload Page
              </button>
            )}
          </div>
        </div>
      )}

      {/* APOD Content */}
      {apodData && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          marginBottom: '20px'
        }}>
          {/* Title */}
          <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
            <h3 style={{ 
              fontSize: '1.8rem', 
              marginBottom: '10px',
              color: '#333',
              lineHeight: '1.4'
            }}>
              {apodData.title}
            </h3>
            <div style={{ display: 'flex', gap: '20px', fontSize: '0.9rem', color: '#666' }}>
              <span>📅 {apodData.date}</span>
              {apodData.copyright && <span>📷 {apodData.copyright}</span>}
            </div>
          </div>

          {/* AI Audio Controls */}
          <div style={{
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #eee'
          }}>
            <h4 style={{ marginBottom: '15px', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
              🤖 AI Audio Narration
            </h4>
            
            {/* Main Controls */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
              {!isPlaying ? (
                <button
                  onClick={startSpeech}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  ▶️ Play Description
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '10px' }}>
                  {!isPaused ? (
                    <button
                      onClick={pauseSpeech}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#ffc107',
                        color: 'black',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '1rem'
                      }}
                    >
                      ⏸️ Pause
                    </button>
                  ) : (
                    <button
                      onClick={resumeSpeech}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '1rem'
                      }}
                    >
                      ▶️ Resume
                    </button>
                  )}
                  <button
                    onClick={stopSpeech}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    ⏹️ Stop
                  </button>
                </div>
              )}
            </div>

            {/* Advanced Controls */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              {/* Voice Selection */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  🎭 Voice:
                </label>
                <select
                  value={availableVoices.indexOf(selectedVoice)}
                  onChange={(e) => handleVoiceChange(parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    fontSize: '0.9rem'
                  }}
                >
                  {availableVoices.map((voice, index) => (
                    <option key={index} value={index}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>

              {/* Speed Control */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  ⚡ Speed: {playbackRate}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={playbackRate}
                  onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666' }}>
                  <span>0.5x</span>
                  <span>1x</span>
                  <span>2x</span>
                </div>
              </div>
            </div>

            {/* Status */}
            {isPlaying && (
              <div style={{ 
                marginTop: '15px', 
                padding: '10px', 
                backgroundColor: '#e7f3ff', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '3px solid #007bff',
                  borderTop: '3px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <span style={{ color: '#0066cc' }}>
                  {isPaused ? '⏸️ Paused' : '🔊 Playing audio description...'}
                </span>
              </div>
            )}
          </div>

          {/* Image */}
          {apodData.media_type === 'image' ? (
            <div style={{ position: 'relative' }}>
              <img 
                src={apodData.url}
                alt={apodData.title}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '600px',
                  objectFit: 'contain',
                  background: '#000'
                }}
              />
              <a 
                href={apodData.hdurl || apodData.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  padding: '8px 12px',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontSize: '0.9rem'
                }}
              >
                🔍 HD Version
              </a>
            </div>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <p style={{ marginBottom: '15px', color: '#666' }}>
                📹 This APOD features a video
              </p>
              <a 
                href={apodData.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              >
                ▶️ Watch Video
              </a>
            </div>
          )}

          {/* Description */}
          <div style={{ padding: '20px' }}>
            <h4 style={{ marginBottom: '15px', color: '#333' }}>📖 Description:</h4>
            <p style={{ 
              lineHeight: '1.8', 
              fontSize: '1.1rem', 
              color: '#444',
              textAlign: 'justify'
            }}>
              {apodData.explanation}
            </p>
          </div>
        </div>
      )}

      {/* CSS for animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      </div>
    </div>
  );
};

export default APODViewer;