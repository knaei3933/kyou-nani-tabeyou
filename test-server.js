const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3000;

// MIME 타입 설정
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // 기본 라우팅
  let filePath = '';
  
  if (req.url === '/' || req.url === '/index.html') {
    filePath = path.join(__dirname, 'test-index.html');
  } else if (req.url === '/manifest.json') {
    filePath = path.join(__dirname, 'public', 'manifest.json');
  } else if (req.url === '/sw.js') {
    filePath = path.join(__dirname, 'public', 'sw.js');
  } else if (req.url === '/simple-test') {
    filePath = path.join(__dirname, 'test-simple.html');
  } else if (req.url.startsWith('/api/recipes/simple')) {
    // API 엔드포인트 시뮬레이션
    handleRecipeAPI(req, res);
    return;
  } else {
    // 정적 파일 서빙
    filePath = path.join(__dirname, 'public', req.url);
  }

  // 파일 존재 여부 확인 및 서빙
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/html'});
      res.end('<h1>404 Not Found</h1>');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Server Error');
        return;
      }

      res.writeHead(200, {'Content-Type': contentType});
      res.end(data);
    });
  });
});

// 레시피 API 핸들러
function handleRecipeAPI(req, res) {
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

  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST',
    'Access-Control-Allow-Headers': 'Content-Type'
  });

  if (req.method === 'GET') {
    res.end(JSON.stringify({recipes: recipes}));
  } else if (req.method === 'POST') {
    res.end(JSON.stringify({recommendations: recipes.slice(0, 1)}));
  }
}

server.listen(port, () => {
  console.log(`🚀 테스트 서버가 http://localhost:${port} 에서 실행중입니다!`);
  console.log(`📱 PWA 테스트를 위해 브라우저에서 접속해보세요!`);
}); 