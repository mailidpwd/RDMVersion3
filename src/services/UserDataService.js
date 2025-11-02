import LocalStorageService from './LocalStorageService';

class UserDataService {
  static async getCurrentUserEmail() {
    return await LocalStorageService.getCurrentUserEmail();
  }

  // Save quiz score for a category
  static async saveQuizScore(category, score, userEmail = null) {
    try {
      const email = userEmail || await this.getCurrentUserEmail();
      if (!email) {
        console.warn('No user email found, cannot save quiz score');
        return;
      }

      const key = this._getScoreKey(category);
      await LocalStorageService.saveUserData(email, key, score);
      console.log(`Quiz score saved for ${category}: ${score}%`);
    } catch (error) {
      console.error('Error saving quiz score:', error);
    }
  }

  // Get quiz score for a category
  static async getQuizScore(category, userEmail = null) {
    try {
      const email = userEmail || await this.getCurrentUserEmail();
      if (!email) return 0;

      const key = this._getScoreKey(category);
      const score = await LocalStorageService.getUserData(email, key, 0);
      return parseInt(score) || 0;
    } catch (error) {
      console.error('Error getting quiz score:', error);
      return 0;
    }
  }

  // Save quiz answers for a category
  static async saveQuizAnswers(category, answers, userEmail = null) {
    try {
      const email = userEmail || await this.getCurrentUserEmail();
      if (!email) return;

      const key = this._getAnswersKey(category);
      const answersString = answers.join(',');
      await LocalStorageService.saveUserData(email, key, answersString);
    } catch (error) {
      console.error('Error saving quiz answers:', error);
    }
  }

  // Get quiz answers for a category
  static async getQuizAnswers(category, userEmail = null) {
    try {
      const email = userEmail || await this.getCurrentUserEmail();
      if (!email) return [];

      const key = this._getAnswersKey(category);
      const answersString = await LocalStorageService.getUserData(email, key, '');
      
      if (answersString && answersString.length > 0) {
        return answersString.split(',').map(a => parseInt(a));
      }
      return [];
    } catch (error) {
      console.error('Error getting quiz answers:', error);
      return [];
    }
  }

  // Save detailed quiz responses with questions and answers
  static async saveDetailedQuizResponses(category, responses, userEmail = null) {
    try {
      const email = userEmail || await this.getCurrentUserEmail();
      if (!email) return;

      const key = 'detailed_responses';
      const allResponses = await LocalStorageService.getUserData(email, key, {});
      
      console.log('💾 UserDataService.saveDetailedQuizResponses:');
      console.log('   Category:', category);
      console.log('   Responses count:', responses.length);
      console.log('   Sample response:', responses[0]);
      
      allResponses[category] = responses;
      await LocalStorageService.saveUserData(email, key, allResponses);
      
      console.log('   ✅ Saved successfully');
    } catch (error) {
      console.error('Error saving detailed quiz responses:', error);
    }
  }

  // Get detailed quiz responses for a category
  static async getDetailedQuizResponses(category, userEmail = null) {
    try {
      const email = userEmail || await this.getCurrentUserEmail();
      if (!email) return [];

      const key = 'detailed_responses';
      const allResponses = await LocalStorageService.getUserData(email, key, {});
      
      console.log('🔍 UserDataService.getDetailedQuizResponses:');
      console.log('   Category:', category);
      console.log('   All responses keys:', Object.keys(allResponses));
      
      // Try exact match first
      let responses = allResponses[category] || [];
      
      // If not found, try with different casing
      if (responses.length === 0) {
        const lowerCategory = category.toLowerCase();
        for (const key in allResponses) {
          if (key.toLowerCase() === lowerCategory) {
            console.log(`   Found responses under key: "${key}"`);
            responses = allResponses[key];
            break;
          }
        }
      }
      
      console.log(`   Returning ${responses.length} responses`);
      return responses;
    } catch (error) {
      console.error('Error getting detailed quiz responses:', error);
      return [];
    }
  }

