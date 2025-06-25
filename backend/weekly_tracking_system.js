#!/usr/bin/env node
/**
 * WEEKLY TRACKING SYSTEM
 * Track real-world performance to build credibility over time
 */

const fs = require('fs');
const { HonestBaselinePredictor } = require('./honest_baseline_system.js');

class WeeklyTracker {
    constructor() {
        this.trackingFile = 'data/real-current/weekly_performance_tracking.json';
        this.loadExistingData();
    }
    
    loadExistingData() {
        try {
            if (fs.existsSync(this.trackingFile)) {
                this.performanceData = JSON.parse(fs.readFileSync(this.trackingFile, 'utf8'));
            } else {
                this.performanceData = {
                    systemStartDate: new Date().toISOString(),
                    totalWeeks: 0,
                    overallRecord: { correct: 0, total: 0 },
                    weeklyResults: [],
                    accuracyTrend: [],
                    confidence: 'EXPERIMENTAL',
                    disclaimer: 'System in validation phase - results may vary'
                };
            }
        } catch (e) {
            console.log('⚠️ Error loading tracking data, starting fresh');
            this.performanceData = {
                systemStartDate: new Date().toISOString(),
                totalWeeks: 0,
                overallRecord: { correct: 0, total: 0 },
                weeklyResults: [],
                accuracyTrend: [],
                confidence: 'EXPERIMENTAL',
                disclaimer: 'System in validation phase - results may vary'
            };
        }
    }
    
    /**
     * Record weekly predictions
     */
    recordWeeklyPredictions(week, year, predictions) {
        const weekData = {
            week,
            year,
            date: new Date().toISOString(),
            predictions,
            results: null, // To be filled in later
            accuracy: null
        };
        
        this.performanceData.weeklyResults.push(weekData);
        this.saveData();
        
        console.log(`✅ Recorded ${predictions.length} predictions for Week ${week}, ${year}`);
        return weekData;
    }
    
    /**
     * Update with actual game results
     */
    updateWithResults(week, year, actualResults) {
        const weekIndex = this.performanceData.weeklyResults.findIndex(
            w => w.week === week && w.year === year
        );
        
        if (weekIndex === -1) {
            console.log(`❌ No predictions found for Week ${week}, ${year}`);
            return null;
        }
        
        const weekData = this.performanceData.weeklyResults[weekIndex];
        const predictions = weekData.predictions;
        
        let correct = 0;
        let total = predictions.length;
        
        console.log(`\n📊 UPDATING WEEK ${week} RESULTS`);
        console.log('-'.repeat(40));
        
        predictions.forEach((pred, index) => {
            const actual = actualResults[index];
            if (!actual) return;
            
            const actualWinner = actual.homeScore > actual.awayScore ? pred.homeTeam : pred.awayTeam;
            const predictionCorrect = pred.predictedWinner === actualWinner;
            
            if (predictionCorrect) correct++;
            
            console.log(`${pred.awayTeam} @ ${pred.homeTeam}: ${predictionCorrect ? '✅' : '❌'} 
                Predicted: ${pred.predictedWinner}, Actual: ${actualWinner}
                Score: ${actual.awayScore}-${actual.homeScore}`);
        });
        
        const weeklyAccuracy = correct / total;
        
        // Update week data
        weekData.results = actualResults;
        weekData.accuracy = weeklyAccuracy;
        weekData.correct = correct;
        weekData.total = total;
        weekData.resultDate = new Date().toISOString();
        
        // Update overall record
        this.performanceData.overallRecord.correct += correct;
        this.performanceData.overallRecord.total += total;
        this.performanceData.totalWeeks++;
        
        // Update accuracy trend
        this.performanceData.accuracyTrend.push({
            week,
            year,
            accuracy: weeklyAccuracy,
            cumulativeAccuracy: this.performanceData.overallRecord.correct / this.performanceData.overallRecord.total
        });
        
        // Update confidence level based on performance
        this.updateConfidenceLevel();
        
        this.saveData();
        
        console.log(`\n📈 WEEK ${week} RESULTS:`);
        console.log(`   Weekly: ${correct}/${total} = ${(weeklyAccuracy * 100).toFixed(1)}%`);
        console.log(`   Overall: ${this.performanceData.overallRecord.correct}/${this.performanceData.overallRecord.total} = ${(this.getOverallAccuracy() * 100).toFixed(1)}%`);
        
        return weekData;
    }
    
    /**
     * Update confidence level based on performance
     */
    updateConfidenceLevel() {
        const overallAccuracy = this.getOverallAccuracy();
        const totalWeeks = this.performanceData.totalWeeks;
        
        if (totalWeeks < 4) {
            this.performanceData.confidence = 'EXPERIMENTAL';
        } else if (totalWeeks < 8) {
            if (overallAccuracy >= 0.55) {
                this.performanceData.confidence = 'EMERGING';
            } else {
                this.performanceData.confidence = 'DEVELOPMENTAL';
            }
        } else if (totalWeeks < 16) {
            if (overallAccuracy >= 0.60) {
                this.performanceData.confidence = 'VALIDATED';
            } else if (overallAccuracy >= 0.55) {
                this.performanceData.confidence = 'PROMISING';
            } else {
                this.performanceData.confidence = 'NEEDS_IMPROVEMENT';
            }
        } else {
            if (overallAccuracy >= 0.62) {
                this.performanceData.confidence = 'PROVEN';
            } else if (overallAccuracy >= 0.58) {
                this.performanceData.confidence = 'SOLID';
            } else if (overallAccuracy >= 0.53) {
                this.performanceData.confidence = 'BASELINE';
            } else {
                this.performanceData.confidence = 'UNDERPERFORMING';
            }
        }
    }
    
