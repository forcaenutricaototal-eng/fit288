// Per Gemini API guidelines, the API key must be accessed via `process.env.API_KEY`.
// The execution environment is expected to provide this variable.

import { GoogleGenAI, Type } from "@google/genai";
import type { UserProfile, DailyPlan } from '../types';

let ai: GoogleGenAI | null = null;

const getAi = () => {
    // If the instance already exists, return it.
    if (ai) {
        return ai;
    }

    // The official Gemini API guidelines require using `process.env.API_KEY`.
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      console.warn("A variável de ambiente API_KEY não está definida. As funcionalidades de IA estarão desativadas. Certifique-se de configurá-la nas configurações do seu ambiente.");
      throw new Error("O cliente Gemini AI não foi inicializado. Verifique se a variável de ambiente API_KEY está configurada corretamente.");
    }
    
    try {
        // Create and cache the instance.
        ai = new GoogleGenAI({ apiKey });
        return ai;
    } catch (error) {
        console.error("Erro ao inicializar o GoogleGenAI:", error);
        // Ensure `ai` is null if initialization fails, so we can retry.
        ai = null; 
        throw new Error("Falha ao inicializar o cliente Gemini AI. Verifique o console para mais detalhes.");
    }
}

export const getGeminiResponse = async (
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  newMessage: string,
  userProfile: UserProfile | null
) => {
  try {
    const aiClient = getAi();
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

    const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
            systemInstruction: systemInstruction,
        },
    });

    return response.text;
  } catch (error) {
    console.error("Erro ao chamar a API Gemini:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Desculpe, não consegui processar sua solicitação no momento. Tente novamente mais tarde.");
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


export const generateMealPlan = async (userProfile: UserProfile, day: number): Promise<DailyPlan> => {
    try {
        const aiClient = getAi();
        const systemInstruction = `Você é um nutricionista expert para o app Fit28. Sua tarefa é criar um plano alimentar Low-Carb detalhado para um usuário, focado em estimular GIP/GLP-1 e promover saciedade e emagrecimento saudável. Retorne APENAS o objeto JSON, sem nenhum texto adicional ou formatação markdown.`;
        
        let daySpecificInstructions = '';
        if (day <= 10) {
            daySpecificInstructions = `
            ATENÇÃO: Este é o Dia ${day}, que faz parte dos 10 primeiros dias do protocolo Detox. Siga RIGOROSAMENTE as seguintes restrições. NÃO inclua NENHUM dos seguintes alimentos:
            - Todos os alimentos que contém Glúten.
            - Soja ou molho de soja.
            - Queijos (são permitidos APENAS Cream cheese light e creme cottage). Queijo muçarela, prato, etc., são PROIBIDOS.
            - Açúcar refinado.
            - Adoçantes (são permitidos APENAS estévia, xilitol e eritritol).
            - Leite de origem animal (Iogurte grego ou natural desnatado sem açúcar SÃO PERMITIDOS).
            - Nenhum tipo de chocolate.
            - Refrigerantes (diet ou convencional).
            - Carnes processadas e embutidas (salsicha, presunto, peito de peru, etc.).
            - Carnes vermelhas.
            - Sal em excesso ou temperos prontos industrializados.
            - Bebidas alcoólicas.
            `;
        }

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

        ${daySpecificInstructions}

        O plano deve incluir café da manhã, almoço, jantar, um lanche opcional e 3 tarefas/hábitos diários para reforçar o programa. As receitas devem ser simples, com ingredientes acessíveis no Brasil.

        INSTRUÇÕES ADICIONAIS E LISTA DE ALIMENTOS PERMITIDOS:
        Baseie TODAS as refeições ESTRITAMENTE na lista de alimentos abaixo. Não use nenhum ingrediente que não esteja nesta lista.

        - **PRIORIDADE DE PROTEÍNAS:** Dê preferência para proteínas mais acessíveis como ovos, sardinha, tilápia, atum, peito de frango e proteína de soja. Indique salmão poucas vezes, pois é uma opção de maior custo para o público-alvo. (Lembre-se que soja é proibida nos primeiros 10 dias).
        - **Opções de Proteína Extra:** Inclua a opção de usar Whey Protein (puro ou com frutas) como lanche, jantar, ou como um complemento no café da manhã.
        - **Frutas:** Kiwi, Maçã, Morango, Banana, Coco, Pera, Abacaxi, Abacate, Melancia, Mamão, Limão, Laranja.
        - **Oleaginosas e sementes:** Castanha-do-pará, Castanha de caju, Nozes, Amêndoas, Amendoim, Semente de girassol, Semente de abóbora, Chia.
        - **Proteínas magras:** Ovo, Lombo, Peito de frango, Peixe (tilápia, salmão, sardinha, atum), Iogurte natural, Iogurte grego, Whey protein, Proteína de soja.
        - **Verduras e vegetais:** Couve-manteiga, Brócolis, Espinafre, Agrião, Escarola, Repolho, Jiló, Quiabo, Abobrinha, Abóbora, Inhame, Cenoura, Tomate, Pepino, Chuchu, Vagem, Ervilha.
        - **Grãos e leguminosas:** Quinoa, Grão-de-bico, Aveia. (Lembre-se da restrição de grãos nos primeiros 4 dias do Detox).
        - **Temperos e complementos:** Azeite, Óleo de coco, Vinagre de maçã, Páprica, Pimenta-do-reino, Maca peruana.
        - **Adoçantes e açúcares naturais:** Mel, Xilitol, Estevia, Eritritol, Açúcar de coco.
        - **Farinhas permitidas:** Farinha de amêndoas, Farinha de coco, Farinha de linhaça, Farinha de aveia, Farinha de grão-de-bico, Farinha de quinoa, Farinha de chia, Farinha de castanha-de-caju, Farinha de castanha-do-pará, Farinha de amaranto, Farinha de arroz integral, Farinha de semente de abóbora, Farinha de banana verde.

        REGRAS PARA CARNE VERMELHA:
        - Carne vermelha (apenas Patinho) pode ser indicada no máximo DUAS VEZES por semana, com porções de 150g cada.
        - NÃO indique carne vermelha nos 10 primeiros dias (protocolo Detox), conforme já especificado nas restrições diárias.`;
        
        const response = await aiClient.models.generateContent({
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
        if (!jsonText) {
            throw new Error("A API retornou uma resposta vazia, o que impediu a criação do plano.");
        }
        return JSON.parse(jsonText) as DailyPlan;

    } catch (error) {
        console.error("Erro ao gerar o plano alimentar:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Não foi possível gerar o plano. Tente novamente.");
    }
}

export const generateShoppingList = async (plan: DailyPlan): Promise<string> => {
    try {
        const aiClient = getAi();
        const ingredients = [
            ...plan.meals.breakfast.ingredients,
            ...plan.meals.lunch.ingredients,
            ...plan.meals.dinner.ingredients,
            ...(plan.meals.snack?.ingredients || [])
        ].join('\n');
        
        const prompt = `A partir da seguinte lista de ingredientes para um dia de refeições, crie uma lista de compras organizada por categorias (ex: Hortifrúti, Açougue, Mercearia). Agrupe itens semelhantes e remova duplicatas. A lista é: \n${ingredients}`;
        
         const response = await aiClient.models.generateContent({
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