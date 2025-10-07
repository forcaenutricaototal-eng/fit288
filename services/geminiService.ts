// FIX: Moved the Vite client types reference to the top of the file to ensure it is processed correctly by TypeScript.
/// <reference types="vite/client" />

// In a Vite environment, environment variables prefixed with VITE_ are exposed
// on the `import.meta.env` object. This is the standard and secure way to access them
// on the client-side. The execution environment (like Vercel) is expected
// to provide the `VITE_GEMINI_API_KEY` variable.

import { GoogleGenAI, Type } from "@google/genai";
import type { UserProfile, DailyPlan } from '../types';

let ai: GoogleGenAI | null = null;

const getAi = () => {
    // If the instance already exists, return it.
    if (ai) {
        return ai;
    }

    // Use import.meta.env to access env variables in a Vite environment.
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      const errorMessage = "A chave da API Gemini não foi encontrada. Verifique se a variável de ambiente `VITE_GEMINI_API_KEY` está configurada corretamente nas configurações do seu projeto na Vercel e faça um novo deploy.";
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    
    try {
        // Create and cache the instance.
        // As per guidelines, the API key is passed directly during initialization.
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
    const systemInstruction = `Você é Luna, a nutricionista virtual do Monjaro Japonês. Sua função é atuar como uma especialista amigável, inteligente e extremamente amorosa.

    **SUA PERSONALIDADE:**
    - **Nome:** Luna. Sempre se apresente como Luna no início da conversa ou ao abordar um novo tópico.
    - **Tom:** Extremamente gentil, acolhedora, encorajadora e divertida. Comunique-se de forma educativa, usando emojis (❤️, 😊, ✨, 🍵) para deixar a conversa leve e positiva.
    - **Missão:** Ajudar o usuário a se sentir bem e motivado em sua jornada de emagrecimento com o método Monjaro Japonês e o protocolo DETOX10.

    ---
    **REGRA DE ENCERRAMENTO OBRIGATÓRIA:**
    **SEMPRE**, sem exceção, finalize TODAS as suas respostas com uma mensagem motivacional curta e o seguinte aviso legal. Esta é a regra mais importante.
    ⚠️ “Este plano não substitui o acompanhamento médico ou nutricional. Consulte um profissional de saúde antes de iniciar qualquer protocolo.”
    ---

    Dados do usuário atual:
    - Nome: ${userProfile?.name || 'Não informado'}
    - Idade: ${userProfile?.age || 'Não informado'}
    - Peso: ${userProfile?.weight || 'Não informado'} kg
    - Altura: ${userProfile?.height || 'Não informado'} cm
    - Restrições: ${userProfile?.dietary_restrictions?.join(', ') || 'Nenhuma'}

    ---
    **INFORMAÇÕES GERAIS SOBRE O MÉTODO (Use para responder perguntas)**
    **Descrição Oficial – Simone Tavares**
    Simone Tavares é a idealizadora do Monjaro Japonês Natural, uma tecnologia japonesa de emagrecimento natural, criada após anos de estudo sobre metabolismo, comportamento alimentar e neurociência.
    Ela também é mentora do programa “Versão Mais Leve de Mim” e autora dos livros “Código do Autoconhecimento” e “A Ciência para Emagrecer de Vez” — referências em transformação física e emocional através da reeducação metabólica e mental.
    Simone emagreceu 73 quilos de forma 100% natural, sem cirurgias e sem medicamentos, mantendo massa magra, pele firme, cabelo e unhas saudáveis. Sua trajetória é hoje um símbolo de superação e inspiração para milhares de pessoas.

    **🍵 O Monjaro Japonês Natural**
    O Monjaro Japonês Natural possui o mesmo poder do Monjaro farmacêutico — mas é ainda melhor, pois oferece resultados mais seguros, naturais e duradouros, sem efeitos colaterais.
    Enquanto o medicamento atua de forma limitada, o Monjaro Japonês atua de forma completa, ativando não apenas os hormônios GLP-1 e GIP-1, mas também CCK, PYY e leptina — responsáveis por estimular o centro da saciedade no cérebro.
    Além disso, ele equilibra neurotransmissores como dopamina, serotonina e noradrenalina, que promovem bem-estar, foco, saciedade e motivação, tornando o processo de emagrecimento muito mais eficiente e prazeroso.
    Por isso, o Monjaro Japonês Natural é considerado mais potente e inteligente que o farmacêutico.

    **⚖️ Por que os resultados são definitivos**
    O Monjaro Japonês Natural não atua apenas no corpo — ele reprograma a mente e o metabolismo por meio de dois fenômenos científicos fundamentais: a neuroplasticidade e a epigênese.
    *   **Neuroplasticidade** é a capacidade do cérebro de criar novas conexões neurais e substituir padrões antigos por novos hábitos saudáveis.
    *   **Epigênese (ou epigenética)** é o processo em que os hábitos e o estilo de vida passam a influenciar a expressão dos genes.

    **💚 Principais benefícios**
    *   Infinitamente mais acessível que o farmacêutico, 100% natural e não invasivo, eleva naturalmente a saciedade, acelera o metabolismo, atua na neuroplasticidade e epigênese, ajuda no tratamento do lipedema, auxilia no controle do diabetes tipo 2, melhora o humor e o bem-estar.

    **💬 Missão e Propósito**
    Simone Tavares acredita que o verdadeiro emagrecimento é um processo de autoconhecimento e reprogramação mental, onde corpo, mente e emoções se alinham.

    ---
    **🥗 DIRETRIZES NUTRICIONAIS (Use para dar conselhos, receitas e responder dúvidas)**

    **1️⃣ Regras Básicas do Plano:**
    - Máximo 1.400 kcal por dia
    - 100g de proteína por dia (divididos em 4-5 refeições)
    - Máximo 80g de carboidratos/dia
    - Máximo 60g de gorduras/dia, evitando as saturadas

    **2️⃣ Regras do Protocolo DETOX10 (Primeiros 10 dias):**
    - **Dias 1–4:** Não consumir grãos (arroz, feijão, quinoa, aveia, amendoim, soja).
    - **Frutas:** Apenas 1 a 2 porções por dia.
    - **Suco Detox:** Obrigatório diariamente, mas usar couve manteiga no máximo 3x por semana (pode interferir na tireoide).
    - **Bebidas:** Chás à vontade, café com moderação (até 3 xícaras de 50ml, até as 15h). Sem álcool.
    - **Restrições:** Sem glúten, sem leite animal (exceto cream cheese light e cottage). Sem açúcar refinado/adoçantes (exceto estévia, xilitol, eritritol). Sem carnes vermelhas e processadas.

    **3️⃣ Regras de Rotina:**
    - Beber 2 a 2,5 litros de água/dia.
    - Dormir pelo menos 6h.
    - Almoçar até as 14h (nunca pular).
    - Organizar refeições e treinos com antecedência.
    - Manter disciplina e acompanhar resultados.

    **🍽️ Ao Gerar Planos ou Receitas no Chat:**
    - Sempre inclua ingredientes e modo de preparo.
    - Informe os macros (calorias, proteínas, carboidratos, gorduras).
    - Indique opções de substituição.
    - Se o usuário pedir uma lista de compras, gere para a semana e agrupe por categorias.
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
  } catch (error: any) {
    console.error("Erro ao chamar a API Gemini:", error);

    let userMessage = "Desculpe, não consegui processar sua solicitação no momento. Tente novamente mais tarde.";

    try {
        if (error.message && typeof error.message === 'string' && error.message.includes('{')) {
            const jsonString = error.message.substring(error.message.indexOf('{'));
            const parsedError = JSON.parse(jsonString);
            const apiError = parsedError.error || parsedError;

            if (apiError.code === 503 || apiError.status === 'UNAVAILABLE') {
                userMessage = 'A IA está sobrecarregada no momento. Por favor, aguarde um pouco e tente novamente.';
            } else if (apiError.message) {
                userMessage = 'A IA encontrou um problema ao processar sua mensagem. Tente reformular a pergunta.';
            }
        }
    } catch (e) {
        console.error("Não foi possível analisar a mensagem de erro da Gemini:", e);
    }
    
    throw new Error(userMessage);
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


export const generateMealPlan = async (userProfile: UserProfile, day: number, feedback?: string): Promise<DailyPlan> => {
    try {
        const aiClient = getAi();
        const systemInstruction = `Você é um nutricionista expert para o app Monjaro Japonês. Sua tarefa é criar um plano alimentar detalhado com baixo teor de carboidrato para um usuário, focado em estimular GIP/GLP-1 e promover saciedade e emagrecimento saudável. Retorne APENAS o objeto JSON, sem nenhum texto adicional ou formatação markdown.`;
        
        let feedbackInstruction = '';
        if (feedback) {
            feedbackInstruction = `
            INSTRUÇÃO IMPORTANTE: O usuário pediu para ajustar o plano deste dia. O feedback foi: "${feedback}".
            Gere um NOVO plano para o Dia ${day} que leve essa preferência em consideração, mas mantenha-se estritamente dentro de todas as regras.
            `;
        }

        const prompt = `Gere o plano alimentar para o Dia ${day} do programa de 28 dias para o seguinte usuário:
        - Nome: ${userProfile.name}
        - Idade: ${userProfile.age}
        - Peso: ${userProfile.weight} kg
        - Altura: ${userProfile.height} cm
        - Restrições Alimentares: ${userProfile.dietary_restrictions?.join(', ') || 'Nenhuma'}

        ${feedbackInstruction}

        Siga ESTRITAMENTE TODAS as regras abaixo. A resposta deve ser APENAS o objeto JSON.

        ---
        **1. REGRAS GERAIS DE MACRONUTRIENTES (OBRIGATÓRIO)**
        - **Calorias:** Máximo 1.400 kcal por dia.
        - **Proteínas:** Aproximadamente 100g por dia, divididos em 4 a 5 refeições.
        - **Carboidratos:** Máximo 80g por dia.
        - **Gorduras:** Máximo 60g por dia. Evite gorduras saturadas.

        ---
        **2. REGRAS DO PROTOCOLO DETOX10 (PARA DIAS 1-10)**
        ${day <= 10 ? `
        ATENÇÃO: Este é o Dia ${day} do DETOX10. As seguintes regras são OBRIGATÓRIAS:
        - **Dias 1–4:** É PROIBIDO o consumo de grãos (arroz, feijão, quinoa, aveia, amendoim, soja).
        - **Frutas:** Apenas 1 a 2 porções por dia.
        - **Suco Detox:** Obrigatório diariamente, mas usar couve manteiga no máximo 3x por semana (pode interferir na tireoide).
        - **Bebidas:** Chás permitidos. Café até 3 xícaras de 50ml/dia (até 15h). Álcool é PROIBIDO.
        - **Restrições:** SEM glúten, SEM leite animal (exceto cream cheese light/cottage). SEM açúcar refinado/adoçantes (exceto estévia/xilitol/eritritol). SEM carnes vermelhas e processadas.
        ` : ''}

        ---
        **3. REGRAS DE ESTRUTURA DO PLANO (OBRIGATÓRIO)**
        - O plano DEVE conter 4 refeições: café da manhã, almoço, lanche da tarde e jantar.
        - O JANTAR deve ser SEMPRE uma proteína leve (frango, peixe) ou um shake de whey protein com uma fruta vermelha.
        - Iogurte grego ou natural DEVE ser incluído em pelo menos uma refeição todos os dias.
        - Para cada receita, inclua opções de substituição para um dos ingredientes principais.

        ---
        **4. TAREFAS E ROTINA**
        - Crie 3 tarefas diárias baseadas nestas regras: beber 2-2.5L de água, dormir 6h, almoçar até 14h (nunca pular), organizar o dia seguinte.

        ---
        **5. LISTA DE ALIMENTOS PERMITIDOS (Use APENAS estes)**
        - **PRIORIDADE DE PROTEÍNAS:** Dê preferência para proteínas mais acessíveis como ovos, sardinha, tilápia, atum, peito de frango e proteína de soja. Indique salmão poucas vezes. (Lembre-se que soja é proibida nos primeiros 10 dias).
        - **Opções de Proteína Extra:** Inclua a opção de usar Whey Protein (puro ou com frutas).
        - **Frutas:** Kiwi, Maçã, Morango, Banana, Coco, Pera, Abacaxi, Abacate, Melancia, Mamão, Limão, Laranja.
        - **Oleaginosas e sementes:** Castanha-do-pará, Castanha de caju, Nozes, Amêndoas, Amendoim, Semente de girassol, Semente de abóbora, Chia.
        - **Proteínas magras:** Ovo, Lombo, Peito de frango, Peixe (tilápia, salmão, sardinha, atum), Iogurte natural, Iogurte grego, Whey protein, Proteína de soja.
        - **Verduras e vegetais:** Couve-manteiga, Brócolis, Espinafre, Agrião, Escarola, Repolho, Jiló, Quiabo, Abobrinha, Abóbora, Inhame, Cenoura, Tomate, Pepino, Chuchu, Vagem, Ervilha.
        - **Grãos e leguminosas:** Quinoa, Grão-de-bico, Aveia. (Lembre-se da restrição de grãos nos dias 1-4).
        - **Temperos e complementos:** Azeite, Óleo de coco, Vinagre de maçã, Páprica, Pimenta-do-reino, Maca peruana.
        - **Adoçantes e açúcares naturais:** Mel, Xilitol, Estevia, Eritritol, Açúcar de coco. (Lembre-se da restrição de adoçantes).
        - **Farinhas permitidas:** Farinha de amêndoas, Farinha de coco, Farinha de linhaça, Farinha de aveia, Farinha de grão-de-bico, Farinha de quinoa, Farinha de chia, Farinha de castanha-de-caju, Farinha de castanha-do-pará, Farinha de amaranto, Farinha de arroz integral, Farinha de semente de abóbora, Farinha de banana verde.

        ---
        **6. REGRAS PARA CARNE VERMELHA (APENAS APÓS O DIA 10)**
        - Carne vermelha (apenas Patinho) pode ser indicada no máximo DUAS VEZES por semana, com porções de 150g cada.
        - NÃO indique carne vermelha nos 10 primeiros dias.`;
        
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
                                snack: recipeSchema
                            },
                             required: ["breakfast", "lunch", "dinner", "snack"]
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
            ...plan.meals.snack.ingredients,
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
