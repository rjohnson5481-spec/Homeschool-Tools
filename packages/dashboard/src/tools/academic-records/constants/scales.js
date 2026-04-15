// Grading scales for Academic Records.
// Two grading systems supported:
//   - LETTER:  A/B/C/D/F based on percentage thresholds (academic courses)
//   - ESNU:    E/S/N/U descriptive grades (skills, conduct, electives)
//
// No external dependencies — pure data only.

export const LETTER_SCALE = [
  { grade: 'A', descriptor: 'Excellent',         minPercent: 90, maxPercent: 100 },
  { grade: 'B', descriptor: 'Good',              minPercent: 80, maxPercent: 89  },
  { grade: 'C', descriptor: 'Satisfactory',      minPercent: 70, maxPercent: 79  },
  { grade: 'D', descriptor: 'Needs Improvement', minPercent: 60, maxPercent: 69  },
  { grade: 'F', descriptor: 'Unsatisfactory',    minPercent: 0,  maxPercent: 59  },
];

export const ESNU_SCALE = [
  { grade: 'E', descriptor: 'Excellent'      },
  { grade: 'S', descriptor: 'Satisfactory'   },
  { grade: 'N', descriptor: 'Needs Work'     },
  { grade: 'U', descriptor: 'Unsatisfactory' },
];

export const GRADING_TYPES = {
  LETTER: 'letter',
  ESNU:   'esnu',
};
