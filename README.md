# QuantLedger — Harpia Quant AI

> Plataforma demonstrativa de inteligência quantitativa, gestão de risco e monitoramento de ativos para uma operação financeira orientada por dados.

## Visão geral

O **QuantLedger** reúne uma interface de acompanhamento executivo com módulos de risco, atribuição de performance, dados de mercado, notícias, simulação, monitoramento agrointeligente e integração com pipelines Python. O projeto foi organizado como uma vitrine técnica para demonstrar arquitetura full-stack, engenharia de dados, controles de risco e visualização para tomada de decisão.

## Destaques para recrutadores e gestores

| Área | Demonstração |
|---|---|
| Front-end | React, TypeScript, Vite e painéis modulares para acompanhamento executivo |
| Engenharia quantitativa | Simulação Monte Carlo, métricas de risco, cenários e análise de ativos |
| Risk management | Limites rígidos, alertas de eventos e interface de comitê de risco |
| Dados e integração | Providers, ingestão, banco local de demonstração e pipelines Python |
| Relatórios | Componentes de relatório mensal, executivo e de ativos negociados |
| Arquitetura | Separação entre interface, API, engine quantitativo, providers e camada de dados |

## Estrutura do projeto

- `src/`: aplicação web e componentes de visualização.
- `engine/`: interfaces e lógica de execução, contexto, meta-learning e scorers.
- `src/risk/`: modelos de risco, limites, alertas e simulação.
- `providers/`: abstrações e gerenciadores de dados.
- `api/`: servidor de apoio em Python.
- `db/`: schema e scripts de preparação do banco de demonstração.
- `scripts/`: automações para geração de relatórios.
- `docs/`: relatório executivo complementar do projeto.

## Execução local

### Interface web

```bash
npm install
npm run dev
```

### Ambiente Python

```bash
pip install -r requirements.txt
python pipeline_ponta_a_ponta.py
```

As variáveis de ambiente devem ser configuradas a partir de `.env.example`. Não inclua chaves reais ou credenciais no repositório.

## Relatório executivo

O arquivo [`docs/Harpia_Relatorio_Final_Quant_AI_2026_5_paginas.docx`](docs/Harpia_Relatorio_Final_Quant_AI_2026_5_paginas.docx) apresenta a visão consolidada da solução, seus objetivos e aplicações. Ele foi incluído para facilitar a avaliação por recrutadores, gestores e stakeholders não técnicos.

## Observação de escopo

Este repositório é uma **demonstração técnica e visual**. Dados, integrações e resultados devem ser validados antes de qualquer uso em produção ou decisão financeira real.

## Tecnologias

`React` · `TypeScript` · `Vite` · `Python` · `FastAPI` · `SQLite` · `Monte Carlo` · `Risk Management` · `Data Visualization`
