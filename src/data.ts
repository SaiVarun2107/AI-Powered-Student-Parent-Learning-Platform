import { Student, Quiz, CalendarEvent, PortalSettings } from './types';

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'julian-stark',
    name: 'Julian Stark',
    grade: 'Class 10',
    school: 'Eduvia Academy Senior High',
    board: 'State Board',
    academicYearFrom: '2024',
    academicYearTo: '2025',
    email: 'julian.stark@student.eduvia.org',
    password: 'studentpass123',
    avatarColor: 'from-orange-500 to-amber-600',
    subjects: [
      { id: 'math', name: 'Mathematics', chaptersCount: 14, completedChapters: 8, percentage: 57, score: 85, status: 'In Progress' },
      { id: 'science', name: 'General Science', chaptersCount: 12, completedChapters: 9, percentage: 75, score: 82, status: 'In Progress' },
      { id: 'lit', name: 'English Literature', chaptersCount: 10, completedChapters: 7, percentage: 70, score: 88, status: 'In Progress' },
      { id: 'history', name: 'History & Civics', chaptersCount: 8, completedChapters: 6, percentage: 75, score: 79, status: 'In Progress' }
    ]
  },
  {
    id: 'elena-rostova',
    name: 'Elena Rostova',
    grade: 'Class 9',
    school: 'St. Jude International Academy',
    board: 'TS SSC',
    academicYearFrom: '2024',
    academicYearTo: '2025',
    email: 'elena.rostova@student.eduvia.org',
    password: 'studentpass123',
    avatarColor: 'from-indigo-500 to-purple-600',
    subjects: [
      { id: 'math', name: 'Mathematics', chaptersCount: 15, completedChapters: 12, percentage: 80, score: 92, status: 'In Progress' },
      { id: 'science', name: 'General Science', chaptersCount: 11, completedChapters: 10, percentage: 91, score: 89, status: 'In Progress' },
      { id: 'lit', name: 'English Literature', chaptersCount: 12, completedChapters: 11, percentage: 92, score: 94, status: 'In Progress' },
      { id: 'history', name: 'History & Civics', chaptersCount: 8, completedChapters: 7, percentage: 88, score: 90, status: 'In Progress' }
    ]
  }
];

