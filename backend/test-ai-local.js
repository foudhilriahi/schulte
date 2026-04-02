// ============================================================
// LOCAL AI ANALYSIS TEST
// Run this to test AI analysis without the full app
// Usage: node test-ai-local.js
// ============================================================

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Sample CV text
const sampleCVText = `
Name: Foudhil Riahi
Email: foudhilriahi@gmail.com
Phone: +216 12345678
Location: Tunis, Tunisia

EDUCATION
Bachelor's Degree in Software Engineering
University of Tunis - 2020

PROFESSIONAL EXPERIENCE
Software Engineer at TechCorp (2020-2024)
- Developed web applications using React, Node.js, and PostgreSQL
- Led a team of 3 developers on e-commerce platform
- Implemented CI/CD pipelines and automated testing
- Technologies: JavaScript, TypeScript, Python, Docker, AWS

Junior Developer at StartupXYZ (2019-2020)
- Built REST APIs with Express.js
- Database design and optimization
- Agile methodology and Scrum practices

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, Java
Frameworks: React, Node.js, Express, Next.js
Databases: PostgreSQL, MongoDB, Redis
Tools: Git, Docker, AWS, CI/CD

LANGUAGES
French: Native
English: Fluent
Arabic: Native
`;

const jobRequirements = {
  title: "Acheteur Strategique",
  requiredSkills: ["Negotiation", "Supply Chain Management", "SAP", "Vendor Management"],
  experienceYears: 3,
  description: "Strategic buyer responsible for supplier negotiations, cost optimization, and supply chain management in automotive industry."
};

// Build the prompt
function buildPrompt() {
  return `You are a senior HR recruiter at Schulte Automotive Tunisia, a German-owned cable assembly factory.
Analyze this candidate's CV against the job requirements with professional depth.

JOB POSITION: ${jobRequirements.title}
REQUIRED SKILLS: ${jobRequirements.requiredSkills.join(', ')}
MINIMUM EXPERIENCE: ${jobRequirements.experienceYears} years
JOB DESCRIPTION: ${jobRequirements.description}

CANDIDATE CV:
${sampleCVText}

ANALYSIS INSTRUCTIONS:
Evaluate the candidate like a real HR professional would:

1. TECHNICAL SKILLS MATCH (40% weight):
   - Does the candidate have the required technical skills?
   - Are they proficient or just familiar?
   - Any certifications or specialized training?

2. EXPERIENCE RELEVANCE (30% weight):
   - Years of relevant experience vs required
   - Industry fit (automotive/manufacturing preferred)
   - Job titles and responsibilities alignment
   - Career progression and stability

3. EDUCATION & QUALIFICATIONS (15% weight):
   - Degree level and field relevance
   - Additional certifications
   - Continuous learning evidence

4. SOFT SKILLS & CULTURE FIT (15% weight):
   - Language skills (French, English, German, Arabic)
   - Teamwork and leadership indicators
   - Adaptability and problem-solving
   - Communication skills

SCORING GUIDE:
- 85-100: Excellent match, strong hire recommendation
- 70-84: Good match, recommend interview
- 50-69: Moderate match, interview if needed
- Below 50: Poor match, likely reject

Return ONLY valid JSON (no markdown, no explanation):
{
  "score": <number 0-100>,
  "strengths": ["<specific strength 1>", "<specific strength 2>", "<specific strength 3>"],
  "gaps": ["<specific gap 1>", "<specific gap 2>"],
  "recommendation": "<Hire|Interview|Reject>",
  "tipsForCandidate": ["<actionable tip 1>", "<actionable tip 2>"],
  "confidence": <number 0-100>,
  "language": "<detected CV language>"
}`;
}

// Helper: clean and parse JSON from model response
function parseJSON(raw) {
  let cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const jsonStart = cleaned.indexOf('{');
  const jsonEnd = cleaned.lastIndexOf('}');
  if (jsonStart !== -1 && jsonEnd !== -1) {
    cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
  }
  return JSON.parse(cleaned);
}

// Helper: display parsed result
function displayResult(parsed) {
  console.log('\n✅ Parsed JSON:\n');
  console.log(JSON.stringify(parsed, null, 2));
  console.log('\n📊 Analysis Summary:');
  console.log(`Score: ${parsed.score}/100`);
  console.log(`Recommendation: ${parsed.recommendation}`);
  console.log(`Confidence: ${parsed.confidence}%`);
  console.log(`Language: ${parsed.language}`);
  console.log(`\nStrengths:`);
  parsed.strengths.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
  console.log(`\nGaps:`);
  parsed.gaps.forEach((g, i) => console.log(`  ${i + 1}. ${g}`));
}

// Helper: extract retry delay in ms from Gemini 429 error message
function extractGeminiRetryDelay(errorMessage) {
  const match = errorMessage.match(/Please retry in ([\d.]+)s/);
  if (match) {
    return Math.ceil(parseFloat(match[1])) * 1000;
  }
  return 35000; // default 35s if not parseable
}

