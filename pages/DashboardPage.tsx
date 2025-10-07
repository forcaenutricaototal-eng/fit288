

import React from 'react';
import { useApp } from '../App';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { Scale, User, Ruler } from 'lucide-react';

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


const DashboardPage: React.FC = () => {
    const { userProfile, checkIns } = useApp();
    const navigate = useNavigate();

    if (!userProfile) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-neutral-800">Carregando dados do usuário...</p>
            </div>
        );
    }
    
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
                <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">Dashboard</h1>
                <p className="text-neutral-800">Seu resumo de progresso, {name}.</p>
            </div>

            {/* User Summary Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard icon={User} label="Idade" value={age} unit=" anos" />
                <StatCard icon={Ruler} label="Altura" value={height} unit=" cm" />
                <StatCard icon={Scale} label="Seu Peso Atual" value={currentWeight?.toFixed(1)} unit=" kg" />
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