  // Get all scores
  static async getAllScores(userEmail = null) {
    return {
      'Mindfulness': await this.getQuizScore('Mindfulness', userEmail),
      'Purposefulness': await this.getQuizScore('Purposefulness', userEmail),
      'Empathy & Philanthropy': await this.getQuizScore('Empathy & Philanthropy', userEmail),
    };
  }

  // Get weak areas (questions with low scores)
  static async getWeakAreas(category, userEmail = null) {
    const responses = await this.getDetailedQuizResponses(category, userEmail);
    return responses.filter(response => response.answer <= 3);
  }

  // Get strong areas (questions with high scores)
  static async getStrongAreas(category, userEmail = null) {
    const responses = await this.getDetailedQuizResponses(category, userEmail);
    return responses.filter(response => response.answer >= 4);
  }

  // Get habits with priority levels based on quiz scores - IMMUTABLE VERSION
  static async getHabitsWithPriority(category, userEmail = null) {
    try {
      console.log('🔍 UserDataService.getHabitsWithPriority: category =', category);
      
      const email = userEmail || await this.getCurrentUserEmail();
      if (!email) {
        console.log('   No email, returning empty');
        return [];
      }

      console.log('   Email:', email);
      
      // Step 1: Get detailed responses (read-only array)
      // Normalize category for lookup (try different formats)
      let responses = await this.getDetailedQuizResponses(category, email);
      
      // If not found, try with normalized versions
      if (responses.length === 0) {
        const lowerCategory = category.toLowerCase();
        responses = await this.getDetailedQuizResponses(lowerCategory, email);
        
        if (responses.length === 0) {
          // Try mapping to expected keys
          if (lowerCategory.includes('mindfulness')) {
            responses = await this.getDetailedQuizResponses('Mindfulness', email);
          } else if (lowerCategory.includes('purposefulness') || lowerCategory.includes('purpose')) {
            responses = await this.getDetailedQuizResponses('Purposefulness', email);
          } else if (lowerCategory.includes('empathy') || lowerCategory.includes('philanthropy')) {
            responses = await this.getDetailedQuizResponses('Empathy & Philanthropy', email);
          }
        }
      }
      
      console.log(`   Found ${responses.length} detailed responses`);
      
      if (!responses || responses.length === 0) {
        console.log('   ⚠️ NO DETAILED RESPONSES FOUND for category:', category);
        console.log('   Trying to get all saved responses for debugging...');
        const email = userEmail || await this.getCurrentUserEmail();
        const key = 'detailed_responses';
        const allResponses = await LocalStorageService.getUserData(email, key, {});
        console.log('   All saved response keys:', Object.keys(allResponses));
        
        // Check if quiz was partially completed (has score but no detailed responses)
        const score = await this.getQuizScore(category, email);
        console.log('   Quiz score:', score);
        
        if (score > 0) {
          // Quiz was partially completed - return default habits for the category
          console.log('   ⚠️ Partial completion detected - returning default habits');
          const defaultHabits = this.getAllHabitsForCategory(category);
          
          // Return first 3-5 default habits as MEDIUM priority
          const limitedHabits = defaultHabits.slice(0, 5).map((habit, index) => ({
            habit: habit,
            score: 3, // Default medium priority
            priority: 'MEDIUM',
            priorityColor: '#FFD93D', // Yellow
            question: `Focus on ${habit}`,
            heading: 'general_improvement',
          }));
          
          console.log(`   ✅ Returning ${limitedHabits.length} default habits for partial completion`);
          return limitedHabits;
        }
        
        return []; // Return empty array only if no score exists
      }
      
      // Step 2: Create a NEW array (don't mutate input)
      const habitsWithPriority = []; // NEW array, can be modified
      
      // Step 3: Build the habits list
      for (const response of responses) {
        const heading = response.heading;
        const question = response.question;
        const score = parseInt(response.answer, 10); // Ensure it's a number
        
        console.log(`   Processing "${heading}", score: ${score}`);
        
        // Only process weak areas (score <= 3)
        if (score <= 3) {
          // Map heading to specific habit
          const habit = this.getSpecificHabitForWeakArea(category, heading);
          
          console.log(`     → Mapped to: "${habit?.substring(0, 50)}..."`);
          
          if (habit && habit !== '') {
            // Determine priority
            let priority;
            let priorityColor;
            
            if (score <= 2) {
              priority = 'HIGH';
              priorityColor = '#FF6B6B'; // Red
            } else {
              priority = 'MEDIUM';
              priorityColor = '#FFD93D'; // Yellow
            }
            
            console.log(`   ✓ Adding: ${priority} priority`);
            
            // Add to NEW array (not modifying the responses array)
            habitsWithPriority.push({
              habit: habit,
              score: score,
              priority: priority,
              priorityColor: priorityColor,
              question: question,
              heading: heading,
            });
          }
        }
      }
      
      // Step 4: Remove duplicates using a NEW Map (not modifying habitsWithPriority)
      const uniqueHabitsMap = {}; // NEW object
      
      for (const habitObj of habitsWithPriority) {
        const habitName = habitObj.habit;
        
        // Check if we already have this habit
        if (!uniqueHabitsMap[habitName]) {
          uniqueHabitsMap[habitName] = habitObj;
        } else if (habitObj.priority === 'HIGH' && uniqueHabitsMap[habitName].priority !== 'HIGH') {
          // Replace if this is HIGH priority and stored one is not
          uniqueHabitsMap[habitName] = habitObj;
        }
      }
      
      // Step 5: Create a NEW sorted array
      const sortedHabits = Object.values(uniqueHabitsMap).sort((a, b) => {
        // HIGH priority first
        if (a.priority === 'HIGH' && b.priority !== 'HIGH') return -1;
        if (a.priority !== 'HIGH' && b.priority === 'HIGH') return 1;
        // Then by score (lowest first)
        return a.score - b.score;
      });
      
      console.log(`   ✅ Returning ${sortedHabits.length} unique habits with priority`);
      
      // Step 6: Return the NEW array (never modify the original)
      return sortedHabits;
      
    } catch (error) {
      console.error('Error getting habits with priority:', error);
      return []; // Return empty array on error
    }
  }