// ============================================================
// TEST GEMINI
// - Falls back through 4 models (each has its own quota pool)
// - On per-minute 429: waits the exact delay Google specifies
// - On daily quota exhausted (limit: 0): skips to next model
// ============================================================
async function testGemini() {
  console.log('\n🤖 Testing Gemini API...\n');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in .env file');
    return;
  }

  console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...`);

  // Each model has its own separate daily quota pool
  const modelFallbacks = [
    'gemini-2.0-flash',       // primary choice
    'gemini-2.0-flash-lite',  // lighter, higher free quota
    'gemini-1.5-flash',       // older but very generous free tier
    'gemini-1.5-flash-8b',    // smallest model, highest free quota
  ];

  const genAI = new GoogleGenerativeAI(apiKey);
  const prompt = buildPrompt();

  for (const modelName of modelFallbacks) {
    console.log(`📤 Trying model: ${modelName}...`);

    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { temperature: 0.2, maxOutputTokens: 2000 }
      });

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      console.log(`\n✅ Gemini Response (via ${modelName}):\n`);
      console.log(response);

      try {
        displayResult(parseJSON(response));
      } catch (parseError) {
        console.error('\n❌ Failed to parse JSON:', parseError.message);
      }

      return; // success — stop

    } catch (error) {
      const is429 = error.message.includes('429') || error.message.includes('Too Many Requests');
      const isDailyExhausted = error.message.includes('limit: 0');

      if (is429 && isDailyExhausted) {
        // Daily quota fully used up — trying this model again is pointless
        console.warn(`⚠️  Daily quota exhausted for ${modelName}, trying next model...`);
        continue;

      } else if (is429) {
        // Per-minute rate limit — wait exactly as long as Google asks, then retry once
        const delayMs = extractGeminiRetryDelay(error.message);
        console.log(`⏳ Rate limited. Waiting ${Math.ceil(delayMs / 1000)}s as requested by Google...`);
        await new Promise(r => setTimeout(r, delayMs));

        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: { temperature: 0.2, maxOutputTokens: 2000 }
          });
          const result = await model.generateContent(prompt);
          const response = result.response.text();
          console.log(`\n✅ Gemini Response (via ${modelName} after retry):\n`);
          console.log(response);
          try { displayResult(parseJSON(response)); } catch (e) { console.error('\n❌ JSON parse error:', e.message); }
          return;
        } catch (retryError) {
          console.warn(`⚠️  Retry also failed for ${modelName}, trying next model...`);
          continue;
        }

      } else {
        // Any other error — not a quota issue
        console.error(`\n❌ Gemini Error on ${modelName}:`, error.message);
        return;
      }
    }
  }

  // All models exhausted
  console.error('\n❌ All Gemini models have hit their daily quota.');
  console.error('💡 Solutions:');
  console.error('   1. Wait until midnight Pacific Time — quotas reset daily');
  console.error('   2. Enable billing at https://ai.google.dev to unlock paid limits');
  console.error('   3. Create a new Google Cloud project with a fresh API key');
}

// ============================================================
// TEST OPENROUTER
// - Tries 5 different free models from different providers
// - Each provider has independent rate limits
// - Short wait on 429 before trying next model
// ============================================================
async function testOpenRouter() {
  console.log('\n🤖 Testing OpenRouter API...\n');

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error('❌ OPENROUTER_API_KEY not found in .env file');
    return;
  }

  console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...`);

  // Models from different providers — independent rate limits
  const modelFallbacks = [
    'meta-llama/llama-3.3-70b-instruct:free',    // Meta — best quality free
    'mistralai/mistral-7b-instruct:free',          // Mistral — very reliable
    'google/gemma-3-4b-it:free',                   // Google Gemma
    'deepseek/deepseek-r1-distill-llama-70b:free', // DeepSeek
    'microsoft/phi-3-mini-128k-instruct:free',     // Microsoft — lightweight
  ];

  const prompt = buildPrompt();

  for (const modelName of modelFallbacks) {
    console.log(`\n📤 Trying model: ${modelName}...`);

    const requestOptions = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://schulte-tunisia.com',
        'X-Title': 'Schulte Tunisia Recruitment'
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: 'user', content: prompt }]
      })
    };

    // Try each model twice: once immediately, once after a wait on 429
    let succeeded = false;
    for (let attempt = 1; attempt <= 2; attempt++) {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', requestOptions);
      console.log(`📥 Response status: ${response.status}`);

      if (response.ok) {
        const data = await response.json();
        const raw = data.choices[0]?.message?.content || '';
        console.log(`\n✅ OpenRouter Response (via ${modelName}):\n`);
        console.log(raw);
        try { displayResult(parseJSON(raw)); } catch (e) { console.error('\n❌ JSON parse error:', e.message); }
        succeeded = true;
        break;
      }

      if (response.status === 429) {
        if (attempt === 1) {
          console.log(`⏳ Rate limited. Waiting 8s before retry...`);
          await new Promise(r => setTimeout(r, 8000));
        } else {
          console.warn(`⚠️  Still rate limited on ${modelName}, skipping to next model...`);
        }
        continue;
      }

      // Non-429 error — log and move on
      const errorText = await response.text();
      console.error(`❌ Error ${response.status} on ${modelName}: ${errorText}`);
      break;
    }

    if (succeeded) return;
  }

  // All models failed
  console.error('\n❌ All OpenRouter free models are currently rate-limited.');
  console.error('💡 Solutions:');
  console.error('   1. Wait 1-2 minutes — free tier limits reset quickly');
  console.error('   2. Add credits at https://openrouter.ai/credits for paid access');
  console.error('   3. Connect your own API key at https://openrouter.ai/settings/integrations');
}

// ============================================================
// MAIN
// ============================================================
async function runTests() {
  console.log('='.repeat(60));
  console.log('LOCAL AI ANALYSIS TEST');
  console.log('='.repeat(60));

  console.log('\n📋 Job Requirements:');
  console.log(`Position: ${jobRequirements.title}`);
  console.log(`Required Skills: ${jobRequirements.requiredSkills.join(', ')}`);
  console.log(`Experience: ${jobRequirements.experienceYears} years`);

  console.log('\n📄 CV Preview:');
  console.log(sampleCVText.substring(0, 300) + '...');

  await testGemini();

  console.log('\n' + '='.repeat(60) + '\n');

  await testOpenRouter();

  console.log('\n' + '='.repeat(60));
  console.log('TESTS COMPLETE');
  console.log('='.repeat(60) + '\n');
}

runTests().catch(console.error);