export const INITIAL_QUIZZES: Quiz[] = [
  {
    id: 'q1',
    name: 'Algebra Basics',
    subject: 'Mathematics',
    date: '2024-10-24',
    questionsCount: 10,
    score: '9/10',
    total: 10,
    percentage: 90,
    summary: 'Strong command of linear equations and algebraic structure with minor slips in coordinate reasoning.',
    strengths: ['Linear Equations', 'Quadratic Equations'],
    learningGaps: ['Coordinate Geometry'],
    mistakes: [{ question: 6, reason: 'Coordinate plotting was rushed.' }],
    recommendations: ['Revise Coordinate Geometry Chapter', 'Practice one geometry worksheet'],
    confidence: 'High',
    overallPerformance: 'Very Good',
    evaluationTimestamp: '2024-10-24T09:30:00.000Z',
    duration: '15m',
    studentId: 'julian-stark'
  },
  { id: 'q2', name: 'Linear Equations', subject: 'Mathematics', date: '2024-10-20', questionsCount: 15, score: '12/15', total: 15, percentage: 80, summary: 'Consistent process work with scope to improve symbolic manipulation.', strengths: ['Equation Solving'], learningGaps: ['Polynomial Manipulation'], mistakes: [{ question: 4, reason: 'Sign handling was inconsistent.' }], recommendations: ['Practice Polynomial MCQs', 'Review sign rules'], confidence: 'Medium', overallPerformance: 'Good', evaluationTimestamp: '2024-10-20T08:20:00.000Z', duration: '20m', studentId: 'julian-stark' },
  { id: 'q3', name: 'Geometry Intro', subject: 'Mathematics', date: '2024-10-15', questionsCount: 8, score: '7/8', total: 8, percentage: 88, summary: 'Clear geometric reasoning and good visual interpretation.', strengths: ['Shape Recognition'], learningGaps: ['Proof Structure'], mistakes: [{ question: 3, reason: 'Proof wording was incomplete.' }], recommendations: ['Practice one proof-based worksheet'], confidence: 'High', overallPerformance: 'Very Good', evaluationTimestamp: '2024-10-15T07:10:00.000Z', duration: '10m', studentId: 'julian-stark' },
  { id: 'q4', name: 'Quadratic Systems', subject: 'Mathematics', date: '2024-10-01', questionsCount: 12, score: '10/12', total: 12, percentage: 83, summary: 'Solid understanding of solving systems with some hesitation in worded contexts.', strengths: ['System Solving'], learningGaps: ['Word Problems'], mistakes: [{ question: 8, reason: 'Interpretation of the scenario was incomplete.' }], recommendations: ['Work through two word problem sets'], confidence: 'High', overallPerformance: 'Good', evaluationTimestamp: '2024-10-01T06:45:00.000Z', duration: '15m', studentId: 'julian-stark' },
  { id: 'q5', name: 'Polymers & Bonds', subject: 'General Science', date: '2024-10-22', questionsCount: 10, score: '8/10', total: 10, percentage: 80, summary: 'Good knowledge of bonding concepts with one gap in application-based reasoning.', strengths: ['Bond Identification'], learningGaps: ['Chemical Reactions'], mistakes: [{ question: 5, reason: 'Application of balancing steps was weak.' }], recommendations: ['Review reaction balancing', 'Solve 3 practice reactions'], confidence: 'Medium', overallPerformance: 'Good', evaluationTimestamp: '2024-10-22T10:05:00.000Z', duration: '15m', studentId: 'julian-stark' },
  { id: 'q6', name: 'Cellular Division', subject: 'Biological Systems', date: '2024-10-18', questionsCount: 20, score: '18/20', total: 20, percentage: 90, summary: 'Excellent grasp of cellular processes and organism-level explanation.', strengths: ['Cell Division', 'Genetics Basics'], learningGaps: ['Mitosis Terminology'], mistakes: [{ question: 12, reason: 'Terminology exchange was incomplete.' }], recommendations: ['Review stage vocabulary', 'Complete one revision card set'], confidence: 'High', overallPerformance: 'Excellent', evaluationTimestamp: '2024-10-18T09:00:00.000Z', duration: '25m', studentId: 'elena-rostova' },
  { id: 'q7', name: 'The Victorian Novel', subject: 'Literature Analysis', date: '2024-10-14', questionsCount: 15, score: '14/15', total: 15, percentage: 93, summary: 'Excellent literary analysis with a strong grasp of themes and authorial intent.', strengths: ['Theme Identification', 'Textual Evidence'], learningGaps: ['Historical Context'], mistakes: [{ question: 9, reason: 'Historical context link was underdeveloped.' }], recommendations: ['Revise Victorian context notes', 'Analyze one additional passage'], confidence: 'High', overallPerformance: 'Excellent', evaluationTimestamp: '2024-10-14T07:40:00.000Z', duration: '20m', studentId: 'elena-rostova' }
];

export const INITIAL_EVENTS: CalendarEvent[] = [
  { id: 'e1', title: 'Quarterly Exams Begin', date: '2024-10-15', type: 'exam' },
  { id: 'e2', title: 'Weekly Assessment: Mathematics', date: '2024-10-22', type: 'assessment', studentId: 'julian-stark', studentName: 'Julian Stark' },
  { id: 'e3', title: 'Science Assessment', date: '2024-10-22', type: 'assessment', studentId: 'julian-stark', studentName: 'Julian Stark' },
  { id: 'e4', title: 'Mathematics Half-Yearly Exam', date: '2024-10-15', type: 'exam', studentId: 'julian-stark', studentName: 'Julian Stark' },
  { id: 'e5', title: 'Final Term Exams', date: '2024-12-10', type: 'exam', studentId: 'julian-stark', studentName: 'Julian Stark' },
  { id: 'e6', title: 'Chemistry Lab Demonstration', date: '2024-10-18', type: 'activity', studentId: 'elena-rostova', studentName: 'Elena Rostova' },
  { id: 'e7', title: 'Midterm Progress Review', date: '2024-10-25', type: 'assessment', studentId: 'elena-rostova', studentName: 'Elena' },
  { id: 'e8', title: 'Autumn Holiday break', date: '2024-10-28', type: 'holiday' }
];

export const INITIAL_SETTINGS: PortalSettings = {
  fullName: 'Dr. Eleanor Thorne',
  email: 'e.thorne@edu-academy.com',
  phone: '',
  emailAlerts: true,
  smsNotifications: false,
  weeklyReports: true,
  language: 'English (United States)',
  twoFactorEnabled: true
};

