/**
 * Scoring Configuration - Point values and rules
 * Modify these values to adjust game balance
 */

export const SCORING_CONFIG = {
  // Daily goals
  daily: {
    earlyCompletion: {
      userPoints: 20,
      aiPoints: -5,
      message: "Early completion! +20 points (AI loses 5)",
    },
    onTimeCompletion: {
      userPoints: 5,
      aiPoints: 5,
      message: "Task completed! +5 points (AI also gets +5)",
    },
    missed: {
      userPoints: 0,
      aiPoints: 15,
      message: "Missed goal! AI gains 15 points",
    },
  },
  
  // Long-term goals
  longTerm: {
    earlyCompletion: {
      userPoints: 20,
      aiPoints: -5,
      message: "Early completion! +20 points (AI loses 5)",
    },
    onTimeCompletion: {
      userPoints: 10,
      aiPoints: 0,
      message: "On-time completion! +10 points",
    },
    lateCompletion: {
      userPoints: 5,
      aiPoints: 5,
      message: "Late completion! +5 points (AI gets +5)",
    },
    noDeadline: {
      userPoints: 10,
      aiPoints: 0,
      message: "Goal completed! +10 points",
    },
    missed: {
      userPoints: 0,
      aiPoints: 15,
      message: "Missed goal! AI gains 15 points",
    },
  },
  
  // Victory thresholds
  victory: {
    pointsToWin: 100, // Points needed for end-of-day victory
    streakBonus: 5, // Bonus points per consecutive day
  },
};