  // Helper methods for key generation
  static _getScoreKey(category) {
    switch (category) {
      case 'Mindfulness': return 'mindfulness_score';
      case 'Purposefulness': return 'purposefulness_score';
      case 'Empathy & Philanthropy': return 'empathy_score';
      default: return `${category.toLowerCase().replace(/ /g, '_')}_score`;
    }
  }

  static _getAnswersKey(category) {
    switch (category) {
      case 'Mindfulness': return 'mindfulness_answers';
      case 'Purposefulness': return 'purposefulness_answers';
      case 'Empathy & Philanthropy': return 'empathy_answers';
      default: return `${category.toLowerCase().replace(/ /g, '_')}_answers`;
    }
  }

  // Get all habits for a specific category
  static getAllHabitsForCategory(category) {
    switch (category.toLowerCase()) {
      case 'mindfulness':
        return [
          'Put phone on silent and face-down during conversations',
          'Take 3 deep belly breaths when noticing tension',
          'Wait 10 seconds after criticism, ask "What can I learn?"',
          'Check in with one team member daily asking "How are you really doing?"',
          'Count to five silently and ask one clarifying question before disagreeing',
          'Maintain eye contact and summarize what you heard before responding',
          'Set phone to "Do Not Disturb" mode during meals and after 8 PM',
          'Label your emotion out loud ("I\'m feeling frustrated") before responding',
          'Replace harsh self-criticism with curious questions',
          'Review weekly calendar every Sunday and delete one non-value commitment'
        ];

      case 'purposefulness':
        return [
          'Write down your top 3 priorities each morning before opening email',
          'Close your laptop lid and silence your phone 2 minutes before meetings',
          'When triggered, pause and say out loud "I\'m feeling [emotion]"',
          'Start every disagreement with "Help me understand your perspective"',
          'Notice when distracted within 30 seconds and gently guide attention back',
          'Take three conscious breaths before responding when stressed',
          'Pause for 10 seconds to sense team energy before giving direction',
          'Put pen down, turn body toward speaker, maintain eye contact',
          'After errors, ask "What\'s one useful thing I learned?" immediately',
          'Write tomorrow\'s top 3 tasks, close browser tabs, reflect before logging off'
        ];

      case 'empathy & philanthropy':
        return [
          'Repeat back what you heard by saying "So what I\'m hearing is..."',
          'Ask "How are you feeling about this situation?" before stating opposing view',
          'Send one thoughtful "thinking of you" message weekly to someone stressed',
          'Within 24 hours of hurting someone, say "I\'m sorry for [specific action]"',
          'When overwhelmed, say "I care about this and need to [set boundary]"',
          'In every team win, publicly name 2-3 specific people who contributed',
          'Volunteer for one task outside your formal job description weekly',
          'Before decisions, ask "Who else is affected by this choice?"',
          'Set up monthly recurring donation or volunteer hours as non-negotiable',
          'Introduce one junior colleague to valuable contact in your network monthly'
        ];

      default:
        return [
          'Focus on daily practice',
          'Set small achievable goals',
          'Track progress weekly'
        ];
    }
  }

