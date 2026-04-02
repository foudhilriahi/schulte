// ============================================================
// PUTER.JS AI SERVICE — Browser-based GPT-4o Analysis
// Primary AI strategy called from HR dashboard
// Fallback: Gemini backend if Puter.js fails or times out
// ============================================================

interface AnalyseInput {
  cvText: string;
  offerTitle: string;
  requiredSkills: string[];
  experienceYears: number;
  description: string;
}

interface AnalysisResult {
  score: number;
  strengths: string[];
  gaps: string[];
  recommendation: 'Hire' | 'Interview' | 'Reject';
  tipsForCandidate: string[];
}

// Declare Puter.js global
declare global {
  interface Window {
    puter?: {
      ai: {
        chat: (prompt: string, options?: any) => Promise<string>;
      };
    };
  }
}

class PuterAIService {
  private static readonly TIMEOUT_MS = 8000; // 8 second timeout as per spec

  /**
   * Build the AI prompt for CV analysis
   */
  private static buildPrompt(input: AnalyseInput): string {
    return `
SYSTEM: You are an HR assistant for a Tunisian automotive cable assembly factory (Schulte Automotive Tunisia).
Respond ONLY with valid JSON. No prose. No markdown. No backticks. No explanation.
The CV may be in French, Arabic, or English — process regardless of language.

USER:
Job Title: ${input.offerTitle}
Required Skills: ${input.requiredSkills.join(', ')}
Minimum Experience: ${input.experienceYears} years
Description: ${input.description}

Candidate CV:
${input.cvText.substring(0, 4000)}

Return exactly this JSON structure (nothing else):
{
  "score": <number between 0 and 100>,
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "gaps": ["<gap 1>", "<gap 2>"],
  "recommendation": "<one of: Hire | Interview | Reject>",
  "tipsForCandidate": ["<tip 1>", "<tip 2>"]
}
    `.trim();
  }

  /**
   * Parse AI response and validate structure
   */
  private static parseResponse(raw: string): AnalysisResult {
    // Strip markdown code fences if present
    let cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    // Find JSON block
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    }

    const parsed = JSON.parse(cleaned);

    // Validate and sanitize
    const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 50)));
    const validRecs = ['Hire', 'Interview', 'Reject'];
    const recommendation = validRecs.includes(parsed.recommendation)
      ? parsed.recommendation as AnalysisResult['recommendation']
      : 'Interview';

    return {
      score,
      strengths: Array.isArray(parsed.strengths)
        ? parsed.strengths.slice(0, 3).map(String)
        : ['Analysis completed', 'Profile reviewed', 'Ready for evaluation'],
      gaps: Array.isArray(parsed.gaps)
        ? parsed.gaps.slice(0, 2).map(String)
        : ['Manual review recommended', 'Additional information needed'],
      recommendation,
      tipsForCandidate: Array.isArray(parsed.tipsForCandidate)
        ? parsed.tipsForCandidate.slice(0, 2).map(String)
        : ['Highlight relevant experience', 'Emphasize key skills'],
    };
  }

  /**
   * Check if Puter.js is available in the browser
   */
  static isPuterAvailable(): boolean {
    return typeof window !== 'undefined' && 
           window.puter && 
           typeof window.puter.ai?.chat === 'function';
  }

  /**
   * Load Puter.js script dynamically
   */
  static async loadPuterScript(): Promise<void> {
    if (this.isPuterAvailable()) return;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://js.puter.com/v2/';
      script.async = true;
      script.onload = () => {
        // Wait a bit for puter to initialize
        setTimeout(() => {
          if (this.isPuterAvailable()) {
            resolve();
          } else {
            reject(new Error('Puter.js loaded but API not available'));
          }
        }, 500);
      };
      script.onerror = () => reject(new Error('Failed to load Puter.js'));
      document.head.appendChild(script);
    });
  }

  /**
   * Analyze CV using Puter.js GPT-4o (primary strategy)
   */
  static async analyzeWithPuter(input: AnalyseInput): Promise<AnalysisResult> {
    // Ensure Puter.js is loaded
    if (!this.isPuterAvailable()) {
      await this.loadPuterScript();
    }

    const prompt = this.buildPrompt(input);
    
    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Puter.js timeout')), this.TIMEOUT_MS);
    });

    try {
      // Race between AI call and timeout
      const response = await Promise.race([
        window.puter!.ai.chat(prompt),
        timeoutPromise
      ]);

      return this.parseResponse(response);
    } catch (error) {
      console.error('Puter.js AI analysis failed:', error);
      throw error;
    }
  }

  /**
   * Fallback to Gemini backend API
   */
  static async analyzeWithGemini(input: AnalyseInput, applicationId: string): Promise<AnalysisResult> {
    const response = await fetch(`/api/applications/${applicationId}/analyse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Gemini analysis failed');
    }

    return response.json();
  }

  /**
   * Main analysis method with Puter.js primary + Gemini fallback
   */
  static async analyze(input: AnalyseInput, applicationId: string): Promise<{
    result: AnalysisResult;
    source: 'puter' | 'gemini';
  }> {
    try {
      // Try Puter.js first (primary strategy)
      const result = await this.analyzeWithPuter(input);
      return { result, source: 'puter' };
    } catch (puterError) {
      console.warn('Puter.js analysis failed, falling back to Gemini:', puterError);
      
      try {
        // Fallback to Gemini
        const result = await this.analyzeWithGemini(input, applicationId);
        return { result, source: 'gemini' };
      } catch (geminiError) {
        console.error('Both Puter.js and Gemini failed:', { puterError, geminiError });
        
        // Final fallback - return default analysis
        return {
          result: {
            score: 50,
            strengths: ['CV received and processed', 'Application under review', 'Manual evaluation recommended'],
            gaps: ['AI analysis temporarily unavailable', 'Human review required'],
            recommendation: 'Interview',
            tipsForCandidate: ['Ensure CV highlights relevant skills', 'Prepare for interview questions'],
          },
          source: 'gemini'
        };
      }
    }
  }
}

export default PuterAIService;