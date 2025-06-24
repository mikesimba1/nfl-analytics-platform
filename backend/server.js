#!/usr/bin/env node
/**
 * Simple HTTP Server for NFL Analytics Platform Demo
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // Default to web-demo.html for root
    if (pathname === '/') {
        pathname = '/web-demo.html';
    }
    
    const filePath = path.join(__dirname, pathname);
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'text/plain';
    
    // Handle API endpoints
    if (pathname.startsWith('/api/')) {
        handleApiRequest(req, res, pathname);
        return;
    }
    
    // Serve static files
    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(`
                    <html>
                        <body style="font-family: Arial; text-align: center; margin-top: 50px;">
                            <h1>404 - File Not Found</h1>
                            <p>The file ${pathname} was not found.</p>
                            <a href="/">Go to NFL Analytics Demo</a>
                        </body>
                    </html>
                `);
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Server Error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
});

function handleApiRequest(req, res, pathname) {
    res.writeHead(200, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    
    if (pathname === '/api/status') {
        res.end(JSON.stringify({
            status: 'OPERATIONAL',
            accuracy: '67.0%',
            system: 'NFL Analytics Platform',
            timestamp: new Date().toISOString(),
            validated_games: 285,
            data_cost: '$0/month',
            tier: 'ELITE'
        }));
    } else if (pathname === '/api/predictions') {
        res.end(JSON.stringify({
            predictions: [
                {
                    game: "Kansas City Chiefs @ Detroit Lions",
                    spread: "DET -2.5",
                    prediction: "+0.3 (Chiefs)",
                    confidence: "HIGH",
                    accuracy: "72%",
                    recommendation: "Take Chiefs +2.5",
                    edge: "2.8 points"
                },
                {
                    game: "Buffalo Bills @ Baltimore Ravens",
                    spread: "BAL -1.5", 
                    prediction: "+3.2 (Bills)",
                    confidence: "MEDIUM",
                    accuracy: "61%",
                    recommendation: "Take Bills +1.5",
                    edge: "4.7 points"
                },
                {
                    game: "Miami Dolphins @ New York Jets",
                    spread: "NYJ -6.5",
                    prediction: "-2.1 (Dolphins)",
                    confidence: "HIGH",
                    accuracy: "72%",
                    recommendation: "Take Dolphins +6.5",
                    edge: "4.4 points"
                }
            ],
            generated_at: new Date().toISOString(),
            system_accuracy: "67.0%"
        }));
    } else if (pathname === '/api/performance') {
        res.end(JSON.stringify({
            overall_accuracy: "67.0%",
            high_confidence: "72.0%",
            medium_confidence: "61.0%",
            total_games: 285,
            weeks_validated: 22,
            recent_weeks: [
                { week: 11, record: "12/14", accuracy: "85.7%", rating: "⭐" },
                { week: 13, record: "14/16", accuracy: "87.5%", rating: "⭐" },
                { week: 15, record: "12/16", accuracy: "75.0%", rating: "✅" },
                { week: 16, record: "12/16", accuracy: "75.0%", rating: "✅" },
                { week: 17, record: "14/16", accuracy: "87.5%", rating: "⭐" }
            ],
            competitive_position: "TOP TIER",
            industry_average: "52-58%",
            our_advantage: "9-15% above average"
        }));
    } else {
        res.end(JSON.stringify({
            error: 'API endpoint not found',
            available_endpoints: ['/api/status', '/api/predictions', '/api/performance']
        }));
    }
}

server.listen(PORT, () => {
    console.log('🏈 NFL ANALYTICS PLATFORM - WEB DEMO SERVER');
    console.log('='.repeat(50));
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`🌐 Open your browser and go to:`);
    console.log(`   http://localhost:${PORT}`);
    console.log('');
    console.log('📊 Available endpoints:');
    console.log(`   http://localhost:${PORT}/           - Main demo page`);
    console.log(`   http://localhost:${PORT}/api/status - System status`);
    console.log(`   http://localhost:${PORT}/api/predictions - Live predictions`);
    console.log(`   http://localhost:${PORT}/api/performance - Performance data`);
    console.log('');
    console.log('🎯 Press Ctrl+C to stop the server');
    console.log('='.repeat(50));
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.close(() => {
        console.log('✅ Server stopped');
        process.exit(0);
    });
}); 