  // Get specific habit based on weak area heading
  static getSpecificHabitForWeakArea(category, heading) {
    const habits = this.getAllHabitsForCategory(category);
    
    switch (category.toLowerCase()) {
      case 'mindfulness':
        switch (heading.toLowerCase()) {
          case 'digital distraction awareness': return habits[0];
          case 'stress response pattern': return habits[1];
          case 'ego defense mechanism': return habits[2];
          case 'empathetic awareness': return habits[3];
          case 'emotional reactivity in conflict': return habits[4];
          case 'quality of listening': return habits[5];
          case 'work-life boundary consciousness': return habits[6];
          case 'mindful response choice': return habits[7];
          case 'compassionate self-talk': return habits[8];
          case 'values-aligned prioritization': return habits[9];
          default: return habits[0];
        }
      case 'purposefulness':
      case 'purpose':
        const lowerHeading = heading.toLowerCase();
        console.log(`🔍 Mapping Purposefulness: "${heading}" → "${lowerHeading}"`);
        switch (lowerHeading) {
          case 'purpose-first planning': return habits[0];
          case 'present in meetings': return habits[1];
          case 'name the feeling first': return habits[2];
          case 'ego-light disagreements': return habits[3];
          case 'attention reset after distraction': return habits[4];
          case 'micro-kindness under pressure': return habits[5];
          case 'read the room': return habits[6];
          case 'listen to understand': return habits[7];
          case 'constructive self-talk after mistakes': return habits[8];
          case 'clear shutdown ritual': return habits[9];
          default: 
            console.log(`⚠️ No mapping found for: "${lowerHeading}"`);
            return habits[0];
        }
      case 'empathy & philanthropy':
        switch (heading.toLowerCase()) {
          case 'listen with full presence': return habits[0];
          case 'empathy in disagreement': return habits[1];
          case 'notice and check in': return habits[2];
          case 'repair after harm': return habits[3];
          case 'care with boundaries': return habits[4];
          case 'share credit generously': return habits[5];
          case 'offer help beyond role': return habits[6];
          case 'weigh wider impact': return habits[7];
          case 'give time, skills, or funds': return habits[8];
          case 'mentor and open doors': return habits[9];
          default: return habits[0];
        }
      default:
        return habits[0];
    }
  }

  static _getDetailedResponsesKey(category) {
    return `detailed_responses_${category.toLowerCase().replace(' & ', '_')}`;
  }

  static _getAnswersKey(category) {
    return `quiz_answers_${category.toLowerCase().replace(' & ', '_')}`;
  }

  static _getScoreKey(category) {
    return `quiz_score_${category.toLowerCase().replace(' & ', '_')}`;
  }

  static _getImprovementsKey(category) {
    return `improvements_${category.toLowerCase().replace(' & ', '_')}`;
  }
}

export default UserDataService;

