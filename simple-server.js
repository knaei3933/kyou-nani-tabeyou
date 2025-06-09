const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3000;

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // CORS 헤더 추가
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // 라우팅
  if (req.url === '/' || req.url === '/index.html') {
    serveFile(res, 'test-index.html', 'text/html');
  } else if (req.url === '/simple-test') {
    serveFile(res, 'test-simple.html', 'text/html');
  } else if (req.url === '/manifest.json') {
    serveFile(res, 'public/manifest.json', 'application/json');
  } else if (req.url === '/sw.js') {
    serveFile(res, 'public/sw.js', 'application/javascript');
  } else if (req.url === '/api/recipes/simple') {
    handleAPI(req, res);
  } else {
    res.writeHead(404, {'Content-Type': 'text/html'});
    res.end('<h1>404 Not Found</h1>');
  }
});

function serveFile(res, filePath, contentType) {
  const fullPath = path.join(__dirname, filePath);
  
  fs.readFile(fullPath, (err, data) => {
    if (err) {
      console.error('File read error:', err);
      res.writeHead(404, {'Content-Type': 'text/html'});
      res.end('<h1>File Not Found</h1>');
      return;
    }
    
    res.writeHead(200, {'Content-Type': contentType});
    res.end(data);
  });
}

function handleAPI(req, res) {
  const recipes = [
    {
      id: 1,
      title: "김치볶음밥",
      description: "김치와 밥으로 만드는 간단한 볶음밥",
      ingredients: [
        {name: "김치", amount: "100", unit: "g"},
        {name: "밥", amount: "1", unit: "공기"},
        {name: "계란", amount: "1", unit: "개"}
      ],
      cookingTime: 10,
      difficulty: "easy",
      cuisine: "한식"
    },
    {
      id: 2,
      title: "계란후라이",
      description: "간단하고 빠른 계란 요리",
      ingredients: [
        {name: "계란", amount: "2", unit: "개"},
        {name: "기름", amount: "1", unit: "큰술"}
      ],
      cookingTime: 5,
      difficulty: "easy",
      cuisine: "기본"
    }
  ];

  res.writeHead(200, {'Content-Type': 'application/json'});
  
  if (req.method === 'GET') {
    res.end(JSON.stringify({recipes: recipes}));
  } else if (req.method === 'POST') {
    res.end(JSON.stringify({recommendations: [recipes[0]]}));
  }
}

server.listen(port, 'localhost', () => {
  console.log('🚀 서버가 http://localhost:3000 에서 실행중입니다!');
  console.log('📱 브라우저에서 접속해보세요!');
});

server.on('error', (err) => {
  console.error('서버 에러:', err);
}); 