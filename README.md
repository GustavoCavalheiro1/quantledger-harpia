# QuantLedger — Harpia Quant AI

## Carta de apresentação

O **QuantLedger** é uma plataforma demonstrativa criada para representar a operação de um fundo quantitativo orientado por dados. Sua finalidade é organizar, em uma única camada de acompanhamento, informações de mercado, análise de risco, simulações, monitoramento de ativos e relatórios executivos para apoiar decisões de gestão.

Em termos simples, o projeto funciona como um **centro de inteligência do fundo**. Ele reúne dados e sinais, transforma essas informações em análises compreensíveis e apresenta os principais pontos de atenção para gestores, comitês de risco e profissionais responsáveis pela alocação de capital.

A proposta não é apresentar apenas uma tela de indicadores. O QuantLedger demonstra como uma estrutura de investimento pode conectar **dados, modelos quantitativos, controles de risco e comunicação executiva**. Dessa forma, um gestor consegue visualizar o contexto da carteira, avaliar cenários, acompanhar concentrações, interpretar alertas e discutir possíveis ações com maior clareza.

> O valor central do QuantLedger está em transformar complexidade técnica em informação útil para decisão, mantendo o controle de risco no centro do processo.

## O que o fundo representa

Para fins de apresentação profissional, o fundo representado pelo projeto pode ser entendido como uma operação quantitativa multimercado, com foco em disciplina de dados, diversificação, monitoramento contínuo e gestão ativa de riscos. A plataforma foi desenhada para apoiar uma visão integrada de diferentes classes de ativos e fontes de informação, sem depender de uma única métrica ou de uma única estratégia.

O fundo utiliza uma abordagem orientada por evidências. Antes de uma decisão, a equipe deve ser capaz de compreender a exposição existente, identificar os fatores que influenciam o resultado, testar cenários adversos e verificar se os limites de risco continuam respeitados. O sistema serve, portanto, como uma camada de apoio à governança e não como substituto da análise humana.

## Como a plataforma apoia a gestão

| Necessidade do fundo | Como o QuantLedger responde |
|---|---|
| Entender a carteira | Painéis executivos, ativos negociados, atribuição e visão consolidada |
| Identificar riscos | Limites rígidos, alertas antecipados, concentração e análise de cenários |
| Testar hipóteses | Simulação Monte Carlo, war games e módulos de otimização |
| Acompanhar o mercado | Providers de dados, notícias, contexto macroeconômico e horários de mercado |
| Comunicar resultados | Relatórios executivos, análises mensais e componentes orientados à gestão |
| Apoiar governança | Interface de comitê de risco, trilhas de análise e separação entre dados e decisão |

## Fluxo de decisão representado

O fluxo conceitual do fundo começa com a ingestão e organização dos dados. Em seguida, a plataforma aplica análises quantitativas, calcula indicadores, identifica sinais de atenção e apresenta cenários para avaliação. A decisão final permanece sob responsabilidade dos gestores e dos mecanismos de governança da operação.

```text
Dados de mercado e contexto
            ↓
Organização e validação dos dados
            ↓
Modelos quantitativos e análise de risco
            ↓
Cenários, alertas e atribuição de performance
            ↓
Comitê de risco e decisão do gestor
            ↓
Monitoramento contínuo e geração de relatórios
```

## Destaques técnicos

| Área | Demonstração no projeto |
|---|---|
| Front-end | React, TypeScript, Vite e painéis modulares para acompanhamento executivo |
| Engenharia quantitativa | Simulação Monte Carlo, métricas de risco, cenários e análise de ativos |
| Gestão de risco | Limites rígidos, alertas de eventos e interface de comitê de risco |
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

## Para recrutadores e gestores

Este projeto demonstra a capacidade de estruturar uma solução que combina **engenharia de software, análise quantitativa, gestão de risco e comunicação para executivos**. Mais do que um conjunto de componentes visuais, o repositório apresenta uma visão de produto: quais perguntas o gestor precisa responder, quais controles devem existir antes de uma decisão e como os resultados podem ser comunicados de forma objetiva.

A solução está posicionada como uma demonstração técnica e conceitual. Dados, integrações e resultados devem ser validados antes de qualquer uso em produção ou decisão financeira real.

## Tecnologias

`React` · `TypeScript` · `Vite` · `Python` · `FastAPI` · `SQLite` · `Monte Carlo` · `Risk Management` · `Data Visualization`
