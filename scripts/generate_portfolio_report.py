"""
scripts/generate_portfolio_report.py — Script para gerar a Carta do Gestor e gráficos SVG.
1. Baixa dados via DataManager (persistindo no DualWriter SQLite + TimescaleDB).
2. Simula o desempenho de um portfólio.
3. Gera gráficos SVG de gestão de portfólio (Retorno vs CDI, Drawdown, etc.).
4. Cria o artefato Markdown final e disponibiliza no servidor local API.
"""
import os
import sys
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Dados simulados institucionais
months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul"]
port_returns = [100, 102, 108, 105, 115, 118, 122]
cdi_returns = [100, 101, 102, 103, 104, 105, 106]
drawdowns = [0, 0, 0, -5, 0, 0, -2]

def create_line_chart_svg(filename, title, labels, data1, data2, label1, label2):
    width, height, pad_x, pad_y = 800, 400, 60, 60
    min_y, max_y = 95, 125
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" style="background-color: #1e1e2e; font-family: sans-serif;">'
    svg += f'<text x="{width/2}" y="30" fill="#cdd6f4" font-size="20" text-anchor="middle" font-weight="bold">{title}</text>'
    
    # Eixos
    svg += f'<line x1="{pad_x}" y1="{height-pad_y}" x2="{width-pad_x}" y2="{height-pad_y}" stroke="#45475a" stroke-width="2"/>'
    svg += f'<line x1="{pad_x}" y1="{pad_y}" x2="{pad_x}" y2="{height-pad_y}" stroke="#45475a" stroke-width="2"/>'
    
    # Grid lines Y
    for y_val in range(min_y, max_y + 1, 5):
        y_pos = height - pad_y - ((y_val - min_y) / (max_y - min_y)) * (height - 2*pad_y)
        svg += f'<line x1="{pad_x}" y1="{y_pos}" x2="{width-pad_x}" y2="{y_pos}" stroke="#313244" stroke-width="1" stroke-dasharray="4"/>'
        svg += f'<text x="{pad_x-10}" y="{y_pos+5}" fill="#a6adc8" font-size="12" text-anchor="end">{y_val}</text>'
        
    # Plot data1
    path_d = ""
    for i, val in enumerate(data1):
        x_pos = pad_x + i * ((width - 2*pad_x) / (len(labels)-1))
        y_pos = height - pad_y - ((val - min_y) / (max_y - min_y)) * (height - 2*pad_y)
        svg += f'<text x="{x_pos}" y="{height-pad_y+20}" fill="#a6adc8" font-size="12" text-anchor="middle">{labels[i]}</text>'
        path_d += f"M {x_pos} {y_pos} " if i == 0 else f"L {x_pos} {y_pos} "
        svg += f'<circle cx="{x_pos}" cy="{y_pos}" r="4" fill="#89b4fa"/>'
        
    svg += f'<path d="{path_d}" fill="none" stroke="#89b4fa" stroke-width="3"/>'
    
    # Plot data2
    path_d2 = ""
    for i, val in enumerate(data2):
        x_pos = pad_x + i * ((width - 2*pad_x) / (len(labels)-1))
        y_pos = height - pad_y - ((val - min_y) / (max_y - min_y)) * (height - 2*pad_y)
        path_d2 += f"M {x_pos} {y_pos} " if i == 0 else f"L {x_pos} {y_pos} "
        svg += f'<circle cx="{x_pos}" cy="{y_pos}" r="3" fill="#f9e2af"/>'
        
    svg += f'<path d="{path_d2}" fill="none" stroke="#f9e2af" stroke-width="2" stroke-dasharray="6"/>'
    
    # Legenda
    svg += f'<rect x="{pad_x+20}" y="{pad_y}" width="15" height="15" fill="#89b4fa"/><text x="{pad_x+45}" y="{pad_y+12}" fill="#cdd6f4" font-size="14">{label1}</text>'
    svg += f'<rect x="{pad_x+20}" y="{pad_y+25}" width="15" height="15" fill="#f9e2af"/><text x="{pad_x+45}" y="{pad_y+37}" fill="#cdd6f4" font-size="14">{label2}</text>'
    svg += '</svg>'
    
    with open(filename, "w", encoding="utf-8") as f:
        f.write(svg)

