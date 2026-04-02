// Simple AI test with battle system
require('dotenv').config();
const { analyseApplication, AIBattleService } = require('./dist/services/ai.service');

async function testAI() {
  console.log('🚀 Testing AI Battle Service...');
  
  const input = {
    cvText: `Name: Foudhil Riahi
Email: foudhilriahi@gmail.com
Location: Tunis, Tunisia

EDUCATION
Bachelor's in Software Engineering — University of Tunis, 2020

EXPERIENCE
Software Engineer @ TechCorp (2020–2024)
- React, Node.js, PostgreSQL, Docker, AWS
- Led team of 3 on e-commerce platform

SKILLS: JavaScript, TypeScript, Python, React, Next.js, MongoDB, Redis, Git, CI/CD
LANGUAGES: French (native), English (fluent), Arabic (native)`,
    offerTitle: 'Acheteur Strategique',
    requiredSkills: ['Negotiation', 'Supply Chain Management', 'SAP', 'Vendor Management'],
    experienceYears: 3,
    description: 'Strategic buyer responsible for supplier negotiations, cost optimization, and supply chain management in automotive industry.'
  };

  try {
    console.log('⚔️ Starting AI Battle...');
    const battle = await AIBattleService.battle(input);
    
    console.log('🏁 Battle Results:');
    console.log(`📊 Models fired: ${battle.totalFired}`);
    console.log(`📊 Models succeeded: ${battle.totalSucceeded}`);
    console.log(`📊 Duration: ${battle.duration}ms`);
    console.log('');
    
    console.log('🏆 Consensus Result:');
    console.log(`📊 Provider: ${battle.consensus.aiProvider}`);
    console.log(`📊 Score: ${battle.consensus.score}/100`);
    console.log(`📊 Recommendation: ${battle.consensus.recommendation}`);
    console.log(`📊 Confidence: ${battle.consensus.confidence}%`);
    console.log(`📊 Language: ${battle.consensus.language}`);
    console.log(`📊 Strengths: ${JSON.stringify(battle.consensus.strengths, null, 2)}`);
    console.log(`📊 Gaps: ${JSON.stringify(battle.consensus.gaps, null, 2)}`);
    console.log(`📊 Tips: ${JSON.stringify(battle.consensus.tipsForCandidate, null, 2)}`);
    
    if (battle.results.length > 1) {
      console.log('');
      console.log('🔍 Individual Results:');
      battle.results.forEach((result, i) => {
        console.log(`${i + 1}. ${result.aiProvider}: Score ${result.score}, ${result.recommendation}`);
      });
    }
    
  } catch (error) {
    console.error('❌ AI Battle failed:', error.message);
  }
}

testAI();