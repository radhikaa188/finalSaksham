const { VertexAI } = require('@google-cloud/vertexai');
const { searchCourses } = require('./youtube');
const { speak } = require('./tts');
const Session = require('../models/Session');
const UserProfile = require('../models/UserProfile');

const credentials = JSON.parse(process.env.GCP_CREDENTIALS_JSON);
const vertex = new VertexAI({
  project: process.env.GOOGLE_PROJECT_ID,
  location: 'us-central1',
  googleAuthOptions: { credentials }
});

const tools = [{
  functionDeclarations: [
    {
      name: 'getFilteredCourses',
      description: 'Find courses filtered by language, level, and duration',
      parameters: {
        type: 'OBJECT',
        properties: {
          career: { type: 'STRING' },
          language: { type: 'STRING', enum: ['hindi', 'english', 'hinglish'] },
          level: { type: 'STRING', enum: ['beginner', 'intermediate', 'advanced'] },
          maxLength: { type: 'STRING', enum: ['short', 'long'] }
        },
        required: ['career']
      }
    },
    {
      name: 'getFilteredJobs',
      description: 'Get job platforms filtered by type and preference',
      parameters: {
        type: 'OBJECT',
        properties: {
          career: { type: 'STRING' },
          jobType: { type: 'STRING', enum: ['freelance', 'full-time', 'internship', 'both'] },
          location: { type: 'STRING' }
        },
        required: ['career']
      }
    },
    {
      name: 'getMoreCareers',
      description: 'Suggest more career options with specific filters',
      parameters: {
        type: 'OBJECT',
        properties: {
          userBackground: { type: 'STRING' },
          filterType: { type: 'STRING', enum: ['freelance', 'traditional', 'both'] },
          excludeCareers: { type: 'STRING' }
        },
        required: ['userBackground']
      }
    },
    {
      name: 'triggerUIAction',
      description: 'Trigger a UI action on the frontend — scroll to a section, open a URL, or highlight something',
      parameters: {
        type: 'OBJECT',
        properties: {
          action: {
            type: 'STRING',
            enum: ['scroll_to_courses', 'scroll_to_jobs', 'open_url', 'highlight_job'],
            description: 'Which UI action to trigger'
          },
          url: { type: 'STRING', description: 'URL to open (only for open_url action)' },
          jobName: { type: 'STRING', description: 'Job platform name to highlight (e.g. LinkedIn)' }
        },
        required: ['action']
      }
    }
  ]
}];

