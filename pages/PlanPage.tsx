import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { DailyPlan, Recipe, UserProfile } from '../types';
import { generateMealPlan, generateShoppingList } from '../services/geminiService';
import { useApp } from '../App';
import { CheckCircle, Circle, Soup, Beef, Fish, Apple, Loader, ClipboardList, X } from 'lucide-react';

const MealCard: React.FC<{ recipe: Recipe, onToggle: () => void, completed: boolean }> = ({ recipe, onToggle, completed }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const icons: { [key: string]: React.ReactNode } = {
        'Café da Manhã': <Soup size={24} />,
        'Almoço': <Beef size={24} />,
        'Jantar': <Fish size={24} />,
        'Lanche': <Apple size={24} />,
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-soft border border-neutral-200">
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                    <div className="text-primary">{icons[recipe.type] || <Soup size={24}/>}</div>
                    <div>
                        <h4 className="font-semibold text-neutral-900">{recipe.name}</h4>
                        <p className="text-sm text-neutral-800">{recipe.calories} kcal</p>
                    </div>
                </div>
                <button onClick={onToggle}>
                    {completed ? <CheckCircle className="text-primary" /> : <Circle className="text-neutral-200" />}
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


const PlanPage: React.FC = () => {
    const { day } = useParams();
    const navigate = useNavigate();
    const { userProfile } = useApp();
    const dayId = day ? parseInt(day, 10) : 1;

    const [plan, setPlan] = useState<DailyPlan | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [completedItems, setCompletedItems] = useState<{ [key: string]: boolean }>({});
    const [showShoppingList, setShowShoppingList] = useState(false);
    
    const toggleItem = (id: string) => {
        setCompletedItems(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const fetchPlan = useCallback(async (currentDay: number) => {
        if (!userProfile) return;
        
        setIsLoading(true);
        setError(null);
        try {
            const generatedPlan = await generateMealPlan(userProfile, currentDay);
            if (generatedPlan) {
                setPlan(generatedPlan);
            } else {
                throw new Error("Não foi possível gerar o plano. Tente novamente.");
            }
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    }, [userProfile]);

    useEffect(() => {
        fetchPlan(dayId);
    }, [dayId, fetchPlan]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <Loader className="animate-spin text-primary mb-4" size={48} />
                <p className="text-neutral-900 font-semibold">Gerando seu plano personalizado para o Dia {dayId}...</p>
                <p className="text-neutral-800">Isso pode levar alguns segundos.</p>
            </div>
        );
    }
    
    if (error || !plan) {
        return <div className="text-center text-red-500">{error || "Plano não encontrado."}</div>
    }

    return (
        <div className="space-y-6">
            {showShoppingList && <ShoppingListModal plan={plan} onClose={() => setShowShoppingList(false)} />}
            
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900">Meu Plano - Dia {plan.day}</h1>
                    <p className="text-neutral-800">Siga as refeições e complete as tarefas para um dia de sucesso!</p>
                </div>
                <button onClick={() => setShowShoppingList(true)} className="flex items-center gap-2 bg-white px-4 py-2 rounded-md shadow-soft border border-neutral-200 font-semibold text-primary-dark hover:bg-neutral-100">
                    <ClipboardList size={18} />
                    Lista de Compras
                </button>
            </div>
            
            <div className="space-y-4">
                <h3 className="font-semibold text-lg text-neutral-900">Refeições do Dia</h3>
                <MealCard recipe={plan.meals.breakfast} onToggle={() => toggleItem('breakfast')} completed={!!completedItems['breakfast']} />
                <MealCard recipe={plan.meals.lunch} onToggle={() => toggleItem('lunch')} completed={!!completedItems['lunch']} />
                <MealCard recipe={plan.meals.dinner} onToggle={() => toggleItem('dinner')} completed={!!completedItems['dinner']} />
                {plan.meals.snack && <MealCard recipe={plan.meals.snack} onToggle={() => toggleItem('snack')} completed={!!completedItems['snack']} />}
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-soft">
                <h3 className="font-semibold text-lg text-neutral-900 mb-4">Checklist de Hábitos</h3>
                <ul className="space-y-2">
                    {plan.tasks.map((task, index) => (
                        <TaskItem key={index} task={task} onToggle={() => toggleItem(`task-${index}`)} completed={!!completedItems[`task-${index}`]} />
                    ))}
                </ul>
            </div>
            
             <div className="bg-white p-6 rounded-lg shadow-soft">
                 <h3 className="font-semibold text-lg text-neutral-900 mb-4">Navegue pelo Plano</h3>
                 <div className="flex flex-wrap gap-2">
                     {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                        <button onClick={() => navigate(`/meal-plan/day/${d}`)} key={d} className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${d === dayId ? 'bg-primary text-white font-bold' : 'bg-neutral-200 text-neutral-900 hover:bg-green-200'}`}>
                           {d}
                        </button>
                     ))}
                 </div>
             </div>
        </div>
    );
};

export default PlanPage;