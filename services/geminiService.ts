import { GoogleGenAI, Type } from "@google/genai";
import type { UserProfile, DailyPlan } from '../types';

let ai: GoogleGenAI | null = null;
const apiKey = process.env.API_KEY;

if (apiKey) {
  try {
    ai = new GoogleGenAI({ apiKey });
  } catch (error) {
    console.error("Erro ao inicializar o GoogleGenAI:", error);
  }
} else {
  console.warn("A variável de ambiente API_KEY não está definida. As funcionalidades de IA estarão desativadas.");
}

const getAi = () => {
    if (!ai) {
        throw new Error("O cliente Gemini AI não foi inicializado. Verifique a chave da API.");
    }
    return ai;
}

export const getGeminiResponse = async (
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  newMessage: string,
  userProfile: UserProfile | null
) => {
  try {
    const ai = getAi();
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


const recipeSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Nome da receita." },
        type: { type: Type.STRING, description: "Tipo de refeição (ex: Café da Manhã, Almoço, Jantar, Lanche)." },
        ingredients: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de ingredientes com quantidades." },
        preparation: { type: Type.STRING, description: "Modo de preparo passo a passo." },
        calories: { type: Type.NUMBER, description: "Total de calorias (kcal)." },
        carbohydrates: { type: Type.NUMBER, description: "Total de carboidratos (g)." },
        proteins: { type: Type.NUMBER, description: "Total de proteínas (g)." },
        fats: { type: Type.NUMBER, description: "Total de gorduras (g)." },
    },
    required: ["name", "type", "ingredients", "preparation", "calories", "carbohydrates", "proteins", "fats"],
};


export const generateMealPlan = async (userProfile: UserProfile, day: number): Promise<DailyPlan | null> => {
    try {
        const ai = getAi();
        const systemInstruction = `Você é um nutricionista expert para o app Fit28. Sua tarefa é criar um plano alimentar Low-Carb detalhado para um usuário, focado em estimular GIP/GLP-1 e promover saciedade e emagrecimento saudável. Retorne APENAS o objeto JSON, sem nenhum texto adicional ou formatação markdown.`;
        
        const prompt = `Gere o plano alimentar para o Dia ${day} do programa de 28 dias para o seguinte usuário:
        - Nome: ${userProfile.name}
        - Idade: ${userProfile.age}
        - Gênero: ${userProfile.gender}
        - Peso: ${userProfile.weight} kg
        - Altura: ${userProfile.height} cm
        - Nível de Atividade: ${userProfile.activityLevel}
        - Objetivo Principal: ${userProfile.goal}
        - Meta de Peso: ${userProfile.weightGoal} kg
        - Restrições Alimentares: ${userProfile.dietaryRestrictions.join(', ') || 'Nenhuma'}

        O plano deve incluir café da manhã, almoço, jantar, um lanche opcional e 3 tarefas/hábitos diários para reforçar o programa. As receitas devem ser simples, com ingredientes acessíveis no Brasil.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        day: { type: Type.NUMBER },
                        meals: {
                            type: Type.OBJECT,
                            properties: {
                                breakfast: recipeSchema,
                                lunch: recipeSchema,
                                dinner: recipeSchema,
                                snack: { ...recipeSchema, description: "Lanche opcional. Pode ser nulo." }
                            },
                             required: ["breakfast", "lunch", "dinner"]
                        },
                        tasks: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["day", "meals", "tasks"]
                },
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as DailyPlan;

    } catch (error) {
        console.error("Erro ao gerar o plano alimentar:", error);
        return null;
    }
}

export const generateShoppingList = async (plan: DailyPlan): Promise<string> => {
    try {
        const ai = getAi();
        const ingredients = [
            ...plan.meals.breakfast.ingredients,
            ...plan.meals.lunch.ingredients,
            ...plan.meals.dinner.ingredients,
            ...(plan.meals.snack?.ingredients || [])
        ].join('\n');
        
        const prompt = `A partir da seguinte lista de ingredientes para um dia de refeições, crie uma lista de compras organizada por categorias (ex: Hortifrúti, Açougue, Mercearia). Agrupe itens semelhantes e remova duplicatas. A lista é: \n${ingredients}`;
        
         const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
              systemInstruction: 'Você é um assistente de compras que cria listas organizadas. Responda apenas com a lista em formato de texto simples, usando markdown para títulos e itens.'
            }
        });

        return response.text;
    } catch (error) {
        console.error("Erro ao gerar lista de compras:", error);
        return "Não foi possível gerar a lista de compras no momento.";
    }
};