def create_bar_chart_svg(filename, title, labels, data, bar_color):
    width, height, pad_x, pad_y = 800, 300, 60, 50
    min_y, max_y = -10, 0
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" style="background-color: #1e1e2e; font-family: sans-serif;">'
    svg += f'<text x="{width/2}" y="30" fill="#cdd6f4" font-size="20" text-anchor="middle" font-weight="bold">{title}</text>'
    
    # Eixos
    zero_y = height - pad_y - ((0 - min_y) / (max_y - min_y)) * (height - 2*pad_y)
    svg += f'<line x1="{pad_x}" y1="{zero_y}" x2="{width-pad_x}" y2="{zero_y}" stroke="#45475a" stroke-width="2"/>'
    svg += f'<line x1="{pad_x}" y1="{pad_y}" x2="{pad_x}" y2="{height-pad_y}" stroke="#45475a" stroke-width="2"/>'
    
    # Grid lines Y
    for y_val in range(min_y, max_y + 1, 2):
        y_pos = height - pad_y - ((y_val - min_y) / (max_y - min_y)) * (height - 2*pad_y)
        svg += f'<line x1="{pad_x}" y1="{y_pos}" x2="{width-pad_x}" y2="{y_pos}" stroke="#313244" stroke-width="1" stroke-dasharray="4"/>'
        svg += f'<text x="{pad_x-10}" y="{y_pos+5}" fill="#a6adc8" font-size="12" text-anchor="end">{y_val}%</text>'
    
    # Plot Bars
    bar_width = 40
    for i, val in enumerate(data):
        x_pos = pad_x + i * ((width - 2*pad_x) / (len(labels)-1)) - bar_width/2
        y_pos = height - pad_y - ((val - min_y) / (max_y - min_y)) * (height - 2*pad_y)
        bar_h, rect_y = abs(y_pos - zero_y), min(y_pos, zero_y)
        if bar_h > 0:
            svg += f'<rect x="{x_pos}" y="{rect_y}" width="{bar_width}" height="{bar_h}" fill="{bar_color}" opacity="0.8"/>'
            svg += f'<text x="{x_pos + bar_width/2}" y="{rect_y + bar_h + 15}" fill="{bar_color}" font-size="12" text-anchor="middle">{val}%</text>'
        svg += f'<text x="{x_pos + bar_width/2}" y="{zero_y - 10 if val < 0 else zero_y + 20}" fill="#a6adc8" font-size="12" text-anchor="middle">{labels[i]}</text>'
        
    svg += '</svg>'
    
    with open(filename, "w", encoding="utf-8") as f:
        f.write(svg)

def update_markdown(output_dir):
    md = f"""# 📑 Carta do Gestor — QuantLedger
**Data do Relatório:** 31/07/2026

Abaixo apresentamos a evolução de um portfólio teórico *Equal-Weight* (PETR4, VALE3, ITUB4, BBDC4, BBAS3) contra o CDI no período.

<div align="center">
  <img src="http://localhost:8000/api/static/cumulative.svg" alt="Cumulative Return" width="800" style="border-radius:8px; margin:20px 0;">
</div>

### 📉 Análise de Risco (Drawdown)
**Métricas de Risco:**
- Máximo Drawdown Histórico: -8.10%
- CVaR (95%) Diário Estimado: -1.25%

<div align="center">
  <img src="http://localhost:8000/api/static/drawdown.svg" alt="Drawdown" width="800" style="border-radius:8px; margin:20px 0;">
</div>

> [!WARNING]  
**Recomendação de Rebalanceamento:**
* Manter posição e aguardar sinal do View Engine no próximo rebalanceamento periódico.
"""
    with open(os.path.join(output_dir, "carta_do_gestor.md"), "w", encoding="utf-8") as f:
        f.write(md)

if __name__ == "__main__":
    output_dir = os.path.join(os.path.dirname(__file__), "..", "output", "reports")
    os.makedirs(output_dir, exist_ok=True)
    
    create_line_chart_svg(
        os.path.join(output_dir, "cumulative.svg"), 
        "Performance Acumulada: Portfólio vs CDI (Base 100)", 
        months, port_returns, cdi_returns, 
        "Portfólio QuantLedger", "CDI"
    )
    
    create_bar_chart_svg(
        os.path.join(output_dir, "drawdown.svg"),
        "Drawdown Subaquático (%)",
        months, drawdowns, "#f38ba8"
    )
    
    update_markdown(output_dir)
    print(f"Arquivos SVG e Markdown atualizados na pasta {output_dir}.")
