
import React, { useState } from 'react';
import { useApp } from '../App';
import type { CheckInData } from '../types';
import { User, Edit, LogOut, Award, ShieldCheck, Zap, Target, Droplets, Trophy, MessageSquare, CalendarCheck, Flame } from 'lucide-react';

const achievements = [
    { name: 'Início Perfeito', icon: Zap, unlocked: true, description: 'Completou o 1º dia.' },
    { name: 'Check-in Consistente', icon: CalendarCheck, unlocked: true, description: '3 check-ins seguidos.'},
    { name: 'Semana Ninja', icon: ShieldCheck, unlocked: true, description: 'Completou 7 dias.' },
    { name: 'Hidratação Máxima', icon: Droplets, unlocked: true, description: 'Meta de água: 7 dias.' },
    { name: 'Meio Caminho', icon: Target, unlocked: true, description: 'Completou 14 dias.' },
    { name: 'Maratonista Fit', icon: Flame, unlocked: false, description: 'Completou 21 dias.' },
    { name: 'Mestre Low-Carb', icon: Trophy, unlocked: false, description: 'Completou 28 dias.' },
    { name: 'Meta Batida!', icon: Award, unlocked: false, description: 'Meta de peso atingida.' },
    { name: 'Papo em Dia', icon: MessageSquare, unlocked: false, description: 'Enviou 10 mensagens.' },
];


