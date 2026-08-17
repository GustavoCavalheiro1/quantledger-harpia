"""
api/server.py — Servidor HTTP simples para fornecer a Carta do Gestor para o frontend React.
Substitui o FastAPI para máxima compatibilidade, fornecendo suporte a CORS e arquivos estáticos.
"""
import os
import json
import http.server
import socketserver

PORT = 8000
REPORTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "output", "reports"))
os.makedirs(REPORTS_DIR, exist_ok=True)

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=REPORTS_DIR, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()
        
    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()
        
    def do_GET(self):
        # Rota de API personalizada para o React
        if self.path == '/api/reports/latest':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            report_path = os.path.join(REPORTS_DIR, "carta_do_gestor.md")
            if not os.path.exists(report_path):
                response = {"content": "Nenhum relatório encontrado. Execute o motor primeiro.", "status": "not_found"}
            else:
                with open(report_path, "r", encoding="utf-8") as f:
                    content = f.read()
                response = {"content": content, "status": "success"}
                
            self.wfile.write(json.dumps(response).encode('utf-8'))
        
        # Servir os arquivos SVG através do pseudo-caminho /api/static/
        elif self.path.startswith('/api/static/'):
            # Redireciona o path virtual para o arquivo real na pasta raiz do server (REPORTS_DIR)
            self.path = '/' + self.path.split('/api/static/')[1]
            super().do_GET()
        else:
            # Comportamento padrão de servir arquivos
            super().do_GET()

if __name__ == '__main__':
    with socketserver.TCPServer(("0.0.0.0", PORT), CORSRequestHandler) as httpd:
        print(f"Servidor rodando na porta {PORT} servindo a pasta {REPORTS_DIR}")
        httpd.serve_forever()
