#!/usr/bin/env python3
"""Gera gráficos cyberpunk demonstrativos a partir dos dados do projeto."""
from pathlib import Path
import re
import math
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs"
OUT.mkdir(exist_ok=True)
CSV = ROOT / "relatorio_ativos_negociados_python.csv"
MONTHLY = ROOT / "src/data/monthlyData.ts"

df = pd.read_csv(CSV)
BG = "#070b17"
PANEL = "#0d1326"
GRID = "#1d3151"
CYAN = "#00e5ff"
MAGENTA = "#ff2bd6"
LIME = "#b8ff3d"
AMBER = "#ffd166"
TEXT = "#d9f7ff"
plt.rcParams.update({
    "font.family": "DejaVu Sans",
    "axes.facecolor": PANEL,
    "figure.facecolor": BG,
    "axes.edgecolor": GRID,
    "axes.labelcolor": TEXT,
    "xtick.color": TEXT,
    "ytick.color": TEXT,
    "text.color": TEXT,
    "grid.color": GRID,
    "grid.alpha": 0.65,
})

def finish(ax, title, subtitle):
    ax.set_title(title, loc="left", color=CYAN, fontsize=16, fontweight="bold", pad=16)
    ax.text(0, 1.015, subtitle, transform=ax.transAxes, color=MAGENTA, fontsize=8, fontweight="bold", va="bottom")
    ax.grid(True, axis="y", linestyle=(0, (2, 4)), linewidth=.7)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["left"].set_color(GRID)
    ax.spines["bottom"].set_color(GRID)
    ax.text(1, -0.16, "Fonte: dados demonstrativos do projeto | Não constitui recomendação de investimento.", transform=ax.transAxes, ha="right", color="#7291a9", fontsize=7)

# 1) Retorno por ativo com contraste cyberpunk.
plot = df.sort_values("Retorno (%)")
fig, ax = plt.subplots(figsize=(11, 6), dpi=180)
colors = [MAGENTA if value < 0 else LIME for value in plot["Retorno (%)"]]
ax.barh(plot["Ticker"], plot["Retorno (%)"], color=colors, alpha=.9, edgecolor=CYAN, linewidth=.5)
ax.axvline(0, color=CYAN, linewidth=.8)
ax.set_xlabel("Retorno (%)")
finish(ax, "RETORNO POR ATIVO // SIGNAL MAP", "QUANTLEDGER / ASSET PERFORMANCE")
fig.tight_layout()
fig.savefig(OUT / "cyberpunk_retorno_por_ativo.png", facecolor=BG, bbox_inches="tight")
plt.close(fig)

# 2) Peso x retorno para leitura de exposição e convicção.
fig, ax = plt.subplots(figsize=(10, 6), dpi=180)
colors = np.where(df["Retorno (%)"] >= 0, CYAN, MAGENTA)
sizes = df["Peso Na Carteira (%)"] * 34
ax.scatter(df["Peso Na Carteira (%)"], df["Retorno (%)"], s=sizes, c=colors, edgecolors=AMBER, linewidths=.8, alpha=.92)
for _, row in df.iterrows():
    ax.annotate(row["Ticker"], (row["Peso Na Carteira (%)"], row["Retorno (%)"]), xytext=(5, 4), textcoords="offset points", fontsize=8, color=TEXT)
ax.axhline(0, color=GRID, linewidth=1)
ax.set_xlabel("Peso na carteira (%)")
ax.set_ylabel("Retorno (%)")
finish(ax, "EXPOSIÇÃO × CONVICÇÃO", "MOTOR QUANTITATIVO / POSITION SIZING")
fig.tight_layout()
fig.savefig(OUT / "cyberpunk_exposicao_conviccao.png", facecolor=BG, bbox_inches="tight")
plt.close(fig)

# 3) Curva acumulada a partir dos retornos mensais presentes no TypeScript.
text = MONTHLY.read_text(encoding="utf-8")
months = re.findall(r'month:\s*"([^"]+)"', text)
returns = [float(value) for value in re.findall(r'fundReturn:\s*(-?\d+(?:\.\d+)?)', text)]
months, returns = months[:len(returns)], returns[:len(months)]
wealth = np.cumprod([1 + value for value in returns])
fig, ax = plt.subplots(figsize=(11, 5.5), dpi=180)
ax.plot(months, wealth * 100, color=CYAN, linewidth=2.6, marker="o", markersize=4, markerfacecolor=BG, markeredgecolor=LIME)
ax.fill_between(range(len(months)), wealth * 100, 100, color=CYAN, alpha=.08)
ax.set_ylabel("Índice base 100")
ax.tick_params(axis="x", rotation=45)
finish(ax, "PERFORMANCE CURVE // BASE 100", "SERIE MENSAL / PIPELINE DE PERFORMANCE")
fig.tight_layout()
fig.savefig(OUT / "cyberpunk_performance_curve.png", facecolor=BG, bbox_inches="tight")
plt.close(fig)

print(f"Gráficos gerados a partir de {len(df)} ativos e {len(returns)} períodos mensais.")
