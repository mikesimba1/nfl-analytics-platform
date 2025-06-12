// Expanded Player Database - Additional NFL Players
const expandedPlayers = {
  // Additional Running Backs
  runningBacks: {
    'Saquon Barkley': {
      position: 'RB1',
      team: 'Philadelphia Eagles',
      baselineStats: {
        rushingYards: 1312, rushingTDs: 10, receivingYards: 280, receivingTDs: 2, receptions: 41
      },
      contextualPerformance: {
        gameScript: {
          leading: { rushingAttempts: 19, receivingTargets: 4 },
          trailing: { rushingAttempts: 13, receivingTargets: 6 },
          close: { rushingAttempts: 16, receivingTargets: 5 }
        },
        fieldPosition: {
          shortField: { tdRate: 0.48, yardsPerTouch: 4.5 },
          longField: { tdRate: 0.09, yardsPerTouch: 5.1 }
        },
        situational: {
          redZone: { rushingTDs: 0.78, receivingTDs: 0.22 },
          thirdDown: { targetShare: 0.18 },
          twoMinute: { targetShare: 0.21 }
        },
        garbageTime: {
          frequency: 0.13,
          avgYards: 35,
          reliability: 0.79
        }
      },
      volumeIntelligence: {
        snapCount: 0.72,
        rushAttempts: 16.8,
        targets: 4.9,
        targetShare: 0.12,
        redZoneTouches: 3.6
      }
    },

    'Derrick Henry': {
      position: 'RB1',
      team: 'Baltimore Ravens',
      baselineStats: {
        rushingYards: 1538, rushingTDs: 13, receivingYards: 169, receivingTDs: 1, receptions: 20
      },
      contextualPerformance: {
        gameScript: {
          leading: { rushingAttempts: 24, receivingTargets: 2 },
          trailing: { rushingAttempts: 16, receivingTargets: 3 },
          close: { rushingAttempts: 20, receivingTargets: 2.5 }
        },
        fieldPosition: {
          shortField: { tdRate: 0.58, yardsPerTouch: 4.1 },
          longField: { tdRate: 0.06, yardsPerTouch: 4.9 }
        },
        situational: {
          redZone: { rushingTDs: 0.91, receivingTDs: 0.09 },
          thirdDown: { targetShare: 0.08 },
          twoMinute: { targetShare: 0.06 }
        },
        garbageTime: {
          frequency: 0.09,
          avgYards: 22,
          reliability: 0.71
        }
      },
      volumeIntelligence: {
        snapCount: 0.65,
        rushAttempts: 20.1,
        targets: 2.4,
        targetShare: 0.06,
        redZoneTouches: 4.8
      }
    },

    'Alvin Kamara': {
      position: 'RB1',
      team: 'New Orleans Saints',
      baselineStats: {
        rushingYards: 1180, rushingTDs: 6, receivingYards: 466, receivingTDs: 1, receptions: 75
      },
      contextualPerformance: {
        gameScript: {
          leading: { rushingAttempts: 16, receivingTargets: 8 },
          trailing: { rushingAttempts: 11, receivingTargets: 11 },
          close: { rushingAttempts: 13.5, receivingTargets: 9.5 }
        },
        fieldPosition: {
          shortField: { tdRate: 0.38, yardsPerTouch: 4.6 },
          longField: { tdRate: 0.11, yardsPerTouch: 5.3 }
        },
        situational: {
          redZone: { rushingTDs: 0.71, receivingTDs: 0.29 },
          thirdDown: { targetShare: 0.31 },
          twoMinute: { targetShare: 0.38 }
        },
        garbageTime: {
          frequency: 0.18,
          avgYards: 48,
          reliability: 0.84
        }
      },
      volumeIntelligence: {
        snapCount: 0.74,
        rushAttempts: 13.8,
        targets: 9.2,
        targetShare: 0.22,
        redZoneTouches: 2.9
      }
    },

    'Bijan Robinson': {
      position: 'RB1',
      team: 'Atlanta Falcons',
      baselineStats: {
        rushingYards: 976, rushingTDs: 8, receivingYards: 487, receivingTDs: 4, receptions: 58
      },
      contextualPerformance: {
        gameScript: {
          leading: { rushingAttempts: 15, receivingTargets: 6 },
          trailing: { rushingAttempts: 10, receivingTargets: 8 },
          close: { rushingAttempts: 12.5, receivingTargets: 7 }
        },
        fieldPosition: {
          shortField: { tdRate: 0.42, yardsPerTouch: 4.3 },
          longField: { tdRate: 0.13, yardsPerTouch: 4.9 }
        },
        situational: {
          redZone: { rushingTDs: 0.61, receivingTDs: 0.39 },
          thirdDown: { targetShare: 0.24 },
          twoMinute: { targetShare: 0.29 }
        },
        garbageTime: {
          frequency: 0.16,
          avgYards: 41,
          reliability: 0.78
        }
      },
      volumeIntelligence: {
        snapCount: 0.69,
        rushAttempts: 12.8,
        targets: 6.9,
        targetShare: 0.16,
        redZoneTouches: 3.1
      }
    },

    'Breece Hall': {
      position: 'RB1',
      team: 'New York Jets',
      baselineStats: {
        rushingYards: 1066, rushingTDs: 4, receivingYards: 591, receivingTDs: 4, receptions: 76
      },
      contextualPerformance: {
        gameScript: {
          leading: { rushingAttempts: 17, receivingTargets: 7 },
          trailing: { rushingAttempts: 12, receivingTargets: 10 },
          close: { rushingAttempts: 14.5, receivingTargets: 8.5 }
        },
        fieldPosition: {
          shortField: { tdRate: 0.35, yardsPerTouch: 4.4 },
          longField: { tdRate: 0.14, yardsPerTouch: 5.1 }
        },
        situational: {
          redZone: { rushingTDs: 0.52, receivingTDs: 0.48 },
          thirdDown: { targetShare: 0.29 },
          twoMinute: { targetShare: 0.34 }
        },
        garbageTime: {
          frequency: 0.21,
          avgYards: 56,
          reliability: 0.81
        }
      },
      volumeIntelligence: {
        snapCount: 0.71,
        rushAttempts: 14.2,
        targets: 8.4,
        targetShare: 0.19,
        redZoneTouches: 2.8
      }
    }
  },

  // Additional Wide Receivers
  wideReceivers: {
    'Cooper Kupp': {
      position: 'WR1',
      team: 'Los Angeles Rams',
      baselineStats: {
        receivingYards: 1947, receivingTDs: 8, receptions: 145, targets: 191
      },
      contextualPerformance: {
        gameScript: {
          leading: { targets: 10, airYards: 9.8 },
          trailing: { targets: 13, airYards: 11.2 },
          close: { targets: 11.5, airYards: 10.5 }
        },
        fieldPosition: {
          shortField: { tdRate: 0.14, yardsPerTarget: 8.9 },
          longField: { tdRate: 0.04, yardsPerTarget: 10.8 }
        },
        situational: {
          redZone: { targetShare: 0.31, tdRate: 0.18 },
          thirdDown: { targetShare: 0.33, conversionRate: 0.67 },
          twoMinute: { targetShare: 0.38, yardsPerTarget: 10.9 }
        },
        garbageTime: {
          frequency: 0.17,
          avgYards: 61,
          reliability: 0.86
        }
      },
      volumeIntelligence: {
        snapCount: 0.91,
        targets: 11.2,
        targetShare: 0.29,
        airYards: 10.2,
        redZoneTargets: 2.4
      }
    },

    'Davante Adams': {
      position: 'WR1',
      team: 'Las Vegas Raiders',
      baselineStats: {
        receivingYards: 1516, receivingTDs: 14, receptions: 103, targets: 175
      },
      contextualPerformance: {
        gameScript: {
          leading: { targets: 9, airYards: 11.8 },
          trailing: { targets: 12, airYards: 13.4 },
          close: { targets: 10.5, airYards: 12.6 }
        },
        fieldPosition: {
          shortField: { tdRate: 0.19, yardsPerTarget: 8.1 },
          longField: { tdRate: 0.06, yardsPerTarget: 9.4 }
        },
        situational: {
          redZone: { targetShare: 0.34, tdRate: 0.24 },
          thirdDown: { targetShare: 0.29, conversionRate: 0.63 },
          twoMinute: { targetShare: 0.32, yardsPerTarget: 10.8 }
        },
        garbageTime: {
          frequency: 0.20,
          avgYards: 73,
          reliability: 0.88
        }
      },
      volumeIntelligence: {
        snapCount: 0.89,
        targets: 10.3,
        targetShare: 0.27,
        airYards: 12.6,
        redZoneTargets: 2.2
      }
    },

    'DeAndre Hopkins': {
      position: 'WR1',
      team: 'Tennessee Titans',
      baselineStats: {
        receivingYards: 1407, receivingTDs: 7, receptions: 75, targets: 137
      },
      contextualPerformance: {
        gameScript: {
          leading: { targets: 7, airYards: 12.1 },
          trailing: { targets: 10, airYards: 14.2 },
          close: { targets: 8.5, airYards: 13.1 }
        },
        fieldPosition: {
          shortField: { tdRate: 0.16, yardsPerTarget: 9.2 },
          longField: { tdRate: 0.04, yardsPerTarget: 11.1 }
        },
        situational: {
          redZone: { targetShare: 0.28, tdRate: 0.21 },
          thirdDown: { targetShare: 0.31, conversionRate: 0.61 },
          twoMinute: { targetShare: 0.34, yardsPerTarget: 11.8 }
        },
        garbageTime: {
          frequency: 0.22,
          avgYards: 67,
          reliability: 0.83
        }
      },
      volumeIntelligence: {
        snapCount: 0.87,
        targets: 8.1,
        targetShare: 0.24,
        airYards: 13.1,
        redZoneTargets: 1.9
      }
    },

    'Mike Evans': {
      position: 'WR1',
      team: 'Tampa Bay Buccaneers',
      baselineStats: {
        receivingYards: 1255, receivingTDs: 13, receptions: 79, targets: 143
      },
      contextualPerformance: {
        gameScript: {
          leading: { targets: 7, airYards: 14.2 },
          trailing: { targets: 10, airYards: 16.8 },
          close: { targets: 8.5, airYards: 15.5 }
        },
        fieldPosition: {
          shortField: { tdRate: 0.22, yardsPerTarget: 7.8 },
          longField: { tdRate: 0.07, yardsPerTarget: 9.9 }
        },
        situational: {
          redZone: { targetShare: 0.36, tdRate: 0.28 },
          thirdDown: { targetShare: 0.24, conversionRate: 0.58 },
          twoMinute: { targetShare: 0.29, yardsPerTarget: 12.1 }
        },
        garbageTime: {
          frequency: 0.15,
          avgYards: 54,
          reliability: 0.81
        }
      },
      volumeIntelligence: {
        snapCount: 0.86,
        targets: 8.4,
        targetShare: 0.22,
        airYards: 15.5,
        redZoneTargets: 2.6
      }
    },

    'DK Metcalf': {
      position: 'WR1',
      team: 'Seattle Seahawks',
      baselineStats: {
        receivingYards: 1124, receivingTDs: 8, receptions: 66, targets: 134
      },
      contextualPerformance: {
        gameScript: {
          leading: { targets: 6, airYards: 15.8 },
          trailing: { targets: 9, airYards: 18.2 },
          close: { targets: 7.5, airYards: 17.0 }
        },
        fieldPosition: {
          shortField: { tdRate: 0.18, yardsPerTarget: 7.2 },
          longField: { tdRate: 0.05, yardsPerTarget: 9.8 }
        },
        situational: {
          redZone: { targetShare: 0.29, tdRate: 0.24 },
          thirdDown: { targetShare: 0.22, conversionRate: 0.54 },
          twoMinute: { targetShare: 0.26, yardsPerTarget: 11.4 }
        },
        garbageTime: {
          frequency: 0.14,
          avgYards: 49,
          reliability: 0.77
        }
      },
      volumeIntelligence: {
        snapCount: 0.84,
        targets: 7.9,
        targetShare: 0.21,
        airYards: 17.0,
        redZoneTargets: 1.8
      }
    }
  },

  // Additional Tight Ends
  tightEnds: {
    'Travis Kelce': {
      position: 'TE1',
      team: 'Kansas City Chiefs',
      baselineStats: {
        receivingYards: 984, receivingTDs: 5, receptions: 93, targets: 121
      },
      contextualPerformance: {
        gameScript: {
          leading: { targets: 6, airYards: 8.2 },
          trailing: { targets: 8, airYards: 9.8 },
          close: { targets: 7, airYards: 9.0 }
        },
        fieldPosition: {
          shortField: { tdRate: 0.16, yardsPerTarget: 7.8 },
          longField: { tdRate: 0.03, yardsPerTarget: 8.9 }
        },
        situational: {
          redZone: { targetShare: 0.24, tdRate: 0.19 },
          thirdDown: { targetShare: 0.28, conversionRate: 0.71 },
          twoMinute: { targetShare: 0.31, yardsPerTarget: 9.4 }
        },
        garbageTime: {
          frequency: 0.15,
          avgYards: 38,
          reliability: 0.89
        }
      },
      volumeIntelligence: {
        snapCount: 0.82,
        targets: 7.1,
        targetShare: 0.21,
        airYards: 9.0,
        redZoneTargets: 1.6
      }
    },

    'Mark Andrews': {
      position: 'TE1',
      team: 'Baltimore Ravens',
      baselineStats: {
        receivingYards: 544, receivingTDs: 11, receptions: 45, targets: 86
      },
      contextualPerformance: {
        gameScript: {
          leading: { targets: 4, airYards: 9.1 },
          trailing: { targets: 6, airYards: 10.8 },
          close: { targets: 5, airYards: 9.9 }
        },
        fieldPosition: {
          shortField: { tdRate: 0.28, yardsPerTarget: 6.9 },
          longField: { tdRate: 0.08, yardsPerTarget: 7.8 }
        },
        situational: {
          redZone: { targetShare: 0.31, tdRate: 0.34 },
          thirdDown: { targetShare: 0.24, conversionRate: 0.68 },
          twoMinute: { targetShare: 0.27, yardsPerTarget: 8.2 }
        },
        garbageTime: {
          frequency: 0.12,
          avgYards: 29,
          reliability: 0.82
        }
      },
      volumeIntelligence: {
        snapCount: 0.78,
        targets: 5.1,
        targetShare: 0.16,
        airYards: 9.9,
        redZoneTargets: 2.1
      }
    },

    'George Kittle': {
      position: 'TE1',
      team: 'San Francisco 49ers',
      baselineStats: {
        receivingYards: 1020, receivingTDs: 6, receptions: 65, targets: 91
      },
      contextualPerformance: {
        gameScript: {
          leading: { targets: 4, airYards: 10.8 },
          trailing: { targets: 6, airYards: 12.4 },
          close: { targets: 5, airYards: 11.6 }
        },
        fieldPosition: {
          shortField: { tdRate: 0.21, yardsPerTarget: 8.9 },
          longField: { tdRate: 0.05, yardsPerTarget: 12.1 }
        },
        situational: {
          redZone: { targetShare: 0.22, tdRate: 0.26 },
          thirdDown: { targetShare: 0.21, conversionRate: 0.69 },
          twoMinute: { targetShare: 0.24, yardsPerTarget: 10.8 }
        },
        garbageTime: {
          frequency: 0.15,
          avgYards: 42,
          reliability: 0.85
        }
      },
      volumeIntelligence: {
        snapCount: 0.79,
        targets: 5.4,
        targetShare: 0.14,
        airYards: 11.6,
        redZoneTargets: 1.4
      }
    }
  }
};

module.exports = expandedPlayers; 