
import React, { useState, useMemo } from 'react';
import { RefreshCw, Copy, Key, Type, Hash, Binary, MoreHorizontal, Eraser, Zap } from 'lucide-react';
import { 
  generateRandomKey, 
  uint8ArrayToHex, 
  hexToUint8Array, 
  stringToUint8Array, 
  uint8ArrayToString,
  base64ToUint8Array,
  uint8ArrayToBase64
} from '../utils/cryptoUtils';

export type KeyMode = 'hex' | 'text' | 'base64';

interface KeyInputProps {
  keyValue: string;
  setKeyValue: (val: string) => void;
  mode: KeyMode;
  setMode: (mode: KeyMode) => void;
}

const KeyInput: React.FC<KeyInputProps> = ({ keyValue, setKeyValue, mode, setMode }) => {
  const [showOptions, setShowOptions] = useState(false);

  const keyBytes = useMemo(() => {
    if (mode === 'hex') return hexToUint8Array(keyValue);
    if (mode === 'base64') return base64ToUint8Array(keyValue);
    return stringToUint8Array(keyValue);
  }, [keyValue, mode]);

  const handleGenerate = () => {
    const newKey = generateRandomKey(16); // 128-bit
    if (mode === 'hex') setKeyValue(uint8ArrayToHex(newKey));
    else if (mode === 'base64') setKeyValue(uint8ArrayToBase64(newKey));
    else setKeyValue(uint8ArrayToString(newKey).replace(/[^\x20-\x7E]/g, '?'));
  };

  const handleModeSwitch = (newMode: KeyMode) => {
    if (newMode === mode) return;
    
    // Attempt conversion
    let newValue = '';
    if (newMode === 'hex') newValue = uint8ArrayToHex(keyBytes);
    else if (newMode === 'base64') newValue = uint8ArrayToBase64(keyBytes);
    else {
        const str = uint8ArrayToString(keyBytes);
        newValue = str === "[Binary Content]" ? "" : str;
    }
    
    setMode(newMode);
    setKeyValue(newValue);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(keyValue);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Key className="w-4 h-4" />
          Cipher Key {keyBytes.length > 0 && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">{keyBytes.length * 8} bits</span>}
        </label>
        
        {/* Mode Switcher */}
        <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 self-start sm:self-auto">
            {(['hex', 'text', 'base64'] as KeyMode[]).map((m) => (
                <button
                    key={m}
                    onClick={() => handleModeSwitch(m)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${mode === m ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    {m}
                </button>
            ))}
        </div>
      </div>

      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors pointer-events-none">
            {mode === 'hex' ? <Hash className="w-4 h-4" /> : mode === 'text' ? <Type className="w-4 h-4" /> : <Binary className="w-4 h-4" />}
        </div>
        <input
          type="text"
          value={keyValue}
          onChange={(e) => setKeyValue(e.target.value)}
          placeholder={mode === 'hex' ? 'Enter Hex (e.g. deadbeef...)' : mode === 'text' ? 'Enter Passphrase...' : 'Enter Base64...'}
          className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-24 py-3 mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-700"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
                onClick={() => setShowOptions(!showOptions)}
                className={`p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all ${showOptions ? 'bg-white/10 text-white' : ''}`}
                title="Sub-Options"
            >
                <MoreHorizontal className="w-4 h-4" />
            </button>
            <button
                onClick={copyToClipboard}
                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
                title="Copy Key"
            >
                <Copy className="w-4 h-4" />
            </button>
        </div>

        {/* Sub-Options Dropdown */}
        {showOptions && (
            <div className="absolute right-0 top-full mt-2 w-48 glass rounded-2xl shadow-2xl z-50 p-2 border border-white/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 mb-1">Key Wizard</div>
                <button 
                    onClick={handleGenerate}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 hover:bg-blue-500/10 text-gray-300 hover:text-blue-400 transition-colors"
                >
                    <RefreshCw className="w-3 h-3" /> Randomize Key
                </button>
                <button 
                    onClick={() => { setKeyValue(""); setShowOptions(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 hover:bg-red-500/10 text-gray-300 hover:text-red-400 transition-colors"
                >
                    <Eraser className="w-3 h-3" /> Clear Field
                </button>
                <div className="h-px bg-white/5 my-1" />
                <button 
                    onClick={() => { handleModeSwitch(mode === 'hex' ? 'text' : 'hex'); setShowOptions(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 hover:bg-purple-500/10 text-gray-300 hover:text-purple-400 transition-colors"
                >
                    <Zap className="w-3 h-3" /> {mode === 'hex' ? 'Hex to Text' : 'Text to Hex'}
                </button>
            </div>
        )}
      </div>

      <div className="flex items-start gap-2 px-1">
          <div className="p-1 bg-amber-500/10 rounded border border-amber-500/20">
              <Binary className="w-3 h-3 text-amber-500" />
          </div>
          <p className="text-[10px] text-gray-500 leading-tight">
            Bitwise XOR uses the <span className="text-gray-300">byte representation</span> of your key. In Text mode, emojis or special characters will generate multi-byte keys.
          </p>
      </div>
    </div>
  );
};

export default KeyInput;
