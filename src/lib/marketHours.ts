export interface MarketStatusInfo {
  isOpen: boolean;
  statusLabel: string;
  badgeColor: "emerald" | "rose" | "amber";
  reason: string;
  nextSessionText: string;
  currentBrtTime: string;
}

/**
 * Checks if the stock exchange (B3 / S&P 500) is currently open for trading.
 * B3 Regular Trading Hours: Monday to Friday, 10:00 to 17:00 (Brasília time / BRT, UTC-3).
 * Outside 10:00-17:00 BRT or on weekends: Market is CLOSED.
 */
export function getMarketStatus(forceSimulateOpen: boolean = false): MarketStatusInfo {
  const now = new Date();
  
  // Convert to America/Sao_Paulo (BRT) date/time
  const brtString = now.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const brtDateString = now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" });
  const brtDate = new Date(brtDateString);

  const dayOfWeek = brtDate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const hours = brtDate.getHours();
  const minutes = brtDate.getMinutes();
  const currentMinuteOfDay = hours * 60 + minutes;

  const OPEN_MINUTE = 10 * 60; // 10:00 AM = 600 mins
  const CLOSE_MINUTE = 17 * 60; // 17:00 PM = 1020 mins

  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  const isWithinTradingHours = currentMinuteOfDay >= OPEN_MINUTE && currentMinuteOfDay < CLOSE_MINUTE;

  const realIsOpen = isWeekday && isWithinTradingHours;
  const isOpen = realIsOpen || forceSimulateOpen;

  let nextSessionText = "";
  if (dayOfWeek === 5 && currentMinuteOfDay >= CLOSE_MINUTE) {
    nextSessionText = "Segunda-feira às 10:00 BRT";
  } else if (dayOfWeek === 6) {
    nextSessionText = "Segunda-feira às 10:00 BRT";
  } else if (dayOfWeek === 0) {
    nextSessionText = "Amanhã (Segunda-feira) às 10:00 BRT";
  } else if (currentMinuteOfDay >= CLOSE_MINUTE) {
    nextSessionText = "Amanhã às 10:00 BRT";
  } else {
    nextSessionText = "Hoje às 10:00 BRT";
  }

  if (forceSimulateOpen) {
    return {
      isOpen: true,
      statusLabel: "PREGÃO SIMULADO 24/7 (MODO TESTE)",
      badgeColor: "amber",
      reason: "Modo de simulação contínua ativado para testes da mesa fora do horário regular.",
      nextSessionText: "Simulação contínua de pregão ativa",
      currentBrtTime: brtString
    };
  }

  if (realIsOpen) {
    return {
      isOpen: true,
      statusLabel: "PREGÃO ABERTO",
      badgeColor: "emerald",
      reason: "B3 e S&P 500 em pregão ao vivo (Horário oficial: 10:00 às 17:00 BRT)",
      nextSessionText: "Sessão atual encerra hoje às 17:00 BRT",
      currentBrtTime: brtString
    };
  } else {
    let reasonText = "Fora do horário regular de pregão da B3 (10:00 às 17:00 BRT, Seg-Sex).";
    if (!isWeekday) {
      reasonText = "Final de semana. A B3 e as bolsas internacionais estão fechadas.";
    }

    return {
      isOpen: false,
      statusLabel: "PREGÃO FECHADO",
      badgeColor: "rose",
      reason: reasonText,
      nextSessionText: `Próximo pregão: ${nextSessionText}`,
      currentBrtTime: brtString
    };
  }
}
