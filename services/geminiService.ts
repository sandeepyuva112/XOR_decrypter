
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeFileHeader = async (
  fileName: string,
  fileSize: number,
  headerHex: string
): Promise<AnalysisResult> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            text: `Analyze this file header (first few bytes in hex) for a file named "${fileName}" with size ${fileSize} bytes. 
            
            Hex Header Data: ${headerHex}

            Identify if it looks like a standard file (check for magic numbers/signatures like PDF, ZIP, PNG, etc.) or if it's potentially already encrypted (high entropy, lack of known signatures).
            Suggest if XOR encryption is suitable and provide a brief security tip regarding the file type and bitwise operations.`
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          suggestion: { type: Type.STRING, description: "Detailed analysis and security advice." },
          entropy: { type: Type.NUMBER, description: "A score from 0.0 to 1.0 representing estimated data randomness." },
          perceivedType: { type: Type.STRING, description: "The likely original file type based on signatures." },
          isPotentiallyEncrypted: { type: Type.BOOLEAN, description: "Whether the file appears to be encrypted already." }
        },
        required: ["suggestion", "entropy", "perceivedType", "isPotentiallyEncrypted"]
      }
    }
  });

  try {
    const text = response.text || "{}";
    return JSON.parse(text) as AnalysisResult;
  } catch (e) {
    return {
      suggestion: "Unable to analyze file content deeply, but XOR will work as a basic obfuscation layer.",
      entropy: 0.5,
      perceivedType: "Unknown",
      isPotentiallyEncrypted: false
    };
  }
};
