
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  FileUp, 
  ShieldCheck, 
  Download, 
  Loader2, 
  AlertCircle, 
  Cpu, 
  FileText, 
  Database,
  Lock,
  Unlock,
  Terminal,
  BrainCircuit
} from 'lucide-react';
import { AnalysisResult, ProcessMode } from './types';
import { 
    xorBuffer, 
    hexToUint8Array, 
    uint8ArrayToHex, 
    generateRandomKey,
    stringToUint8Array,
    base64ToUint8Array
} from './utils/cryptoUtils';
import { analyzeFileHeader } from './services/geminiService';
import KeyInput, { KeyMode } from './components/KeyInput';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<string>('');
  const [keyMode, setKeyMode] = useState<KeyMode>('hex');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [processedFileUrl, setProcessedFileUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<ProcessMode>(ProcessMode.ENCRYPT);

  // Initialize a random key on mount
  useEffect(() => {
    const key = generateRandomKey(16);
    setEncryptionKey(uint8ArrayToHex(key));
  }, []);

  // Derived key bytes for the operation
  const keyBytes = useMemo(() => {
    if (keyMode === 'hex') return hexToUint8Array(encryptionKey);
    if (keyMode === 'base64') return base64ToUint8Array(encryptionKey);
    return stringToUint8Array(encryptionKey);
  }, [encryptionKey, keyMode]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setProcessedFileUrl(null);
    setError(null);
    setAnalysis(null);

    setIsAnalyzing(true);
    try {
      const headerBlob = selectedFile.slice(0, 128);
      const reader = new FileReader();
      
      reader.onload = async () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const hexHeader = uint8ArrayToHex(new Uint8Array(arrayBuffer));
        const result = await analyzeFileHeader(selectedFile.name, selectedFile.size, hexHeader);
        setAnalysis(result);
        setIsAnalyzing(false);
      };
      reader.onerror = () => {
        setIsAnalyzing(false);
        setError("Failed to read file header for analysis.");
      };
      reader.readAsArrayBuffer(headerBlob);
    } catch (err) {
      console.error(err);
      setIsAnalyzing(false);
    }
  };

  const processFile = useCallback(async () => {
    if (!file || keyBytes.length === 0) {
        setError("Please provide a valid key.");
        return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const resultBuffer = xorBuffer(arrayBuffer, keyBytes);
        const blob = new Blob([resultBuffer], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        setProcessedFileUrl(url);
        setIsProcessing(false);
      };
      reader.onerror = () => {
        setIsProcessing(false);
        setError("Error reading file.");
      };
      reader.readAsArrayBuffer(file);
    } catch (err: any) {
      setIsProcessing(false);
      setError(err.message || "An unexpected error occurred during processing.");
    }
  }, [file, keyBytes]);

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8">
      {/* Header Section */}
      <header className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">XOR <span className="gradient-text">Cipher Lab</span></h1>
            <p className="text-gray-400 text-sm">Professional Bitwise Security Environment</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
          <button 
            onClick={() => setMode(ProcessMode.ENCRYPT)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${mode === ProcessMode.ENCRYPT ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            <Lock className="w-4 h-4" /> Encrypt
          </button>
          <button 
            onClick={() => setMode(ProcessMode.DECRYPT)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${mode === ProcessMode.DECRYPT ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            <Unlock className="w-4 h-4" /> Decrypt
          </button>
        </div>
      </header>

      <main className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Panel: File Input & Key */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass rounded-3xl p-6 md:p-8 space-y-8">
            {/* File Upload Area */}
            <div className="space-y-4">
              <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider block">Target File</label>
              <div className="relative group">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all ${file ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/10 group-hover:border-white/20'}`}>
                  {file ? (
                    <div className="flex items-center gap-4 text-left w-full">
                      <div className="p-4 bg-blue-500/10 rounded-xl text-blue-400">
                        <FileText className="w-8 h-8" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-lg truncate">{file.name}</p>
                        <p className="text-sm text-gray-400">{(file.size / 1024).toFixed(2)} KB • {file.type || 'Unknown Type'}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <FileUp className="w-12 h-12 text-gray-500 mb-4" />
                      <p className="text-lg font-medium text-gray-300">Drop your file here</p>
                      <p className="text-sm text-gray-500 mt-1">or click to browse local storage</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Key Input Component */}
            <KeyInput 
                keyValue={encryptionKey} 
                setKeyValue={setEncryptionKey} 
                mode={keyMode} 
                setMode={setKeyMode} 
            />

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4">
              {!processedFileUrl ? (
                <button
                  onClick={processFile}
                  disabled={!file || encryptionKey.length === 0 || isProcessing}
                  className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                    !file || encryptionKey.length === 0 || isProcessing
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-blue-500/20'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Computing XOR...
                    </>
                  ) : (
                    <>
                      <Cpu className="w-6 h-6" />
                      Process Bitwise {mode === ProcessMode.ENCRYPT ? 'Encryption' : 'Decryption'}
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-4">
                  <a
                    href={processedFileUrl}
                    download={mode === ProcessMode.ENCRYPT ? `${file?.name}.xor` : (file?.name.endsWith('.xor') ? file?.name.slice(0, -4) : `decrypted_${file?.name}`)}
                    className="w-full py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-xl shadow-green-500/20"
                  >
                    <Download className="w-6 h-6" />
                    Download Result
                  </a>
                  <button
                    onClick={() => {
                      setProcessedFileUrl(null);
                      setFile(null);
                    }}
                    className="w-full py-3 text-gray-400 hover:text-white transition-colors text-sm font-medium"
                  >
                    Reset & Process New File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: AI Analysis & Logs */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Advisor Panel */}
          <div className="glass rounded-3xl overflow-hidden">
            <div className="p-4 bg-blue-600/10 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Gemini AI Assistant</span>
              </div>
              {isAnalyzing && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
            </div>
            
            <div className="p-6 space-y-6">
              {!file ? (
                <div className="text-center py-8 space-y-4">
                  <Terminal className="w-12 h-12 text-gray-700 mx-auto" />
                  <p className="text-gray-500 text-sm">Upload a file to begin automated bitwise analysis and security auditing.</p>
                </div>
              ) : isAnalyzing ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-white/5 rounded w-3/4"></div>
                  <div className="h-4 bg-white/5 rounded w-full"></div>
                  <div className="h-20 bg-white/5 rounded w-full"></div>
                </div>
              ) : analysis ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                      <span className="text-[10px] text-gray-500 uppercase font-bold">Entropy</span>
                      <p className="text-xl font-bold text-blue-400">{(analysis.entropy * 100).toFixed(1)}%</p>
                    </div>
                    <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                      <span className="text-[10px] text-gray-500 uppercase font-bold">Detected Type</span>
                      <p className="text-lg font-bold text-purple-400 truncate">{analysis.perceivedType}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${analysis.isPotentiallyEncrypted ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'}`}></span>
                      <span className="text-xs text-gray-400 font-medium">
                        {analysis.isPotentiallyEncrypted ? 'Detected High Entropy Pattern' : 'Standard File Structure Verified'}
                      </span>
                    </div>
                    <div className="p-4 bg-blue-500/5 rounded-2xl text-sm text-gray-300 leading-relaxed border border-blue-500/10 italic">
                      &ldquo;{analysis.suggestion}&rdquo;
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {/* System Telemetry */}
          <div className="glass rounded-3xl p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
              <Database className="w-4 h-4" />
              Runtime Telemetry
            </h3>
            <div className="space-y-3 mono text-[11px] text-gray-500">
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span>Operation</span>
                <span className="text-gray-300 uppercase">{mode}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span>Algorithm</span>
                <span className="text-gray-300">SYMMETRIC_XOR</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span>Key Length</span>
                <span className="text-gray-300">{keyBytes.length * 8} bits</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span>Format</span>
                <span className="text-gray-300 uppercase">{keyMode}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-auto py-8 text-gray-600 text-[11px] uppercase tracking-widest font-bold">
        Secure Client-Side Execution &bull; Powered by Gemini LLM
      </footer>
    </div>
  );
};

export default App;
