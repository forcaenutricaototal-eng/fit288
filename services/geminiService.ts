import { GoogleGenAI } from "@google/genai";
import type { UserProfile } from '../types';

// Inicializa a IA de forma segura para evitar que o aplicativo quebre
let ai: GoogleGenAI | null = null;
// FIX: Replaced import.meta.env.VITE_API_KEY with process.env.API_KEY to align with guidelines and fix TypeScript type errors.
const apiKey = process.env.API_KEY;

if (apiKey) {
  try {
    ai = new GoogleGenAI({ apiKey });
  } catch (error) {
    console.error("Erro ao inicializar o GoogleGenAI:", error);
  }
} else {
  // FIX: Updated the warning message to refer to API_KEY, consistent with the change above.
  console.warn("A variável de ambiente API_KEY não está definida. As funcionalidades de IA estarão desativadas.");
}


export const getGeminiResponse = async (
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  newMessage: string,
  userProfile: UserProfile | null
) => {
  // Se a inicialização falhou, retorna uma mensagem clara para o usuário
  if (!ai) {
    console.error("O cliente Gemini AI não foi inicializado.");
    return "Desculpe, a IA não está configurada corretamente. Verifique a chave da API nas configurações de publicação.";
  }

  try {
    const systemInstruction = `Você é a IA do Fit28, um nutricionista especialista do programa de mesmo nome. Este programa é um plano Low-Carb de 28 dias para ajudar usuários que buscam estimular naturalmente GIP/GLP-1, reduzir retenção hídrica e emagrecer de forma saudável. Seu objetivo é dar conselhos práticos, motivadores e com base científica. Você pode sugerir substituições de refeições (sempre low-carb), dar dicas para controlar vontades, motivar e responder dúvidas sobre o plano. Mantenha um tom amigável, encorajador e profissional. Responda sempre em português.
    Dados do usuário:
    - Nome: ${userProfile?.name || 'Não informado'}
    - Idade: ${userProfile?.age || 'Não informado'}
    - Peso: ${userProfile?.weight || 'Não informado'} kg
    - Altura: ${userProfile?.height || 'Não informado'} cm
    - Objetivo: ${userProfile?.goal || 'Não informado'}
    - Restrições: ${userProfile?.dietaryRestrictions.join(', ') || 'Nenhuma'}
    `;
    
    const contents = [...history, { role: 'user' as const, parts: [{ text: newMessage }] }];

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
            systemInstruction: systemInstruction,
        },
    });

    return response.text;
  } catch (error) {
    console.error("Erro ao chamar a API Gemini:", error);
    return "Desculpe, não consegui processar sua solicitação no momento. Tente novamente mais tarde.";
  }
};