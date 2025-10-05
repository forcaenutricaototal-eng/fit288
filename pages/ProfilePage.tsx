import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { User, Calendar, Edit, LogOut, PlusCircle, Save, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { UserProfile } from '../types';


const InfoItem: React.FC<{ icon: React.ElementType, label: string, value: string | number }> = ({ icon: Icon, label, value }) => (
    <div>
        <div className="text-sm text-neutral-800 flex items-center">
            <Icon size={14} className="mr-2" />
            {label}
        </div>
        <p className="font-semibold text-neutral-900">{value}</p>
    </div>
);

const getBmiCategory = (bmi: number): { category: string; color: string } => {
    if (bmi < 18.5) return { category: 'Abaixo do peso', color: 'text-blue-500' };
    if (bmi < 24.9) return { category: 'Peso normal', color: 'text-primary' };
    if (bmi < 29.9) return { category: 'Sobrepeso', color: 'text-yellow-500' };
    if (bmi < 34.9) return { category: 'Obesidade Grau I', color: 'text-orange-500' };
    if (bmi < 39.9) return { category: 'Obesidade Grau II', color: 'text-red-500' };
    return { category: 'Obesidade Grau III', color: 'text-red-700' };
};

const AddMeasurementModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { addCheckIn, userProfile, checkIns, updateUserProfile } = useApp();
    const lastCheckIn = checkIns.length > 0 ? checkIns[checkIns.length - 1] : null;

    const [measurements, setMeasurements] = useState({
        weight: lastCheckIn?.weight ?? userProfile?.weight ?? undefined,
        height: userProfile?.height ?? undefined,
        waist: lastCheckIn?.waist ?? undefined,
        hips: lastCheckIn?.hips ?? undefined,
        neck: lastCheckIn?.neck ?? undefined,
        right_arm: lastCheckIn?.right_arm ?? undefined,
        left_arm: lastCheckIn?.left_arm ?? undefined,
        right_thigh: lastCheckIn?.right_thigh ?? undefined,
        left_thigh: lastCheckIn?.left_thigh ?? undefined,
        observations: lastCheckIn?.observations ?? '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'observations') {
            setMeasurements(prev => ({ ...prev, observations: value }));
        } else {
            setMeasurements(prev => ({
                ...prev,
                [name]: value === '' ? undefined : Number(value)
            }));
        }
    };

    const handleSave = async () => {
        if (!measurements.weight || measurements.weight <= 0) {
            alert("O peso é obrigatório e deve ser maior que zero.");
            return;
        }

        if (measurements.height && measurements.height !== userProfile?.height) {
            await updateUserProfile({ height: measurements.height });
        }

        const { height, ...restOfMeasurements } = measurements;
        
        const checkInData = {
            ...restOfMeasurements,
            weight: measurements.weight,
            water_intake: 0, 
            fluid_retention: 1,
        };

        await addCheckIn(checkInData);
        onClose();
    };
    
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-xl font-bold text-neutral-900">Adicionar Medidas</h3>
                    <button onClick={onClose} className="bg-primary text-white px-4 py-1 rounded-md text-sm font-semibold hover:bg-primary-dark transition-colors">
                        Cancelar
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                        <div>
                            <label className="text-sm font-medium text-neutral-800">Peso (kg)</label>
                            <input type="number" name="weight" value={measurements.weight ?? ''} onChange={handleChange} className="w-full mt-1 p-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"/>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-neutral-800">Altura (cm)</label>
                            <input type="number" name="height" value={measurements.height ?? ''} onChange={handleChange} className="w-full mt-1 p-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"/>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-neutral-800">Cintura (cm)</label>
                            <input type="number" name="waist" value={measurements.waist ?? ''} onChange={handleChange} className="w-full mt-1 p-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"/>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-neutral-800">Quadril (cm)</label>
                            <input type="number" name="hips" value={measurements.hips ?? ''} onChange={handleChange} className="w-full mt-1 p-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"/>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-neutral-800">Braço Esq. (cm)</label>
                            <input type="number" name="left_arm" value={measurements.left_arm ?? ''} onChange={handleChange} className="w-full mt-1 p-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"/>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-neutral-800">Braço Dir. (cm)</label>
                            <input type="number" name="right_arm" value={measurements.right_arm ?? ''} onChange={handleChange} className="w-full mt-1 p-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"/>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-neutral-800">Coxa Esq. (cm)</label>
                            <input type="number" name="left_thigh" value={measurements.left_thigh ?? ''} onChange={handleChange} className="w-full mt-1 p-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"/>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-neutral-800">Coxa Dir. (cm)</label>
                            <input type="number" name="right_thigh" value={measurements.right_thigh ?? ''} onChange={handleChange} className="w-full mt-1 p-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"/>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-neutral-800">Pescoço (cm)</label>
                        <input type="number" name="neck" value={measurements.neck ?? ''} onChange={handleChange} className="w-full mt-1 p-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"/>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-neutral-800">Observações</label>
                        <textarea name="observations" value={measurements.observations} onChange={handleChange} rows={3} placeholder="Observações sobre as medidas..." className="w-full mt-1 p-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
                    </div>
                </div>
                 <div className="p-4 pt-0 mt-2">
                    <button onClick={handleSave} className="flex items-center gap-2 bg-primary text-white w-full justify-center px-6 py-3 rounded-md font-semibold hover:bg-primary-dark transition-colors">
                        <Save size={18} />
                        Salvar Medidas
                    </button>
                </div>
            </div>
        </div>
    );
};

