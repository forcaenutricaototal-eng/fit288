import { GoogleGenAI } from "@google/genai";
import type { UserProfile } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const getGeminiResponse = async (
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  newMessage: string,
  userProfile: UserProfile | null
) => {
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

    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction,
        },
        history: history,
    });
    
    const response = await chat.sendMessage({ message: newMessage });

    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Desculpe, não consegui processar sua solicitação no momento. Tente novamente mais tarde.";
  }
};