async function executeTool(name, args, userPreferences) {
  if (name === 'getFilteredCourses') {
    const filters = {
      language: args.language || userPreferences.language || 'hindi',
      level: args.level || userPreferences.level || 'beginner',
      maxLength: args.maxLength || 'long'
    };
    const courses = await searchCourses(args.career, filters);
    const udemyCourse = {
      title: `"${args.career}" ${filters.level} courses on Udemy`,
      platform: 'Udemy',
      url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(args.career)}&sort=highest-rated&lang=${filters.language === 'hindi' ? 'hi' : 'en'}`,
      level: filters.level,
      language: filters.language
    };
    return [...courses, udemyCourse];
  }

  if (name === 'getFilteredJobs') {
    const q = encodeURIComponent(args.career);
    const slug = args.career.toLowerCase().replace(/\s+/g, '-');
    const jobType = args.jobType || userPreferences.jobType || 'both';

    let platforms = [
      { name: 'LinkedIn', url: `https://www.linkedin.com/jobs/search/?keywords=${q}`, type: 'full-time', tip: 'दुनियाभर की नौकरियां' },
      { name: 'Naukri', url: `https://www.naukri.com/${slug}-jobs`, type: 'full-time', tip: 'भारत का नंबर 1 जॉब पोर्टल' },
      { name: 'Internshala', url: `https://internshala.com/internships/${slug}-internship`, type: 'internship', tip: 'Students के लिए best' },
      { name: 'Upwork', url: `https://www.upwork.com/nx/search/jobs/?q=${q}`, type: 'freelance', tip: 'International clients' },
      { name: 'Fiverr', url: `https://www.fiverr.com/search/gigs?query=${q}`, type: 'freelance', tip: 'Gig-based काम' },
      { name: 'Freelancer', url: `https://www.freelancer.in/jobs/${slug}/`, type: 'freelance', tip: 'Global projects' },
    ];

    if (jobType === 'freelance') platforms = platforms.filter(p => p.type === 'freelance');
    if (jobType === 'full-time') platforms = platforms.filter(p => p.type === 'full-time');
    if (jobType === 'internship') platforms = platforms.filter(p => p.type === 'internship');

    return platforms;
  }

  if (name === 'getMoreCareers') {
    const model = vertex.getGenerativeModel({ model: 'gemini-2.0-flash-001' });
    const exclude = args.excludeCareers ? `Do NOT suggest these: ${args.excludeCareers}` : '';
    const filter = args.filterType && args.filterType !== 'both' ? `Only ${args.filterType} careers.` : '';
    const result = await model.generateContent(`
      Person background: "${args.userBackground}"
      Suggest 5 MORE different career options. ${filter} ${exclude}
      Title in English, description in Hindi.
      Return ONLY raw JSON array:
      [{ "title": "...", "type": "freelance|traditional", "description": "..." }]
    `);
    const text = result.response.candidates[0].content.parts[0].text;
    const match = text.replace(/\`\`\`json|\`\`\`/g, '').match(/(\[[\s\S]*\])/);
    return JSON.parse(match[0]);
  }

  if (name === 'triggerUIAction') {
    // Bas action return karo — frontend handle karega
    return { triggered: true, action: args.action, url: args.url, jobName: args.jobName };
  }
}

async function runAgent(history, userMessage, context, userId) {
  let userPreferences = { language: 'hindi', level: 'beginner', jobType: 'both' };
  let pastCareers = [];

  if (userId) {
    const pastSessions = await Session.find({ userId }).sort({ createdAt: -1 }).limit(5);
    if (pastSessions.length > 0) {
      pastCareers = pastSessions.map(s => s.chosenCareer).filter(Boolean);
      const latest = pastSessions[0];
      userPreferences = {
        language: latest.preferredLanguage || 'hindi',
        level: latest.courseLevel || 'beginner',
        jobType: latest.preferredJobType || 'both'
      };
    } else {
      const profile = await UserProfile.findOne({ userId });
      if (profile) {
        userPreferences = {
          language: profile.preferredLanguage || 'hindi',
          level: 'beginner',
          jobType: profile.workPreference === 'remote' ? 'freelance' : 'both'
        };
      }
    }
  }

  const model = vertex.getGenerativeModel({
    model: 'gemini-2.0-flash-001',
    tools,
    systemInstruction: {
      parts: [{
        text: `You are a helpful AI career counselor for Indian students. Respond in Hinglish.
        
        User's current context:
        - Selected career: ${context.selectedCareer || 'none'}
        - Their background: ${context.transcript || 'unknown'}
        - Past careers explored: ${pastCareers.join(', ') || 'none'}
        
        User preferences:
        - Preferred language: ${userPreferences.language}
        - Course level: ${userPreferences.level}  
        - Job type: ${userPreferences.jobType}
        
        IMPORTANT - Voice-friendly responses:
        - Keep responses SHORT (2-4 sentences max) — will be spoken aloud
        - NO bullet points, NO markdown — plain conversational text only
        - Sound natural and warm like a friend
        - When courses/jobs found, narrate conversationally
        
        UI CONTROL RULES — use triggerUIAction ONLY when user EXPLICITLY asks:
        - User says EXACTLY "courses dikhao" / "courses scroll karo" / "courses upar le jao" → action: scroll_to_courses
        - User says EXACTLY "jobs dikhao" / "naukri dikhao" / "jobs scroll karo" → action: scroll_to_jobs
        - User says EXACTLY "LinkedIn kholo" / "Upwork kholo" / "Fiverr kholo" / "[platform name] kholo" → action: open_url
        - DO NOT call triggerUIAction for general questions, greetings, or anything that is not a direct UI navigation request
        - DO NOT call triggerUIAction more than once per response
        - NEVER open URLs unless user specifically says "[platform] kholo" or "open [platform]" 
        
        Tool rules:
        - ALWAYS use user's preferred language when calling getFilteredCourses
        - Never make up course links — always use getFilteredCourses tool`
      }]
    }
  });

  const messages = [
    ...history,
    { role: 'user', parts: [{ text: userMessage }] }
  ];

  let response = await model.generateContent({ contents: messages });
  let candidate = response.response.candidates[0];

  while (candidate.content.parts.some(p => p.functionCall)) {
    const toolCalls = candidate.content.parts.filter(p => p.functionCall);
    const results = await Promise.all(
      toolCalls.map(p => executeTool(p.functionCall.name, p.functionCall.args, userPreferences))
    );

    const toolResults = toolCalls.map((p, i) => ({
      functionResponse: { name: p.functionCall.name, response: { result: results[i] } }
    }));

    messages.push({ role: 'model', parts: candidate.content.parts });
    messages.push({ role: 'user', parts: toolResults });

    response = await model.generateContent({ contents: messages });
    candidate = response.response.candidates?.[0];
    // Agar candidate nahi mila (safety filter ya empty response) toh loop tod do
    if (!candidate) break;
  }

  const allToolResults = messages
    .filter(m => m.parts?.some(p => p.functionResponse))
    .flatMap(m => m.parts.filter(p => p.functionResponse));

  const updatedHistory = candidate
    ? [...messages, { role: 'model', parts: candidate.content.parts }]
    : messages;
  const textPart = candidate?.content?.parts?.find(p => p.text);
  const agentText = textPart?.text || '';

  // Extract UI action if triggered
  const uiActionResult = allToolResults.find(p => p.functionResponse.name === 'triggerUIAction');
  const uiAction = uiActionResult?.functionResponse.response.result;

  // Save session
  if (userId && context.selectedCareer) {
    const updatePayload = {
      preferredLanguage: userPreferences.language,
      courseLevel: userPreferences.level,
      preferredJobType: userPreferences.jobType,
      $push: {
        chatHistory: {
          $each: [
            { role: 'user', content: userMessage },
            { role: 'assistant', content: agentText }
          ]
        }
      }
    };
    const foundCourses = allToolResults.find(p => p.functionResponse.name === 'getFilteredCourses');
    if (foundCourses) updatePayload.courses = foundCourses.functionResponse.response.result;

    await Session.findOneAndUpdate(
      { userId, chosenCareer: context.selectedCareer },
      updatePayload,
      { upsert: true, new: true }
    );
  }

  // TTS
  let audioBase64 = null;
  try {
    audioBase64 = await speak(agentText, userPreferences.language);
  } catch (e) {
    console.error('TTS error (non-fatal):', e.message);
  }

  return {
    message: agentText,
    audio: audioBase64,
    action: uiAction?.action || null,         // 👈 frontend ko action
    actionPayload: uiAction?.url ? { url: uiAction.url } : null,
    history: updatedHistory,
    newCourses: allToolResults.find(p => p.functionResponse.name === 'getFilteredCourses')?.functionResponse.response.result || null,
    newCareers: allToolResults.find(p => p.functionResponse.name === 'getMoreCareers')?.functionResponse.response.result || null,
    newJobs: allToolResults.find(p => p.functionResponse.name === 'getFilteredJobs')?.functionResponse.response.result || null,
  };
}

module.exports = { runAgent };