import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fixHistoricalOddsJson() {
    const inputPath = path.join(__dirname, '../historical-odds-scraper/data/nfl_archive_10Y.json');
    const outputPath = path.join(__dirname, '../historical-odds-scraper/data/nfl_archive_10Y_fixed.json');
    
    try {
        console.log('🔧 Fixing malformed JSON file...');
        
        // Read the raw file
        const rawData = fs.readFileSync(inputPath, 'utf8');
        console.log(`📄 Original file size: ${rawData.length} characters`);
        
        // The file appears to be multiple JSON objects concatenated together
        // We need to split them and create a proper array
        
        // First, let's try to identify the pattern
        console.log('🔍 Analyzing JSON structure...');
        
        // Look for game objects that start with {"season":
        const gameMatches = rawData.match(/\{"season":\d+[^}]*\}/g);
        
        if (gameMatches) {
            console.log(`📊 Found ${gameMatches.length} individual game objects`);
            
            // Parse each game object individually
            const games = [];
            let successCount = 0;
            let errorCount = 0;
            
            for (let i = 0; i < gameMatches.length; i++) {
                try {
                    const game = JSON.parse(gameMatches[i]);
                    games.push(game);
                    successCount++;
                } catch (error) {
                    console.log(`⚠️ Error parsing game ${i + 1}: ${error.message}`);
                    errorCount++;
                }
            }
            
            console.log(`✅ Successfully parsed ${successCount} games`);
            if (errorCount > 0) {
                console.log(`❌ Failed to parse ${errorCount} games`);
            }
            
            // Create proper JSON array
            const fixedData = JSON.stringify(games, null, 2);
            
            // Write the fixed file
            fs.writeFileSync(outputPath, fixedData, 'utf8');
            console.log(`✅ Fixed JSON saved to: ${outputPath}`);
            console.log(`📄 Fixed file size: ${fixedData.length} characters`);
            
            // Test parse the fixed JSON
            console.log('🧪 Testing JSON parsing...');
            const testData = JSON.parse(fixedData);
            console.log(`✅ Successfully parsed ${testData.length} games`);
            
            // Show sample data structure
            if (testData.length > 0) {
                console.log('\n📊 Sample game data structure:');
                console.log(JSON.stringify(testData[0], null, 2));
            }
            
        } else {
            console.log('❌ Could not identify game objects in the file');
            throw new Error('Unable to parse the JSON structure');
        }
        
    } catch (error) {
        console.error('❌ Error fixing JSON:', error.message);
        throw error;
    }
}

// Execute the function
fixHistoricalOddsJson(); 