#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import http.server
import socketserver
import json
import os
from urllib.parse import urlparse, parse_qs

PORT = 3000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        print(f"GET {path}")
        
        if path == '/' or path == '/index.html':
            self.serve_file('test-index.html', 'text/html')
        elif path == '/simple-test':
            self.serve_file('test-simple.html', 'text/html')
        elif path == '/manifest.json':
            self.serve_file('public/manifest.json', 'application/json')
        elif path == '/sw.js':
            self.serve_file('public/sw.js', 'application/javascript')
        elif path == '/api/recipes/simple':
            self.handle_api()
        else:
            self.send_error(404, "File not found")
    
    def do_POST(self):
        if self.path == '/api/recipes/simple':
            self.handle_api()
        else:
            self.send_error(404, "Not found")
    
    def serve_file(self, filename, content_type):
        try:
            with open(filename, 'rb') as f:
                content = f.read()
            
            self.send_response(200)
            self.send_header('Content-Type', content_type + '; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(content)
        except FileNotFoundError:
            print(f"파일을 찾을 수 없습니다: {filename}")
            self.send_error(404, f"File not found: {filename}")
    
    def handle_api(self):
        recipes = [
            {
                "id": 1,
                "title": "김치볶음밥",
                "description": "김치와 밥으로 만드는 간단한 볶음밥",
                "ingredients": [
                    {"name": "김치", "amount": "100", "unit": "g"},
                    {"name": "밥", "amount": "1", "unit": "공기"},
                    {"name": "계란", "amount": "1", "unit": "개"}
                ],
                "cookingTime": 10,
                "difficulty": "easy",
                "cuisine": "한식"
            },
            {
                "id": 2,
                "title": "계란후라이",
                "description": "간단하고 빠른 계란 요리",
                "ingredients": [
                    {"name": "계란", "amount": "2", "unit": "개"},
                    {"name": "기름", "amount": "1", "unit": "큰술"}
                ],
                "cookingTime": 5,
                "difficulty": "easy",
                "cuisine": "기본"
            }
        ]
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
        if self.command == 'GET':
            response = {"recipes": recipes}
        else:  # POST
            response = {"recommendations": [recipes[0]]}
        
        self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))

def main():
    try:
        with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
            print(f"🚀 서버가 http://localhost:{PORT} 에서 실행중입니다!")
            print("📱 브라우저에서 접속해보세요!")
            print("⏹️  종료하려면 Ctrl+C를 누르세요")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n서버를 종료합니다.")
    except Exception as e:
        print(f"서버 에러: {e}")

if __name__ == "__main__":
    main() 