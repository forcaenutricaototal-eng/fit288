

import React, { useState } from 'react';
import { useApp } from '../App';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InfoCircle: React.FC<{ children: React.ReactNode, label?: string }> = ({ children, label }) => (
    <div className="flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md border">
            {children}
        </div>
        {label && <p className="mt-2 text-sm text-gray-600 max-w-[80px]">{label}</p>}
    </div>
)

const DashboardPage: React.FC = () => {
    const { userProfile, checkIns, planDuration } = useApp();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'weight' | 'measurements'>('weight');

    // --- Dynamic Data Calculations ---

    const currentDayOfPlan = Math.max(0, checkIns.length - 1);
    const startWeight = checkIns.length > 0 ? checkIns[0].weight : userProfile?.weight;
    const currentWeight = userProfile?.weight;
    const goalWeight = userProfile?.weightGoal;

    let weightProgressPercentage = 0;
    if (startWeight && currentWeight && goalWeight) {
        const totalWeightChangeNeeded = startWeight - goalWeight;
        const weightChangeSoFar = startWeight - currentWeight;

        if (totalWeightChangeNeeded > 0) {
            weightProgressPercentage = Math.round((weightChangeSoFar / totalWeightChangeNeeded) * 100);
        } else if (currentWeight <= goalWeight) {
            weightProgressPercentage = 100;
        }
        weightProgressPercentage = Math.max(0, Math.min(100, weightProgressPercentage));
    }
    
    // Chart Data
    const weightChartData = checkIns.length > 1 
        ? checkIns.slice(1).map(checkIn => ({
            name: `Dia ${checkIn.day}`,
            peso: checkIn.weight,
        }))
        : [{ name: 'Início', peso: userProfile?.weight ?? 0 }];
    
    const measurementsWithData = checkIns.filter(
        checkIn => checkIn.waist || checkIn.hips || checkIn.neck || checkIn.rightArm || checkIn.leftArm || checkIn.rightThigh || checkIn.leftThigh
    );

    // Dynamic Y-axis domain calculation for measurements
    const allValues = measurementsWithData.flatMap(checkIn => 
        [
            checkIn.waist, 
            checkIn.hips, 
            checkIn.neck, 
            checkIn.rightArm, 
            checkIn.leftArm, 
            checkIn.rightThigh, 
            checkIn.leftThigh
        ].filter((value): value is number => typeof value === 'number' && value > 0)
    );

    let yDomain: [number, number] | ['auto', 'auto'] = ['auto', 'auto'];

    if (allValues.length > 0) {
        const minVal = Math.min(...allValues);
        const maxVal = Math.max(...allValues);
        
        // Add a buffer to the min and max to create a nice visual range.
        const padding = Math.max((maxVal - minVal) * 0.1, 5); // Use 10% padding, but at least 5 units.
        
        const domainMin = Math.max(0, Math.floor(minVal - padding)); 
        const domainMax = Math.ceil(maxVal + padding);
        yDomain = [domainMin, domainMax];
    }

    const measurementsChartData = measurementsWithData.map(checkIn => ({
        name: checkIn.day === 0 ? 'Início' : `Dia ${checkIn.day}`,
        Cintura: checkIn.waist,
        Quadril: checkIn.hips,
        Pescoço: checkIn.neck,
        'Braço D.': checkIn.rightArm,
        'Braço E.': checkIn.leftArm,
        'Coxa D.': checkIn.rightThigh,
        'Coxa E.': checkIn.leftThigh,
    }));


    const renderChart = () => {
        if (activeTab === 'measurements' && measurementsChartData.length === 0) {
            return (
                 <div className="h-[200px] flex flex-col items-center justify-center text-center text-gray-500">
                    <p>Nenhuma medida registrada ainda.</p>
                    <p className="text-sm">Faça um check-in no seu Perfil para começar.</p>
                </div>
            )
        }
        
        return (
            <ResponsiveContainer width="100%" height={250}>
                {activeTab === 'weight' ? (
                     <LineChart data={weightChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} tickLine={false}/>
                        <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']}/>
                        <Tooltip formatter={(value: number) => `${value.toFixed(1)} kg`} />
                        <Line type="monotone" dataKey="peso" stroke="#10b981" strokeWidth={3} dot={{ r: 5, fill: '#10b981' }} activeDot={{ r: 7, stroke: '#fff', strokeWidth: 2 }}/>
                    </LineChart>
                ) : (
                    <LineChart data={measurementsChartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} tickLine={false}/>
                        <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} domain={yDomain} type="number" />
                        <Tooltip formatter={(value: number, name: string) => `${value.toFixed(1)} cm (${name})`} />
                        <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{fontSize: "12px", paddingLeft: "10px"}} iconSize={10} />
                        <Line type="monotone" dataKey="Cintura" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="Quadril" stroke="#82ca9d" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="Pescoço" stroke="#387908" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="Braço D." stroke="#ff7300" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="Braço E." stroke="#e60073" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="Coxa D." stroke="#00bfff" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="Coxa E." stroke="#5ac18e" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                )}
            </ResponsiveContainer>
        )
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Dashboard Principal</h1>
                <p className="text-gray-600">Olá, {userProfile?.name}!</p>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg text-gray-700">Progresso</h3>
                    <button onClick={() => navigate('/profile')} className="text-emerald-600 font-semibold text-sm">Novo Check-in</button>
                </div>
                 <div className="flex mb-4 border-b">
                    <button onClick={() => setActiveTab('weight')} className={`py-2 px-4 font-semibold transition-colors ${activeTab === 'weight' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-400'}`}>Peso (kg)</button>
                    <button onClick={() => setActiveTab('measurements')} className={`py-2 px-4 font-semibold transition-colors ${activeTab === 'measurements' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-400'}`}>Medidas (cm)</button>
                </div>
                {renderChart()}
            </div>
            
            <div className="grid grid-cols-3 gap-4 items-start justify-items-center">
                 <InfoCircle label="Progresso da Meta">
                    <div className="relative w-20 h-20">
                         <svg className="w-full h-full" viewBox="0 0 100 100">
                             <circle cx="50" cy="50" r="45" fill="none" stroke="#e6e6e6" strokeWidth="10" />
                             <circle
                                 cx="50"
                                 cy="50"
                                 r="45"
                                 fill="none"
                                 stroke="#10b981"
                                 strokeWidth="10"
                                 strokeDasharray="283"
                                 strokeDashoffset={283 - (283 * weightProgressPercentage) / 100}
                                 transform="rotate(-90 50 50)"
                                 strokeLinecap="round"
                                 className="transition-all duration-500"
                            />
                         </svg>
                         <span className="absolute inset-0 flex items-center justify-center text-xl font-bold">{weightProgressPercentage}%</span>
                     </div>
                 </InfoCircle>
                 <InfoCircle label="Dias Concluídos">
                    <p className="text-3xl font-bold text-gray-800">{currentDayOfPlan}<span className="text-gray-400 text-2xl">/{planDuration}</span></p>
                 </InfoCircle>
                 <InfoCircle label="Plano Ativo">
                     <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center">
                        <Check className="text-emerald-600" size={32}/>
                     </div>
                 </InfoCircle>
            </div>
            
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <button onClick={() => navigate('/plan')} className="bg-emerald-600 text-white font-semibold py-4 rounded-xl shadow-md hover:bg-emerald-700 transition-colors">
                    Meu Plano Diário
                </button>
                 <button onClick={() => navigate('/chat')} className="bg-white text-gray-800 font-semibold py-4 rounded-xl shadow-md hover:bg-gray-100 transition-colors border">
                    Falar com a IA
                </button>
            </div>
        </div>
    );
};

export default DashboardPage;