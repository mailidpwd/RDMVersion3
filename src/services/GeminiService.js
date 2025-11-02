import axios from 'axios';

class GeminiService {
  static API_KEY = 'AIzaSyAafxIHpryH3m-RF9xEIcXsRlpDGXxq28k';
  static BASE_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';

  // Generate personalized habit suggestions
  static async generatePersonalizedHabitSuggestions(selectedMood, moodName, userDescription) {
    try {
      const prompt = `
Generate 3 personalized habit suggestions for someone feeling ${moodName.toLowerCase()} (${selectedMood} mood).

User's specific situation: "${userDescription}"

Each suggestion should be:
- 1-2 lines long
- Directly address their specific situation and feelings
- Provide actionable ways to cope with their exact emotional state
- Focused on personal growth or well-being

Format the response as:
1. [first personalized suggestion]
2. [second personalized suggestion]  
3. [third personalized suggestion]

Make each suggestion highly relevant to their specific situation and emotional needs.
`;

      const response = await axios.post(
        `${this.BASE_URL}?key=${this.API_KEY}`,
        {
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 300,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        const data = response.data;
        if (data.candidates && data.candidates.length > 0) {
          const candidate = data.candidates[0];
          if (candidate.finishReason === 'STOP') {
            const content = candidate.content;
            if (content && content.parts && content.parts.length > 0) {
              const text = content.parts[0].text;
              const suggestions = this.parseSuggestions(text);
              
              if (suggestions.length >= 3) {
                console.log('✅ GeminiService: Generated personalized suggestions');
                return suggestions.slice(0, 3);
              }
            }
          }
        }
      }

      // Fallback
      return this.getFallbackMoodSuggestions(moodName);
    } catch (error) {
      console.error('GeminiService: Error generating suggestions:', error);
      console.error('Error details:', error.response?.data || error.message);
      // Return fallback instead of failing
      return this.getFallbackMoodSuggestions(moodName);
    }
  }

  // Parse suggestions from AI response
  static parseSuggestions(text) {
    const suggestions = [];
    const lines = text.split('\n');

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('1.') || trimmedLine.startsWith('2.') || trimmedLine.startsWith('3.')) {
        const suggestion = trimmedLine.substring(2).trim();
        if (suggestion) {
          suggestions.push(suggestion);
        }
      }
    }

