import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, FileText, CheckCircle2, AlertTriangle, Cpu, HelpCircle, 
  DollarSign, Briefcase, FileCode, Check, Star, RefreshCw, Send, ArrowRight, Download
} from 'lucide-react';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [scanningStatus, setScanningStatus] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  
  // ATS Score values
  const [atsScore, setAtsScore] = useState(82);
  const [jobDescription, setJobDescription] = useState('');
  const [matchScore, setMatchScore] = useState(null);
  const [isMatching, setIsMatching] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, interview, salary
  
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const processFile = (selectedFile) => {
    setFile(selectedFile);
    setIsScanning(true);
    setScanComplete(false);
    setUploadProgress(0);
    
    // Animate progress with status updates
    const statuses = [
      { progress: 20, text: 'Detecting file type and encoding...' },
      { progress: 50, text: 'Extracting content via Apache Tika/PDFBox...' },
      { progress: 80, text: 'Running ATS parser & heuristics engine...' },
      { progress: 100, text: 'Analysis completed successfully!' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < statuses.length) {
        setUploadProgress(statuses[currentStep].progress);
        setScanningStatus(statuses[currentStep].text);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsScanning(false);
          setScanComplete(true);
        }, 500);
      }
    }, 850);
  };

  const handleMatchCompute = () => {
    if (!jobDescription.trim()) return;
    setIsMatching(true);
    setTimeout(() => {
      // Simulate score calculation
      const calculatedScore = Math.floor(Math.random() * (95 - 65 + 1)) + 65;
      setMatchScore(calculatedScore);
      setIsMatching(false);
    }, 1500);
  };

  const resetScanner = () => {
    setFile(null);
    setUploadProgress(0);
    setScanningStatus('');
    setIsScanning(false);
    setScanComplete(false);
    setMatchScore(null);
  };

  // SVG Dashboard Gauge calculations
  const strokeDashoffset = 440 - (440 * (scanComplete ? atsScore : 0)) / 100;

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="logo-section">
          <div className="logo-icon">
            <Cpu size={24} className="float-animation" />
          </div>
          <div>
            <h1 className="logo-title">Resume<span className="glow-text">Intelligence</span></h1>
          </div>
        </div>
        <div className="vibe-tag">
          vibe coded by <span className="vibe-name">Prakash Karuppusamy</span>
        </div>
      </header>

      {/* Main Grid */}
      <div className="dashboard-grid">
        
        {/* Left Side: Controls & Input */}
        <div className="flex-row-gap" style={{ flexDirection: 'column' }}>
          
          {/* Upload Resume Card */}
          <div className="glass-card">
            <h2 className="card-title">
              <Upload size={20} style={{ color: 'var(--color-primary)' }} />
              Upload Resume
            </h2>
            
            {!file ? (
              <div 
                className={`upload-zone ${isDragging ? 'active' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".pdf,.doc,.docx,.txt,.rtf" 
                  style={{ display: 'none' }} 
                />
                <FileText size={48} className="upload-icon float-animation" />
                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Drag & drop your resume here</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Supports PDF, DOCX, DOC, TXT, RTF up to 10MB</p>
              </div>
            ) : (
              <div>
                <div className="file-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FileCode size={28} style={{ color: 'var(--color-secondary)' }} />
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{file.name}</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  {!isScanning && (
                    <button className="btn btn-secondary" onClick={resetScanner} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                      Remove
                    </button>
                  )}
                </div>

                {isScanning && (
                  <div style={{ marginTop: '1.5rem', textAlign: 'left' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-secondary)' }}>{scanningStatus}</p>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  </div>
                )}

                {scanComplete && (
                  <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', color: 'var(--color-success)', alignItems: 'center' }}>
                    <CheckCircle2 size={18} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>File parsed successfully</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Job Match Analysis */}
          <div className="glass-card">
            <h2 className="card-title">
              <Briefcase size={20} style={{ color: 'var(--color-secondary)' }} />
              Job Description Match
            </h2>
            <div className="form-group">
              <label className="form-label">Target Job Description</label>
              <textarea 
                className="textarea" 
                placeholder="Paste the job description here to check compatibility and missing skills..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>
            
            <button 
              className="btn" 
              style={{ width: '100%' }} 
              disabled={!scanComplete || isMatching || !jobDescription.trim()}
              onClick={handleMatchCompute}
            >
              {isMatching ? (
                <>
                  <RefreshCw size={18} className="spin" style={{ animation: 'spin 1.5s linear infinite' }} />
                  Analyzing Fit Score...
                </>
              ) : (
                <>
                  Compute Fit Score
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {matchScore !== null && (
              <div style={{ marginTop: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--bg-card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>Job Match Compatibility</span>
                <span className="badge badge-success" style={{ fontSize: '1rem', padding: '0.4rem 0.8rem' }}>{matchScore}% Match</span>
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Analysis & Metrics */}
        <div>
          
          {scanComplete ? (
            <div className="flex-row-gap" style={{ flexDirection: 'column' }}>
              
              {/* Tab Navigation */}
              <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.03)', padding: '0.25rem', borderRadius: '100px', border: '1px solid var(--bg-card-border)', width: 'fit-content' }}>
                <button className={`btn ${activeTab === 'overview' ? '' : 'btn-secondary'}`} style={{ borderRadius: '100px', padding: '0.5rem 1.25rem', fontSize: '0.85rem' }} onClick={() => setActiveTab('overview')}>
                  Overview
                </button>
                <button className={`btn ${activeTab === 'interview' ? '' : 'btn-secondary'}`} style={{ borderRadius: '100px', padding: '0.5rem 1.25rem', fontSize: '0.85rem' }} onClick={() => setActiveTab('interview')}>
                  Interview Prep
                </button>
                <button className={`btn ${activeTab === 'salary' ? '' : 'btn-secondary'}`} style={{ borderRadius: '100px', padding: '0.5rem 1.25rem', fontSize: '0.85rem' }} onClick={() => setActiveTab('salary')}>
                  Market Insights
                </button>
              </div>

              {activeTab === 'overview' && (
                <>
                  {/* Score & Formatting Checks */}
                  <div className="grid-cols-2">
                    
                    <div className="glass-card ats-panel">
                      <div className="circular-gauge">
                        <svg className="circular-svg">
                          <circle className="gauge-bg" cx="80" cy="80" r="70" />
                          <circle 
                            className="gauge-fill" 
                            cx="80" 
                            cy="80" 
                            r="70" 
                            stroke="var(--color-primary)"
                            strokeDasharray="440"
                            strokeDashoffset={strokeDashoffset}
                          />
                        </svg>
                        <div className="gauge-text">
                          <span className="gauge-value">{atsScore}%</span>
                          <span className="gauge-label">ATS Score</span>
                        </div>
                      </div>
                      <span className="badge badge-success">Highly Compatible</span>
                    </div>

                    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-secondary)' }}>Format Integrity</h3>
                      
                      <div className="list-item">
                        <span style={{ fontSize: '0.9rem' }}>Contact Info Extracted</span>
                        <span className="badge badge-success"><Check size={12} /> Complete</span>
                      </div>
                      <div className="list-item">
                        <span style={{ fontSize: '0.9rem' }}>LinkedIn Link Detected</span>
                        <span className="badge badge-success"><Check size={12} /> Yes</span>
                      </div>
                      <div className="list-item">
                        <span style={{ fontSize: '0.9rem' }}>Tables & Column Check</span>
                        <span className="badge badge-success"><Check size={12} /> Clean Layout</span>
                      </div>
                      <div className="list-item">
                        <span style={{ fontSize: '0.9rem' }}>Bullet Point Density</span>
                        <span className="badge badge-success"><Check size={12} /> Ideal</span>
                      </div>
                    </div>

                  </div>

                  {/* Missing Skills Card */}
                  <div className="glass-card">
                    <h2 className="card-title">
                      <Star size={20} style={{ color: 'var(--color-accent)' }} />
                      Missing Skills & Gap Analysis
                    </h2>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                      These high-priority skills were identified as missing or weak compared to current market demands.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div className="list-item">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: 600 }}>Docker & Kubernetes</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>DevOps & Containerization</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <span className="badge badge-danger">High Priority</span>
                          <span className="badge badge-warning">Required</span>
                        </div>
                      </div>

                      <div className="list-item">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: 600 }}>AWS Cloud Services (EC2, S3)</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Infrastructure</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <span className="badge badge-danger">High Priority</span>
                          <span className="badge badge-warning">Required</span>
                        </div>
                      </div>

                      <div className="list-item">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: 600 }}>SonarQube & Static Analysis</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Code Quality</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <span className="badge badge-warning">Medium Priority</span>
                          <span className="badge badge-success">Preferred</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                      <button className="btn" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--bg-card-border)', color: 'white' }}>
                        <Download size={16} />
                        Download PDF Report
                      </button>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'interview' && (
                <div className="glass-card">
                  <h2 className="card-title">
                    <HelpCircle size={20} style={{ color: 'var(--color-primary)' }} />
                    Personalized Interview Prep
                  </h2>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Based on your parsed resume, here are custom generated questions you might face.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--bg-card-border)', borderRadius: 'var(--radius-sm)' }}>
                      <span className="badge badge-success" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>Java / Spring Boot</span>
                      <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>1. How do you manage transaction propagation levels in a multi-layered Spring Boot service structure?</p>
                    </div>

                    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--bg-card-border)', borderRadius: 'var(--radius-sm)' }}>
                      <span className="badge badge-success" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>System Design</span>
                      <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>2. Describe how you would scale the resume intelligence platform parser to handle 50,000 resume processing requests concurrently.</p>
                    </div>

                    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--bg-card-border)', borderRadius: 'var(--radius-sm)' }}>
                      <span className="badge badge-warning" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>DevOps Gap</span>
                      <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>3. Since Docker wasn't explicitly detected on your resume, how would you containerize your Spring Boot app using a multi-stage Docker build?</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'salary' && (
                <div className="glass-card">
                  <h2 className="card-title">
                    <DollarSign size={20} style={{ color: 'var(--color-secondary)' }} />
                    Market Salary Insights
                  </h2>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Calculated salary range benchmarking for matching profiles.
                  </p>

                  <div className="grid-cols-2" style={{ marginBottom: '1.5rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--bg-card-border)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>US Market (USD)</p>
                      <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-secondary)', margin: '4px 0' }}>$110K - $145K</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-success)' }}>High Market Demand</p>
                    </div>

                    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--bg-card-border)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Remote/Global Average</p>
                      <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)', margin: '4px 0' }}>$85K - $115K</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-success)' }}>Robust Growth Path</p>
                    </div>
                  </div>

                  <div className="list-item">
                    <span style={{ fontWeight: 600 }}>Top Hiring Regions</span>
                    <span>San Francisco, New York, Seattle, Austin, Bangalore (Remote)</span>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem', textAlign: 'center', borderStyle: 'dashed' }}>
              <Cpu size={48} style={{ color: 'var(--bg-card-border)', marginBottom: '1.5rem' }} className="float-animation" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Awaiting Analysis</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '280px' }}>Upload a candidate resume on the left to activate the AI scanning panel and see metrics in action.</p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default App;
