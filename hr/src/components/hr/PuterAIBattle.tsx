import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Zap, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

// Puter.js models for HR second opinion
const PUTER_MODELS = [
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', color: '#10b981' },
  { id: 'claude-haiku-4-5', name: 'Claude Haiku', provider: 'Anthropic', color: '#f59e0b' },
  { id: 'gemini-2.0-flash', name: 'Gemini Flash', provider: 'Google', color: '#3b82f6' },
  { id: 'mistral-large-latest', name: 'Mistral Large', provider: 'Mistral', color: '#ec4899' },
];

interface PuterAIBattleProps {
  analysisText: string;
  jobTitle: string;
  requiredSkills: string[];
  experienceYears: number;
  description: string;
  onResults?: (results: any[]) => void;
}

interface ModelResult {
  id: string;
  name: string;
  provider: string;
  color: string;
  status: 'pending' | 'running' | 'success' | 'error';
  result?: any;
  error?: string;
  duration?: number;
}

export default function PuterAIBattle({
  analysisText,
  jobTitle,
  requiredSkills,
  experienceYears,
  description,
  onResults
}: PuterAIBattleProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isBattling, setIsBattling] = useState(false);
  const [models, setModels] = useState<ModelResult[]>([]);
  const [consensus, setConsensus] = useState<any>(null);

  // Check Puter.js authentication on mount
  useEffect(() => {
    checkPuterAuth();
  }, []);

  const checkPuterAuth = async () => {
    try {
      const puter = typeof window !== 'undefined' ? (window as any).puter : null;
      if (puter?.auth) {
        const user = await puter.auth.getUser();
        setIsAuthenticated(!!user);
      }
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const signInToPuter = async () => {
    try {
      const puter = typeof window !== 'undefined' ? (window as any).puter : null;
      if (puter?.auth) {
        await puter.auth.signIn();
        await checkPuterAuth();
        toast.success('Signed in to Puter.js');
      }
    } catch (error) {
      toast.error('Failed to sign in to Puter.js');
    }
  };

  const buildPrompt = () => {
    return `You are a senior HR recruiter at Schulte Automotive Tunisia, a German-owned cable assembly factory.
Analyze this candidate's CV against the job requirements with professional depth.

JOB POSITION: ${jobTitle}
REQUIRED SKILLS: ${requiredSkills.join(', ')}
MINIMUM EXPERIENCE: ${experienceYears} years
JOB DESCRIPTION: ${description}

CANDIDATE CV:
${analysisText.substring(0, 5000)}

EVALUATION CRITERIA:
1. TECHNICAL SKILLS MATCH (40%): required skills present? proficiency level? certifications?
2. EXPERIENCE RELEVANCE (30%): years vs required, industry fit (automotive preferred), progression
3. EDUCATION (15%): degree relevance, certifications
4. SOFT SKILLS (15%): French/English/German/Arabic, teamwork, leadership, communication

SCORING:
- 85–100 → Hire
- 70–84  → Interview
- 50–69  → Interview (conditional)
- <50    → Reject

Return ONLY valid JSON — no markdown, no backticks, no explanation:
{"score":<0-100>,"strengths":["s1","s2","s3"],"gaps":["g1","g2"],"recommendation":"<Hire|Interview|Reject>","tipsForCandidate":["t1","t2"],"confidence":<0-100>,"language":"<detected CV language>"}`;
  };

  const parseResponse = (raw: string, modelName: string) => {
    try {
      let cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      const jsonStart = cleaned.indexOf('{');
      const jsonEnd = cleaned.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
      }

      const parsed = JSON.parse(cleaned);
      const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 60)));
      const validRecs = ['Hire', 'Interview', 'Reject'];
      const recommendation = validRecs.includes(parsed.recommendation) ? parsed.recommendation : 'Interview';

      return {
        score,
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 5) : ['Analysis completed'],
        gaps: Array.isArray(parsed.gaps) ? parsed.gaps.slice(0, 3) : ['Manual review recommended'],
        recommendation,
        tipsForCandidate: Array.isArray(parsed.tipsForCandidate) ? parsed.tipsForCandidate.slice(0, 3) : ['Highlight relevant skills'],
        aiProvider: modelName,
        confidence: Math.max(0, Math.min(100, Math.round(Number(parsed.confidence) || 75))),
        language: parsed.language || 'Unknown'
      };
    } catch (error) {
      throw new Error(`Failed to parse JSON response: ${error}`);
    }
  };

  const callPuterModel = async (model: any): Promise<any> => {
    const prompt = buildPrompt();

    const puter = typeof window !== 'undefined' ? (window as any).puter : null;
    if (puter?.ai) {
      const stream = await puter.ai.chat(prompt, {
        model: model.id, 
        stream: true,
        temperature: 0.2,
        max_tokens: 2000
      });

      let text = '';
      for await (const part of stream) {
        if (typeof part === 'string') {
          text += part;
        } else {
          text += part?.text || '';
        }
      }

      return parseResponse(text, `${model.name} (Puter.js)`);
    } else {
      throw new Error('Puter.js not available');
    }
  };

  const startBattle = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to Puter.js first');
      return;
    }

    setIsBattling(true);
    setConsensus(null);
    
    // Initialize model states
    const initialModels = PUTER_MODELS.map(model => ({
      ...model,
      status: 'pending' as const
    }));
    setModels(initialModels);

    const results: any[] = [];
    const promises = PUTER_MODELS.map(async (model, index) => {
      const startTime = Date.now();
      
      // Update status to running
      setModels(prev => prev.map((m, i) => 
        i === index ? { ...m, status: 'running' } : m
      ));

      try {
        const result = await callPuterModel(model);
        const duration = Date.now() - startTime;
        
        // Update status to success
        setModels(prev => prev.map((m, i) => 
          i === index ? { ...m, status: 'success', result, duration } : m
        ));
        
        results.push(result);
        return result;
      } catch (error: any) {
        // Update status to error
        setModels(prev => prev.map((m, i) => 
          i === index ? { ...m, status: 'error', error: error.message } : m
        ));
        
        return null;
      }
    });

    // Wait for all models to complete
    await Promise.allSettled(promises);
    
    // Generate consensus from successful results
    const successfulResults = results.filter(r => r !== null);
    
    if (successfulResults.length > 0) {
      const avgScore = Math.round(successfulResults.reduce((sum, r) => sum + r.score, 0) / successfulResults.length);
      
      // Get most common recommendation
      const recCounts = successfulResults.reduce((acc, r) => {
        acc[r.recommendation] = (acc[r.recommendation] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const topRec = Object.entries(recCounts).sort(([,a], [,b]) => (b as number) - (a as number))[0][0];
      
      const consensusResult = {
        score: avgScore,
        recommendation: topRec,
        confidence: Math.round(successfulResults.reduce((sum, r) => sum + r.confidence, 0) / successfulResults.length),
        aiProvider: `Puter.js Consensus (${successfulResults.length} models)`,
        strengths: [...new Set(successfulResults.flatMap(r => r.strengths))].slice(0, 4),
        gaps: [...new Set(successfulResults.flatMap(r => r.gaps))].slice(0, 3),
        tipsForCandidate: [...new Set(successfulResults.flatMap(r => r.tipsForCandidate))].slice(0, 3),
        language: successfulResults[0]?.language || 'Unknown'
      };
      
      setConsensus(consensusResult);
      onResults?.(successfulResults);
      
      toast.success(`Puter.js battle complete: ${successfulResults.length}/${PUTER_MODELS.length} models succeeded`);
    } else {
      toast.error('All Puter.js models failed');
    }
    
    setIsBattling(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-gray-400" />;
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600 bg-green-100';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (!analysisText || analysisText.length < 50) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">No CV text available for Puter.js analysis</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-sm">Puter.js AI Battle</h3>
          <Badge variant="outline" className="text-xs">Second opinion</Badge>
        </div>
        
        {!isAuthenticated ? (
          <Button size="sm" variant="outline" onClick={signInToPuter}>
            Sign in (free)
          </Button>
        ) : (
          <Button 
            size="sm" 
            onClick={startBattle} 
            disabled={isBattling}
            className="gap-2"
          >
            {isBattling ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Battling...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Start Battle
              </>
            )}
          </Button>
        )}
      </div>

      {/* Authentication Status */}
      {!isAuthenticated && (
        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-700">
            Sign in to Puter.js for free access to GPT-4o, Claude, Gemini, and Mistral models
          </p>
        </div>
      )}

      {/* Model Status Grid */}
      {models.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {models.map((model) => (
            <div key={model.id} className="p-3 border rounded-lg bg-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: model.color }}
                  />
                  <span className="text-xs font-medium">{model.name}</span>
                </div>
                {getStatusIcon(model.status)}
              </div>
              
              <div className="text-xs text-gray-500 mb-1">{model.provider}</div>
              
              {model.status === 'success' && model.result && (
                <div className="space-y-1">
                  <div className={`text-xs font-bold px-2 py-1 rounded ${getScoreColor(model.result.score)}`}>
                    {model.result.score}/100
                  </div>
                  <div className="text-xs text-gray-600">
                    {model.result.recommendation} • {model.duration}ms
                  </div>
                </div>
              )}
              
              {model.status === 'error' && (
                <div className="text-xs text-red-600 truncate" title={model.error}>
                  {model.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Consensus Result */}
      {consensus && (
        <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-3">
            <Bot className="h-4 w-4 text-purple-600" />
            <span className="font-semibold text-sm">Puter.js consensus</span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-3">
            <div className="text-center">
              <div className={`text-2xl font-bold px-3 py-2 rounded-lg ${getScoreColor(consensus.score)}`}>
                {consensus.score}
              </div>
              <div className="text-xs text-gray-600 mt-1">Score</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-800">
                {consensus.recommendation}
              </div>
              <div className="text-xs text-gray-600 mt-1">Recommendation</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-800">
                {consensus.confidence}%
              </div>
              <div className="text-xs text-gray-600 mt-1">Confidence</div>
            </div>
          </div>
          
          {consensus.strengths?.length > 0 && (
            <div className="mb-2">
              <div className="text-xs font-semibold text-green-700 mb-1">Strengths</div>
              <div className="text-xs text-green-600 space-y-0.5">
                {consensus.strengths.map((strength: string, i: number) => (
                  <div key={i}>• {strength}</div>
                ))}
              </div>
            </div>
          )}
          
          {consensus.gaps?.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-amber-700 mb-1">Gaps</div>
              <div className="text-xs text-amber-600 space-y-0.5">
                {consensus.gaps.map((gap: string, i: number) => (
                  <div key={i}>• {gap}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}