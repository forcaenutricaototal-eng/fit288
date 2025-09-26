
import React, { useState } from 'react';
import { useApp } from '../App';
import { User, Edit, LogOut, Award, ShieldCheck, Zap } from 'lucide-react';

const achievements = [
    { name: 'Início Perfeito', icon: Zap, unlocked: true, description: 'Completou o primeiro dia do plano.' },
    { name: 'Semana Ninja', icon: ShieldCheck, unlocked: true, description: 'Completou 7 dias seguidos.' },
    { name: 'Hidratação Máxima', icon: Award, unlocked: false, description: 'Bateu a meta de água por 5 dias.' },
    { name: 'Detox10', icon: Award, unlocked: false, description: 'Completou os primeiros 10 dias.' },
];

const ProfilePage: React.FC = () => {
    const { userProfile, logout } = useApp();
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState(userProfile);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setProfileData(prev => prev ? {...prev, [name]: value} : null);
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Perfil e Configurações</h1>
                 <button onClick={logout} className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors">
                    <LogOut size={18} />
                    <span>Sair</span>
                </button>
            </div>
            
            {/* User Profile Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-700">Seus Dados</h2>
                    <button onClick={() => setIsEditing(!isEditing)} className="text-emerald-600 hover:text-emerald-800 font-semibold flex items-center space-x-1">
                        <Edit size={16} />
                        <span>{isEditing ? 'Salvar' : 'Editar'}</span>
                    </button>
                </div>
                {profileData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-500">Nome</label>
                            <input type="text" name="name" value={profileData.name} onChange={handleInputChange} disabled={!isEditing} className="w-full p-2 border-b-2 bg-gray-50 disabled:bg-white disabled:border-gray-200 focus:outline-none focus:border-emerald-500" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-500">Idade</label>
                            <input type="number" name="age" value={profileData.age} onChange={handleInputChange} disabled={!isEditing} className="w-full p-2 border-b-2 bg-gray-50 disabled:bg-white disabled:border-gray-200 focus:outline-none focus:border-emerald-500" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-500">Peso (kg)</label>
                            <input type="number" name="weight" value={profileData.weight} onChange={handleInputChange} disabled={!isEditing} className="w-full p-2 border-b-2 bg-gray-50 disabled:bg-white disabled:border-gray-200 focus:outline-none focus:border-emerald-500" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-500">Altura (cm)</label>
                            <input type="number" name="height" value={profileData.height} onChange={handleInputChange} disabled={!isEditing} className="w-full p-2 border-b-2 bg-gray-50 disabled:bg-white disabled:border-gray-200 focus:outline-none focus:border-emerald-500" />
                        </div>
                    </div>
                )}
            </div>

            {/* Check-in Section */}
             <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Check-in Diário</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Peso de Hoje (kg)</label>
                        <input type="number" step="0.1" className="w-full p-2 border border-gray-300 rounded-md" defaultValue={userProfile?.weight} />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Água Consumida (L)</label>
                        <input type="number" step="0.1" className="w-full p-2 border border-gray-300 rounded-md" placeholder="Ex: 2.5" />
                     </div>
                </div>
                 <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nível de Retenção Hídrica</label>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Baixa</span>
                        <span>Média</span>
                        <span>Alta</span>
                    </div>
                    <input type="range" min="1" max="3" step="1" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                 </div>
                 <button className="mt-6 bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors w-full md:w-auto">
                    Registrar Check-in
                 </button>
            </div>


            {/* Achievements Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Conquistas</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    {achievements.map((ach) => (
                        <div key={ach.name} className={`p-4 rounded-lg border-2 ${ach.unlocked ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-gray-50'}`}>
                            <ach.icon size={32} className={`mx-auto mb-2 ${ach.unlocked ? 'text-emerald-600' : 'text-gray-400'}`} />
                            <h3 className={`font-semibold ${ach.unlocked ? 'text-emerald-800' : 'text-gray-500'}`}>{ach.name}</h3>
                            <p className="text-xs text-gray-500">{ach.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
