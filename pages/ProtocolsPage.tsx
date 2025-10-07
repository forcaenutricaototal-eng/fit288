

import React, { useState } from 'react';
import { Youtube, Leaf, Droplets, Ban, List, CheckCircle, Zap, CalendarDays, ChevronDown, ChevronUp, Dumbbell } from 'lucide-react';

const YoutubeEmbed: React.FC<{ embedId: string; title: string }> = ({ embedId, title }) => (
    <div className="bg-white p-4 rounded-lg shadow-soft border border-neutral-200">
        <h3 className="font-semibold text-neutral-900 mb-3">{title}</h3>
        <div className="aspect-w-16 aspect-h-9">
            <iframe
                src={`https://www.youtube.com/embed/${embedId}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={title}
                className="w-full h-full rounded-md"
            />
        </div>
    </div>
);

const MonjaroProtocol: React.FC = () => (
    <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-soft">
            <h2 className="text-lg md:text-xl font-bold text-neutral-900 mb-2">Protocolo Monjaro Japonês</h2>
            <p className="text-neutral-800 mt-2">
                Este protocolo é inspirado em práticas de saúde e nutrição japonesas, focando em ingredientes naturais para otimizar o metabolismo e promover o bem-estar. Assista aos vídeos abaixo para receitas e dicas essenciais.
            </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <YoutubeEmbed embedId="76jTKr-dRq8" title="Iogurte Grego: Como escolher" />
            <YoutubeEmbed embedId="mCDsMFaXafE" title="Chá de Cavalinha: Preparo e benefícios" />
            <YoutubeEmbed embedId="2JWaNfuh6iU" title="Receita: Crepe Proteico" />
            <YoutubeEmbed embedId="tCoeWsDfxrk" title="Receita: Pão Proteico" />
        </div>
    </div>
);


const SectionCard: React.FC<{ icon: React.ElementType; title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ icon: Icon, title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="bg-white rounded-lg shadow-soft border border-neutral-200">
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full p-4 md:p-6 text-left">
                <div className="flex items-center space-x-3">
                    <Icon className="text-primary" size={24} />
                    <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
                </div>
                {isOpen ? <ChevronUp /> : <ChevronDown />}
            </button>
            {isOpen && (
                 <div className="px-4 md:px-6 pb-6 space-y-2 text-neutral-800 prose prose-sm max-w-none animate-fade-in">
                    {children}
                </div>
            )}
        </div>
    );
};

const dailyPlans = [
    {
        day: 1,
        content: () => (
            <>
                <p><strong>Obs.:</strong> Suco verde somente 3 dias na semana.</p>
                <p><strong>Jejum:</strong> Suco verde: 1 folha média de couve manteiga (20g), suco de 1 limão (48g), 1 col de chá de gengibre em pó ou em raiz (2g), 85g de Kiwi.</p>
                <p><strong>CAFÉ DA MANHÃ:</strong> 2 ovos cozidos, 1 tomate pequeno (50g) ou 5 tomate cereja, pepino, um fio de azeite, orégano e uma pitada de sal marinho.</p>
                <p><strong>Lanche da manhã:</strong> 1 xícara de chá de morangos (10 morangos), 1 de chá de semente de chia (10g) ou 7 castanhas de cajú ou 2 do pará.</p>
                <p><strong>Almoço:</strong> 120g de peito de frango ou de peixe grelhado no óleo de coco, salsinha desidratada. Brócolis cozido ao dente levemente refogado no alho com azeite + salada a gosto. Opcional: 100ml de suco de limão (adoçado com stévia).</p>
                <p><em>1 hora depois do almoço tomar 100 ml de chá cavalinha.</em></p>
                <p><strong>LANCHE DA TARDE:</strong> 90g de iogurte grego (sem gorduras e sem açúcar) com uma colher de sopa cranberry ou 7 morangos (aprox. 10g) + 1 de chá rasa de semente de chia.</p>
                <p><strong>Jantar:</strong></p>
                <ul>
                    <li><strong>Opção 1:</strong> 2 ovos cozidos, ou 3 colheres de atum com óleo (moderado) ou sem óleo (opcional), ou 1 filé de peito de frango ou tilápia (aprox. 100g). Para acompanhar: espinafre levemente refogado, agrião com tomate, ou rúcula com tomate ou brócolis.</li>
                    <li><strong>Opção 2:</strong> Crepe proteica feito com farinha de grão de bico ou farinha de feijão branco. Recheio: 1 ovo cozido, ou 80g de peito de frango desfiado, ou 80g de atum.</li>
                    <li><strong>Opção 3:</strong> Pão proteico feito com farinha de grão de bico. Recheios: ovo frito levemente com óleo de coco, ou 80g de peito de frango desfiado ou 80g de atum.</li>
                </ul>
                <p>Para acompanhar (opcional): 100ml de suco de limão (adoçado com estévia, ou xilitol, ou eritritol).</p>
            </>
        )
    },
    {
        day: 2,
        content: () => (
             <>
                <p><strong>Café da manhã:</strong> 2 ovos cozidos (100g), 50g de tomate, 50g de pepino.</p>
                <p><strong>Lanche da manhã:</strong> 1 iogurte grego natural (90g), 6 Cranberry (40g), 2 castanhas-do-pará (~5g).</p>
                <p><strong>Almoço:</strong> 130g de peito de frango grelhado, 200g de brócolis cozido, 10g de azeite. Salada de folhas verdes à vontade.</p>
                <p><strong>Lanche da tarde:</strong> 1 iogurte grego natural (90g), 10g de nozes (4 unidades pequenas).</p>
                <p><strong>Jantar:</strong> 130g de tilápia grelhada, 200g de abobrinha refogada, 10g de azeite.</p>
                <div className="font-bold border-t pt-2 mt-2">Macronutrientes: 994 kcal, Proteínas 94g, Carboidratos 57g, Gorduras 43g.</div>
            </>
        )
    },
     {
        day: 3,
        content: () => (
             <>
                <p><strong>Café da manhã:</strong> 2 ovos mexidos com azeite (100g), 50g de tomate, 50g de pepino.</p>
                <p><strong>Lanche da manhã:</strong> 1 iogurte grego natural (90g), 6 Cranberry (40g), 2 castanhas-do-pará (~5g).</p>
                <p><strong>Almoço:</strong> 130g de tilápia grelhada, 200g de couve refogada, 10g de azeite. Salada de folhas verdes à vontade.</p>
                <p><strong>Lanche da tarde:</strong> 1 iogurte grego.</p>
                <p><strong>Jantar:</strong> 130g de peito de frango grelhado, 200g de chuchu refogado, 10g de azeite.</p>
                <div className="font-bold border-t pt-2 mt-2">Macronutrientes: 996 kcal, Proteínas 94g, Carboidratos 59g, Gorduras 42g.</div>
            </>
        )
    },
    {
        day: 4,
        content: () => (
            <>
                <p><strong>Café da manhã:</strong> 2 ovos cozidos (100g), 50g de tomate, 50g de pepino.</p>
                <p><strong>Lanche da manhã:</strong> 1 iogurte grego natural (90g), 5 morangos (70g), 2 castanhas-do-pará (~5g).</p>
                <p><strong>Almoço:</strong> 130g de peito de frango grelhado, 200g de abobrinha cozida, 10g de azeite. Salada de folhas verdes à vontade.</p>
                <p><strong>Lanche da tarde:</strong> 1 iogurte grego natural com 10g de nozes ou com 2 colheres de sopa de abacate.</p>
                <p><strong>Jantar:</strong> 130g de tilápia grelhada, 200g de brócolis cozido, 10g de azeite.</p>
                <div className="font-bold border-t pt-2 mt-2">Macronutrientes: 995 kcal, Proteínas 93g, Carboidratos 57g, Gorduras 43g.</div>
            </>
        )
    },
    {
        day: 5,
        content: () => (
            <>
                <p><strong>Café da manhã:</strong> 2 ovos mexidos com azeite (100g), 50g de tomate, 50g de pepino.</p>
                <p><strong>Lanche da manhã:</strong> 1 iogurte grego natural (90g), 6 Cranberry (40g), 2 castanhas-do-pará (~5g).</p>
                <p><strong>Almoço:</strong> 130g de tilápia grelhada, 200g de chuchu refogado, 10g de azeite. Salada de folhas verdes à vontade.</p>
                <p><strong>Lanche da tarde:</strong> 1 iogurte grego natural (90g), 10g de amêndoas.</p>
                <p><strong>Jantar:</strong> 130g de peito de frango grelhado, 200g de couve refogada, 10g de azeite.</p>
                <div className="font-bold border-t pt-2 mt-2">Macronutrientes: 996 kcal, Proteínas 94g, Carboidratos 56g, Gorduras 42g.</div>
            </>
        )
    }
];

const Detox10Protocol: React.FC = () => (
    <div className="space-y-4">
        <div className="bg-white p-6 rounded-lg shadow-soft text-center">
            <h2 className="text-lg md:text-xl font-bold text-primary-dark mb-2">Estratégia dos 5 Primeiros Dias do Detox10</h2>
            <p className="text-neutral-800 max-w-2xl mx-auto mt-2">
                Emagreça de 3 a 5kg em 10 dias com um plano focado, organização e monitoramento constante para manter a motivação e alcançar resultados.
            </p>
        </div>

        <SectionCard icon={Zap} title="Estratégia do Detox10">
            <ul className="list-disc list-inside space-y-2">
                <li><strong>Organize com antecedência:</strong> Prepare sua alimentação, roupa e tipo de treino com 1 dia de antecedência.</li>
                <li><strong>Calcule seu gasto calórico:</strong> Determine seu gasto calórico basal para planejar sua alimentação.</li>
                <li><strong>Siga o protocolo:</strong> Mantenha-se fiel às orientações nutricionais do Detox10.</li>
                <li><strong>Monitore resultados:</strong> Acompanhe seu progresso diariamente para manter a motivação.</li>
            </ul>
        </SectionCard>

        <SectionCard icon={List} title="Lista de Compras">
            <p>Compre tudo em pouca quantidade. É importante organizar os alimentos antecipadamente para facilitar sua rotina.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                <ul className="list-disc list-inside">
                    <li>Adoçante (estévia, xilitol, eritritol)</li>
                    <li>Limão e Vinagre de maçã</li>
                    <li>Ovos, Peito de frango, Peixes (atum, sardinha, tilápia)</li>
                    <li>Farinhas (amêndoa, coco, linhaça, chia, banana verde, semente de abóbora)</li>
                    <li>Cream cheese light ou creme cottage</li>
                    <li>Iogurte grego 90g (sem açúcar/gordura)</li>
                    <li>Whey protein (isolado ou hidrolisado)</li>
                    <li>Castanha-do-pará ou de caju</li>
                    <li>Páprica, Orégano, Sal marinho</li>
                </ul>
                <ul className="list-disc list-inside">
                    <li>Chia, Semente de girassol</li>
                    <li>Salsa desidratada</li>
                    <li>Quinoa, Grão-de-bico</li>
                    <li>Maca peruana e Óleo de coco</li>
                    <li>Vegetais: Vagem, chuchu, abobrinha, tomate, cebola roxa, pepino, ervilha</li>
                    <li><strong>Frutas Permitidas (máx. 2 por dia):</strong> Kiwi, Maçã, Morango, Banana, Coco, Pera, Abacaxi, Abacate, Melancia, Mamão, Limão, Laranja.</li>
                </ul>
            </div>
            <p className="mt-4 italic text-sm"><strong>Sobre as farinhas:</strong> Elas têm baixo índice glicêmico, alto teor de fibras e ajudam a regular hormônios da fome (GLP-1 e GIP) naturalmente.</p>
        </SectionCard>

        <SectionCard icon={Ban} title="O que NÃO consumir">
             <ul className="list-disc list-inside space-y-1">
                <li>Todos os alimentos que contém Glúten.</li>
                <li>Soja ou molho de soja.</li>
                <li>Queijo (exceto Cream cheese e creme cottage).</li>
                <li>Açúcar refinado e adoçantes (exceto os permitidos).</li>
                <li>Leite de origem animal e qualquer tipo de chocolate.</li>
                <li>Refrigerantes (diet ou convencional).</li>
                <li>Carnes processadas, embutidas e vermelhas.</li>
                <li>Sal em excesso (temperos prontos) e álcool.</li>
                <li><strong>Importante:</strong> Nos 4 primeiros dias, não consumir grãos (arroz, feijão, aveia, quinoa, amendoim, soja).</li>
                 <li><strong>Dica:</strong> Em caso de dores de cabeça, tome uma xícara de café com canela e meia colher de chá de óleo de coco.</li>
            </ul>
        </SectionCard>
        
        <SectionCard icon={CheckCircle} title="Priorize">
            <ul className="list-disc list-inside space-y-1">
                <li>Oleaginosas (Castanhas, amêndoas, nozes) com moderação.</li>
                <li>Consumir a fruta e não o suco.</li>
                <li>Ervas frescas e especiarias para temperar.</li>
                <li>A organização do seu cardápio.</li>
                <li>Faça escolhas calóricas modestas e mantenha uma dieta equilibrada.</li>
                <li><strong>Café:</strong> Somente 3 xícaras (50 ml) por dia, com a última até às 15h.</li>
                <li><strong>Última refeição:</strong> Faça a última refeição 3 horas antes de dormir (proteína sólida) ou 1 hora antes (proteína líquida como whey/iogurte).</li>
            </ul>
        </SectionCard>

        <SectionCard icon={Droplets} title="Consumo de Água">
             <ul className="list-disc list-inside space-y-1">
                <li>No primeiro horário em jejum, consuma pelo menos 200ml de água.</li>
                <li>Beba no mínimo de 2 a 3 litros de água por dia.</li>
                <li>Beba gradativamente ao longo do dia, em doses de no máximo 400ml por vez.</li>
                <li>Se consumir líquido durante as refeições, não ultrapasse 100ml.</li>
            </ul>
        </SectionCard>

        <SectionCard icon={Leaf} title="Chá de Cavalinha">
             <p>Reconhecido por suas propriedades diuréticas e anti-inflamatórias. Consumir 100ml, 1 hora depois do café da manhã, <strong>somente 5 dias na semana</strong>.</p>
             <p className="font-semibold">Atenção:</p>
             <ul className="list-disc list-inside space-y-1">
                <li>Não é seguro para gestantes, pessoas com pressão baixa ou problemas renais.</li>
                <li>Consulte um profissional se utilizar medicamentos diuréticos ou anti-hipertensivos.</li>
                <li>O uso prolongado pode causar deficiência de vitamina B1 e desequilíbrios minerais. Use de forma moderada.</li>
            </ul>
        </SectionCard>
        
        <SectionCard icon={Dumbbell} title="Orientação de Treinos (10 primeiros dias)">
            <h4>Exercícios Durante o Protocolo Detox10: Cuidados Essenciais</h4>
            <p>
                Durante os 10 dias do Protocolo Detox 10, é fundamental ajustar sua rotina de exercícios físicos para garantir a máxima eficiência do programa e proteger seu corpo. Como o consumo de carboidratos será reduzido, o corpo terá menor capacidade de absorver nutrientes essenciais, especialmente diante de atividades físicas intensas.
            </p>
            <p>
                Quando realizamos exercícios muito exigentes, liberamos radicais livres, o que aumenta o estresse oxidativo. Por isso, é importante evitar esforço excessivo e optar por um plano de treinos moderado.
            </p>
            
            <h5>Orientações para os Treinos:</h5>
            <ul>
                <li>Realize treinos funcionais de <strong>25 a 30 minutos, apenas 3 vezes por semana</strong>, em dias intercalados.</li>
                <li>Exemplo de planejamento:
                    <ul>
                        <li><strong>Segunda-feira:</strong> Treino</li>
                        <li><strong>Terça-feira:</strong> Descanso</li>
                        <li><strong>Quarta-feira:</strong> Treino</li>
                        <li><strong>Quinta-feira:</strong> Descanso</li>
                        <li><strong>Sexta-feira:</strong> Treino</li>
                        <li><strong>Sábado e Domingo:</strong> Descanso</li>
                    </ul>
                </li>
            </ul>

            <h5>Dicas para Melhorar sua Rotina:</h5>
            <ul>
                <li><strong>Descanso ativo:</strong> Nos dias de descanso, inclua atividades leves como caminhada ou alongamentos.</li>
                <li><strong>Adaptação individual:</strong> Se você já pratica exercícios, pode manter sua rotina e usar este planejamento como complemento.</li>
            </ul>

             <h5>Benefícios do treino funcional:</h5>
            <ul>
                <li>Auxilia no emagrecimento.</li>
                <li>Melhora a postura e a mobilidade.</li>
                <li>Estimula a coordenação motora e promove benefícios mentais.</li>
            </ul>
        </SectionCard>

        <SectionCard icon={CalendarDays} title="Planos Diários" defaultOpen={true}>
            <div className="space-y-2">
                {dailyPlans.map(plan => (
                    <AccordionItem key={plan.day} title={`Dia ${plan.day}`}>
                        {plan.content()}
                    </AccordionItem>
                ))}
            </div>
        </SectionCard>
        
        <SectionCard icon={Zap} title="E Agora? O Próximo Passo!">
            <p>
                Se você seguiu cada etapa do Protocolo Detox10, seu corpo já começou a se desintoxicar, desinflamar e eliminar peso. Este não é apenas uma solução momentânea – é um método poderoso para limpar seu organismo e acelerar seus resultados de forma natural.
            </p>
            <p>
                Agora você tem as ferramentas certas para eliminar toxinas, reduzir inchaço e potencializar seu emagrecimento – sem dietas radicais ou estratégias insustentáveis!
            </p>
        </SectionCard>
    </div>
);

const AccordionItem: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-neutral-200 rounded-md">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-3 bg-neutral-100 hover:bg-neutral-200">
                <span className="font-semibold">{title}</span>
                {isOpen ? <ChevronUp /> : <ChevronDown />}
            </button>
            {isOpen && <div className="p-4 border-t border-neutral-200 animate-fade-in">{children}</div>}
        </div>
    )
}

const ProtocolsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'monjaro' | 'detox'>('monjaro');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-neutral-900">Protocolos</h1>
                <p className="text-neutral-800">Siga guias e estratégias para potencializar seus resultados.</p>
            </div>

            <div className="flex border-b border-neutral-200 bg-white rounded-t-lg shadow-soft">
                <button 
                    onClick={() => setActiveTab('monjaro')} 
                    className={`py-3 px-6 font-semibold transition-colors text-sm sm:text-base ${activeTab === 'monjaro' ? 'text-primary border-b-2 border-primary' : 'text-neutral-800'}`}
                >
                    Monjaro Japonês
                </button>
                <button 
                    onClick={() => setActiveTab('detox')} 
                    className={`py-3 px-6 font-semibold transition-colors text-sm sm:text-base ${activeTab === 'detox' ? 'text-primary border-b-2 border-primary' : 'text-neutral-800'}`}
                >
                    Detox10 (5 dias)
                </button>
            </div>

            <div className="animate-fade-in">
                {activeTab === 'monjaro' && <MonjaroProtocol />}
                {activeTab === 'detox' && <Detox10Protocol />}
            </div>
        </div>
    );
};

export default ProtocolsPage;