const ProfilePage: React.FC = () => {
    const { userProfile, checkIns, logout, updateUserProfile } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editableProfile, setEditableProfile] = useState<UserProfile | null>(userProfile);

    useEffect(() => {
        setEditableProfile(userProfile);
    }, [userProfile]);

    if (!userProfile || !editableProfile) {
        return <div>Carregando perfil...</div>;
    }
    
    const handleEditSave = () => {
        if (editableProfile) {
            updateUserProfile(editableProfile);
        }
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setEditableProfile(userProfile);
        setIsEditing(false);
    };

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isNumeric = ['age', 'height', 'weight', 'weight_goal'].includes(name);
        setEditableProfile(prev => prev ? { ...prev, [name]: isNumeric ? Number(value) : value } : null);
    };

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
            {isModalOpen && <AddMeasurementModal onClose={() => setIsModalOpen(false)} />}
            
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900">Meu Perfil</h1>
                    <p className="text-neutral-800">Gerencie suas informações e acompanhe sua evolução.</p>
                </div>
                 <div className="flex items-center gap-4">
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-md font-semibold hover:bg-primary-dark transition-colors">
                        <PlusCircle size={18} />
                        <span>Adicionar Check-in</span>
                    </button>
                    <button onClick={logout} className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-600 transition-colors">
                        <LogOut size={18} />
                        <span>Sair</span>
                    </button>
                 </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                
                {/* Main Column */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Informações Básicas */}
                    <div className="bg-white p-6 rounded-lg shadow-soft">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-neutral-900">Informações Básicas</h2>
                            {isEditing ? (
                                <div className="flex items-center gap-2">
                                    <button onClick={handleEditSave} className="text-primary-dark p-2 rounded-full hover:bg-neutral-100"><Save size={18} /></button>
                                    <button onClick={handleCancelEdit} className="text-red-500 p-2 rounded-full hover:bg-neutral-100"><X size={18} /></button>
                                </div>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="text-primary-dark hover:text-primary p-2 rounded-full hover:bg-neutral-100">
                                    <Edit size={18} />
                                </button>
                            )}
                        </div>
                        {isEditing ? (
                            <div className="grid grid-cols-2 gap-4 animate-fade-in">
                                <div>
                                    <label className="text-sm text-neutral-800 block mb-1">Nome</label>
                                    <input type="text" name="name" value={editableProfile.name} onChange={handleProfileChange} className="w-full p-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"/>
                                </div>
                                <div>
                                    <label className="text-sm text-neutral-800 block mb-1">Idade</label>
                                    <input type="number" name="age" value={editableProfile.age} onChange={handleProfileChange} className="w-full p-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"/>
                                </div>
                                <div>
                                    <label className="text-sm text-neutral-800 block mb-1">Meta de Peso (kg)</label>
                                    <input type="number" name="weight_goal" value={editableProfile.weight_goal} onChange={handleProfileChange} className="w-full p-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"/>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InfoItem icon={User} label="Nome" value={userProfile.name} />
                                <InfoItem icon={Calendar} label="Idade" value={`${userProfile.age} anos`} />
                            </div>
                        )}
                    </div>

                    {/* Estatísticas Atuais */}
                    <div className="bg-white p-6 rounded-lg shadow-soft">
                        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Estatísticas Atuais</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-3xl font-bold text-neutral-900">{currentWeight.toFixed(1)}<span className="text-lg text-gray-500">kg</span></p>
                                <p className="text-sm text-neutral-800">Peso</p>
                            </div>
                             <div>
                                <p className="text-3xl font-bold text-neutral-900">{currentBmi.toFixed(1)}</p>
                                <p className={`text-sm font-semibold ${bmiInfo.color}`}>{bmiInfo.category}</p>
                            </div>
                             {currentWaist && (
                                <div>
                                    <p className="text-3xl font-bold text-neutral-900">{currentWaist}<span className="text-lg text-gray-500">cm</span></p>
                                    <p className="text-sm text-neutral-800">Cintura</p>
                                </div>
                            )}
                             {currentHips && (
                                <div>
                                    <p className="text-3xl font-bold text-neutral-900">{currentHips}<span className="text-lg text-gray-500">cm</span></p>
                                    <p className="text-sm text-neutral-800">Quadril</p>
                                </div>
                            )}
                        </div>
                    </div>
                     {/* Histórico de Medidas */}
                    <div className="bg-white p-6 rounded-lg shadow-soft">
                        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Histórico de Medidas</h2>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                           {checkIns.slice().reverse().map((checkIn) => {
                                const checkInBmi = calculateBmi(checkIn.weight, userProfile.height);
                                const isCurrent = checkIn.day === (lastCheckIn?.day ?? -1);
                                
                                const date = checkIn.created_at ? new Date(checkIn.created_at) : new Date();
                                const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

                                return (
                                <div key={checkIn.day} className={`p-3 rounded-md flex flex-wrap justify-between items-center ${isCurrent ? 'bg-green-50 border border-green-200' : 'bg-neutral-100'}`}>
                                    <div className="font-semibold text-neutral-900">{formattedDate}</div>
                                    <div className="flex gap-4 text-sm text-neutral-800">
                                        <span>Peso: <strong>{checkIn.weight.toFixed(1)}kg</strong></span>
                                        {checkIn.waist && <span>Cintura: <strong>{checkIn.waist}cm</strong></span>}
                                        {checkIn.hips && <span>Quadril: <strong>{checkIn.hips}cm</strong></span>}
                                        <span>IMC: <strong>{checkInBmi.toFixed(1)}</strong></span>
                                    </div>
                                    {isCurrent && <span className="text-xs font-bold text-primary-dark bg-green-200 px-2 py-1 rounded-full">Atual</span>}
                                </div>
                                )
                           })}
                        </div>
                    </div>
                </div>

                {/* Side Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Evolução das Medidas */}
                    <div className="bg-white p-6 rounded-lg shadow-soft">
                         <h2 className="text-xl font-semibold text-neutral-900 mb-4">Evolução das Medidas</h2>
                         <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} domain={['dataMin - 5', 'dataMax + 5']} />
                                    <Tooltip formatter={(value: number) => value.toFixed(1)} />
                                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                                    <Line type="monotone" dataKey="Peso" stroke="#2ECC71" strokeWidth={2} name="Peso (kg)" />
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