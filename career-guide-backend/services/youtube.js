const { google } = require('googleapis');
const youtube = google.youtube({ version: 'v3', auth: process.env.YOUTUBE_API_KEY });

async function searchCourses(career, filters = {}) {
  const langMap = { hindi: 'hi', english: 'en', hinglish: 'hi' };

  // Build smarter query based on filters
  let query = `${career} tutorial`;
  if (filters.level === 'beginner') query += ' for beginners';
  if (filters.level === 'advanced') query += ' advanced';
  if (filters.language === 'hindi') query += ' hindi mein';

  const res = await youtube.search.list({
    part: 'snippet',
    q: query,
    type: 'video',
    maxResults: 5,
    relevanceLanguage: langMap[filters.language] || 'hi',
    videoDuration: filters.maxLength === 'short' ? 'short' : 'long',
  });

  return res.data.items.map(item => ({
    title: item.snippet.title,
    platform: 'YouTube',
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    thumbnail: item.snippet.thumbnails.medium.url,
    channel: item.snippet.channelTitle,
    level: filters.level || 'beginner',
    language: filters.language || 'hindi'
  }));
}

module.exports = { searchCourses };