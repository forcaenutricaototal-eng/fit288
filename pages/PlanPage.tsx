import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { DailyPlan, Recipe } from '../types';
import { generateMealPlan, generateShoppingList } from '../services/geminiService';
import { useApp } from '../App';
import { CheckCircle, Circle, Soup, Beef, Fish, Apple, Loader, ClipboardList, X, RefreshCw } from 'lucide-react';

const ApiKeyErrorComponent: React.FC<{ onRetry: () => void; featureName: string }> = ({ onRetry, featureName }) => (
    <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200 shadow-soft animate-fade-in">
        <h3 className="font-bold text-lg text-red-700 mb-2">Configuração da API Necessária</h3>
        <p className="text-neutral-800 mb-4 max-w-2xl mx-auto">
            Para que {featureName} funcione, o aplicativo precisa se conectar ao serviço de inteligência artificial (Google Gemini). A chave da API não foi encontrada.
        </p>
        <div className="bg-white p-4 rounded-md border border-neutral-200 text-left space-y-3">
            <p className="font-semibold text-neutral-900">Como Resolver (Passo Final):</p>
            <ol className="list-decimal list-inside space-y-3 text-sm text-neutral-800">
                <li>
                    <strong>Verifique a Chave na Vercel:</strong> Confirme se a variável <code className="bg-neutral-200 px-1 rounded">VITE_API_KEY</code> existe em <code className="bg-neutral-200 px-1 rounded">Settings → Environment Variables</code>. O nome deve começar com <code className="bg-neutral-200 px-1 rounded">VITE_</code>.
                </li>
                <li>
                    <strong>Faça o Redeploy Forçado (com Cache Limpo):</strong> Esta etapa é <strong>essencial</strong> para garantir que a Vercel use a nova chave. Às vezes, o cache antigo pode causar problemas.
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                        <li>Vá para a aba <code className="bg-neutral-200 px-1 rounded">Deployments</code> no seu projeto Vercel.</li>
                        <li>Encontre o deploy mais recente, clique no menu de três pontinhos (•••) e selecione <strong>"Redeploy"</strong>.</li>
                        <li>Na janela de confirmação, <strong>desmarque a opção "Use existing Build Cache"</strong> e clique em "Redeploy".</li>
                    </ul>
                </li>
            </ol>
        </div>
        <button 
            onClick={onRetry} 
            className="mt-6 bg-primary text-white font-semibold px-6 py-2 rounded-md hover:bg-primary-dark transition-colors"
        >
            Tentar Novamente
        </button>
    </div>
);