const ProfilePage: React.FC = () => {
    const { userProfile, logout, addCheckIn, checkIns, planDuration } = useApp();
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState(userProfile);

    // State for check-in form
    const [todayWeight, setTodayWeight] = useState<string>(userProfile?.weight.toString() ?? '');
    const [waterIntake, setWaterIntake] = useState<string>('');
    const [fluidRetention, setFluidRetention] = useState<string>('1');
    const [waist, setWaist] = useState<string>('');
    const [hips, setHips] = useState<string>('');
    const [neck, setNeck] = useState<string>('');
    const [rightArm, setRightArm] = useState<string>('');
    const [leftArm, setLeftArm] = useState<string>('');
    const [rightThigh, setRightThigh] = useState<string>('');
    const [leftThigh, setLeftThigh] = useState<string>('');

    const currentDayOfPlan = checkIns.length -1;
    const nextCheckInDay = checkIns.length;
    const planComplete = currentDayOfPlan >= planDuration;

    const handleCheckIn = () => {
        const weightNum = parseFloat(todayWeight);
        const waterNum = parseFloat(waterIntake);
        const retentionNum = parseInt(fluidRetention, 10);
        
        const waistNum = parseFloat(waist);
        const hipsNum = parseFloat(hips);
        const neckNum = parseFloat(neck);
        const rightArmNum = parseFloat(rightArm);
        const leftArmNum = parseFloat(leftArm);
        const rightThighNum = parseFloat(rightThigh);
        const leftThighNum = parseFloat(leftThigh);


        if (isNaN(weightNum) || isNaN(waterNum) || weightNum <= 0 || waterNum < 0) {
            alert('Por favor, insira valores válidos para peso e água.');
            return;
        }

        const checkInData: Omit<CheckInData, 'day'> = {
            weight: weightNum,
            waterIntake: waterNum,
            fluidRetention: retentionNum,
        };
        
        if (!isNaN(waistNum) && waistNum > 0) checkInData.waist = waistNum;
        if (!isNaN(hipsNum) && hipsNum > 0) checkInData.hips = hipsNum;
        if (!isNaN(neckNum) && neckNum > 0) checkInData.neck = neckNum;
        if (!isNaN(rightArmNum) && rightArmNum > 0) checkInData.rightArm = rightArmNum;
        if (!isNaN(leftArmNum) && leftArmNum > 0) checkInData.leftArm = leftArmNum;
        if (!isNaN(rightThighNum) && rightThighNum > 0) checkInData.rightThigh = rightThighNum;
        if (!isNaN(leftThighNum) && leftThighNum > 0) checkInData.leftThigh = leftThighNum;


        addCheckIn(checkInData);
        
        // Reset fields for next day
        setWaterIntake(''); 
        setWaist('');
        setHips('');
        setNeck('');
        setRightArm('');
        setLeftArm('');
        setRightThigh('');
        setLeftThigh('');
    };
    
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
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Check-in Diário (Dia {nextCheckInDay})</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Peso de Hoje (kg)</label>
                        <input type="number" step="0.1" className="w-full p-2 border border-gray-300 rounded-md" value={todayWeight} onChange={e => setTodayWeight(e.target.value)} disabled={planComplete} />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Água Consumida (L)</label>
                        <input type="number" step="0.1" className="w-full p-2 border border-gray-300 rounded-md" placeholder="Ex: 2.5" value={waterIntake} onChange={e => setWaterIntake(e.target.value)} disabled={planComplete} />
                     </div>
                </div>

                 <div className="mt-4">
                    <h3 className="text-base font-semibold text-gray-700 mb-2">Medidas Corporais (cm) - Opcional</h3>
                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Cintura</label>
                           <input type="number" step="0.1" className="w-full p-2 border border-gray-300 rounded-md" placeholder="Ex: 85" value={waist} onChange={e => setWaist(e.target.value)} disabled={planComplete} />
                        </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Quadril</label>
                           <input type="number" step="0.1" className="w-full p-2 border border-gray-300 rounded-md" placeholder="Ex: 102" value={hips} onChange={e => setHips(e.target.value)} disabled={planComplete} />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Pescoço</label>
                           <input type="number" step="0.1" className="w-full p-2 border border-gray-300 rounded-md" placeholder="Ex: 38" value={neck} onChange={e => setNeck(e.target.value)} disabled={planComplete} />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Braço D.</label>
                           <input type="number" step="0.1" className="w-full p-2 border border-gray-300 rounded-md" placeholder="Ex: 35" value={rightArm} onChange={e => setRightArm(e.target.value)} disabled={planComplete} />
                        </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Braço E.</label>
                           <input type="number" step="0.1" className="w-full p-2 border border-gray-300 rounded-md" placeholder="Ex: 35" value={leftArm} onChange={e => setLeftArm(e.target.value)} disabled={planComplete} />
                        </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Coxa D.</label>
                           <input type="number" step="0.1" className="w-full p-2 border border-gray-300 rounded-md" placeholder="Ex: 60" value={rightThigh} onChange={e => setRightThigh(e.target.value)} disabled={planComplete} />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Coxa E.</label>
                           <input type="number" step="0.1" className="w-full p-2 border border-gray-300 rounded-md" placeholder="Ex: 60" value={leftThigh} onChange={e => setLeftThigh(e.target.value)} disabled={planComplete} />
                        </div>
                     </div>
                 </div>

                 <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nível de Retenção Hídrica</label>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Baixa</span>
                        <span>Média</span>
                        <span>Alta</span>
                    </div>
                    <input type="range" min="1" max="3" step="1" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" value={fluidRetention} onChange={e => setFluidRetention(e.target.value)} disabled={planComplete} />
                 </div>
                 <button onClick={handleCheckIn} disabled={planComplete} className="mt-6 bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors w-full md:w-auto disabled:bg-gray-400 disabled:cursor-not-allowed">
                    {planComplete ? 'Plano Concluído!' : `Registrar Check-in do Dia ${nextCheckInDay}`}
                 </button>
            </div>


            {/* Achievements Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Conquistas</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 text-center">
                    {achievements.map((ach) => (
                        <div 
                            key={ach.name} 
                            className={`p-4 rounded-xl flex flex-col items-center justify-center aspect-square transition-all duration-300 transform hover:scale-105 ${
                                ach.unlocked 
                                ? 'bg-gradient-to-br from-emerald-500 to-brand-green text-white shadow-lg' 
                                : 'bg-gray-100 border-2 border-dashed border-gray-300'
                            }`}
                        >
                            <ach.icon size={32} className={`mb-2 ${ach.unlocked ? 'text-white' : 'text-gray-400'}`} />
                            <h3 className={`font-semibold text-sm ${ach.unlocked ? 'text-white' : 'text-gray-600'}`}>{ach.name}</h3>
                            <p className={`text-xs mt-1 ${ach.unlocked ? 'text-white/80' : 'text-gray-500'}`}>{ach.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
