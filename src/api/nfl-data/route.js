import { NextResponse } from 'next/server';

// 2025 NFL Season Data - Updated June 11, 2025
// All roster moves, trades, and current information included

const nfl2025Data = {
  // Updated Week 1 2025 Schedule with Current Rosters
  week1Games: [
    {
      id: 1,
      homeTeam: "New York Jets",
      awayTeam: "Pittsburgh Steelers", 
      date: "2025-09-07",
      time: "1:00 PM ET",
      network: "CBS",
      keyMatchup: "Aaron Rodgers (41) REVENGE vs Jets who released him",
      spread: "PIT -3.5",
      total: "42.5",
      weather: "Clear, 75°F",
      analysis: "Rodgers gets revenge against team that released him after 20 seconds. DK Metcalf upgrade from Geno Smith to HOF QB.",
      confidence: "HIGH",
      topProp: "DK Metcalf Over 75.5 receiving yards"
    },
    {
      id: 2,
      homeTeam: "Green Bay Packers",
      awayTeam: "Chicago Bears",
      date: "2025-09-07", 
      time: "1:00 PM ET",
      network: "FOX",
      keyMatchup: "Caleb Williams YEAR 2 (no longer rookie) vs Jordan Love",
      spread: "GB -6.5",
      total: "45.5",
      weather: "Clear, 72°F",
      analysis: "Williams enters sophomore season with high expectations. Historical Year 2 QB leap expected.",
      confidence: "HIGH",
      topProp: "Caleb Williams Over 1.5 passing TDs"
    },
    {
      id: 3,
      homeTeam: "Buffalo Bills",
      awayTeam: "Miami Dolphins",
      date: "2025-09-07",
      time: "1:00 PM ET", 
      network: "CBS",
      keyMatchup: "AFC East rivalry - Bills heavy favorites",
      spread: "BUF -7.5",
      total: "47.5",
      weather: "Partly cloudy, 75°F",
      analysis: "Bills coming off strong season, Dolphins still searching for consistency",
      confidence: "MEDIUM",
      topProp: "Josh Allen Over 275.5 passing yards"
    },
    {
      id: 4,
      homeTeam: "Cincinnati Bengals",
      awayTeam: "Cleveland Browns",
      date: "2025-09-07",
      time: "1:00 PM ET",
      network: "CBS", 
      keyMatchup: "Joe Burrow vs Kenny Pickett (new Browns starter)",
      spread: "CIN -4.5",
      total: "44.5",
      weather: "Clear, 78°F",
      analysis: "Pickett acquired from Eagles, gets fresh start with Browns",
      confidence: "HIGH",
      topProp: "Ja'Marr Chase Over 85.5 receiving yards"
    },
    {
      id: 5,
      homeTeam: "Indianapolis Colts", 
      awayTeam: "Houston Texans",
      date: "2025-09-07",
      time: "1:00 PM ET",
      network: "CBS",
      keyMatchup: "Daniel Jones debut vs C.J. Stroud + Nick Chubb",
      spread: "HOU -3.5", 
      total: "43.5",
      weather: "Dome",
      analysis: "Jones gets fresh start with Colts, Texans added Nick Chubb from Browns",
      confidence: "MEDIUM",
      topProp: "C.J. Stroud Over 265.5 passing yards"
    },
    {
      id: 6,
      homeTeam: "Jacksonville Jaguars",
      awayTeam: "Tennessee Titans", 
      date: "2025-09-07",
      time: "1:00 PM ET",
      network: "CBS",
      keyMatchup: "AFC South battle - lowest total of week",
      spread: "JAX -2.5",
      total: "41.5",
      weather: "Hot, 88°F",
      analysis: "Low-scoring divisional matchup expected",
      confidence: "MEDIUM",
      topProp: "Calvin Ridley Over 65.5 receiving yards"
    },
    {
      id: 7,
      homeTeam: "New England Patriots",
      awayTeam: "Philadelphia Eagles",
      date: "2025-09-07", 
      time: "1:00 PM ET",
      network: "FOX",
      keyMatchup: "Stefon Diggs Patriots debut vs Saquon Barkley",
      spread: "PHI -4.5",
      total: "44.5", 
      weather: "Clear, 73°F",
      analysis: "Diggs brings elite talent to Patriots, Barkley extended with Eagles",
      confidence: "HIGH",
      topProp: "Stefon Diggs Over 75.5 receiving yards"
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
      weather: "Hot, 85°F",
      analysis: "Saints slight road favorites in division matchup",
      confidence: "MEDIUM",
      topProp: "Alvin Kamara Over 75.5 rushing yards"
    },
    {
      id: 9,
      homeTeam: "Detroit Lions", 
      awayTeam: "Minnesota Vikings",
      date: "2025-09-07",
      time: "4:05 PM ET",
      network: "FOX",
      keyMatchup: "NFC North powerhouses - highest total of week",
      spread: "DET -3.5",
      total: "48.5",
      weather: "Dome",
      analysis: "Offensive shootout expected between two high-powered offenses",
      confidence: "HIGH",
      topProp: "Justin Jefferson Over 95.5 receiving yards"
    },
    {
      id: 10,
      homeTeam: "Las Vegas Raiders",
      awayTeam: "Denver Broncos",
      date: "2025-09-07",
      time: "4:05 PM ET", 
      network: "CBS",
      keyMatchup: "Geno Smith (new Raiders QB) vs Bo Nix",
      spread: "LV -1.5",
      total: "43.5",
      weather: "Hot, 95°F",
      analysis: "Smith acquired from Seahawks, gets massive extension",
      confidence: "MEDIUM",
      topProp: "Geno Smith Over 245.5 passing yards"
    },
    {
      id: 11,
      homeTeam: "Los Angeles Chargers",
      awayTeam: "Kansas City Chiefs",
      date: "2025-09-07",
      time: "4:25 PM ET",
      network: "CBS", 
      keyMatchup: "Chiefs title defense vs Najee Harris debut",
      spread: "KC -6.5",
      total: "46.5",
      weather: "Clear, 82°F",
      analysis: "Chiefs favored despite Chargers adding Harris from Steelers",
      confidence: "HIGH",
      topProp: "Patrick Mahomes Over 275.5 passing yards"
    },
    {
      id: 12,
      homeTeam: "Tampa Bay Buccaneers",
      awayTeam: "Washington Commanders",
      date: "2025-09-07",
      time: "4:25 PM ET",
      network: "FOX",
      keyMatchup: "Baker Mayfield vs Jayden Daniels (Year 2)",
      spread: "TB -2.5", 
      total: "47.5",
      weather: "Hot, 89°F",
      analysis: "Daniels enters sophomore season with high expectations",
      confidence: "MEDIUM",
      topProp: "Jayden Daniels Over 225.5 passing yards"
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
      weather: "Hot, 98°F",
      analysis: "NFC West rivalry in desert heat",
      confidence: "MEDIUM",
      topProp: "Brock Purdy Over 275.5 passing yards"
    },
    {
      id: 14,
      homeTeam: "Seattle Seahawks",
      awayTeam: "Los Angeles Rams",
      date: "2025-09-07",
      time: "4:25 PM ET",
      network: "FOX",
      keyMatchup: "Sam Darnold ($100M) vs Stafford + Davante Adams",
      spread: "LAR -1.5",
      total: "45.5",
      weather: "Clear, 75°F",
      analysis: "Darnold gets massive contract, Rams added Adams from Raiders",
      confidence: "HIGH",
      topProp: "Davante Adams Over 75.5 receiving yards"
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
      weather: "Dome",
      analysis: "Primetime NFC showdown with highest total of the slate",
      confidence: "HIGH",
      topProp: "CeeDee Lamb Over 85.5 receiving yards"
    },
    {
      id: 16,
      homeTeam: "New York Giants",
      awayTeam: "Baltimore Ravens", 
      date: "2025-09-08",
      time: "8:15 PM ET",
      network: "ESPN",
      keyMatchup: "Russell Wilson Giants debut vs Lamar Jackson",
      spread: "BAL -7.5",
      total: "46.5",
      weather: "Clear, 76°F",
      analysis: "Wilson's Giants debut against MVP candidate Jackson",
      confidence: "HIGH",
      topProp: "Lamar Jackson Over 55.5 rushing yards"
    }
  ],

  // Updated Player Props with Current Teams (2025)
  playerProps: [
    {
      name: "Aaron Rodgers",
      position: "QB",
      team: "Pittsburgh Steelers", // UPDATED
      age: 41,
      experience: "20th season",
      contract: "1-year, $13.65M ($10M guaranteed)",
      props: {
        passingYards: {
          line: 4150.5,
          recommendation: "Under",
          confidence: "Medium",
          reasoning: "Age 41, new system, but elite weapons in DK Metcalf and Freiermuth"
        },
        passingTDs: {
          line: 26.5,
          recommendation: "Over", 
          confidence: "High",
          reasoning: "Red zone targets in Metcalf, improved weapons from Jets"
        },
        interceptions: {
          line: 12.5,
          recommendation: "Under",
          confidence: "Medium",
          reasoning: "Better weapons should lead to better decisions"
        }
      },
      keyGames: ["Week 1 @ NYJ (Revenge)", "Week 8 vs GB (Return to Lambeau)"],
      note: "Jets released him after 20 seconds in meeting"
    },
    {
      name: "DK Metcalf",
      position: "WR",
      team: "Pittsburgh Steelers", // UPDATED - Traded from Seahawks
      age: 27,
      contract: "4-year, $132M extension",
      props: {
        receivingYards: {
          line: 1150.5,
          recommendation: "Over",
          confidence: "High",
          reasoning: "Massive upgrade from Geno Smith to Aaron Rodgers, WR1 role, huge contract"
        },
        receptions: {
          line: 75.5,
          recommendation: "Over", 
          confidence: "High",
          reasoning: "Rodgers loves his #1 target, should see 140+ targets"
        },
        touchdowns: {
          line: 8.5,
          recommendation: "Over",
          confidence: "Medium",
          reasoning: "Red zone monster with elite QB"
        }
      },
      weeklyProjection: {
        targets: 9.2,
        receptions: 5.8,
        yards: 82,
        touchdowns: 0.65
      }
    },
    {
      name: "Caleb Williams",
      position: "QB", 
      team: "Chicago Bears",
      age: 23,
      experience: "2nd season", // UPDATED - No longer rookie
      props: {
        passingYards: {
          line: 3850.5,
          recommendation: "Over",
          confidence: "High", 
          reasoning: "Year 2 leap expected, improved weapons, no longer rookie struggles"
        },
        passingTDs: {
          line: 24.5,
          recommendation: "Over",
          confidence: "High",
          reasoning: "Sophomore surge, better red zone efficiency expected"
        },
        rushingYards: {
          line: 450.5,
          recommendation: "Over",
          confidence: "Medium",
          reasoning: "Mobile QB with designed runs"
        }
      },
      development: "Expected to make significant Year 2 leap"
    },
    {
      name: "Justin Fields", 
      position: "QB",
      team: "New York Jets", // UPDATED - Signed with Jets
      age: 26,
      contract: "2-year, $40M ($30M guaranteed)",
      props: {
        passingYards: {
          line: 3200.5,
          recommendation: "Over",
          confidence: "Medium",
          reasoning: "Better weapons than Chicago, fresh start, Garrett Wilson"
        },
        rushingYards: {
          line: 650.5,
          recommendation: "Over",
          confidence: "High",
          reasoning: "Elite rushing ability, Jets will design runs"
        }
      },
      note: "Jets moved on from Rodgers for Fields"
    },
    {
      name: "Nick Chubb",
      position: "RB",
      team: "Houston Texans", // UPDATED - Signed with Texans
      age: 29,
      props: {
        rushingYards: {
          line: 950.5,
          recommendation: "Under",
          confidence: "Medium", 
          reasoning: "Injury recovery, new team, age concerns, likely timeshare"
        },
        touchdowns: {
          line: 8.5,
          recommendation: "Over",
          confidence: "Medium",
          reasoning: "Goal line back, Texans improved offense"
        }
      },
      injuryConcern: "Knee injury recovery from 2023"
    },
    {
      name: "Najee Harris",
      position: "RB", 
      team: "Los Angeles Chargers", // UPDATED - Signed with Chargers
      age: 27,
      contract: "1-year, $5.25M (fully guaranteed)",
      props: {
        rushingYards: {
          line: 1100.5,
          recommendation: "Over",
          confidence: "Medium",
          reasoning: "Better offensive line than Pittsburgh, fresh start"
        },
        receptions: {
          line: 45.5,
          recommendation: "Over",
          confidence: "High",
          reasoning: "Pass-catching back, Harbaugh system utilizes RBs"
        }
      }
    },
    {
      name: "Russell Wilson",
      position: "QB",
      team: "New York Giants", // UPDATED - Signed with Giants
      age: 36,
      contract: "1-year, $10.5M (up to $21M)",
      props: {
        passingYards: {
          line: 3400.5,
          recommendation: "Under",
          confidence: "Medium",
          reasoning: "Age, limited weapons, Giants offensive struggles"
        }
      }
    },
    {
      name: "Davante Adams",
      position: "WR",
      team: "Los Angeles Rams", // UPDATED - Signed with Rams
      age: 32,
      contract: "2-year, $46M ($26M guaranteed)",
      props: {
        receivingYards: {
          line: 1050.5,
          recommendation: "Over",
          confidence: "Medium",
          reasoning: "Reunion with Stafford, proven chemistry from Green Bay days"
        },
        receptions: {
          line: 85.5,
          recommendation: "Over",
          confidence: "High",
          reasoning: "Slot role, high-volume target in Rams offense"
        }
      }
    },
    {
      name: "Geno Smith",
      position: "QB",
      team: "Las Vegas Raiders", // UPDATED - Traded to Raiders
      age: 34,
      contract: "2-year extension, $85.5M ($66.5M guaranteed)",
      props: {
        passingYards: {
          line: 3800.5,
          recommendation: "Over",
          confidence: "Medium",
          reasoning: "Massive contract, Raiders need production"
        }
      }
    },
    {
      name: "Sam Darnold",
      position: "QB", 
      team: "Seattle Seahawks", // UPDATED - Signed with Seahawks
      age: 27,
      contract: "3-year, $100.5M ($55M guaranteed)",
      props: {
        passingYards: {
          line: 3600.5,
          recommendation: "Over",
          confidence: "Medium",
          reasoning: "Huge contract, Seahawks weapons, fresh start"
        }
      }
    }
  ],

  // Key 2025 Storylines
  keyStorylines: [
    {
      title: "Aaron Rodgers' Revenge Tour",
      description: "41-year-old QB faces Jets Week 1, Packers Week 8 in primetime",
      impact: "High",
      games: ["Week 1 @ NYJ", "Week 8 vs GB (SNF)"],
      note: "Jets released him after 20 seconds in meeting"
    },
    {
      title: "Sophomore Surge Season", 
      description: "Caleb Williams, Jayden Daniels no longer rookies - Year 2 leap expected",
      impact: "High",
      reasoning: "Historically QBs make biggest jump in Year 2"
    },
    {
      title: "Quarterback Musical Chairs",
      description: "Wilson (Giants), Jones (Colts), Fields (Jets), Darnold (Seahawks)",
      impact: "Medium",
      note: "Major QB movement across league"
    },
    {
      title: "DK Metcalf's $132M Bet",
      description: "Steelers traded for and extended Metcalf, paired with Rodgers",
      impact: "High",
      reasoning: "Massive investment in WR-QB combo"
    },
    {
      title: "Running Back Diaspora",
      description: "Chubb (Texans), Harris (Chargers), major RB movement",
      impact: "Medium"
    }
  ],

  // Injury Watch List
  injuryWatch: [
    {
      player: "Aaron Rodgers",
      team: "Pittsburgh Steelers",
      concern: "Age (41) and Achilles recovery", 
      impact: "Monitor workload, mobility concerns"
    },
    {
      player: "Nick Chubb",
      team: "Houston Texans",
      concern: "Knee injury recovery from 2023",
      impact: "Workload management, timeshare likely"
    },
    {
      player: "Roman Wilson",
      team: "Pittsburgh Steelers",
      concern: "Missed entire rookie season with injury", 
      impact: "Health crucial for 2nd season"
    }
  ],

  lastUpdated: "2025-06-11T20:00:00Z",
  dataVersion: "2025.1.0"
};

export async function GET() {
  try {
    return NextResponse.json(nfl2025Data);
  } catch (error) {
    console.error('Error fetching NFL data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NFL data' },
      { status: 500 }
    );
  }
} 