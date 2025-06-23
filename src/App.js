import React, { useState } from 'react';
import APODViewer from './components/APODViewer';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0b1426 0%, #1e3c72 50%, #2a5298 100%)' }}>
        {/* Professional NASA Header */}
        <header style={{
          background: 'linear-gradient(135deg, #000814 0%, #001d3d 100%)',
          color: 'white',
          padding: '20px 0',
          borderBottom: '3px solid #003566',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            {/* NASA Logo and Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {/* Official NASA Logo */}
              <div style={{
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <img 
                  src="https://www.nasa.gov/wp-content/uploads/2023/03/nasa-logo-web-rgb.png"
                  alt="NASA Logo"
                  style={{
                    width: '80px',
                    height: '80px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                  }}
                  onError={(e) => {
                    // Fallback to custom NASA logo if image fails to load
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                
                {/* Fallback Custom NASA Logo */}
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: '#fc3d21',
                  borderRadius: '50%',
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  boxShadow: '0 4px 15px rgba(252,61,33,0.4)'
                }}>
                  <div style={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '20px',
                    fontFamily: 'Arial, sans-serif',
                    letterSpacing: '1px'
                  }}>
                    NASA
                  </div>
                  {/* NASA Logo Elements */}
                  <div style={{
                    position: 'absolute',
                    width: '60px',
                    height: '2px',
                    background: 'white',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%) rotate(25deg)'
                  }}></div>
                  <div style={{
                    position: 'absolute',
                    width: '8px',
                    height: '8px',
                    background: 'white',
                    borderRadius: '50%',
                    top: '30%',
                    right: '25%'
                  }}></div>
                </div>
              </div>

              {/* Title */}
              <div>
                <h1 style={{
                  fontSize: '2.8rem',
                  margin: '0',
                  fontWeight: '700',
                  background: 'linear-gradient(45deg, #ffffff, #87ceeb)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                  NASA Explorer
                </h1>
                <p style={{
                  fontSize: '1.1rem',
                  margin: '5px 0 0 0',
                  color: '#87ceeb',
                  fontWeight: '300'
                }}>
                  National Aeronautics and Space Administration
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav style={{ display: 'flex', gap: '15px' }}>
              <button 
                onClick={() => document.getElementById('apod-section').scrollIntoView({ behavior: 'smooth' })}
                style={{
                  color: '#87ceeb',
                  background: 'transparent',
                  textDecoration: 'none',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '1px solid #87ceeb',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#87ceeb';
                  e.target.style.color = '#000814';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#87ceeb';
                }}
              >
                APOD
              </button>
              <button 
                onClick={() => document.getElementById('about-section').scrollIntoView({ behavior: 'smooth' })}
                style={{
                  color: '#87ceeb',
                  background: 'transparent',
                  textDecoration: 'none',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '1px solid transparent',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#87ceeb';
                  e.target.style.color = '#000814';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#87ceeb';
                }}
              >
                About
              </button>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ 
          minHeight: '80vh', 
          background: 'transparent',
          padding: '0'
        }}>
          {/* APOD Section */}
          <section id="apod-section">
            <APODViewer />
          </section>
          
          {/* About Section */}
          <section id="about-section" style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            margin: '40px 20px',
            borderRadius: '20px',
            padding: '40px',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            maxWidth: '1000px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            <div style={{ color: 'white', textAlign: 'center' }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '20px',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
              }}>
                🌍
              </div>
              <h2 style={{
                fontSize: '2.5rem',
                margin: '0 0 20px 0',
                fontWeight: '600',
                background: 'linear-gradient(45deg, #ffffff, #87ceeb, #ffd700)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                About NASA Explorer
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '30px',
                marginTop: '30px',
                textAlign: 'left'
              }}>
                {/* Mission */}
                <div style={{
                  background: 'rgba(255,255,255,0.1)',
                  padding: '25px',
                  borderRadius: '15px',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <h3 style={{
                    fontSize: '1.5rem',
                    marginBottom: '15px',
                    color: '#87ceeb',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    🚀 Our Mission
                  </h3>
                  <p style={{
                    color: '#e6f3ff',
                    fontSize: '1.1rem',
                    lineHeight: '1.6',
                    margin: '0'
                  }}>
                    To make NASA's incredible astronomical discoveries accessible to everyone through cutting-edge web technology and AI-powered features.
                  </p>
                </div>

                {/* Features */}
                <div style={{
                  background: 'rgba(255,255,255,0.1)',
                  padding: '25px',
                  borderRadius: '15px',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <h3 style={{
                    fontSize: '1.5rem',
                    marginBottom: '15px',
                    color: '#87ceeb',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    ⭐ Features
                  </h3>
                  <ul style={{
                    color: '#e6f3ff',
                    fontSize: '1.1rem',
                    lineHeight: '1.8',
                    margin: '0',
                    paddingLeft: '20px'
                  }}>
                    <li>🖼️ High-resolution space imagery</li>
                    <li>🤖 AI-powered text-to-speech</li>
                    <li>📅 Explore any date since 1995</li>
                    <li>🔊 Multiple voice options</li>
                    <li>📱 Responsive design</li>
                  </ul>
                </div>

                {/* Technology */}
                <div style={{
                  background: 'rgba(255,255,255,0.1)',
                  padding: '25px',
                  borderRadius: '15px',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <h3 style={{
                    fontSize: '1.5rem',
                    marginBottom: '15px',
                    color: '#87ceeb',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    💻 Technology
                  </h3>
                  <div style={{
                    color: '#e6f3ff',
                    fontSize: '1.1rem',
                    lineHeight: '1.6'
                  }}>
                    <p style={{ margin: '0 0 10px 0' }}>
                      <strong>Frontend:</strong> React.js with modern hooks
                    </p>
                    <p style={{ margin: '0 0 10px 0' }}>
                      <strong>Backend:</strong> Node.js & Express API
                    </p>
                    <p style={{ margin: '0 0 10px 0' }}>
                      <strong>AI:</strong> Web Speech API integration
                    </p>
                    <p style={{ margin: '0' }}>
                      <strong>Data:</strong> NASA APOD API
                    </p>
                  </div>
                </div>

                {/* Contact */}
                <div style={{
                  background: 'rgba(255,255,255,0.1)',
                  padding: '25px',
                  borderRadius: '15px',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <h3 style={{
                    fontSize: '1.5rem',
                    marginBottom: '15px',
                    color: '#87ceeb',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    📧 Connect
                  </h3>
                  <p style={{
                    color: '#e6f3ff',
                    fontSize: '1.1rem',
                    lineHeight: '1.6',
                    margin: '0 0 15px 0'
                  }}>
                    Built with passion for space exploration and modern web development.
                  </p>
                  <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <button 
                      onClick={() => window.open('https://github.com/NavyasriB98', '_blank')}
                      style={{
                        padding: '8px 16px',
                        background: 'linear-gradient(45deg, #007bff, #0056b3)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 15px rgba(0,123,255,0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      🐙 GitHub
                    </button>
                    <button 
                      onClick={() => window.open('https://navyasrib.netlify.app/', '_blank')}
                      style={{
                        padding: '8px 16px',
                        background: 'linear-gradient(45deg, #6f42c1, #5a32a3)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 15px rgba(111,66,193,0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      💼 Portfolio
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Professional Footer */}
        <footer style={{
          background: 'linear-gradient(135deg, #000814 0%, #001d3d 100%)',
          color: 'white',
          padding: '30px 20px',
          marginTop: '40px',
          borderTop: '3px solid #003566'
        }}>
          <div style={{
            maxWidth: '1000px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '15px',
              marginBottom: '15px',
              flexWrap: 'wrap'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: '#fc3d21',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                NASA
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                  National Aeronautics and Space Administration
                </div>
                <div style={{ fontSize: '0.9rem', color: '#87ceeb', marginTop: '5px' }}>
                  Inspiring the next generation of explorers
                </div>
              </div>
            </div>
            
            <div style={{
              borderTop: '1px solid #003566',
              paddingTop: '15px',
              fontSize: '0.9rem',
              color: '#87ceeb'
            }}>
              <p style={{ margin: '0' }}>
                Data provided by{' '}
                <a 
                  href="https://api.nasa.gov/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#ffd700', textDecoration: 'none' }}
                >
                  NASA Open Data API
                </a>
              </p>
              <p style={{ margin: '10px 0 0 0' }}>
                Built with ❤️ for space exploration • © 2025 NASA Explorer
              </p>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;