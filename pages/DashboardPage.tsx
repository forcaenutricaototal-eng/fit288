import React from 'react';
import { useApp } from '../App';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { Scale, User, Ruler, Target, CalendarCheck, Utensils } from 'lucide-react';

const StatCard: React.FC<{ icon: React.ElementType, label: string, value: string | number | undefined | null, unit?: string }> = ({ icon: Icon, label, value, unit }) => (
    <div className="bg-primary-light p-4 rounded-lg flex items-center space-x-3">
        <div className="bg-white p-2 rounded-full">
            <Icon className="text-primary-dark" size={24} />
        </div>
        <div>
            <p className="text-sm text-neutral-800">{label}</p>
            <p className="text-lg font-bold text-neutral-900">
                {value !== undefined && value !== null ? `${value}${unit || ''}` : 'N/A'}
            </p>
        </div>
    </div>
);

const ProgressCard: React.FC<{ currentDay: number, totalDays: number }> = ({ currentDay, totalDays }) => {
    const progressPercentage = Math.max(0, Math.min(100, ((currentDay - 1) / totalDays) * 100));
    return (
        <div className="bg-white p-6 rounded-lg shadow-soft flex flex-col justify-center">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-lg text-neutral-900">Seu Progresso</h3>
                <Target className="text-primary-dark" size={24}/>
            </div>
            <p className="text-neutral-800 text-sm mb-3">Você está no <span className="font-bold text-neutral-900">Dia {currentDay}</span> de {totalDays} do seu plano.</p>
            <div className="w-full bg-neutral-200 rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
            </div>
        </div>
    );
};

const ActionCard: React.FC<{ onNavigate: () => void, day: number }> = ({ onNavigate, day }) => (
    <div className="bg-primary-dark p-6 rounded-lg shadow-soft text-white flex flex-col justify-center items-center text-center">
        <CalendarCheck size={32} className="mb-2"/>
        <h3 className="font-bold text-lg">Pronto para o Dia {day}?</h3>
        <p className="text-red-100 text-sm mb-4">Seu plano alimentar e tarefas de hoje estão esperando por você.</p>
        <button onClick={onNavigate} className="bg-white text-primary-dark font-bold py-2 px-6 rounded-md hover:bg-red-100 transition-all w-full flex items-center justify-center gap-2">
            <Utensils size={18}/>
            Ver plano de hoje
        </button>
    </div>
);


const DashboardPage: React.FC = () => {
    const { userProfile, checkIns, planDuration } = useApp();
    const navigate = useNavigate();

    if (!userProfile) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-neutral-800">Carregando dados do usuário...</p>
            </div>
        );
    }
    
    const currentDay = Math.min(checkIns.length + 1, planDuration);
    
    // Safely extract data
    const name = userProfile.name;
    const age = userProfile.age;
    const height = userProfile.height;
    const currentWeight = checkIns.length > 0 ? checkIns[checkIns.length - 1].weight : userProfile.weight;

    const weightChartData = checkIns.length > 0 
        ? checkIns.map(checkIn => ({
            name: checkIn.day === 0 ? 'Início' : `Dia ${checkIn.day}`,
            Peso: checkIn.weight,
        }))
        : (currentWeight ? [{ name: 'Início', Peso: currentWeight }] : []);


    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">Bem-vindo, {name}.</h1>
                <p className="text-neutral-800">Seu resumo de progresso está aqui.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-soft border-l-4 border-gold">
                <p className="text-neutral-800 text-sm mb-4">
                    O emagrecimento verdadeiro não está em dietas extremas ou remédios milagrosos. Está em alinhar corpo e mente com hábitos corretos, como os japoneses fazem há séculos.
                </p>
                <p className="text-neutral-800 text-sm mb-4">
                    Você não precisa lutar contra o seu corpo. Precisa trabalhar com ele.
                </p>
                <blockquote className="text-neutral-900 font-semibold italic text-sm">
                    🌸 “Quando você vive em harmonia com seu corpo, ele te devolve equilíbrio, leveza e saúde.”
                </blockquote>
            </div>

            {/* New Progress & Action Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProgressCard currentDay={currentDay} totalDays={planDuration} />
                <ActionCard onNavigate={() => navigate(`/meal-plan/day/${currentDay}`)} day={currentDay} />
            </div>


            {/* User Summary Section */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-soft">
                <h3 className="font-semibold text-lg text-neutral-900 mb-4">Resumo Pessoal</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard icon={User} label="Idade" value={age} unit=" anos" />
                    <StatCard icon={Ruler} label="Altura" value={height} unit=" cm" />
                    <StatCard icon={Scale} label="Seu Peso Atual" value={currentWeight?.toFixed(1)} unit=" kg" />
                </div>
            </div>

            {/* Evolution Chart */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-soft">
                <h3 className="font-semibold text-lg text-neutral-900 mb-1">Evolução do Peso</h3>
                <p className="text-sm text-neutral-800 mb-4">Veja como você está evoluindo a cada check-in.</p>

                {weightChartData.length > 1 ? (
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={weightChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
                                <XAxis dataKey="name" tick={{fontSize: 12, fill: '#333333'}} axisLine={false} tickLine={false}/>
                                <YAxis 
                                    tick={{fontSize: 12, fill: '#333333'}} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    domain={['dataMin - 2', 'dataMax + 2']}
                                    tickFormatter={(value) => `${value}kg`}
                                />
                                <Tooltip formatter={(value: number) => `${value.toFixed(1)} kg`} />
                                <Line type="monotone" dataKey="Peso" stroke="#D32F2F" strokeWidth={3} dot={{ r: 5, fill: '#D32F2F' }} activeDot={{ r: 7, stroke: '#fff', strokeWidth: 2 }}/>
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-[250px] flex flex-col items-center justify-center text-center text-neutral-800">
                        <p>Ainda não há dados suficientes para exibir o gráfico.</p>
                        <p className="text-sm">Faça pelo menos dois check-ins para começar a ver sua evolução aqui.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;