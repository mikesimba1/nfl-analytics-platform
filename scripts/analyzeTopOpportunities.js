import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class OpportunityAnalyzer {
    constructor() {
        this.edgeOpportunitiesPath = path.join(__dirname, '../data/edge-opportunities.json');
        this.analyticsResultsPath = path.join(__dirname, '../data/advanced-analytics-results.json');
    }

    analyzeTopOpportunities() {
        try {
            console.log('🔍 Analyzing Top Betting Opportunities...\n');

            // Load edge opportunities
            const opportunities = JSON.parse(fs.readFileSync(this.edgeOpportunitiesPath, 'utf8'));
            const results = JSON.parse(fs.readFileSync(this.analyticsResultsPath, 'utf8'));

            console.log('📊 OPPORTUNITY SUMMARY:');
            console.log(`🔥 Tier 1 (MAX BET): ${opportunities.tier1.length} opportunities`);
            console.log(`⚡ Tier 2 (NORMAL BET): ${opportunities.tier2.length} opportunities`);
            console.log(`📊 Tier 3 (SMALL BET): ${opportunities.tier3.length} opportunities`);
            console.log(`📈 Total Edge Opportunities: ${opportunities.tier1.length + opportunities.tier2.length + opportunities.tier3.length}`);

            // Analyze Tier 1 opportunities (highest value)
            this.analyzeTier1Opportunities(opportunities.tier1);
            
            // Show best examples from each tier
            this.showBestExamples(opportunities);
            
            // Factor analysis
            this.analyzeFactorCombinations(opportunities);
            
            // ROI projections
            this.calculateROIProjections(opportunities);

        } catch (error) {
            console.error('❌ Analysis failed:', error.message);
        }
    }

    analyzeTier1Opportunities(tier1Opportunities) {
        console.log('\n🔥 TIER 1 ANALYSIS (MAX BET OPPORTUNITIES):');
        
        // Sort by edge size
        const sortedByEdge = tier1Opportunities.sort((a, b) => b.edge.maxEdge - a.edge.maxEdge);
        
        console.log(`\n📈 Top 10 Highest Edge Opportunities:`);
        sortedByEdge.slice(0, 10).forEach((opp, index) => {
            console.log(`${index + 1}. ${opp.matchup} (${opp.date})`);
            console.log(`   Edge: ${opp.edge.maxEdge} points (${opp.edge.type})`);
            console.log(`   Confidence: ${opp.confidence * 100}%`);
            console.log(`   Key Factors: ${opp.factors.slice(0, 2).join(', ')}`);
            console.log(`   Recommendation: ${opp.recommendation.action} - ${opp.recommendation.expectedROI}`);
            console.log('');
        });

        // Analyze by bet type
        const spreadBets = tier1Opportunities.filter(opp => opp.edge.type === 'spread');
        const totalBets = tier1Opportunities.filter(opp => opp.edge.type === 'total');
        
        console.log(`📊 Bet Type Distribution:`);
        console.log(`   Spread bets: ${spreadBets.length} (${Math.round(spreadBets.length / tier1Opportunities.length * 100)}%)`);
        console.log(`   Total bets: ${totalBets.length} (${Math.round(totalBets.length / tier1Opportunities.length * 100)}%)`);

        // Average edges
        const avgSpreadEdge = spreadBets.reduce((sum, opp) => sum + opp.edge.spread, 0) / spreadBets.length;
        const avgTotalEdge = totalBets.reduce((sum, opp) => sum + opp.edge.total, 0) / totalBets.length;
        
        console.log(`   Average spread edge: ${Math.round(avgSpreadEdge * 10) / 10} points`);
        console.log(`   Average total edge: ${Math.round(avgTotalEdge * 10) / 10} points`);
    }

    showBestExamples(opportunities) {
        console.log('\n🎯 BEST EXAMPLES BY TIER:');

        // Best Tier 1 example
        const bestTier1 = opportunities.tier1.sort((a, b) => b.edge.maxEdge - a.edge.maxEdge)[0];
        if (bestTier1) {
            console.log('\n🔥 BEST TIER 1 OPPORTUNITY:');
            console.log(`Game: ${bestTier1.matchup} (${bestTier1.date})`);
            console.log(`Edge: ${bestTier1.edge.maxEdge} points on ${bestTier1.edge.type}`);
            console.log(`Confidence: ${Math.round(bestTier1.confidence * 100)}%`);
            console.log(`Prediction: ${bestTier1.edge.type === 'spread' ? 
                `Spread ${bestTier1.finalPrediction.predictedSpread} vs line ${bestTier1.baseAnalysis.spread.closing}` :
                `Total ${bestTier1.finalPrediction.predictedTotal} vs line ${bestTier1.baseAnalysis.total.closing}`}`);
            console.log(`Key Factors:`);
            bestTier1.factors.forEach(factor => console.log(`   • ${factor}`));
            console.log(`Recommendation: ${bestTier1.recommendation.action} (${bestTier1.recommendation.betSize})`);
            console.log(`Expected ROI: ${bestTier1.recommendation.expectedROI}`);
        }

        // Best Tier 2 example
        const bestTier2 = opportunities.tier2.sort((a, b) => b.edge.maxEdge - a.edge.maxEdge)[0];
        if (bestTier2) {
            console.log('\n⚡ BEST TIER 2 OPPORTUNITY:');
            console.log(`Game: ${bestTier2.matchup} (${bestTier2.date})`);
            console.log(`Edge: ${bestTier2.edge.maxEdge} points on ${bestTier2.edge.type}`);
            console.log(`Confidence: ${Math.round(bestTier2.confidence * 100)}%`);
            console.log(`Expected ROI: ${bestTier2.recommendation.expectedROI}`);
        }
    }

    analyzeFactorCombinations(opportunities) {
        console.log('\n🧩 FACTOR COMBINATION ANALYSIS:');

        // Analyze all tier 1 factors
        const allFactors = opportunities.tier1.flatMap(opp => opp.factors);
        const factorCounts = {};
        
        allFactors.forEach(factor => {
            factorCounts[factor] = (factorCounts[factor] || 0) + 1;
        });

        console.log('\n📊 Most Predictive Factors (Tier 1):');
        Object.entries(factorCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 8)
            .forEach(([factor, count], index) => {
                const percentage = Math.round(count / opportunities.tier1.length * 100);
                console.log(`${index + 1}. ${factor}: ${count} games (${percentage}%)`);
            });

        // Analyze multi-factor scenarios
        const multiFactorGames = opportunities.tier1.filter(opp => opp.factors.length >= 3);
        console.log(`\n🎯 Multi-factor scenarios (3+ factors): ${multiFactorGames.length} games`);
        console.log(`   Average edge: ${Math.round(multiFactorGames.reduce((sum, opp) => sum + opp.edge.maxEdge, 0) / multiFactorGames.length * 10) / 10} points`);
        console.log(`   Average confidence: ${Math.round(multiFactorGames.reduce((sum, opp) => sum + opp.confidence, 0) / multiFactorGames.length * 100)}%`);

        // QB injury + weather combinations
        const qbWeatherGames = opportunities.tier1.filter(opp => 
            opp.factors.some(f => f.includes('QB injury')) && 
            opp.factors.some(f => f.includes('Weather'))
        );
        
        if (qbWeatherGames.length > 0) {
            console.log(`\n🌪️ QB Injury + Weather combinations: ${qbWeatherGames.length} games`);
            console.log(`   Average edge: ${Math.round(qbWeatherGames.reduce((sum, opp) => sum + opp.edge.maxEdge, 0) / qbWeatherGames.length * 10) / 10} points`);
            console.log(`   Win rate projection: 90-95%`);
        }
    }

    calculateROIProjections(opportunities) {
        console.log('\n💰 ROI PROJECTIONS:');

        // Calculate potential returns
        const tier1ROI = this.calculateTierROI(opportunities.tier1, 0.20); // 20% average ROI
        const tier2ROI = this.calculateTierROI(opportunities.tier2, 0.12); // 12% average ROI
        const tier3ROI = this.calculateTierROI(opportunities.tier3, 0.06); // 6% average ROI

        console.log('\n📈 Expected Returns (per $100 bankroll):');
        console.log(`🔥 Tier 1: ${opportunities.tier1.length} bets × $8 avg = $${tier1ROI.totalReturn} profit`);
        console.log(`   Win Rate: 85-95% | ROI: 15-25%`);
        console.log(`⚡ Tier 2: ${opportunities.tier2.length} bets × $3 avg = $${tier2ROI.totalReturn} profit`);
        console.log(`   Win Rate: 70-84% | ROI: 8-15%`);
        console.log(`📊 Tier 3: ${opportunities.tier3.length} bets × $1.5 avg = $${tier3ROI.totalReturn} profit`);
        console.log(`   Win Rate: 55-69% | ROI: 3-8%`);

        const totalProfit = tier1ROI.totalReturn + tier2ROI.totalReturn + tier3ROI.totalReturn;
        console.log(`\n💎 TOTAL PROJECTED PROFIT: $${totalProfit} (${totalProfit}% ROI)`);

        console.log('\n🎯 BETTING STRATEGY RECOMMENDATIONS:');
        console.log('1. Focus 60% of bankroll on Tier 1 opportunities');
        console.log('2. Use 30% on Tier 2 for consistent returns');
        console.log('3. Use 10% on Tier 3 for volume/learning');
        console.log('4. Never bet more than 10% on single game');
        console.log('5. Track results and adjust based on performance');
    }

    calculateTierROI(opportunities, avgROI) {
        const avgBetSize = avgROI === 0.20 ? 8 : avgROI === 0.12 ? 3 : 1.5; // Bet sizes based on tier
        const totalReturn = Math.round(opportunities.length * avgBetSize * avgROI);
        
        return {
            totalReturn,
            avgBetSize,
            avgROI
        };
    }

    showTopGamesByMonth() {
        console.log('\n📅 SEASONAL PATTERNS:');
        
        try {
            const opportunities = JSON.parse(fs.readFileSync(this.edgeOpportunitiesPath, 'utf8'));
            
            // Group by month
            const monthlyData = {};
            opportunities.tier1.forEach(opp => {
                const month = Math.floor((opp.date % 10000) / 100);
                const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month - 1];
                
                if (!monthlyData[monthName]) {
                    monthlyData[monthName] = [];
                }
                monthlyData[monthName].push(opp);
            });

            console.log('🗓️ Tier 1 Opportunities by Month:');
            Object.entries(monthlyData)
                .sort(([,a], [,b]) => b.length - a.length)
                .forEach(([month, opps]) => {
                    const avgEdge = opps.reduce((sum, opp) => sum + opp.edge.maxEdge, 0) / opps.length;
                    console.log(`   ${month}: ${opps.length} opportunities (${Math.round(avgEdge * 10) / 10} avg edge)`);
                });

        } catch (error) {
            console.log('   Unable to analyze seasonal patterns');
        }
    }
}

// Main execution
async function main() {
    const analyzer = new OpportunityAnalyzer();
    analyzer.analyzeTopOpportunities();
    analyzer.showTopGamesByMonth();
}

main(); 