export const SUPPORT_FAQS = [
  {
    q: "How is my child's curriculum mastery percentage calculated?",
    a: "Curriculum mastery is calculated based on completed topics, scores from assigned quizzes, and participation in classroom assessments. Completed chapters count for 50%, and assessment performance accounts for the other 50% of the overall score."
  },
  {
    q: "Can I assign custom quizzes on specific topics?",
    a: "Yes! Navigate to the 'Assessments' screen, where you can configure a customized quiz based on grade-level chapters, specify the number of questions, and allocate it directly. Your child can then launch it from their student space."
  },
  {
    q: "How do I update my notification preference?",
    a: "Go to the 'Portal Settings' page in the left navigation sidebar. Here you can toggle Email Alerts, SMS Notifications, and choose whether to receive the consolidated Weekly Progress Report directly."
  },
  {
    q: "What is the difference between a classroom exam and a portal task?",
    a: "Classroom exams are scheduled school-wide assessments administered on-premise by teachers. Portal tasks are personalized micro-assessments or quizzes created by parents or recommended by the platform to support growth."
  }
];

export const KNOWLEDGE_BASE_GRID = [
  {
    title: "Getting Started",
    desc: "Understand how the Eduvia ecosystem links parent dashboards, student desks, and teacher rooms.",
    itemsCount: 5,
    tag: "Fundamentals"
  },
  {
    title: "Managing Profiles",
    desc: "Learn to add children, configure academic calendars, switch student focus, and update board levels.",
    itemsCount: 3,
    tag: "Profiles"
  },
  {
    title: "Understanding Analytics",
    desc: "How to interpret the performance growth trend line, mastery matrices, and growth insight suggestions.",
    itemsCount: 4,
    tag: "Analytics"
  }
];

export const MATH_TOPICS_GRADE_10 = [
  'Quadratic Equations',
  'Arithmetic Progressions',
  'Similar Triangles',
  'Coordinate Geometry',
  'Trigonometric Identities',
  'Probability Concepts'
];

export const CURRICULUM_DETAILS: Record<string, { desc: string; sections: { name: string; topics: string[] }[] }> = {
  'math': {
    desc: "Core algebraic formulations, geometrical proofs, coordinate systems, and intermediate trigonometry designed for advanced college prep.",
    sections: [
      {
        name: "Algebraic Foundations",
        topics: [
          "Topic 1.1: Linear Equations in Two Variables",
          "Topic 1.2: Rational Expressions & Long Division",
          "Topic 1.3: Quadratic Functions & Parabolas",
          "Topic 1.4: Real-world Modeling with Equations"
        ]
      },
      {
        name: "Coordinate & Analytical Geometry",
        topics: [
          "Topic 2.1: Distance and Section Formulas",
          "Topic 2.2: Slope and Straight Line Formulations",
          "Topic 2.3: Circle Theorems & Tangent Bounds"
        ]
      },
      {
        name: "Trigonometry & Ratios",
        topics: [
          "Topic 3.1: Trigonometric Functions & Unit Circle",
          "Topic 3.2: Standard Identities (sin²θ + cos²θ = 1)",
          "Topic 3.3: Heights and Distances Applications"
        ]
      }
    ]
  },
  'science': {
    desc: "An exploration of fundamental physical forces, chemical structures, bonding dynamics, and macro biological systems.",
    sections: [
      {
        name: "Chemical Compounds & Bonds",
        topics: [
          "Topic 1.1: Ionic and Covalent Bonds",
          "Topic 1.2: Balancing Complex Reactions",
          "Topic 1.3: Acid-Base Neutralization Scales"
        ]
      },
      {
        name: "Life Science & Cellular Organelles",
        topics: [
          "Topic 2.1: Cellular Mitochondria & Energy Transduction",
          "Topic 2.2: Mitosis and Meiosis Stages",
          "Topic 2.3: Mendelian Genetics & Punnett Squares"
        ]
      }
    ]
  },
  'lit': {
    desc: "In-depth literary criticism, prose analysis, classical poetry interpretations, and advanced syntax structure workshops.",
    sections: [
      {
        name: "Textual Deconstruction",
        topics: [
          "Topic 1.1: Character Arcs & Motif Identification",
          "Topic 1.2: Historical Context in Victorian Literature",
          "Topic 1.3: Authorial Intent vs. Reader Response"
        ]
      }
    ]
  },
  'history': {
    desc: "A chronological view of global historical epochs, geo-political transformations, and democratic constitutional systems.",
    sections: [
      {
        name: "Global Industrialization",
        topics: [
          "Topic 1.1: The Industrial Revolution and Urbanization",
          "Topic 1.2: Geo-Political Boundaries post-1918",
          "Topic 1.3: The Evolution of Global Trade Agreements"
        ]
      }
    ]
  }
};
