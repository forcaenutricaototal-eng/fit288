import React from 'react';
import { useApp } from '../App';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const weightData = [
  { name: 'Sem 1', peso: 80 },
  { name: 'Sem 2', peso: 79 },
  { name: 'Sem 3', peso: 78.5 },
  { name: 'Sem 4', peso: 77 },
];

const InfoCircle: React.FC<{ children: React.ReactNode, label?: string }> = ({ children, label }) => (
    <div className="flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md border">
            {children}
        </div>
        {label && <p className="mt-2 text-sm text-gray-600 max-w-[80px]">{label}</p>}
    </div>
)

const DashboardPage: React.FC = () => {
    const { userProfile } = useApp();
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Dashboard Principal</h1>
                <p className="text-gray-600">Olá, {userProfile?.name}!</p>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg text-gray-700">Progresso em Tempo Real</h3>
                    <button className="text-emerald-600 font-semibold text-2xl">+</button>
                </div>
                 <div className="flex mb-4 border-b">
                    <button className="py-2 px-4 text-emerald-600 border-b-2 border-emerald-600 font-semibold">Peso (kg)</button>
                    <button className="py-2 px-4 text-gray-400 font-semibold">Medidas (cm)</button>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={weightData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} tickLine={false}/>
                        <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']}/>
                        <Tooltip />
                        <Line type="monotone" dataKey="peso" stroke="#10b981" strokeWidth={3} dot={{ r: 5, fill: '#10b981' }} activeDot={{ r: 7, stroke: '#fff', strokeWidth: 2 }}/>
                    </LineChart>
                </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-3 gap-4 items-start justify-items-center">
                 <InfoCircle>
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
                                 strokeDashoffset={283 - (283 * 70) / 100}
                                 transform="rotate(-90 50 50)"
                                 strokeLinecap="round"
                            />
                         </svg>
                         <span className="absolute inset-0 flex items-center justify-center text-xl font-bold">70%</span>
                     </div>
                 </InfoCircle>
                 <InfoCircle>
                    <p className="text-2xl font-bold text-gray-800">14<span className="text-gray-400">/28</span></p>
                 </InfoCircle>
                 <InfoCircle>
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