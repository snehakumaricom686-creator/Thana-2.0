import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig';
import { 
  UploadCloud, 
  FileImage, 
  Video, 
  FileText, 
  Search, 
  Filter, 
  Lock, 
  ShieldCheck, 
  History,
  CheckCircle,
  Database
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import './EvidenceVault.css';
import GpsCapture from '../components/GpsCapture';

const EvidenceVault = ({ view }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [evidenceList, setEvidenceList] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Form Data
  const [gpsLocation, setGpsLocation] = useState(null);
  const [formData, setFormData] = useState({
    caseId: searchParams.get('caseId') || '',
    evidenceType: 'photo',
    description: ''
  });

  useEffect(() => {
    if (view !== 'upload') {
      fetchEvidence();
    }
  }, [view]);

  const fetchEvidence = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/evidence`);
      setEvidenceList(res.data || []);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    
    setLoading(true);
    try {
      const userStr = localStorage.getItem('thana2_user');
      const userObj = userStr ? JSON.parse(userStr) : null;

      const submitData = new FormData();
      submitData.append('caseId', formData.caseId);
      submitData.append('evidenceType', formData.evidenceType);
      submitData.append('description', formData.description);
      submitData.append('officerId', userObj?.officerId || 'Demo Officer');
      submitData.append('evidenceFile', file);
      // GPS location
      if (gpsLocation) {
        submitData.append('locationLat', gpsLocation.lat);
        submitData.append('locationLng', gpsLocation.lng);
        submitData.append('locationAddress', gpsLocation.address || '');
        submitData.append('locationAccuracy', gpsLocation.accuracy || 0);
        submitData.append('locationCapturedAt', gpsLocation.capturedAt || new Date().toISOString());
      }

      await axios.post(`${API_URL}/api/evidence/upload`, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/evidence');
    } catch (err) {
      alert("Error securely uploading evidence. Check Case ID or file size.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    inputRef.current.click();
  };

  if (view === 'upload') {
    return (
      <div className="evidence-upload">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Secure Evidence Upload</h1>
            <p className="text-secondary text-sm">All uploads are timestamped and hashed for chain-of-custody verification.</p>
          </div>
          <Link to="/evidence" className="btn btn-outline">Back to Vault</Link>
        </div>

        <div className="grid-layout-upload">
          <form className="glass-card p-6 flex flex-col gap-6" onSubmit={handleUploadSubmit}>
            <h3 className="font-semibold text-lg flex items-center gap-2 border-b border-color pb-4">
               <UploadCloud size={20} className="text-primary"/> Upload Form
            </h3>
            
            <div className="input-group">
               <label>Assign to Case ID</label>
               <input type="text" className="input-field" placeholder="e.g. 64d9f... (or Database ID)" required value={formData.caseId} onChange={(e) => setFormData({...formData, caseId: e.target.value})} />
            </div>

            <div className="input-group">
               <label>Evidence Type</label>
               <select className="input-field bg-black/50 text-white cursor-pointer select-arrow" value={formData.evidenceType} onChange={(e) => setFormData({...formData, evidenceType: e.target.value})}>
                  <option value="photo">Photographic Evidence</option>
                  <option value="cctv">CCTV / Video Footage</option>
                  <option value="audio">Audio Recording</option>
                  <option value="document">Physical Document Scan</option>
                  <option value="forensic">Forensic Report</option>
               </select>
            </div>

            <div className="input-group">
               <label>Description & Context</label>
               <textarea className="input-field" rows="3" placeholder="Describe the evidence context..." required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
            </div>

            {/* GPS Capture — auto-captures upload location */}
            <div>
              <GpsCapture
                label="Upload Location (GPS)"
                autoCapture={true}
                onLocation={(loc) => setGpsLocation(loc)}
              />
            </div>

            <div 
              className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            >
              <input ref={inputRef} type="file" onChange={handleChange} style={{ display: "none" }} />
              {file ? (
                <div className="text-center">
                   <div className="w-16 h-16 bg-primary-soft text-primary rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle size={32} />
                   </div>
                   <div className="font-semibold">{file.name}</div>
                   <div className="text-xs text-secondary mt-1">{(file.size / (1024*1024)).toFixed(2)} MB • Ready for hashing</div>
                   <button type="button" className="text-xs text-primary mt-4 hover:underline" onClick={() => setFile(null)}>Remove file</button>
                </div>
              ) : (
                <div className="text-center flex flex-col items-center">
                   <div className="w-16 h-16 bg-black/30 border border-white/10 rounded-full flex items-center justify-center mb-3">
                      <UploadCloud size={28} className="text-secondary" />
                   </div>
                   <p className="font-medium mb-1">Drag and drop file here</p>
                   <p className="text-xs text-secondary mb-4">Supported formats: JPG, PNG, PDF</p>
                   <button className="btn btn-outline" type="button" onClick={onButtonClick}>Browse Computer</button>
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary w-full py-3 mt-2 text-md flex justify-center gap-2" disabled={loading}>
               <Lock size={18} /> {loading ? 'UPLOADING...' : 'INITIALIZE SECURE UPLOAD'}
            </button>
          </form>

          <div className="glass-card p-6 flex flex-col gap-4 bg-primary-soft/10 border-primary/20">
             <div className="flex items-center gap-3 mb-2">
                <ShieldCheck size={28} className="text-primary bg-primary/20 p-1 rounded" />
                <h3 className="font-semibold text-lg">Integrity Protocol</h3>
             </div>
             
             <div className="protocol-item">
                <div className="protocol-dot bg-green-400"></div>
                <div>
                   <div className="font-medium text-sm">SHA-256 Hashing</div>
                   <div className="text-xs text-secondary">A unique fingerprint is generated immediately upon upload.</div>
                </div>
             </div>
             
             <div className="protocol-item">
                <div className="protocol-dot bg-blue"></div>
                <div>
                   <div className="font-medium text-sm">Timestamp &amp; GPS Lock</div>
                   <div className="text-xs text-secondary">Exact upload timestamp and GPS location permanently sealed with evidence.</div>
                </div>
             </div>

             <div className="protocol-item">
                <div className="protocol-dot bg-warning"></div>
                <div>
                   <div className="font-medium text-sm">Chain of Custody Init</div>
                   <div className="text-xs text-secondary">Your officer ID is permanently linked as the origin source.</div>
                </div>
             </div>
             
             <div className="mt-auto pt-6 border-t border-color text-xs text-secondary text-center">
                Modifying the file after this point will invalidate the cryptographic signature and generate an alert.
             </div>
          </div>
        </div>
      </div>
    );
  }

  // Vault View
  return (
    <div className="evidence-vault">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Digital Evidence Vault</h1>
          <p className="text-secondary text-sm">Tamper-proof repository with chain of custody tracking</p>
        </div>
        <Link to="/evidence/upload" className="btn btn-primary flex items-center gap-2">
          <UploadCloud size={18} /> Upload New Evidence
        </Link>
      </div>

      <div className="glass-card mb-6 p-4">
         <div className="flex gap-4">
            <button className="vault-tab active text-primary bg-primary-soft">All Files ({evidenceList.length})</button>
            <button className="vault-tab text-secondary hover:text-white"><FileImage size={16}/> Images ({evidenceList.filter(e => e.evidenceType === 'photo').length})</button>
            <button className="vault-tab text-secondary hover:text-white"><FileText size={16}/> Docs ({evidenceList.filter(e => e.evidenceType !== 'photo').length})</button>
            
            <div className="ml-auto search-box flex items-center gap-2 bg-black/20 p-2 px-4 rounded-lg border border-white/5 flex-2 min-w-[300px]">
               <Search size={16} className="text-secondary" />
               <input type="text" placeholder="Search hash, description, or case ID..." className="bg-transparent border-none text-white w-full outline-none text-sm" />
               <Filter size={16} className="text-secondary cursor-pointer" />
            </div>
         </div>
      </div>

      {evidenceList.length === 0 && !loading && (
        <div className="glass-card p-12 text-center flex flex-col items-center justify-center text-secondary">
          <Database size={48} className="opacity-50 mb-4" />
          <h3 className="text-xl text-white mb-2">The Vault is Empty</h3>
          <p>There are no digital evidence records uploaded to the server yet.</p>
          <p>Please register a Case File and securely upload documents/photos to start.</p>
        </div>
      )}

      {loading && <div className="text-center p-8 text-secondary">Synchronizing Secure Network...</div>}

      <div className="vault-grid">
         {evidenceList.map((ev) => (
            <div key={ev._id} className="vault-card glass-card overflow-hidden group">
               <div className="vault-card-img h-36 relative flex items-center justify-center bg-gray-900 border-b border-color overflow-hidden">
                  <img src={ev.cloudinaryUrl} alt="Evidence" className="absolute w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" />
                  {/* Tamper-proof seal badge */}
                  <div className="absolute top-2 right-2 bg-black/80 backdrop-blur text-xs px-2 py-1 rounded flex items-center gap-1 border border-green-500/30" style={{ color: '#4ade80' }}>
                     <ShieldCheck size={12} /> IMMUTABLE
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur text-[10px] px-2 py-1 rounded border border-white/10">
                     Case: {ev.caseId?.firNumber || ev.caseId || 'Unknown'}
                  </div>
               </div>
               <div className="p-4">
                  <h4 className="font-semibold text-sm truncate mb-1">{ev.description || 'Evidence Record'}</h4>
                  <div className="text-xs text-secondary mb-3">
                     <span style={{ color: '#4ade80', fontWeight: 600 }}>{ev.evidenceType?.toUpperCase()}</span>
                     &nbsp;· Sealed by {ev.uploadedBy?.name || 'Officer'}
                  </div>
                  {/* Hash seal — read-only, permanently displayed */}
                  <div className="flex justify-between items-center text-[10px] font-mono border-t border-color pt-3">
                     <span className="flex items-center gap-1 text-green-400">
                        <Lock size={10} /> SEALED
                     </span>
                     <span className="text-secondary truncate w-32" title={ev.fileHash}>
                        {ev.fileHash?.substring(0, 14)}...
                     </span>
                  </div>
                  <div className="text-[10px] text-secondary mt-1">
                     {ev.uploadTimestamp ? new Date(ev.uploadTimestamp).toLocaleString() : new Date(ev.createdAt).toLocaleString()}
                  </div>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};

export default EvidenceVault;
