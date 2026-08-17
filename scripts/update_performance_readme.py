#!/usr/bin/env python3
"""Atualiza as métricas de performance do QuantLedger no README.

A fonte da série é src/data/monthlyData.ts, que contém os dados mensais
consolidados usados pela aplicação. O script usa apenas a biblioteca padrão
para facilitar a execução local e em GitHub Actions.
"""
from __future__ import annotations

import math
import re
from pathlib import Path
from statistics import mean, stdev

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src" / "data" / "monthlyData.ts"
README = ROOT / "README.md"


def extract_history(text: str) -> list[dict[str, float | str]]:
    pattern = re.compile(
        r"month:\s*\"(?P<month>[^\"]+)\"(?P<body>.*?)(?=\n\s*month:\s*\"|\Z)",
        re.DOTALL,
    )
    rows = []
    for match in pattern.finditer(text):
        body = match.group("body")
        values = {"month": match.group("month")}
        for field in ("fundReturn", "benchReturn", "cdiReturn"):
            found = re.search(rf"{field}:\s*(-?\d+(?:\.\d+)?)", body)
            if not found:
                break
            values[field] = float(found.group(1))
        if len(values) == 4:
            rows.append(values)
    if len(rows) < 2:
        raise RuntimeError("Não foi possível extrair pelo menos dois períodos mensais da fonte.")
    return rows


def max_drawdown(returns: list[float]) -> float:
    wealth = 1.0
    peak = 1.0
    worst = 0.0
    for current_return in returns:
        wealth *= 1 + current_return
        peak = max(peak, wealth)
        worst = min(worst, wealth / peak - 1)
    return worst


def calculate(rows: list[dict[str, float | str]]) -> dict[str, float | str | int]:
    fund = [float(row["fundReturn"]) for row in rows]
    benchmark = [float(row["benchReturn"]) for row in rows]
    cdi = [float(row["cdiReturn"]) for row in rows]
    periods = len(fund)
    cumulative = math.prod(1 + item for item in fund) - 1
    annualized = (1 + cumulative) ** (12 / periods) - 1
    volatility = stdev(fund) * math.sqrt(12)
    excess = [fund[i] - cdi[i] for i in range(periods)]
    sharpe = mean(excess) / stdev(fund) * math.sqrt(12) if stdev(fund) else 0.0
    return {
        "periods": periods,
        "first": str(rows[0]["month"]),
        "last": str(rows[-1]["month"]),
        "cumulative": cumulative,
        "annualized": annualized,
        "volatility": volatility,
        "sharpe": sharpe,
        "drawdown": max_drawdown(fund),
        "benchmark": math.prod(1 + item for item in benchmark) - 1,
        "cdi": math.prod(1 + item for item in cdi) - 1,
    }


def render_block(metrics: dict[str, float | str | int]) -> str:
    return f"""<!-- PERFORMANCE:START -->
### Rentabilidade e risco — atualização automática

| Métrica | Resultado demonstrativo |
|---|---:|
| Rentabilidade acumulada | **{float(metrics['cumulative']):.2%}** |
| Rentabilidade anualizada | **{float(metrics['annualized']):.2%}** |
| Volatilidade anualizada | **{float(metrics['volatility']):.2%}** |
| Índice de Sharpe anualizado | **{float(metrics['sharpe']):.2f}** |
| Drawdown máximo | **{float(metrics['drawdown']):.2%}** |
| Benchmark acumulado | {float(metrics['benchmark']):.2%} |
| CDI acumulado | {float(metrics['cdi']):.2%} |

_Período analisado: {metrics['first']} a {metrics['last']} ({metrics['periods']} observações mensais). Os resultados são demonstrativos, derivados da série histórica presente no projeto, e não constituem promessa de rentabilidade ou recomendação de investimento._

<!-- PERFORMANCE:END -->"""


def main() -> None:
    rows = extract_history(SOURCE.read_text(encoding="utf-8"))
    metrics = calculate(rows)
    block = render_block(metrics)
    readme = README.read_text(encoding="utf-8")
    marker = re.compile(r"<!-- PERFORMANCE:START -->.*?<!-- PERFORMANCE:END -->", re.DOTALL)
    if marker.search(readme):
        updated = marker.sub(block, readme, count=1)
    else:
        anchor = "## Tecnologias"
        if anchor not in readme:
            raise RuntimeError("Âncora '## Tecnologias' não encontrada no README.")
        updated = readme.replace(anchor, f"## Rentabilidade e risco\n\n{block}\n\n{anchor}", 1)
    README.write_text(updated, encoding="utf-8")
    print(f"Atualizado: {metrics['first']}–{metrics['last']} | Sharpe={float(metrics['sharpe']):.2f} | Drawdown={float(metrics['drawdown']):.2%}")


if __name__ == "__main__":
    main()
