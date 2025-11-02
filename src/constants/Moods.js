export const MOODS = [
  { 
    key: 'SAD', 
    emoji: '😢', 
    name: 'Sad',
    color: '#60A5FA'
  },
  { 
    key: 'NEUTRAL', 
    emoji: '😐', 
    name: 'Neutral',
    color: '#9CA3AF'
  },
  { 
    key: 'CONTENT', 
    emoji: '🙂', 
    name: 'Content',
    color: '#34D399'
  },
  { 
    key: 'CHEERFUL', 
    emoji: '😄', 
    name: 'Cheerful',
    color: '#FBBF24'
  },
  { 
    key: 'LOVING', 
    emoji: '🥰', 
    name: 'Loving',
    color: '#F87171'
  },
];

export const MOOD_QUESTIONS = {
  SAD: [
    {
      question: 'What would help you feel better right now?',
      options: {
        A: 'Connecting with someone I trust',
        B: 'Doing something creative or physical',
        C: 'Taking a break and resting',
        D: 'Getting support or professional help'
      }
    }
  ],
  NEUTRAL: [
    {
      question: 'What would make today more meaningful?',
      options: {
        A: 'Trying something new',
        B: 'Helping someone else',
        C: 'Learning something new',
        D: 'Reflecting on goals'
      }
    }
  ],
  CONTENT: [
    {
      question: 'How would you like to build on this positive feeling?',
      options: {
        A: 'Share this feeling with others',
        B: 'Take on a meaningful challenge',
        C: 'Savor and appreciate this moment',
        D: 'Channel this energy into a goal'
      }
    }
  ],
  CHEERFUL: [
    {
      question: 'What would amplify your positive energy today?',
      options: {
        A: 'Spreading joy to others',
        B: 'Starting a new creative project',
        C: 'Expressing gratitude publicly',
        D: 'Using this energy for impact'
      }
    }
  ],
  LOVING: [
    {
      question: 'How would you like to express this loving feeling?',
      options: {
        A: 'Show appreciation to someone special',
        B: 'Practice self-compassion',
        C: 'Extend kindness to others',
        D: 'Create something meaningful'
      }
    }
  ],
};

