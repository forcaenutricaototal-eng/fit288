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

    // The API key is injected during the build process by Vite from environment variables.
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      const errorMessage = "A chave da API Gemini não foi encontrada. Verifique se a variável de ambiente `VITE_GEMINI_API_KEY` está configurada corretamente nas configurações do seu projeto na Vercel e faça um novo deploy.";
      console.error(errorMessage);
      throw new Error(errorMessage);
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
    const systemInstruction = `Você é a IA do Monjaro Japonês, um nutricionista especialista do programa de mesmo nome. Este programa é um plano de 28 dias com baixo teor de carboidrato para ajudar usuários que buscam estimular naturalmente GIP/GLP-1, reduzir retenção hídrica e emagrecer de forma saudável. Seu objetivo é dar conselhos práticos, motivadores e com base científica. Você pode sugerir substituições de refeições (sempre com baixo teor de carboidrato), dar dicas para controlar vontades, motivar e responder dúvidas sobre o plano. Mantenha um tom amigável, encorajador e profissional. Responda sempre em português.
    Dados do usuário:
    - Nome: ${userProfile?.name || 'Não informado'}
    - Idade: ${userProfile?.age || 'Não informado'}
    - Peso: ${userProfile?.weight || 'Não informado'} kg
    - Altura: ${userProfile?.height || 'Não informado'} cm
    - Objetivo: Emagrecimento saudável e melhora metabólica
    - Restrições: ${userProfile?.dietary_restrictions?.join(', ') || 'Nenhuma'}

    ---
    INFORMAÇÕES ADICIONAIS SOBRE O PROGRAMA E SUA CRIADORA (Use estas informações para responder perguntas sobre o Monjaro Japonês, Simone Tavares ou a filosofia do programa):

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
    *   **Neuroplasticidade** é a capacidade do cérebro de criar novas conexões neurais e substituir padrões antigos por novos hábitos saudáveis. Com o tempo, à medida que a pessoa vive de forma mais consciente, pratica alimentação equilibrada e adota a cultura japonesa de leveza e disciplina, o cérebro literalmente se reorganiza, consolidando comportamentos que sustentam o emagrecimento de forma natural e duradoura.
    *   **Epigênese (ou epigenética)** é o processo em que os hábitos e o estilo de vida passam a influenciar a expressão dos genes. Isso significa que, ao manter uma rotina saudável por tempo suficiente, o corpo muda a forma como os genes se manifestam, favorecendo o equilíbrio hormonal, o controle da inflamação, a saciedade e a queima de gordura. Com isso, o emagrecimento se torna definitivo, porque o corpo passa a funcionar em harmonia com o novo padrão metabólico e mental.

    **💚 Principais benefícios**
    *   Infinitamente mais acessível que o farmacêutico
    *   100% natural e não invasivo
    *   Eleva naturalmente a saciedade
    *   Acelera o metabolismo
    *   Atua na neuroplasticidade e epigênese, tornando o resultado definitivo
    *   Ajuda no tratamento do lipedema, sem crises inflamatórias
    *   Auxilia no controle do diabetes tipo 2
    *   Melhora o humor, o foco e o bem-estar emocional
    *   Resultados duradouros e reeducativos

    **💬 Missão e Propósito**
    Simone Tavares acredita que o verdadeiro emagrecimento é um processo de autoconhecimento e reprogramação mental, onde corpo, mente e emoções se alinham para criar uma nova identidade leve e saudável.
    Por isso, suas mentorias e programas combinam ciência, neuroplasticidade, epigenética e inteligência emocional, transformando não apenas o corpo, mas toda a forma de pensar, sentir e viver.
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
        
        let daySpecificInstructions = '';
        if (day <= 10) {
            daySpecificInstructions = `
            ATENÇÃO: Este é o Dia ${day}, que faz parte dos 10 primeiros dias do protocolo Detox. Siga RIGOROSAMENTE as seguintes restrições. NÃO inclua NENHUM dos seguintes alimentos:
            - Todos os alimentos que contém Glúten.
            - Soja ou molho de soja.
            - Queijos (são permitidos APENAS Cream cheese light e creme cottage). Queijo muçarala, prato, etc., são PROIBIDOS.
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
        
        let feedbackInstruction = '';
        if (feedback) {
            feedbackInstruction = `
            INSTRUÇÃO IMPORTANTE: O usuário pediu para ajustar o plano deste dia. O feedback foi: "${feedback}".
            Gere um NOVO plano para o Dia ${day} que leve essa preferência em consideração. Seja criativo e evite repetir as refeições que o usuário não gostou, mas mantenha-se estritamente dentro da estrutura de baixo teor de carboidrato e das regras do protocolo (especialmente as restrições do Detox para os primeiros 10 dias).
            `;
        }

        const prompt = `Gere o plano alimentar para o Dia ${day} do programa de 28 dias para o seguinte usuário:
        - Nome: ${userProfile.name}
        - Idade: ${userProfile.age}
        - Peso: ${userProfile.weight} kg
        - Altura: ${userProfile.height} cm
        - Nível de Atividade: Moderado (para fins de cálculo calórico)
        - Objetivo Principal: Perda de peso e melhora da saúde metabólica
        - Restrições Alimentares: ${userProfile.dietary_restrictions?.join(', ') || 'Nenhuma'}

        ${feedbackInstruction}
        ${daySpecificInstructions}

        O plano deve incluir 3 tarefas/hábitos diários para reforçar o programa. As receitas devem ser simples, com ingredientes acessíveis no Brasil.

        REGRAS ESTRITAS DE ESTRUTURA DO PLANO:
        1. O plano DEVE OBRIGATORIAMENTE conter 4 refeições: café da manhã, almoço, lanche da tarde e jantar.
        2. O JANTAR deve ser SEMPRE uma proteína leve (frango, peixe) ou um shake de whey protein com uma fruta vermelha (ex: morango).
        3. Iogurte grego ou natural DEVE ser incluído em pelo menos uma refeição todos os dias (no café da manhã ou no lanche da tarde).

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