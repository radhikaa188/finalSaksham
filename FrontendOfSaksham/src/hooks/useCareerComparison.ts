import { useState } from 'react';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface CareerComparisonData {
  career: string;
  avgSalary: {
    entry: string;
    mid: string;
    senior: string;
  };
  topSkills: string[];
  jobAvailability: {
    overall: 'High' | 'Medium' | 'Low';
    inCity: string;
    topCities: string[];
  };
  difficulty: {
    level: 'Easy' | 'Moderate' | 'Hard';
    timeToJob: string;
    learningCurve: string;
  };
  pros: string[];
  cons: string[];
  bestFor: string;
  indiaScope: string;
  freelanceScope: 'High' | 'Medium' | 'Low';
  score: number; // 1-10 overall score
}

export interface ComparisonResult {
  careers: CareerComparisonData[];
  verdict: string;
  recommendation: string;
}

export function useCareerComparison() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ComparisonResult | null>(null);

  const compare = async (
    careers: string[],
    userCity: string,
    userGoal: string,
    userEducation: string
  ) => {
    setLoading(true);
    setError(null);
    setResult(null);

    const prompt = `You are a career counselor specializing in India's job market, especially for tier-2 and tier-3 city students.

Compare these careers for a student in ${userCity || 'India'} with goal: "${userGoal}" and education: "${userEducation}".

Careers to compare: ${careers.join(', ')}

Return ONLY a valid JSON object (no markdown, no backticks) in this exact format:
{
  "careers": [
    {
      "career": "Career Name",
      "avgSalary": {
        "entry": "₹3-5 LPA",
        "mid": "₹8-12 LPA",
        "senior": "₹18-25 LPA"
      },
      "topSkills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4"],
      "jobAvailability": {
        "overall": "High",
        "inCity": "Moderate demand in ${userCity || 'your city'}, strong remote options",
        "topCities": ["Bengaluru", "Hyderabad", "Pune"]
      },
      "difficulty": {
        "level": "Moderate",
        "timeToJob": "6-8 months",
        "learningCurve": "Steep initially but rewarding"
      },
      "pros": ["Pro 1", "Pro 2", "Pro 3"],
      "cons": ["Con 1", "Con 2"],
      "bestFor": "Students who enjoy problem solving and logic",
      "indiaScope": "Very high demand, especially in product companies",
      "freelanceScope": "High",
      "score": 8
    }
  ],
  "verdict": "One sentence comparing all careers",
  "recommendation": "Based on your goal of ${userGoal} in ${userCity || 'India'}, we recommend X because..."
}

Make salary figures realistic for India 2024. Make city-specific advice relevant for ${userCity || 'Indian'} students. Keep pros/cons to 3 each max.`;

    try {
      const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      const data = await res.json();
      console.log('Groq raw response:', JSON.stringify(data, null, 2));

      // Check for API-level errors
      if (data.error) {
        console.error('Groq API error:', data.error);
        setError(`API Error: ${data.error.message || 'Unknown error'}`);
        return;
      }

      const text = data?.choices?.[0]?.message?.content || '';
      console.log('Groq text:', text);

      if (!text) {
        setError('Empty response from Groq. Please try again.');
        return;
      }

      // Strip any accidental markdown fences
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed: ComparisonResult = JSON.parse(clean);
      setResult(parsed);
    } catch (err) {
      console.error('Gemini comparison error:', err);
      setError(`Failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return { compare, loading, error, result };
}