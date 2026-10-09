import { INTENTS } from '../data/intents.js';
import { RESPONSES } from '../data/responses.js';
import { SERVICE_BY_ID } from '../data/services.js';

/**
 * Route a user transcript to the best-matching intent.
 */
export const routeIntent = (transcript = '') => {
  const lower = transcript.toLowerCase().trim();
  if (!lower) return buildReply('fallback');

  const words = lower.split(/\s+/);

  // 1. Multi-word phrase match (highest priority)
  for (const intent of INTENTS) {
    for (const keyword of intent.keywords) {
      if (keyword.includes(' ') && lower.includes(keyword)) {
        return buildReply(intent.id);
      }
    }
  }

  // 2. Weighted single-word match
  let bestIntentId = null;
  let bestScore = 0;
  for (const intent of INTENTS) {
    let score = 0;
    for (const keyword of intent.keywords) {
      if (!keyword.includes(' ') && words.includes(keyword)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestIntentId = intent.id;
    }
  }

  // 3. Fallback
  return bestIntentId ? buildReply(bestIntentId) : buildReply('fallback');
};

const buildReply = (intentId) => {
  const service = SERVICE_BY_ID[intentId];

  if (service) {
    return {
      text: RESPONSES[intentId],
      intent: intentId,
      service: service.id,
    };
  }

  return {
    text: RESPONSES[intentId] || RESPONSES.fallback,
    intent: intentId,
    service: null,
  };
};
