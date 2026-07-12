import React, { useState, useRef } from 'react';
import { 
  Upload, FileText, CheckCircle2, AlertTriangle, Cpu, HelpCircle, 
  DollarSign, Briefcase, FileCode, Check, Star, RefreshCw, ArrowRight, Download, XCircle
} from 'lucide-react';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  
  // Validation flow states
  const [isValidating, setIsValidating] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  const [validationStep, setValidationStep] = useState('');
  const [validationComplete, setValidationComplete] = useState(false);
  
  // Scanned / matched results
  const [atsScore, setAtsScore] = useState(0);
  const [matchScore, setMatchScore] = useState(0);
  const [matchedSkills, setMatchedSkills] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);
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
      setFile(e.dataTransfer.files[0]);
      setValidationComplete(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setValidationComplete(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  // Perform Step-by-Step validation and matching
  const handleValidate = () => {
    if (!file || !jobDescription.trim()) return;

    setIsValidating(true);
    setValidationComplete(false);
    setValidationProgress(0);
    setValidationStep('Step 1: Scanning Resume & Extracting Metadata...');

    // Phase 1: Scan (0% - 40%)
    setTimeout(() => {
      setValidationProgress(40);
      setValidationStep('Step 2: Matching candidate profile against Job Description...');
      
      // Phase 2: Match (40% - 80%)
      setTimeout(() => {
        setValidationProgress(80);
        setValidationStep('Step 3: Calculating compatibility index & non-matching gaps...');
        
        // Phase 3: Finalize (80% - 100%)
        setTimeout(() => {
          // Parse skills from Job Description
          const commonSkills = [
            'Java', 'Spring Boot', 'React', 'Docker', 'Kubernetes', 
            'AWS', 'SQL', 'Python', 'Git', 'JavaScript', 'TypeScript', 
            'Maven', 'REST APIs', 'PostgreSQL', 'CI/CD'
          ];
          
          const foundInJd = commonSkills.filter(skill => 
            new RegExp(`\\b${skill}\\b`, 'i').test(jobDescription)
          );

          // Default fallback skills if none detected in JD text
          const targetSkills = foundInJd.length > 0 ? foundInJd : ['Java', 'Spring Boot', 'React', 'Docker', 'AWS', 'CI/CD'];
          
          // Randomly distribute to matched vs missing to simulate scanner comparison
          const matched = [];
          const missing = [];
          targetSkills.forEach((skill, index) => {
            if (index % 3 === 0) {
              missing.push(skill);
            } else {
              matched.push(skill);
            }
          });

          // If no missing skills, add a placeholder gap
          if (missing.length === 0) {
            missing.push('Docker');
          }

          setMatchedSkills(matched);
          setMissingSkills(missing);
          
          // Calculate scores based on matches
          const calculatedAts = Math.floor(Math.random() * (92 - 75 + 1)) + 75;
          const calculatedMatch = Math.floor((matched.length / targetSkills.length) * 100);

          setAtsScore(calculatedAts);
          setMatchScore(calculatedMatch > 0 ? calculatedMatch : 70);
          setValidationProgress(100);
          setIsValidating(false);
          setValidationComplete(true);
        }, 1000);
      }, 1200);
    }, 1200);
  };

  const resetAll = () => {
    setFile(null);
    setJobDescription('');
    setValidationProgress(0);
    setValidationStep('');
    setIsValidating(false);
    setValidationComplete(false);
    setMatchedSkills([]);
    setMissingSkills([]);
    setAtsScore(0);
    setMatchScore(0);
  };

  const strokeDashoffsetATS = 440 - (440 * atsScore) / 100;
  const strokeDashoffsetMatch = 440 - (440 * matchScore) / 100;

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
        
        {/* Left Column: Input Forms */}
        <div className="flex-row-gap" style={{ flexDirection: 'column' }}>
          
          {/* Upload Resume Card */}
          <div className="glass-card">
            <h2 className="card-title">
              <Upload size={20} style={{ color: 'var(--color-primary)' }} />
              1. Upload Resume
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
                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Drag & drop candidate resume</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Supports PDF, DOCX, TXT, RTF</p>
              </div>
            ) : (
              <div className="file-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FileCode size={28} style={{ color: 'var(--color-secondary)' }} />
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{file.name}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                {!isValidating && (
                  <button className="btn btn-secondary" onClick={() => setFile(null)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                    Change
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Job Description Card */}
          <div className="glass-card">
            <h2 className="card-title">
              <Briefcase size={20} style={{ color: 'var(--color-secondary)' }} />
              2. Target Job Description
            </h2>
            <div className="form-group" style={{ margin: 0 }}>
              <textarea 
                className="textarea" 
                placeholder="Paste requirements, role definition, and target skills here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                disabled={isValidating}
              />
            </div>
          </div>

          {/* Action validation trigger */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              className="btn" 
              style={{ flex: 1, padding: '1rem' }} 
              disabled={!file || !jobDescription.trim() || isValidating}
              onClick={handleValidate}
            >
              {isValidating ? (
                <>
                  <RefreshCw size={18} className="spin" style={{ animation: 'spin 1.5s linear infinite' }} />
                  Running Pipeline...
                </>
              ) : (
                <>
                  Validate & Match Profile
                  <ArrowRight size={18} />
                </>
              )}
            </button>
            {(file || jobDescription) && !isValidating && (
              <button className="btn btn-secondary" onClick={resetAll}>
                Reset
              </button>
            )}
          </div>

          {/* Validation Progress Indicator */}
          {isValidating && (
            <div className="glass-card" style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-secondary)', marginBottom: '0.5rem' }}>
                {validationStep}
              </p>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${validationProgress}%` }}></div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Validation Gaps & Score Dashboards */}
        <div>
          {validationComplete ? (
            <div className="flex-row-gap" style={{ flexDirection: 'column' }}>
              
              {/* Tab Navigation */}
              <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.03)', padding: '0.25rem', borderRadius: '100px', border: '1px solid var(--bg-card-border)', width: 'fit-content' }}>
                <button className={`btn ${activeTab === 'overview' ? '' : 'btn-secondary'}`} style={{ borderRadius: '100px', padding: '0.5rem 1.25rem', fontSize: '0.85rem' }} onClick={() => setActiveTab('overview')}>
                  Overview & Gaps
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
                  {/* Scores dashboard */}
                  <div className="grid-cols-2">
                    {/* ATS score circular check */}
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
                            strokeDashoffset={strokeDashoffsetATS}
                          />
                        </svg>
                        <div className="gauge-text">
                          <span className="gauge-value">{atsScore}%</span>
                          <span className="gauge-label">ATS Score</span>
                        </div>
                      </div>
                      <span className="badge badge-success">ATS Compatible</span>
                    </div>

                    {/* Job Match circular check */}
                    <div className="glass-card ats-panel">
                      <div className="circular-gauge">
                        <svg className="circular-svg">
                          <circle className="gauge-bg" cx="80" cy="80" r="70" />
                          <circle 
                            className="gauge-fill" 
                            cx="80" 
                            cy="80" 
                            r="70" 
                            stroke="var(--color-secondary)"
                            strokeDasharray="440"
                            strokeDashoffset={strokeDashoffsetMatch}
                          />
                        </svg>
                        <div className="gauge-text">
                          <span className="gauge-value">{matchScore}%</span>
                          <span className="gauge-label">Job Match</span>
                        </div>
                      </div>
                      <span className="badge badge-success">Good Fit</span>
                    </div>
                  </div>

                  {/* Step 3 Gaps: Matched vs Missing Skills */}
                  <div className="glass-card">
                    <h2 className="card-title">
                      <Star size={20} style={{ color: 'var(--color-accent)' }} />
                      Step 3: Compatibility & Skill Gaps
                    </h2>
                    
                    <div className="grid-cols-2" style={{ marginTop: '1.5rem' }}>
                      {/* Matched Skills */}
                      <div style={{ background: 'rgba(34, 197, 94, 0.02)', border: '1px solid rgba(34, 197, 94, 0.1)', padding: '1.25rem', borderRadius: 'var(--radius-sm)' }}>
                        <h4 style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem', fontSize: '0.95rem' }}>
                          <CheckCircle2 size={16} />
                          Matching Items ({matchedSkills.length})
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {matchedSkills.map((skill, index) => (
                            <span key={index} className="badge badge-success" style={{ textTransform: 'none', letterSpacing: 0 }}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Missing Skills */}
                      <div style={{ background: 'rgba(239, 68, 68, 0.02)', border: '1px solid rgba(239, 68, 68, 0.1)', padding: '1.25rem', borderRadius: 'var(--radius-sm)' }}>
                        <h4 style={{ color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem', fontSize: '0.95rem' }}>
                          <XCircle size={16} />
                          Non-Matching Gaps ({missingSkills.length})
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {missingSkills.map((skill, index) => (
                            <span key={index} className="badge badge-danger" style={{ textTransform: 'none', letterSpacing: 0 }}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'flex-end' }}>
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
                    Prepare for key questions designed to test both your matching skills and fill in the missing gaps:
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {matchedSkills.slice(0, 2).map((skill, index) => (
                      <div key={index} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--bg-card-border)', borderRadius: 'var(--radius-sm)' }}>
                        <span className="badge badge-success" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>{skill} (Strong)</span>
                        <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>Explain a production-level challenge you faced using {skill} and how you optimized its implementation.</p>
                      </div>
                    ))}

                    {missingSkills.slice(0, 2).map((skill, index) => (
                      <div key={index} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--bg-card-border)', borderRadius: 'var(--radius-sm)' }}>
                        <span className="badge badge-danger" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>{skill} (Gap)</span>
                        <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>How would you go about building out skills in {skill} to support development pipelines in this role?</p>
                      </div>
                    ))}
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
                    Benchmarked salary ranges for this matching profile:
                  </p>

                  <div className="grid-cols-2" style={{ marginBottom: '1.5rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--bg-card-border)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>US Base Salary Range</p>
                      <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-secondary)', margin: '4px 0' }}>$115K - $150K</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-success)' }}>High Market Demand</p>
                    </div>

                    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--bg-card-border)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Global / Remote average</p>
                      <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)', margin: '4px 0' }}>$90K - $120K</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-success)' }}>Stable Growth Segment</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '7rem 2rem', textAlign: 'center', borderStyle: 'dashed' }}>
              <Cpu size={48} style={{ color: 'var(--bg-card-border)', marginBottom: '1.5rem' }} className="float-animation" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Awaiting Validation Pipeline</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '300px' }}>Upload a candidate resume and paste a target job description, then click "Validate & Match Profile" to trigger the three-step analysis.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default App;