    /**
     * Generate public performance report
     */
    generatePublicReport() {
        const overallAccuracy = this.getOverallAccuracy();
        const recentAccuracy = this.getRecentAccuracy(4); // Last 4 weeks
        
        const report = {
            systemName: "NFL Prediction System",
            lastUpdated: new Date().toISOString(),
            overallPerformance: {
                totalPredictions: this.performanceData.overallRecord.total,
                correctPredictions: this.performanceData.overallRecord.correct,
                accuracy: Math.round(overallAccuracy * 1000) / 10, // 1 decimal place
                weeksTracked: this.performanceData.totalWeeks
            },
            recentPerformance: {
                accuracy: Math.round(recentAccuracy * 1000) / 10,
                description: "Last 4 weeks"
            },
            confidenceLevel: this.performanceData.confidence,
            status: this.getSystemStatus(),
            disclaimer: "Past performance does not guarantee future results. This system is for entertainment purposes.",
            transparency: {
                methodology: "Simple team strength ratings + home field advantage",
                dataSource: "Historical NFL games and real-time results",
                updateFrequency: "Weekly after game results"
            }
        };
        
        return report;
    }
    
    /**
     * Get system status message
     */
    getSystemStatus() {
        const accuracy = this.getOverallAccuracy();
        const weeks = this.performanceData.totalWeeks;
        
        if (weeks < 4) {
            return "EXPERIMENTAL - Insufficient data for reliable assessment";
        } else if (accuracy >= 0.60) {
            return "PERFORMING WELL - Above industry average";
        } else if (accuracy >= 0.55) {
            return "ABOVE BASELINE - Better than random chance";
        } else if (accuracy >= 0.50) {
            return "BASELINE - About as good as random";
        } else {
            return "NEEDS IMPROVEMENT - Below expected performance";
        }
    }
    
    getOverallAccuracy() {
        if (this.performanceData.overallRecord.total === 0) return 0;
        return this.performanceData.overallRecord.correct / this.performanceData.overallRecord.total;
    }
    
    getRecentAccuracy(numWeeks) {
        const recentWeeks = this.performanceData.weeklyResults.slice(-numWeeks);
        const totalCorrect = recentWeeks.reduce((sum, week) => sum + (week.correct || 0), 0);
        const totalPredictions = recentWeeks.reduce((sum, week) => sum + (week.total || 0), 0);
        
        if (totalPredictions === 0) return 0;
        return totalCorrect / totalPredictions;
    }
    
    saveData() {
        try {
            fs.writeFileSync(this.trackingFile, JSON.stringify(this.performanceData, null, 2));
        } catch (e) {
            console.log('❌ Error saving tracking data:', e.message);
        }
    }
    
    /**
     * Display current status
     */
    displayStatus() {
        console.log('\n📊 SYSTEM PERFORMANCE STATUS');
        console.log('='.repeat(50));
        
        const accuracy = this.getOverallAccuracy();
        const recent = this.getRecentAccuracy(4);
        
        console.log(`Overall Record: ${this.performanceData.overallRecord.correct}/${this.performanceData.overallRecord.total} (${(accuracy * 100).toFixed(1)}%)`);
        console.log(`Recent Form: ${(recent * 100).toFixed(1)}% (last 4 weeks)`);
        console.log(`Weeks Tracked: ${this.performanceData.totalWeeks}`);
        console.log(`Confidence Level: ${this.performanceData.confidence}`);
        console.log(`Status: ${this.getSystemStatus()}`);
        
        if (this.performanceData.accuracyTrend.length > 0) {
            console.log('\nWeekly Accuracy Trend:');
            this.performanceData.accuracyTrend.slice(-8).forEach(week => {
                console.log(`  Week ${week.week}: ${(week.accuracy * 100).toFixed(1)}% (Cumulative: ${(week.cumulativeAccuracy * 100).toFixed(1)}%)`);
            });
        }
    }
}

/**
 * Demonstrate the tracking system
 */
function demonstrateTracking() {
    console.log('\n🎯 WEEKLY TRACKING SYSTEM DEMONSTRATION');
    console.log('='.repeat(50));
    
    const tracker = new WeeklyTracker();
    const predictor = new HonestBaselinePredictor();
    
    // Example: Record Week 1 predictions
    const week1Games = [
        { homeTeam: 'PHI', awayTeam: 'DAL' },
        { homeTeam: 'LAC', awayTeam: 'KC' },
        { homeTeam: 'GB', awayTeam: 'MIN' }
    ];
    
    const predictions = predictor.predictWeek(week1Games);
    tracker.recordWeeklyPredictions(1, 2025, predictions);
    
    // Example: Update with fictional results
    const actualResults = [
        { homeScore: 24, awayScore: 21 }, // PHI beats DAL
        { homeScore: 17, awayScore: 28 }, // KC beats LAC  
        { homeScore: 31, awayScore: 14 }  // GB beats MIN
    ];
    
    tracker.updateWithResults(1, 2025, actualResults);
    tracker.displayStatus();
    
    // Generate public report
    const publicReport = tracker.generatePublicReport();
    fs.writeFileSync('data/real-current/public_performance_report.json', JSON.stringify(publicReport, null, 2));
    
    console.log('\n💾 Public report saved: data/real-current/public_performance_report.json');
    console.log('\n🎯 KEY BENEFITS:');
    console.log('✅ Transparent performance tracking');
    console.log('✅ Gradual confidence building');
    console.log('✅ Honest assessment of capabilities');
    console.log('✅ User trust through transparency');
    
    return tracker;
}

if (require.main === module) {
    demonstrateTracking();
}

module.exports = { WeeklyTracker }; 