const MealCard: React.FC<{ recipe: Recipe, onToggle: () => void, completed: boolean }> = ({ recipe, onToggle, completed }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const icons: { [key: string]: React.ReactNode } = {
        'Café da Manhã': <Soup size={24} />,
        'Almoço': <Beef size={24} />,
        'Jantar': <Fish size={24} />,
        'Lanche': <Apple size={24} />,
    };

    return (
        <div className={`bg-white p-4 rounded-lg shadow-soft border transition-all ${completed ? 'border-primary' : 'border-neutral-200'}`}>
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                    <div className="text-primary">{icons[recipe.type] || <Soup size={24}/>}</div>
                    <div>
                        <h4 className={`font-semibold transition-colors ${completed ? 'text-neutral-800' : 'text-neutral-900'}`}>{recipe.name}</h4>
                        <p className="text-sm text-neutral-800">{recipe.calories} kcal</p>
                    </div>
                </div>
                <button onClick={onToggle} aria-label={completed ? `Marcar ${recipe.name} como não concluído` : `Marcar ${recipe.name} como concluído`}>
                    {completed ? <CheckCircle className="text-primary" size={24} /> : <Circle className="text-neutral-200" size={24} />}
                </button>
            </div>
            <div className="mt-4">
                <button onClick={() => setIsExpanded(!isExpanded)} className="text-sm font-semibold text-primary-dark">
                    {isExpanded ? 'Ocultar Detalhes' : 'Ver Detalhes'}
                </button>
                 {isExpanded && (
                    <div className="mt-4 space-y-4 text-sm text-neutral-900 animate-fade-in">
                        <div>
                            <h5 className="font-semibold mb-2">Ingredientes:</h5>
                            <ul className="list-disc list-inside space-y-1">
                                {recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-semibold mb-2">Modo de Preparo:</h5>
                            <p className="whitespace-pre-wrap">{recipe.preparation}</p>
                        </div>
                         <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center border-t border-neutral-200">
                            <div><span className="font-bold">{recipe.carbohydrates}g</span><p>Carbs</p></div>
                            <div><span className="font-bold">{recipe.proteins}g</span><p>Proteínas</p></div>
                            <div><span className="font-bold">{recipe.fats}g</span><p>Gorduras</p></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const TaskItem: React.FC<{ task: string, onToggle: () => void, completed: boolean }> = ({ task, onToggle, completed }) => {
    return (
        <li 
            onClick={onToggle}
            className="flex items-center justify-between p-3 bg-neutral-100 rounded-md cursor-pointer hover:bg-neutral-200"
        >
            <span className={`transition-colors ${completed ? 'text-gray-400 line-through' : 'text-neutral-900'}`}>{task}</span>
            {completed ? <CheckCircle className="text-primary" /> : <Circle className="text-neutral-200" />}
        </li>
    );
};

const ShoppingListModal: React.FC<{ plan: DailyPlan | null, onClose: () => void }> = ({ plan, onClose }) => {
    const [list, setList] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        if (plan) {
            setIsLoading(true);
            generateShoppingList(plan).then(generatedList => {
                setList(generatedList);
                setIsLoading(false);
            });
        }
    }, [plan]);
    
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-semibold">Lista de Compras - Dia {plan?.day}</h3>
                    <button onClick={onClose}><X size={24} /></button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {isLoading ? (
                         <div className="flex items-center justify-center h-40">
                             <Loader className="animate-spin text-primary" size={32} />
                         </div>
                    ) : (
                        <div className="prose prose-sm whitespace-pre-wrap">{list}</div>
                    )}
                </div>
            </div>
        </div>
    );
};

const RegenerateModal: React.FC<{
    day: number;
    onClose: () => void;
    onRegenerate: (feedback: string) => void;
}> = ({ day, onClose, onRegenerate }) => {
    const [feedback, setFeedback] = useState('');

    const handleSubmit = () => {
        onRegenerate(feedback);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-semibold text-neutral-900">Ajustar Plano - Dia {day}</h3>
                    <button onClick={onClose}><X size={24} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-neutral-800">O que você não gostou ou gostaria de mudar? A IA usará seu feedback para criar um novo plano para hoje.</p>
                    <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows={4}
                        placeholder="Ex: Não gosto de abacate, prefiro peixe no almoço..."
                        className="w-full p-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div className="flex justify-end p-4 border-t gap-2">
                    <button onClick={onClose} className="bg-neutral-200 text-neutral-900 px-4 py-2 rounded-md font-semibold hover:bg-neutral-300">
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} className="bg-primary text-white px-4 py-2 rounded-md font-semibold hover:bg-primary-dark">
                        Gerar Novo Plano
                    </button>
                </div>
            </div>
        </div>
    );
};

const loadingMessages = [
  "Analisando seu perfil e progresso...",
  "Nossa IA, Luna, está montando as melhores refeições para você... 🍵",
  "Criando um plano delicioso e alinhado aos seus objetivos...",
  "Lembre-se de beber bastante água hoje! 💧",
  "Estamos preparando tudo para o seu sucesso. Quase pronto! ✨",
];

const PlanPage: React.FC = () => {
    const { day } = useParams();
    const navigate = useNavigate();
    const { userProfile, completedItemsByDay, toggleItemCompletion, resetDayCompletion } = useApp();
    const dayId = day ? parseInt(day, 10) : 1;

    const [plan, setPlan] = useState<DailyPlan | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showShoppingList, setShowShoppingList] = useState(false);
    const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
    const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
    
    const completedItemsForDay = completedItemsByDay[dayId] || {};

    const fetchPlan = useCallback(async (currentDay: number, feedback?: string) => {
        if (!userProfile) return;
        
        setIsLoading(true);
        setError(null);
        try {
            const generatedPlan = await generateMealPlan(userProfile, currentDay, feedback);
            setPlan(generatedPlan);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    }, [userProfile]);
    
    const handleRegenerate = (feedback: string) => {
        resetDayCompletion(dayId);
        fetchPlan(dayId, feedback);
        setIsRegenerateModalOpen(false);
    };

    useEffect(() => {
        fetchPlan(dayId);
    }, [dayId, fetchPlan]);

    useEffect(() => {
      let interval: number;
      if (isLoading) {
        setLoadingMessageIndex(0); 
        interval = window.setInterval(() => {
          setLoadingMessageIndex(prevIndex => (prevIndex + 1) % loadingMessages.length);
        }, 3000); 
      }
      return () => {
        if (interval) {
          window.clearInterval(interval);
        }
      };
    }, [isLoading]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <Loader className="animate-spin text-primary mb-4" size={48} />
                <p className="text-neutral-900 font-semibold text-lg">Gerando seu plano personalizado para o Dia {dayId}...</p>
                <p className="text-neutral-800 mt-2 transition-opacity duration-500">{loadingMessages[loadingMessageIndex]}</p>
            </div>
        );
    }
    
    if (error) {
        if (error.includes("A chave da API Gemini não foi encontrada")) {
            return <ApiKeyErrorComponent onRetry={() => fetchPlan(dayId)} featureName="a geração de planos" />;
        }
        return (
            <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200 shadow-soft">
                <h3 className="font-bold text-lg text-red-700 mb-2">Não foi possível gerar o plano.</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                    onClick={() => fetchPlan(dayId)} 
                    className="bg-primary text-white font-semibold px-6 py-2 rounded-md hover:bg-primary-dark transition-colors"
                >
                    Tentar Novamente
                </button>
            </div>
        );
    }
    
    if (!plan) {
         return <div className="text-center text-neutral-800">Plano não encontrado.</div>;
    }


    return (
        <div className="space-y-6">
            {showShoppingList && <ShoppingListModal plan={plan} onClose={() => setShowShoppingList(false)} />}
            {isRegenerateModalOpen && (
                <RegenerateModal
                    day={plan.day}
                    onClose={() => setIsRegenerateModalOpen(false)}
                    onRegenerate={handleRegenerate}
                />
            )}
            
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-neutral-900">Meu Plano - Dia {plan.day}</h1>
                    <p className="text-neutral-800">Siga as refeições e complete as tarefas para um dia de sucesso!</p>
                    <p className="text-sm text-primary-dark mt-1 font-medium">Clique em uma refeição ou tarefa para marcar como concluída!</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => setShowShoppingList(true)} className="flex items-center gap-2 bg-white px-4 py-2 rounded-md shadow-soft border border-neutral-200 font-semibold text-primary-dark hover:bg-neutral-100">
                        <ClipboardList size={18} />
                        Lista de Compras
                    </button>
                    <button onClick={() => setIsRegenerateModalOpen(true)} className="flex items-center gap-2 bg-white px-4 py-2 rounded-md shadow-soft border border-neutral-200 font-semibold text-primary-dark hover:bg-neutral-100">
                        <RefreshCw size={18} />
                        Ajustar Plano
                    </button>
                </div>
            </div>
            
            <div className="space-y-4">
                <h3 className="font-semibold text-lg text-neutral-900">Refeições do Dia</h3>
                <MealCard recipe={plan.meals.breakfast} onToggle={() => toggleItemCompletion(dayId, 'breakfast')} completed={!!completedItemsForDay['breakfast']} />
                <MealCard recipe={plan.meals.lunch} onToggle={() => toggleItemCompletion(dayId, 'lunch')} completed={!!completedItemsForDay['lunch']} />
                <MealCard recipe={plan.meals.snack} onToggle={() => toggleItemCompletion(dayId, 'snack')} completed={!!completedItemsForDay['snack']} />
                <MealCard recipe={plan.meals.dinner} onToggle={() => toggleItemCompletion(dayId, 'dinner')} completed={!!completedItemsForDay['dinner']} />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-soft">
                <h3 className="font-semibold text-lg text-neutral-900 mb-4">Checklist de Hábitos</h3>
                <ul className="space-y-2">
                    {plan.tasks.map((task, index) => (
                        <TaskItem key={index} task={task} onToggle={() => toggleItemCompletion(dayId, `task-${index}`)} completed={!!completedItemsForDay[`task-${index}`]} />
                    ))}
                </ul>
            </div>
            
             <div className="bg-white p-6 rounded-lg shadow-soft">
                 <h3 className="font-semibold text-lg text-neutral-900 mb-4">Navegue pelo Plano</h3>
                 <div className="flex flex-wrap gap-2">
                     {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                        <button onClick={() => navigate(`/meal-plan/day/${d}`)} key={d} className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${d === dayId ? 'bg-primary text-white font-bold' : 'bg-neutral-200 text-neutral-900 hover:bg-red-200'}`}>
                           {d}
                        </button>
                     ))}
                 </div>
             </div>
        </div>
    );
};

export default PlanPage;
