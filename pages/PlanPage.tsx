
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import type { DailyPlan } from '../types';
import { CheckCircle, Circle, Soup, Beef, Fish, Apple } from 'lucide-react';

const fullPlan: DailyPlan[] = Array.from({ length: 28 }, (_, i) => ({
  day: i + 1,
  meals: {
    breakfast: 'Ovos mexidos com espinafre e tomate',
    lunch: `Frango grelhado com salada de folhas verdes e abacate (Dia ${i + 1})`,
    dinner: `Salmão assado com brócolis no vapor (Dia ${i + 1})`,
    snack: 'Mix de castanhas',
  },
  tasks: ['Beber 2.5L de água', 'Caminhada leve de 30 minutos', 'Evitar açúcar refinado'],
}));

const MealCard: React.FC<{ title: string; meal: string; icon: React.ReactNode }> = ({ title, meal, icon }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm flex items-start space-x-4">
        <div className="text-emerald-500">{icon}</div>
        <div>
            <h4 className="font-semibold text-gray-700">{title}</h4>
            <p className="text-gray-600">{meal}</p>
        </div>
    </div>
);

const TaskItem: React.FC<{ task: string }> = ({ task }) => {
    const [completed, setCompleted] = useState(false);
    return (
        <li 
            onClick={() => setCompleted(!completed)}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
        >
            <span className={`transition-colors ${completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{task}</span>
            {completed ? <CheckCircle className="text-emerald-500" /> : <Circle className="text-gray-300" />}
        </li>
    );
};

const PlanPage: React.FC = () => {
    const { id } = useParams();
    const dayId = id ? parseInt(id, 10) : 1;
    const [selectedDay, setSelectedDay] = useState<DailyPlan>(fullPlan[dayId - 1]);
    
    React.useEffect(() => {
        const newDay = fullPlan.find(d => d.day === dayId);
        if (newDay) setSelectedDay(newDay);
    }, [dayId]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Plano Diário - Dia {selectedDay.day}</h1>
            <p className="text-gray-600">Siga as refeições e complete as tarefas para um dia de sucesso!</p>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="font-semibold text-lg text-gray-700 mb-4">Refeições do Dia</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MealCard title="Café da Manhã" meal={selectedDay.meals.breakfast} icon={<Soup size={24} />} />
                    <MealCard title="Almoço" meal={selectedDay.meals.lunch} icon={<Beef size={24} />} />
                    <MealCard title="Jantar" meal={selectedDay.meals.dinner} icon={<Fish size={24} />} />
                    {selectedDay.meals.snack && <MealCard title="Lanche" meal={selectedDay.meals.snack} icon={<Apple size={24} />} />}
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="font-semibold text-lg text-gray-700 mb-4">Checklist de Hábitos</h3>
                <ul className="space-y-2">
                    {selectedDay.tasks.map((task, index) => <TaskItem key={index} task={task} />)}
                </ul>
            </div>
            
             <div className="bg-white p-6 rounded-xl shadow-sm">
                 <h3 className="font-semibold text-lg text-gray-700 mb-4">Navegue pelo Plano</h3>
                 <div className="flex flex-wrap gap-2">
                     {fullPlan.map(day => (
                        <a href={`#/plan/dia/${day.day}`} key={day.day} className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${day.day === selectedDay.day ? 'bg-emerald-600 text-white font-bold' : 'bg-gray-200 text-gray-700 hover:bg-emerald-200'}`}>
                           {day.day}
                        </a>
                     ))}
                 </div>
             </div>
        </div>
    );
};

export default PlanPage;
