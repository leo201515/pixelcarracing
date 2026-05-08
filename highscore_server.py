#!/usr/bin/env python3
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import os

HIGH_SCORES_FILE = '/home/leo/pixelcarracing/highscores.json'
PORT = 8081

def load_high_scores():
    if os.path.exists(HIGH_SCORES_FILE):
        with open(HIGH_SCORES_FILE, 'r') as f:
            return json.load(f)
    return []

def save_high_scores(scores):
    with open(HIGH_SCORES_FILE, 'w') as f:
        json.dump(scores, f)

class HighScoreHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/highscores':
            scores = load_high_scores()
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(scores).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == '/highscores':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode())

            scores = load_high_scores()
            new_name = data.get('name', 'Anonymous')
            new_score = data.get('score', 0)

            existing = next((s for s in scores if s['name'].lower() == new_name.lower()), None)
            if existing:
                if new_score > existing['score']:
                    existing['score'] = new_score
                    existing['date'] = data.get('date', '')
            else:
                scores.append({
                    'name': new_name,
                    'score': new_score,
                    'date': data.get('date', '')
                })

            scores = sorted(scores, key=lambda x: x['score'], reverse=True)[:10]
            save_high_scores(scores)

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True}).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == '__main__':
    server = HTTPServer(('0.0.0.0', PORT), HighScoreHandler)
    print(f'High score server running on port {PORT}')
    server.serve_forever()
