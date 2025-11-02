// Purposefulness-specific service with all questions and habits

class PurposefulnessService {
  // All Purposefulness quiz questions
  static QUESTIONS = [
    {
      heading: 'Purpose-First Planning',
      question: 'At the start of your day, how often do you choose your top 1–3 priorities and protect time for them?',
      explanation: 'Anchoring to purpose reduces low-value busywork.',
    },
    {
      heading: 'Present in Meetings',
      question: 'In meetings, how often do you give full attention (no multitasking, no quick peeks at notifications) to the speaker/topic?',
      explanation: 'Presence builds trust and improves decisions.',
    },
    {
      heading: 'Name the Feeling First',
      question: 'When you feel triggered, how often do you first notice and name the emotion before deciding what to do?',
      explanation: 'Labeling emotions creates space for wiser responses.',
    },
    {
      heading: 'Ego-Light Disagreements',
      question: 'In disagreements, how often do you set aside \'being right\' and ask one clarifying question first?',
      explanation: 'Curiosity over ego accelerates problem-solving.',
    },
    {
      heading: 'Attention Reset After Distraction',
      question: 'After a distraction, how often do you notice it quickly and return to the task without self‑criticism?',
      explanation: 'Fast, kind recovery sustains deep work.',
    },
    {
      heading: 'Micro-Kindness Under Pressure',
      question: 'When you\'re stressed, how often do you still choose small acts of kindness in tone, word choice, or patience?',
      explanation: 'Compassion under pressure protects relationships and culture.',
    },
    {
      heading: 'Read the Room',
      question: 'Before giving direction, how often do you pause to sense the team\'s energy, workload, and unspoken tensions?',
      explanation: 'Situational awareness improves timing and outcomes.',
    },
    {
      heading: 'Listen to Understand',
      question: 'While someone speaks, how often do you listen without mentally rehearsing your reply?',
      explanation: 'Deep listening strengthens psychological safety.',
    },
    {
      heading: 'Constructive Self-Talk After Mistakes',
      question: 'After you make a mistake, how often is your inner voice curious and constructive rather than harsh or defensive?',
      explanation: 'Balanced self-talk supports resilience and learning.',
    },
    {
      heading: 'Clear Shutdown Ritual',
      question: 'By day\'s end, how often do you create a clear shutdown (final scan, log‑off, brief reflection) to prevent spillover stress?',
      explanation: 'Boundaries restore attention and reduce burnout.',
    },
  ];

  // All Purposefulness habits mapped to their headings
  static HABITS = {
    'Purpose-First Planning': 'Write down your top 3 priorities each morning before opening email',
    'Present in Meetings': 'Close your laptop lid and silence your phone 2 minutes before meetings',
    'Name the Feeling First': 'When triggered, pause and say out loud "I\'m feeling [emotion]"',
    'Ego-Light Disagreements': 'Start every disagreement with "Help me understand your perspective"',
    'Attention Reset After Distraction': 'Notice when distracted within 30 seconds and gently guide attention back',
    'Micro-Kindness Under Pressure': 'Take three conscious breaths before responding when stressed',
    'Read the Room': 'Pause for 10 seconds to sense team energy before giving direction',
    'Listen to Understand': 'Put pen down, turn body toward speaker, maintain eye contact',
    'Constructive Self-Talk After Mistakes': 'After errors, ask "What\'s one useful thing I learned?" immediately',
    'Clear Shutdown Ritual': 'Write tomorrow\'s top 3 tasks, close browser tabs, reflect before logging off',
  };

  // Get habits with priority based on scores
  static getHabitsWithPriority(scores) {
    const habits = [];
    
    console.log('🔍 PurposefulnessService: Processing scores:', scores);
    
    for (let i = 0; i < this.QUESTIONS.length; i++) {
      const question = this.QUESTIONS[i];
      const heading = question.heading;
      const score = scores[i] || 0;
      
      console.log(`   Question ${i + 1}: "${heading}", score: ${score}`);
      
      // Only include weak areas (scores 1-3)
      if (score <= 3 && score > 0) {
        const habit = this.HABITS[heading];
        
        if (habit) {
          let priority, priorityColor;
          
          if (score <= 2) {
            priority = 'HIGH';
            priorityColor = '#FF6B6B'; // Red
          } else {
            priority = 'MEDIUM';
            priorityColor = '#FFD93D'; // Yellow
          }
          
          console.log(`   ✓ Adding habit: "${habit}" with priority: ${priority}`);
          
          habits.push({
            habit: habit,
            score: score,
            priority: priority,
            priorityColor: priorityColor,
            question: question.question,
            heading: heading,
          });
        } else {
          console.log(`   ✗ No habit found for "${heading}"`);
        }
      }
    }
    
    // Sort by priority (HIGH first) then by score (lowest first)
    habits.sort((a, b) => {
      if (a.priority === 'HIGH' && b.priority !== 'HIGH') return -1;
      if (a.priority !== 'HIGH' && b.priority === 'HIGH') return 1;
      return a.score - b.score;
    });
    
    console.log(`✅ PurposefulnessService: Returning ${habits.length} habits with priority`);
    return habits;
  }

  // Get questions for quiz
  static getQuestions() {
    return this.QUESTIONS;
  }
}

export default PurposefulnessService;

