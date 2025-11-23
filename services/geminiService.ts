import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || ''; // Ensure this is set in your environment
const ai = new GoogleGenAI({ apiKey });

export const getSmartReply = async (conversationHistory: string[], lastMessage: string): Promise<string> => {
  if (!apiKey) return "Je ne peux pas répondre pour le moment (Clé API manquante).";

  try {
    const prompt = `
      Tu es "Salsifie AI", un assistant intégré dans une messagerie sécurisée post-quantique.
      
      Contexte de la conversation:
      ${conversationHistory.join('\n')}
      
      Dernier message reçu: "${lastMessage}"
      
      Tâche: Génère une réponse courte, pertinente et un peu mystérieuse ou "cyberpunk" en Français.
      Ne mets pas de guillemets. Maximum 2 phrases.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Communication sécurisée établie.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erreur de connexion au noeud neuronal.";
  }
};

export const analyzeSafety = async (content: string): Promise<{ safe: boolean; reason: string }> => {
    if (!apiKey) return { safe: true, reason: "Offline" };
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze this message for phishing or malicious intent. Reply JSON { "safe": boolean, "reason": string }. Message: "${content}"`,
            config: { responseMimeType: "application/json" }
        });
        const text = response.text;
        if(text) return JSON.parse(text);
        return { safe: true, reason: "Undetermined" };
    } catch (e) {
        return { safe: true, reason: "Error" };
    }
}
