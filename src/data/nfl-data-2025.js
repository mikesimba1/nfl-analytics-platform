// 2025 NFL Season Data - Updated with Current Rosters and Moves
// Last Updated: June 11, 2025

export const nfl2025Data = {
  // Current Week 1 2025 Schedule
  week1Schedule: [
    {
      id: 1,
      homeTeam: "New York Jets",
      awayTeam: "Pittsburgh Steelers", 
      date: "2025-09-07",
      time: "1:00 PM ET",
      network: "CBS",
      keyMatchup: "Aaron Rodgers returns to face his former team",
      spread: "PIT -3.5",
      total: "42.5",
      weather: "Dome"
    },
    {
      id: 2,
      homeTeam: "Green Bay Packers",
      awayTeam: "Chicago Bears",
      date: "2025-09-07", 
      time: "1:00 PM ET",
      network: "FOX",
      keyMatchup: "Caleb Williams (2nd season) vs Jordan Love",
      spread: "GB -6.5",
      total: "45.5",
      weather: "Clear, 72°F"
    },
    {
      id: 3,
      homeTeam: "Buffalo Bills",
      awayTeam: "Miami Dolphins",
      date: "2025-09-07",
      time: "1:00 PM ET", 
      network: "CBS",
      keyMatchup: "AFC East rivalry renewed",
      spread: "BUF -7.5",
      total: "47.5",
      weather: "Partly cloudy, 75°F"
    },
    {
      id: 4,
      homeTeam: "Cincinnati Bengals",
      awayTeam: "Cleveland Browns",
      date: "2025-09-07",
      time: "1:00 PM ET",
      network: "CBS", 
      keyMatchup: "Joe Burrow vs Kenny Pickett",
      spread: "CIN -4.5",
      total: "44.5",
      weather: "Clear, 78°F"
    },
    {
      id: 5,
      homeTeam: "Indianapolis Colts", 
      awayTeam: "Houston Texans",
      date: "2025-09-07",
      time: "1:00 PM ET",
      network: "CBS",
      keyMatchup: "Daniel Jones debut vs C.J. Stroud",
      spread: "HOU -3.5", 
      total: "43.5",
      weather: "Dome"
    },
    {
      id: 6,
      homeTeam: "Jacksonville Jaguars",
      awayTeam: "Tennessee Titans", 
      date: "2025-09-07",
      time: "1:00 PM ET",
      network: "CBS",
      keyMatchup: "AFC South battle",
      spread: "JAX -2.5",
      total: "41.5",
      weather: "Hot, 88°F"
    },
    {
      id: 7,
      homeTeam: "New England Patriots",
      awayTeam: "Philadelphia Eagles",
      date: "2025-09-07", 
      time: "1:00 PM ET",
      network: "FOX",
      keyMatchup: "Stefon Diggs debut vs Saquon Barkley",
      spread: "PHI -4.5",
      total: "44.5", 
      weather: "Clear, 73°F"
    },
    {
      id: 8,
      homeTeam: "Carolina Panthers",
      awayTeam: "New Orleans Saints",
      date: "2025-09-07",
      time: "1:00 PM ET",
      network: "FOX",
      keyMatchup: "NFC South rivalry",
      spread: "NO -3.5",
      total: "42.5",
      weather: "Hot, 85°F"
    },
    {
      id: 9,
      homeTeam: "Detroit Lions", 
      awayTeam: "Minnesota Vikings",
      date: "2025-09-07",
      time: "4:05 PM ET",
      network: "FOX",
      keyMatchup: "NFC North powerhouses clash",
      spread: "DET -3.5",
      total: "48.5",
      weather: "Dome"
    },
    {
      id: 10,
      homeTeam: "Las Vegas Raiders",
      awayTeam: "Denver Broncos",
      date: "2025-09-07",
      time: "4:05 PM ET", 
      network: "CBS",
      keyMatchup: "Geno Smith vs Bo Nix",
      spread: "LV -1.5",
      total: "43.5",
      weather: "Hot, 95°F"
    },
    {
      id: 11,
      homeTeam: "Los Angeles Chargers",
      awayTeam: "Kansas City Chiefs",
      date: "2025-09-07",
      time: "4:25 PM ET",
      network: "CBS", 
      keyMatchup: "AFC West title defense begins",
      spread: "KC -6.5",
      total: "46.5",
      weather: "Clear, 82°F"
    },
    {
      id: 12,
      homeTeam: "Tampa Bay Buccaneers",
      awayTeam: "Washington Commanders",
      date: "2025-09-07",
      time: "4:25 PM ET",
      network: "FOX",
      keyMatchup: "Baker Mayfield vs Jayden Daniels (2nd season)",
      spread: "TB -2.5", 
      total: "47.5",
      weather: "Hot, 89°F"
    },
    {
      id: 13,
      homeTeam: "Arizona Cardinals",
      awayTeam: "San Francisco 49ers",
      date: "2025-09-07",
      time: "4:25 PM ET",
      network: "FOX",
      keyMatchup: "Kyler Murray vs Brock Purdy",
      spread: "SF -4.5",
      total: "46.5", 
      weather: "Hot, 98°F"
    },
    {
      id: 14,
      homeTeam: "Seattle Seahawks",
      awayTeam: "Los Angeles Rams",
      date: "2025-09-07",
      time: "4:25 PM ET",
      network: "FOX",
      keyMatchup: "Sam Darnold vs Matthew Stafford",
      spread: "LAR -1.5",
      total: "45.5",
      weather: "Clear, 75°F"
    },
    {
      id: 15,
      homeTeam: "Atlanta Falcons", 
      awayTeam: "Dallas Cowboys",
      date: "2025-09-07",
      time: "8:20 PM ET",
      network: "NBC",
      keyMatchup: "Sunday Night Football - Kirk Cousins vs Dak Prescott",
      spread: "ATL -3.5",
      total: "48.5",
      weather: "Dome"
    },
    {
      id: 16,
      homeTeam: "New York Giants",
      awayTeam: "Baltimore Ravens", 
      date: "2025-09-08",
      time: "8:15 PM ET",
      network: "ESPN",
      keyMatchup: "Monday Night Football - Russell Wilson vs Lamar Jackson",
      spread: "BAL -7.5",
      total: "46.5",
      weather: "Clear, 76°F"
    }
  ],

  // Updated Team Data with 2025 Rosters
  teams: {
    "Pittsburgh Steelers": {
      quarterback: {
        starter: "Aaron Rodgers",
        age: 41,
        experience: "20th season",
        previousTeam: "New York Jets",
        keyStats2024: "3,897 yards, 28 TD, 11 INT",
        strengths: ["Arm talent", "Experience", "Leadership"],
        concerns: ["Age", "Mobility", "Coming off worst season"]
      },
      receivers: {
        wr1: {
          name: "DK Metcalf", 
          age: 27,
          previousTeam: "Seattle Seahawks",
          contract: "5-year, $150M extension",
          targets2024: 134,
          yards2024: 1255,
          tds2024: 8
        },
        wr2: {
          name: "Calvin Austin III",
          age: 25, 
          experience: "3rd season",
          role: "Slot receiver",
          targets2024: 45,
          yards2024: 398,
          tds2024: 3
        },
        wr3: {
          name: "Roman Wilson",
          age: 23,
          experience: "2nd season", 
          note: "Missed entire rookie season with injury"
        }
      },
      runningBacks: {
        rb1: {
          name: "Kaleb Johnson",
          age: 21,
          experience: "Rookie",
          college: "Iowa",
          draftRound: 3,
          comparison: "Le'Veon Bell/Najee Harris hybrid"
        },
        rb2: {
          name: "Jaylen Warren",
          age: 26,
          experience: "4th season",
          role: "Change of pace back"
        }
      },
      tightEnd: {
        te1: {
          name: "Pat Freiermuth",
          age: 26,
          experience: "5th season",
          targets2024: 78,
          yards2024: 663,
          tds2024: 4
        }
      }
    },

    "Chicago Bears": {
      quarterback: {
        starter: "Caleb Williams",
        age: 23,
        experience: "2nd season", // UPDATED - No longer rookie
        draftYear: 2024,
        keyStats2024: "3,541 yards, 20 TD, 18 INT",
        development: "Showing improvement in Year 2"
      },
      receivers: {
        wr1: {
          name: "DJ Moore",
          age: 27,
          targets2024: 140,
          yards2024: 1364,
          tds2024: 8
        },
        wr2: {
          name: "Keenan Allen", 
          age: 32,
          experience: "12th season",
          previousTeam: "Los Angeles Chargers"
        },
        wr3: {
          name: "Rome Odunze",
          age: 22,
          experience: "2nd season",
          draftYear: 2024
        }
      }
    },

    "New York Jets": {
      quarterback: {
        starter: "Justin Fields", // UPDATED - Rodgers no longer with Jets
        age: 26,
        experience: "5th season",
        contract: "2-year, $40M with $30M guaranteed",
        previousTeam: "Chicago Bears",
        keyStats2024: "2,562 yards, 16 TD, 9 INT"
      },
      receivers: {
        wr1: {
          name: "Garrett Wilson",
          age: 24,
          targets2024: 154,
          yards2024: 1104,
          tds2024: 7
        },
        wr2: {
          name: "Mike Williams",
          age: 30,
          previousTeam: "Los Angeles Chargers"
        }
      }
    },

    "Houston Texans": {
      quarterback: {
        starter: "C.J. Stroud",
        age: 23,
        experience: "2nd season",
        keyStats2024: "4,108 yards, 23 TD, 5 INT"
      },
      runningBacks: {
        rb1: {
          name: "Nick Chubb", // UPDATED - New signing
          age: 29,
          previousTeam: "Cleveland Browns",
          note: "Recovering from knee injury"
        }
      }
    },

    "New York Giants": {
      quarterback: {
        starter: "Russell Wilson", // UPDATED - New signing
        age: 36,
        contract: "1-year, $10.5M up to $21M",
        previousTeam: "Denver Broncos"
      },
      backup: {
        name: "Jameis Winston",
        contract: "2-year, $8M"
      }
    },

    "Indianapolis Colts": {
      quarterback: {
        starter: "Daniel Jones", // UPDATED - New signing
        age: 27,
        contract: "1-year, $14M with $13.15M guaranteed",
        previousTeam: "New York Giants"
      }
    },

    "Los Angeles Chargers": {
      runningBacks: {
        rb1: {
          name: "Najee Harris", // UPDATED - New signing
          age: 27,
          contract: "1-year, $5.25M fully guaranteed",
          previousTeam: "Pittsburgh Steelers"
        }
      }
    },

    "Seattle Seahawks": {
      quarterback: {
        starter: "Sam Darnold", // UPDATED - New signing
        age: 27,
        contract: "3-year, $100.5M with $55M guaranteed",
        previousTeam: "Minnesota Vikings"
      }
    },

    "Los Angeles Rams": {
      receivers: {
        wr1: {
          name: "Davante Adams", // UPDATED - New signing
          age: 32,
          contract: "2-year, $46M with $26M guaranteed",
          previousTeam: "Las Vegas Raiders"
        }
      }
    },

    "Las Vegas Raiders": {
      quarterback: {
        starter: "Geno Smith", // UPDATED - Acquired in trade
        age: 34,
        contract: "2-year extension, $85.5M with $66.5M guaranteed",
        previousTeam: "Seattle Seahawks"
      }
    }
  },

  // Updated Player Props with Current Teams
  playerProps: {
    quarterbacks: [
      {
        name: "Aaron Rodgers",
        team: "Pittsburgh Steelers", // UPDATED
        age: 41,
        passingYards: {
          line: 4150.5,
          recommendation: "Under",
          confidence: "Medium",
          reasoning: "Age concerns and new system, but has DK Metcalf"
        },
        passingTDs: {
          line: 26.5,
          recommendation: "Over", 
          confidence: "High",
          reasoning: "Red zone target in Metcalf, improved weapons"
        }
      },
      {
        name: "Caleb Williams",
        team: "Chicago Bears",
        age: 23,
        experience: "2nd season", // UPDATED
        passingYards: {
          line: 3850.5,
          recommendation: "Over",
          confidence: "High", 
          reasoning: "Year 2 leap expected, improved weapons"
        }
      },
      {
        name: "Justin Fields", 
        team: "New York Jets", // UPDATED
        age: 26,
        passingYards: {
          line: 3200.5,
          recommendation: "Over",
          confidence: "Medium",
          reasoning: "Better weapons than Chicago, fresh start"
        }
      },
      {
        name: "C.J. Stroud",
        team: "Houston Texans",
        age: 23,
        experience: "2nd season",
        passingYards: {
          line: 4250.5,
          recommendation: "Over",
          confidence: "High",
          reasoning: "Sophomore surge, added weapons"
        }
      }
    ],

    receivers: [
      {
        name: "DK Metcalf",
        team: "Pittsburgh Steelers", // UPDATED
        age: 27,
        receivingYards: {
          line: 1150.5,
          recommendation: "Over",
          confidence: "High",
          reasoning: "Aaron Rodgers upgrade, WR1 role, big contract"
        },
        receptions: {
          line: 75.5,
          recommendation: "Over", 
          confidence: "High"
        },
        touchdowns: {
          line: 8.5,
          recommendation: "Over",
          confidence: "Medium"
        }
      },
      {
        name: "Davante Adams",
        team: "Los Angeles Rams", // UPDATED
        age: 32,
        receivingYards: {
          line: 1050.5,
          recommendation: "Over",
          confidence: "Medium",
          reasoning: "Reunion with Stafford, proven chemistry"
        }
      },
      {
        name: "DJ Moore", 
        team: "Chicago Bears",
        age: 27,
        receivingYards: {
          line: 1200.5,
          recommendation: "Over",
          confidence: "High",
          reasoning: "Caleb Williams Year 2, target monster"
        }
      }
    ],

    runningBacks: [
      {
        name: "Nick Chubb",
        team: "Houston Texans", // UPDATED
        age: 29,
        rushingYards: {
          line: 950.5,
          recommendation: "Under",
          confidence: "Medium", 
          reasoning: "Injury concerns, new team, age"
        }
      },
      {
        name: "Najee Harris",
        team: "Los Angeles Chargers", // UPDATED
        age: 27,
        rushingYards: {
          line: 1100.5,
          recommendation: "Over",
          confidence: "Medium",
          reasoning: "Better offensive line, fresh start"
        }
      },
      {
        name: "Kaleb Johnson",
        team: "Pittsburgh Steelers",
        age: 21,
        experience: "Rookie",
        rushingYards: {
          line: 750.5,
          recommendation: "Over",
          confidence: "High",
          reasoning: "Immediate starter role, Iowa pedigree"
        }
      }
    ]
  },

  // Key Storylines for 2025
  keyStorylines: [
    {
      title: "Aaron Rodgers' Revenge Tour",
      description: "Faces Jets Week 1, Packers Week 8 in primetime",
      impact: "High"
    },
    {
      title: "Caleb Williams Year 2 Leap", 
      description: "No longer a rookie, expected to take major step forward",
      impact: "High"
    },
    {
      title: "Quarterback Musical Chairs",
      description: "Russell Wilson (Giants), Daniel Jones (Colts), Justin Fields (Jets)",
      impact: "Medium"
    },
    {
      title: "DK Metcalf's New Home",
      description: "$150M extension with Steelers, paired with Rodgers",
      impact: "High"
    }
  ],

  // Updated Injury Concerns
  injuryConcerns: [
    {
      player: "Aaron Rodgers",
      team: "Pittsburgh Steelers",
      concern: "Age (41) and Achilles recovery",
      impact: "Monitor closely"
    },
    {
      player: "Nick Chubb", 
      team: "Houston Texans",
      concern: "Knee injury recovery",
      impact: "Workload management expected"
    }
  ]
};

export default nfl2025Data; 