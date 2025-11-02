class MoodAssessmentService {
  static moodData = {
    'sad': {
      key: 'sad',
      emoji: '😢',
      name: 'SAD',
      description: 'Low Morning Energy',
      questions: [
        {
          question: 'When you woke up today, what was your first thought?',
          options: {
            A: 'I can still try to make today better.',
            B: 'I just want to get through it.',
            C: 'What\'s the point of today anyway?'
          }
        },
        {
          question: 'How are you handling your morning right now?',
          options: {
            A: 'Took a bath, had chai/coffee, trying to move ahead.',
            B: 'Just lying around, checking phone.',
            C: 'Didn\'t want to even get out of bed.'
          }
        },
        {
          question: 'If someone called you right now, would you pick up?',
          options: {
            A: 'Yes, I\'d talk.',
            B: 'Maybe, if I feel okay.',
            C: 'No, not in the mood at all.'
          }
        }
      ],
      habits: {
        grounding: {
          title: '2-Minute Reset',
          description: 'Sit on your bed, breathe in 4 counts, out 6 counts. Say: "Today I\'m safe and starting small."',
          type: 'Grounding',
          message: 'Ground yourself gently — your system needs immediate calm.'
        },
        reflective: {
          title: 'Warm Shower + Journal Thought',
          description: 'After your bath, write one line: "Today I\'ll try to…"',
          type: 'Reflective',
          message: 'You\'re in a reflective zone — take 10 minutes to process and rebalance.'
        },
        growth: {
          title: 'Morning Gratitude Act',
          description: 'Send a short text or RDM token: "Thanks for being there — means a lot."',
          type: 'Growth',
          message: 'You\'re emotionally stable — build momentum or spread your positive energy.'
        }
      }
    },
    'neutral': {
      key: 'neutral',
      emoji: '😐',
      name: 'NEUTRAL',
      description: 'Auto-Pilot Mode',
      questions: [
        {
          question: 'How did you wake up today?',
          options: {
            A: 'With a sense of direction or plan.',
            B: 'Just the usual — nothing special.',
            C: 'No idea — just opened eyes and scrolled.'
          }
        },
        {
          question: 'What are you doing with your morning energy?',
          options: {
            A: 'Planning something small (chai, walk, prayer).',
            B: 'Sitting around thinking of work or tasks.',
            C: 'Just waiting for things to start moving.'
          }
        },
        {
          question: 'What\'s your inner voice like right now?',
          options: {
            A: 'Let\'s make this day meaningful.',
            B: 'Let\'s get through the list.',
            C: 'Whatever, it doesn\'t matter much.'
          }
        }
      ],
      habits: {
        grounding: {
          title: 'Sunlight Wake-Up',
          description: 'Step near a window or outside for 2 mins — no phone, just light.',
          type: 'Grounding',
          message: 'Ground yourself gently — your system needs immediate calm.'
        },
        reflective: {
          title: 'Purpose Nudge',
          description: 'Write one line: "If I could improve one thing today, it\'s ___."',
          type: 'Reflective',
          message: 'You\'re in a reflective zone — take 10 minutes to process and rebalance.'
        },
        growth: {
          title: 'Small Win Action',
          description: 'Do a micro-task: clean your table, reply to one text — then reward with token.',
          type: 'Growth',
          message: 'You\'re emotionally stable — build momentum or spread your positive energy.'
        }
      }
    },
    'content': {
      key: 'content',
      emoji: '🙂',
      name: 'CONTENT',
      description: 'Calm and Centered',
      questions: [
        {
          question: 'When you woke up, how did your body feel?',
          options: {
            A: 'Relaxed and balanced.',
            B: 'Okay, just normal.',
            C: 'Lazy and slow.'
          }
        },
        {
          question: 'What are you thinking about your morning?',
          options: {
            A: 'I\'ll keep this peace alive.',
            B: 'Let\'s just go with the flow.',
            C: 'It\'s calm now, but I\'m unsure how long.'
          }
        },
        {
          question: 'How do you usually handle calm days?',
          options: {
            A: 'Create something, help someone.',
            B: 'Just enjoy it quietly.',
            C: 'Waste it doing random stuff.'
          }
        }
      ],
      habits: {
        grounding: {
          title: 'Peace Journal',
          description: 'Note one thing that made yesterday calm — re-read before starting work.',
          type: 'Grounding',
          message: 'Ground yourself gently — your system needs immediate calm.'
        },
        reflective: {
          title: 'Intent Setting',
          description: 'Set one word for your day: "Focus", "Kindness", or "Growth".',
          type: 'Reflective',
          message: 'You\'re in a reflective zone — take 10 minutes to process and rebalance.'
        },
        growth: {
          title: 'Pay It Forward',
          description: 'Send a compliment, appreciation token, or chai emoji to a colleague.',
          type: 'Growth',
          message: 'You\'re emotionally stable — build momentum or spread your positive energy.'
        }
      }
    },
    'cheerful': {
      key: 'cheerful',
      emoji: '😄',
      name: 'CHEERFUL',
      description: 'Joyful & Charged',
      questions: [
        {
          question: 'What\'s making your morning bright?',
          options: {
            A: 'Someone\'s message, good memory, or music.',
            B: 'Just the vibe, no reason.',
            C: 'Not sure, but it feels okay.'
          }
        },
        {
          question: 'What are you doing with that energy?',
          options: {
            A: 'Sharing or helping others.',
            B: 'Doing my work with flow.',
            C: 'Just scrolling or talking random stuff.'
          }
        },
        {
          question: 'If you could do one thing with this joy, what would it be?',
          options: {
            A: 'Spread it — cheer up someone.',
            B: 'Keep it — don\'t let it fade.',
            C: 'Don\'t know — it\'ll pass anyway.'
          }
        }
      ],
      habits: {
        grounding: {
          title: 'Smile Pause',
          description: 'Smile intentionally, breathe, and think of one good thing.',
          type: 'Grounding',
          message: 'Ground yourself gently — your system needs immediate calm.'
        },
        reflective: {
          title: 'Joy Ripple',
          description: 'Appreciate someone: "Hey, you made my day better." (Send token).',
          type: 'Reflective',
          message: 'You\'re in a reflective zone — take 10 minutes to process and rebalance.'
        },
        growth: {
          title: 'Impact Action',
          description: 'Use joy energy to share or donate 1 token — create ripple impact.',
          type: 'Growth',
          message: 'You\'re emotionally stable — build momentum or spread your positive energy.'
        }
      }
    },
    'loving': {
      key: 'loving',
      emoji: '🥰',
      name: 'LOVING',
      description: 'Warmth and Compassionate Energy',
      questions: [
        {
          question: 'Who or what is filling your heart this morning?',
          options: {
            A: 'A person or purpose I deeply value.',
            B: 'Just general good feeling.',
            C: 'Nothing special, just neutral.'
          }
        },
        {
          question: 'How do you express that warmth?',
          options: {
            A: 'Saying kind words, helping someone.',
            B: 'Keeping it to myself.',
            C: 'Ignoring it — too busy.'
          }
        },
        {
          question: 'What does this love inspire you to do?',
          options: {
            A: 'Spread kindness intentionally.',
            B: 'Stay peaceful and balanced.',
            C: 'Just move on with day.'
          }
        }
      ],
      habits: {
        grounding: {
          title: 'Heart Center Pause',
          description: 'Keep hand on chest, breathe deeply 3 times — say: "I am enough today."',
          type: 'Grounding',
          message: 'Ground yourself gently — your system needs immediate calm.'
        },
        reflective: {
          title: 'Gratitude Ripple',
          description: 'Send one kind message or donate a token to a cause.',
          type: 'Reflective',
          message: 'You\'re in a reflective zone — take 10 minutes to process and rebalance.'
        },
        growth: {
          title: 'Generosity Spark',
          description: 'Gift one token or appreciation to a user or NGO — spread love chain.',
          type: 'Growth',
          message: 'You\'re emotionally stable — build momentum or spread your positive energy.'
        }
      }
    }
  };

  // Calculate Mood Assessment
  static calculateMoodAssessment(mood, answers) {
    console.log('=== MOOD ASSESSMENT CALCULATION ===');
    console.log('Mood:', mood);
    console.log('Raw answers:', answers);
    
    const scoreMapping = { 'A': 2, 'B': 1, 'C': 0 };
    
    // Ensure answers is an array
    const answersArray = Array.isArray(answers) ? answers : Object.values(answers);
    console.log('Answers array:', answersArray);
    
    const scores = answersArray.map(answer => {
      const score = scoreMapping[answer.toUpperCase()] || 0;
      console.log(`Answer: ${answer}, Score: ${score}`);
      return score;
    });
    const totalScore = scores.reduce((a, b) => a + b, 0);
    const moodIndex = Math.round((totalScore / 6) * 100);
    
    console.log('Total score:', totalScore);
    console.log('Mood Index:', moodIndex);

    let habitCategory;
    let message;

    if (moodIndex <= 40) {
      habitCategory = 'grounding';
      message = 'Ground yourself gently — your system needs immediate calm.';
    } else if (moodIndex <= 70) {
      habitCategory = 'reflective';
      message = 'You\'re in a reflective zone — take 10 minutes to process and rebalance.';
    } else {
      habitCategory = 'growth';
      message = 'You\'re emotionally stable — build momentum or spread your positive energy.';
    }

    console.log('Selected category:', habitCategory);
    
    const recommendedHabit = this.moodData[mood].habits[habitCategory];
    console.log('Recommended habit:', recommendedHabit);

    return {
      mood,
      moodIndex,
      habitCategory,
      message,
      recommendedHabit,
      answers: answersArray,
      scores,
      totalScore,
    };
  }

  static getQuestionsForMood(mood) {
    return [...this.moodData[mood].questions];
  }

  // Get dynamic action buttons based on mood and score
  static getActionButtons(mood, moodIndex) {
    const actionButtons = {
      'loving': {
        0: { left: 'Send 1 RDM to someone that you miss', right: 'Reach out with kindness' },
        41: { left: 'Thank someone who showed up', right: 'Celebrate unspoken care' },
        71: { left: 'Gift a gratitude token', right: 'Support a NGO' }
      },
      'cheerful': {
        0: { left: 'Share one small win', right: 'Express gratitude to your uplifter' },
        41: { left: 'Appreciate your teammate', right: 'Gift a RDM Token' },
        71: { left: 'Donate your happiness', right: 'Send celebration token' }
      },
      'content': {
        0: { left: 'Share a gratitude token', right: 'Reward yourself' },
        41: { left: 'Give your day\'s joy to someone', right: 'Celebrate your day with a donation' },
        71: { left: 'Support an education cause', right: 'Donate to uplift others' }
      },
      'neutral': {
        0: { left: 'Appreciate small acts', right: 'Celebrate unnoticed help' },
        41: { left: 'Gift yourself', right: 'Uplift a like-minded friend' },
        71: { left: 'Support community', right: 'Uplift others with RDM' }
      },
      'sad': {
        0: { left: 'Text someone you trust', right: 'Uplift a heart in need' },
        41: { left: 'Thank your quiet supporters', right: 'Send kindness forward' },
        71: { left: 'Donate for mental wellness', right: 'Gift RDM token' }
      }
    };

    const moodButtons = actionButtons[mood];
    if (!moodButtons) return { left: 'Thank a friend', right: 'Appreciate colleague' };

    // Determine which score range to use
    let buttonSet;
    if (moodIndex <= 40) {
      buttonSet = moodButtons[0];
    } else if (moodIndex <= 70) {
      buttonSet = moodButtons[41];
    } else {
      buttonSet = moodButtons[71];
    }

    return buttonSet || { left: 'Thank a friend', right: 'Appreciate colleague' };
  }
}

export default MoodAssessmentService;