    return suggestions;
  }

  // Fallback suggestions
  static getFallbackMoodSuggestions(moodName) {
    const suggestions = {
      'SAD': [
        'Write down three things you\'re grateful for today',
        'Take a 10-minute walk outside and notice nature around you',
        'Send a kind message to someone you care about'
      ],
      'NEUTRAL': [
        'Do a 5-minute task that gives visible progress',
        'Try a new activity or hobby for 15 minutes',
        'Reflect on what would make today more meaningful'
      ],
      'CONTENT': [
        'Plan tomorrow\'s first 10 minutes intentionally',
        'Do one creative or value-aligned action today',
        'Share your positive energy with someone else'
      ],
      'CHEERFUL': [
        'Start a 15-minute creative or impact action right now',
        'Text one thank-you message or compliment someone',
        'Notice and appreciate three things around you'
      ],
      'LOVING': [
        'Do a small, quiet kindness today with no expectation',
        'Write one thing you love about yourself',
        'Send one thank-you text or share an appreciation'
      ],
    };

    return suggestions[moodName.toUpperCase()] || [
      'Take three deep breaths and set an intention for today',
      'Do one small act of self-care',
      'Reflect on what you\'re grateful for right now'
    ];
  }

  // Get improvement suggestions for weak areas
  static async getImprovementSuggestions(category, weakAreas) {
    try {
      // Prepare detailed weak areas information
      let weakAreasText = '';
      for (let i = 0; i < weakAreas.length && i < 3; i++) {
        const area = weakAreas[i];
        weakAreasText += `- ${area.heading}: User scored ${area.answer}/5\n  Question: ${area.question}\n\n`;
      }

      const prompt = `You are a leadership development coach. A user has taken a ${category} assessment and scored low (3 or below) on these specific areas:

${weakAreasText}

Provide exactly 3 actionable improvement tips:
- Each tip should be 4-6 words maximum
- Be specific and actionable
- Focus on practical daily behaviors
- Match the style: "Pause, breathe, observe."

Format your response EXACTLY as:
1. [first tip]
2. [second tip]
3. [third tip]

Start now:`;

      console.log('🧠 GeminiService: Attempting AI call...');
      
      // Skip AI call for now - use fallback immediately
      console.log('⏭️ GeminiService: Using fallback suggestions');
      return this._generateFallbackImprovements(category);

      /* DISABLED AI CALL - API KEY ISSUE
      const response = await axios.post(
        `${this.BASE_URL}?key=${this.API_KEY}`,
        {
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 300,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.status === 200) {
        const data = response.data;
        if (data.candidates && data.candidates.length > 0) {
          const candidate = data.candidates[0];
          if (candidate.content && candidate.content.parts && candidate.content.parts[0]) {
            const content = candidate.content.parts[0].text;
            const parsed = this._parseImprovementSuggestions(content);
            console.log('✅ GeminiService: AI suggestions parsed:', parsed);
            return parsed;
          }
        }
      }
      */
      
    } catch (error) {
      console.log('⚠️ GeminiService: Using fallback suggestions');
      return this._generateFallbackImprovements(category);
    }
  }

  // Parse improvement suggestions
  static _parseImprovementSuggestions(content) {
    const suggestions = [];
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmedLine = line.trim();
      // Match lines starting with number and period (1., 2., 3., etc.)
      if (/^\d+\./.test(trimmedLine)) {
        // Remove the number and period, then clean up markdown
        let suggestion = trimmedLine.replace(/^\d+\.\s*/, '').trim();
        
        // Remove markdown formatting
        suggestion = suggestion.replace(/\*\*/g, '').replace(/\*/g, '').replace(/`/g, '');
        
        // Remove quotes if present
        suggestion = suggestion.replace(/^["']|["']$/g, '');
        
        // Final trim
        suggestion = suggestion.trim();
        
        // Keep only if it has reasonable length (4-50 chars for short tips)
        if (suggestion.length >= 4 && suggestion.length <= 50) {
          suggestions.push(suggestion);
        }
      }
    }

    // If we got good suggestions, use them
    if (suggestions.length >= 3) {
      console.log('✅ Parsed', suggestions.length, 'suggestions from AI');
      return suggestions.slice(0, 3);
    }

    // If we got some suggestions, pad with fallback
    while (suggestions.length < 3) {
      suggestions.push(this._generateFallbackImprovements()[0]);
    }

    console.log('⚠️ Fallback used, final suggestions:', suggestions);
    return suggestions.slice(0, 3);
  }

  // Generate fallback improvements
  static _generateFallbackImprovements(category) {
    // Return fallback suggestions based on category
    const fallbackSuggestions = {
      'Mindfulness': [
        'Put phone on silent during conversations',
        'Take 3 deep breaths when stressed',
        'Wait 10 seconds before responding'
      ],
      'Purposefulness': [
        'Write down top 3 priorities each morning',
        'Close laptop 2 minutes before meetings',
        'When triggered, pause and name the emotion'
      ],
      'Empathy & Philanthropy': [
        'Repeat back what you heard',
        'Ask about feelings before stating view',
        'Send one thoughtful message weekly'
      ]
    };
    
    return fallbackSuggestions[category] || [
      'Practice daily mindfulness',
      'Set small achievable goals',
      'Track progress weekly'
    ];
  }

  // Legacy method for backward compatibility
  static async generateLeadershipFeedback(category, responses, score) {
    // Use the new method
    return this._generateFallbackImprovements(category);
  }

  // Generate AI goal descriptions
  static async generateGoalDescriptions({ title, category, subcategory, userDescription }) {
    const prompt = `
Create 3 different 1-2 line descriptions for this goal:

Goal: ${title}
Category: ${category}
Subcategory: ${subcategory}
User Input: ${userDescription}

Please provide exactly 3 descriptions:
1. Motivational
2. Practical  
3. Personal

Format: Just the descriptions, one per line.
`;

    try {
      console.log('🤖 Calling Gemini API for goal descriptions...');
      
      const response = await axios.post(
        `${this.BASE_URL}?key=${this.API_KEY}`,
        {
          contents: [{
            parts: [{ text: prompt }],
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 300,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        const text = response.data.candidates[0].content.parts[0].text;
        console.log('✅ AI Response:', text);
        
        // Parse suggestions (one per line)
        const suggestions = text
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0 && !line.match(/^\d+\./))
          .slice(0, 3); // Take first 3

        console.log(`✅ Parsed ${suggestions.length} suggestions`);
        return suggestions;
      } else {
        throw new Error(`API returned status ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Gemini API Error:', error);
      // Return fallback descriptions
      return this.getFallbackGoalDescriptions(category, subcategory);
    }
  }

  // Fallback goal descriptions
  static getFallbackGoalDescriptions(category, subcategory) {
    const fallbackMap = {
      'Fitness': [
        `Transform your body and mind through consistent ${subcategory} practice.`,
        `Set aside 20 minutes daily for ${subcategory} to build lasting fitness habits.`,
        `Connect with your inner strength and achieve personal wellness through ${subcategory}.`,
      ],
      'Mental Wellness': [
        `Cultivate inner peace and mental clarity through dedicated ${subcategory} practice.`,
        `Practice ${subcategory} for 10 minutes each morning to start your day mindfully.`,
        `Discover your inner calm and emotional balance through regular ${subcategory} sessions.`,
      ],
      'Desirable Behaviour': [
        `Master your emotions and develop healthier responses through ${subcategory} techniques.`,
        `Implement ${subcategory} strategies daily to improve your interpersonal relationships.`,
        `Build emotional intelligence and self-awareness through consistent ${subcategory} practice.`,
      ],
    };

    return fallbackMap[category] || [
      `Achieve your ${category} goals through dedicated ${subcategory} practice.`,
      `Build consistent habits around ${subcategory} to reach your objectives.`,
      `Transform your life by embracing ${subcategory} as part of your daily routine.`,
    ];
  }
}

export { GeminiService };

