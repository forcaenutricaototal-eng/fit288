
import React from 'react';
import { useApp } from '../App';
import { User, Calendar, Droplet, Target, BarChart, Edit, LogOut } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const InfoItem: React.FC<{ icon: React.ElementType, label: string, value: string | number }> = ({ icon: Icon, label, value }) => (
    <div>
        <div className="text-sm text-gray-500 flex items-center">
            <Icon size={14} className="mr-2" />
            {label}
        </div>
        <p className="font-semibold text-gray-800">{value}</p>
    </div>
);

const getBmiCategory = (bmi: number): { category: string; color: string } => {
    if (bmi < 18.5) return { category: 'Abaixo do peso', color: 'text-blue-500' };
    if (bmi < 24.9) return { category: 'Peso normal', color: 'text-emerald-500' };
    if (bmi < 29.9) return { category: 'Sobrepeso', color: 'text-yellow-500' };
    if (bmi < 34.9) return { category: 'Obesidade Grau I', color: 'text-orange-500' };
    if (bmi < 39.9) return { category: 'Obesidade Grau II', color: 'text-red-500' };
    return { category: 'Obesidade Grau III', color: 'text-red-700' };
};


const ProfilePage: React.FC = () => {
    const { userProfile, checkIns, logout } = useApp();

    if (!userProfile) {
        return <div>Carregando perfil...</div>;
    }
    
    const lastCheckIn = checkIns.length > 0 ? checkIns[checkIns.length - 1] : null;
    const currentWeight = lastCheckIn?.weight ?? userProfile.weight;
    const currentWaist = lastCheckIn?.waist ?? (checkIns.length > 0 ? checkIns[0].waist : undefined);
    const currentHips = lastCheckIn?.hips ?? (checkIns.length > 0 ? checkIns[0].hips : undefined);
    
    const calculateBmi = (weight: number, height: number) => {
        if (height > 0) {
            return (weight / Math.pow(height / 100, 2));
        }
        return 0;
    };
    
    const currentBmi = calculateBmi(currentWeight, userProfile.height);
    const bmiInfo = getBmiCategory(currentBmi);
    
    const chartData = checkIns.map(ci => ({
        name: ci.day === 0 ? 'Início' : `Dia ${ci.day}`,
        Peso: ci.weight,
        Cintura: ci.waist,
        Quadril: ci.hips,
    }));


    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Meu Perfil</h1>
                    <p className="text-gray-600">Gerencie suas informações pessoais e acompanhe sua evolução.</p>
                </div>
                 <button onClick={logout} className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors">
                    <LogOut size={18} />
                    <span>Sair</span>
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                
                {/* Main Column */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Informações Básicas */}
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-700">Informações Básicas</h2>
                            <button className="text-emerald-600 hover:text-emerald-800 p-2 rounded-full hover:bg-emerald-50">
                                <Edit size={18} />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <InfoItem icon={User} label="Nome" value={userProfile.name} />
                            <InfoItem icon={Calendar} label="Idade" value={`${userProfile.age} anos`} />
                            <InfoItem icon={User} label="Gênero" value={userProfile.gender} />
                            <InfoItem icon={Target} label="Objetivo" value={userProfile.goal} />
                            <InfoItem icon={BarChart} label="Nível de Atividade" value={userProfile.activityLevel.split(' ')[0]} />
                        </div>
                    </div>

                    {/* Estatísticas Atuais */}
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Estatísticas Atuais</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-3xl font-bold text-gray-800">{currentWeight.toFixed(1)}<span className="text-lg text-gray-500">kg</span></p>
                                <p className="text-sm text-gray-600">Peso</p>
                            </div>
                             <div>
                                <p className="text-3xl font-bold text-gray-800">{currentBmi.toFixed(1)}</p>
                                <p className={`text-sm font-semibold ${bmiInfo.color}`}>{bmiInfo.category}</p>
                            </div>
                             {currentWaist && (
                                <div>
                                    <p className="text-3xl font-bold text-gray-800">{currentWaist}<span className="text-lg text-gray-500">cm</span></p>
                                    <p className="text-sm text-gray-600">Cintura</p>
                                </div>
                            )}
                             {currentHips && (
                                <div>
                                    <p className="text-3xl font-bold text-gray-800">{currentHips}<span className="text-lg text-gray-500">cm</span></p>
                                    <p className="text-sm text-gray-600">Quadril</p>
                                </div>
                            )}
                        </div>
                    </div>
                     {/* Histórico de Medidas */}
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Histórico de Medidas</h2>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                           {checkIns.slice().reverse().map((checkIn) => {
                                const checkInBmi = calculateBmi(checkIn.weight, userProfile.height);
                                const isCurrent = checkIn.day === (lastCheckIn?.day ?? -1);
                                
                                // Simulating dates for display
                                const baseDate = new Date();
                                baseDate.setDate(baseDate.getDate() - ((lastCheckIn?.day ?? 0) - checkIn.day));
                                const formattedDate = baseDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

                                return (
                                <div key={checkIn.day} className={`p-3 rounded-lg flex flex-wrap justify-between items-center ${isCurrent ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50'}`}>
                                    <div className="font-semibold">{formattedDate}</div>
                                    <div className="flex gap-4 text-sm text-gray-600">
                                        <span>Peso: <strong>{checkIn.weight.toFixed(1)}kg</strong></span>
                                        {checkIn.waist && <span>Cintura: <strong>{checkIn.waist}cm</strong></span>}
                                        {checkIn.hips && <span>Quadril: <strong>{checkIn.hips}cm</strong></span>}
                                        <span>IMC: <strong>{checkInBmi.toFixed(1)}</strong></span>
                                    </div>
                                    {isCurrent && <span className="text-xs font-bold text-emerald-600 bg-emerald-200 px-2 py-1 rounded-full">Atual</span>}
                                </div>
                                )
                           })}
                        </div>
                    </div>
                </div>

                {/* Side Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Evolução das Medidas */}
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                         <h2 className="text-xl font-semibold text-gray-700 mb-4">Evolução das Medidas</h2>
                         <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} domain={['dataMin - 5', 'dataMax + 5']} />
                                    <Tooltip formatter={(value: number) => value.toFixed(1)} />
                                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                                    <Line type="monotone" dataKey="Peso" stroke="#10b981" strokeWidth={2} name="Peso (kg)" />
                                    <Line type="monotone" dataKey="Cintura" stroke="#8884d8" strokeWidth={2} name="Cintura (cm)" />
                                    <Line type="monotone" dataKey="Quadril" stroke="#ff7300" strokeWidth={2} name="Quadril (cm)" />
                                </LineChart>
                            </ResponsiveContainer>
                         </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProfilePage;
