from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs"
OUT.mkdir(exist_ok=True)
DATA = ROOT / "relatorio_ativos_negociados_python.csv"

df = pd.read_csv(DATA)

sns.set_theme(style="whitegrid", font="DejaVu Sans")
NAVY = "#0b1220"
GOLD = "#c6a15b"
BLUE = "#2d6cdf"
RED = "#b84a4a"
GREEN = "#2d8a61"

# 1. Retorno por ativo: fonte local do projeto.
plot = df.sort_values("Retorno (%)")
colors = [RED if x < 0 else GREEN for x in plot["Retorno (%)"]]
fig, ax = plt.subplots(figsize=(11, 6.2), dpi=180)
ax.barh(plot["Ticker"], plot["Retorno (%)"], color=colors, alpha=0.92)
ax.axvline(0, color=NAVY, linewidth=1)
ax.set_title("Retorno por ativo — carteira demonstrativa", fontsize=16, weight="bold", color=NAVY, pad=16)
ax.set_xlabel("Retorno (%)")
ax.set_ylabel("")
ax.text(0.99, -0.14, "Fonte: relatorio_ativos_negociados_python.csv | Demonstração técnica, não recomendação de investimento.", transform=ax.transAxes, ha="right", fontsize=8, color="#555")
for spine in ["top", "right", "left"]:
    ax.spines[spine].set_visible(False)
fig.tight_layout()
fig.savefig(OUT / "retorno_por_ativo.png", bbox_inches="tight", facecolor="white")
plt.close(fig)

# 2. Alocação por classe.
alloc = df.groupby("Classe de Ativo", as_index=False)["Peso Na Carteira (%)"].sum().sort_values("Peso Na Carteira (%)", ascending=True)
fig, ax = plt.subplots(figsize=(10.5, 5.8), dpi=180)
ax.barh(alloc["Classe de Ativo"], alloc["Peso Na Carteira (%)"], color=GOLD, alpha=0.95)
ax.set_title("Alocação por classe de ativo", fontsize=16, weight="bold", color=NAVY, pad=16)
ax.set_xlabel("Peso na carteira (%)")
ax.set_ylabel("")
ax.set_xlim(0, max(alloc["Peso Na Carteira (%)"]) * 1.2)
for i, v in enumerate(alloc["Peso Na Carteira (%)"]):
    ax.text(v + 0.2, i, f"{v:.0f}%", va="center", fontsize=9, color=NAVY, weight="bold")
ax.text(0.99, -0.14, "Fonte: relatorio_ativos_negociados_python.csv | Distribuição demonstrativa.", transform=ax.transAxes, ha="right", fontsize=8, color="#555")
for spine in ["top", "right", "left"]:
    ax.spines[spine].set_visible(False)
fig.tight_layout()
fig.savefig(OUT / "alocacao_por_classe.png", bbox_inches="tight", facecolor="white")
plt.close(fig)

# 3. Relação risco-retorno ilustrativa a partir de retorno e peso; não é estimativa estatística.
fig, ax = plt.subplots(figsize=(9.5, 6.2), dpi=180)
size = df["Peso Na Carteira (%)"] * 30
ax.scatter(df["Peso Na Carteira (%)"], df["Retorno (%)"], s=size, c=df["Retorno (%)"], cmap="RdYlGn", vmin=-5, vmax=15, edgecolor="white", linewidth=0.8, alpha=0.9)
for _, row in df.iterrows():
    ax.annotate(row["Ticker"], (row["Peso Na Carteira (%)"], row["Retorno (%)"]), xytext=(5, 4), textcoords="offset points", fontsize=8, color=NAVY)
ax.axhline(0, color="#555", linewidth=0.8)
ax.set_title("Mapa de exposição e retorno", fontsize=16, weight="bold", color=NAVY, pad=16)
ax.set_xlabel("Peso na carteira (%)")
ax.set_ylabel("Retorno (%)")
ax.text(0.99, -0.14, "Fonte: dados demonstrativos do projeto. O gráfico não representa volatilidade nem recomendação.", transform=ax.transAxes, ha="right", fontsize=8, color="#555")
for spine in ["top", "right"]:
    ax.spines[spine].set_visible(False)
fig.tight_layout()
fig.savefig(OUT / "mapa_exposicao_retorno.png", bbox_inches="tight", facecolor="white")
plt.close(fig)

weighted = (df["Peso Na Carteira (%)"] * df["Retorno (%)"] / 100).sum()
print(f"Retorno ponderado demonstrativo: {weighted:.2f}%")
