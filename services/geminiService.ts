// Simulation locale des réponses pour éviter l'utilisation de l'API Google

export const getSmartReply = async (conversationHistory: string[], lastMessage: string): Promise<string> => {
  // Réponses prédéfinies style "Cyberpunk/Securisé"
  const responses = [
    "Signal reçu fort et clair. Cryptage maintenu.",
    "L'intégrité des données est vérifiée à 100%.",
    "Intéressant. Le protocole fantôme est actif.",
    "Transmission sécurisée. Aucune anomalie détectée.",
    "Je garde un œil sur le réseau.",
    "Affirmatif. L'anonymat est total.",
    "Les clés de chiffrement ont été renouvelées.",
    "Message intercepté et sécurisé.",
    "Communication stable sur le canal quantique."
  ];

  // Simulation d'un délai de "réflexion" ou réseau
  await new Promise(resolve => setTimeout(resolve, 800));

  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
};

export const analyzeSafety = async (content: string): Promise<{ safe: boolean; reason: string }> => {
    // Simulation d'analyse de sécurité locale
    return { safe: true, reason: "Vérification locale heuristique: OK" };
}