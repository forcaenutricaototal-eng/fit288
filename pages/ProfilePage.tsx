import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { User, Calendar, Edit, LogOut, PlusCircle, Save, X, Ruler, Scale, Mail } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import type { UserProfile } from '../types';


const InfoItem: React.FC<{ icon: React.ElementType, label: string, value?: string | number }> = ({ icon: Icon, label, value }) => (
    <div>
        <div className="text-sm text-neutral-800 flex items-center">
            <Icon size={14} className="mr-2" />
            {label}
        </div>
        <p className="font-semibold text-neutral-900">{value || 'Não informado'}</p>
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
    const [error, setError] = useState<React.ReactNode | null>(null);
    
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
        setError(null);
        if (!measurements.weight || measurements.weight <= 0) {
            setError("O peso é obrigatório e deve ser maior que zero.");
            return;
        }

        try {
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

        } catch (err: any) {
             if (err.message && (err.message.includes('security policy') || err.message.includes('violates row-level security'))) {
                const rlsErrorGuide = (
                    <div className="text-sm text-left">
                        <h4 className="font-bold text-red-700">Falha de Permissão ao Salvar Check-in (RLS)</h4>
                        <p className="mt-2 text-neutral-800">Seu banco de dados precisa de regras para permitir que você salve e veja seus check-ins. Crie <strong>DUAS</strong> políticas para a tabela <strong>check_ins</strong>.</p>
                        
                        <div className="mt-4 bg-neutral-100 p-3 rounded-md">
                            <p className="font-semibold text-neutral-900">1ª Política: Permitir Leitura (SELECT)</p>
                            <ol className="list-decimal list-inside mt-1 space-y-1 text-neutral-800">
                                <li>Vá para: <strong>Authentication</strong> → <strong>Policies</strong>.</li>
                                <li>Na tabela <strong>check_ins</strong>, clique em <strong>"New Policy"</strong> → <strong>"From a template"</strong>.</li>
                                <li>Selecione o template: <strong>"Enable read access for users based on their UID"</strong>.</li>
                                <li>Clique em <strong>"Review"</strong> e <strong>"Save policy"</strong>.</li>
                            </ol>
                        </div>

                         <div className="mt-3 bg-neutral-100 p-3 rounded-md">
                            <p className="font-semibold text-neutral-900">2ª Política: Permitir Inserção (INSERT)</p>
                            <ol className="list-decimal list-inside mt-1 space-y-1 text-neutral-800">
                                <li>Clique em <strong>"New Policy"</strong> → <strong>"From a template"</strong> novamente.</li>
                                <li>Selecione o template: <strong>"Enable insert for authenticated users only"</strong>.</li>
                                <li>Clique em <strong>"Review"</strong> e <strong>"Save policy"</strong>.</li>
                            </ol>
                        </div>
                    </div>
                );
                setError(rlsErrorGuide);
            } else {
                setError('Não foi possível salvar o check-in. Tente novamente.');
            }
            console.error(err);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-xl font-bold text-neutral-900">Adicionar Medidas</h3>
                    <button onClick={onClose} className="text-neutral-800 p-2 hover:bg-neutral-100 rounded-full">
                        <X size={20}/>
                    </button>
                </div>
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {error && <div className="text-red-500 text-sm text-center font-semibold bg-red-50 p-3 rounded-md">{error}</div>}
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
                            <label className="text-sm font-medium text-neutral-800">Pescoço (cm)</label>
                            <input type="number" name="neck" value={measurements.neck ?? ''} onChange={handleChange} className="w-full mt-1 p-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"/>
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
                        <label className="text-sm font-medium text-neutral-800">Observações</label>
                        <textarea name="observations" value={measurements.observations} onChange={handleChange} rows={3} placeholder="Como você se sentiu hoje? Alguma observação?" className="w-full mt-1 p-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
                    </div>
                </div>
                 <div className="flex gap-2 p-4 border-t">
                    <button onClick={onClose} className="bg-neutral-200 text-neutral-900 w-full px-6 py-3 rounded-md font-semibold hover:bg-neutral-300 transition-colors">
                        Cancelar
                    </button>
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
    const [editableProfile, setEditableProfile] = useState<Partial<UserProfile> | null>(userProfile);
    const [editError, setEditError] = useState<React.ReactNode | null>(null);

    useEffect(() => {
        setEditableProfile(userProfile);
    }, [userProfile]);

    if (!userProfile || !editableProfile) {
        return <div>Carregando perfil...</div>;
    }
    
    const handleEditSave = async () => {
        setEditError(null);
        if (editableProfile) {
            const trimmedName = editableProfile.name?.trim();
            if (!trimmedName) {
                setEditError("O nome não pode ficar em branco.");
                return;
            }
            try {
                const profileToSave = {
                    ...editableProfile,
                    name: trimmedName,
                };
                await updateUserProfile(profileToSave);
                setIsEditing(false);
            } catch (err: any) {
                const defaultMessage = "Ocorreu um erro ao salvar o perfil. Tente novamente.";

                if (err.message && err.message.includes("Could not find") && err.message.includes("column") && err.message.includes("schema cache")) {
                    const columnErrorGuide = (
                        <div className="text-sm text-left">
                            <h4 className="font-bold text-red-700">Erro de Banco de Dados: Coluna ou Cache Desatualizado</h4>
                            <p className="mt-2 text-neutral-800">Ocorreu um erro ao salvar: <code className="bg-neutral-200 px-1 rounded text-xs">{err.message}</code>. Isso geralmente significa uma de duas coisas:</p>
                            <ol className="list-decimal list-inside mt-2 space-y-2 text-neutral-800">
                                <li>A coluna <strong>'completed_items_by_day'</strong> não existe na sua tabela 'profiles'.</li>
                                <li>O "cache de schema" do Supabase está desatualizado e não "vê" a coluna que já existe.</li>
                            </ol>

                            <p className="mt-3 text-neutral-900 font-semibold">Como Resolver:</p>
                            
                            <div className="mt-2 bg-neutral-100 p-3 rounded-md">
                                <p className="font-semibold text-neutral-900">Solução 1: Adicionar a Coluna (se ela não existir)</p>
                                <p className="mt-1">No seu painel Supabase, vá para <strong>SQL Editor</strong> e execute o comando abaixo para garantir que a coluna exista:</p>
                                <div className="my-2 p-2 bg-gray-800 rounded-md">
                                    <pre><code className="text-white text-xs whitespace-pre-wrap select-all">ALTER TABLE public.profiles ADD COLUMN completed_items_by_day jsonb NOT NULL DEFAULT '{{}}';</code></pre>
                                </div>
                            </div>

                            <div className="mt-3 bg-neutral-100 p-3 rounded-md">
                                <p className="font-semibold text-neutral-900">Solução 2: Atualizar o Cache do Supabase</p>
                                <p className="mt-1">Se a coluna já existe, o cache pode estar desatualizado. Para forçar uma atualização:</p>
                                <ul className="list-disc list-inside mt-1">
                                    <li>Vá para <strong>Table Editor</strong> → tabela <strong>profiles</strong> no Supabase.</li>
                                    <li>Adicione uma descrição a qualquer coluna (clique na coluna → Edit column). Salve. Depois pode remover a descrição.</li>
                                    <li>Isso força o Supabase a recarregar o schema. Após isso, recarregue o app e tente salvar novamente.</li>
                                </ul>
                            </div>
                        </div>
                    );
                    setEditError(columnErrorGuide);
                } else if (err.message && (err.message.includes('security policy') || err.message.includes('violates row-level security'))) {
                    const rlsErrorGuide = (
                        <div className="text-sm text-left">
                            <h4 className="font-bold text-red-700">Falha de Permissão ao Salvar (RLS)</h4>
                            <p className="mt-2 text-neutral-800">Este erro indica que seu banco de dados não tem as permissões corretas. Para funcionar, a tabela <strong>'profiles'</strong> precisa de <strong>TRÊS</strong> políticas de segurança.</p>
                            <p className="mt-2 text-neutral-900 font-semibold">Verifique suas políticas no Supabase:</p>
                            
                            <div className="mt-4 bg-neutral-100 p-3 rounded-md">
                                <p className="font-semibold text-neutral-900">1. Política de Criação (INSERT)</p>
                                <p className="text-xs text-neutral-800">Template: <strong>"Enable insert for authenticated users only"</strong></p>
                            </div>

                            <div className="mt-3 bg-neutral-100 p-3 rounded-md">
                                <p className="font-semibold text-neutral-900">2. Política de Leitura (SELECT)</p>
                                <p className="text-xs text-neutral-800">Template: <strong>"Enable read access for users based on their UID"</strong></p>
                            </div>

                            <div className="mt-3 bg-neutral-100 p-3 rounded-md">
                                <p className="font-semibold text-neutral-900">3. Política de Atualização (UPDATE)</p>
                                <p className="text-xs text-neutral-800">Template: <strong>"Enable update access for users based on their UID"</strong></p>
                            </div>
                            
                            <p className="mt-3 text-xs text-neutral-800">
                                Vá para <strong>Authentication → Policies</strong> no Supabase e garanta que essas três políticas existem e estão ativas para a tabela 'profiles'.
                            </p>
                        </div>
                    );
                    setEditError(rlsErrorGuide);
                } else {
                    setEditError(err.message || defaultMessage);
                }
                console.error(err);
            }
        }
    };

    const handleCancelEdit = () => {
        setEditableProfile(userProfile);
        setIsEditing(false);
        setEditError(null);
    };

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isNumeric = ['age', 'height', 'weight'].includes(name);
        setEditableProfile(prev => prev ? { ...prev, [name]: isNumeric && value ? Number(value) : (isNumeric ? undefined : value) } : null);
    };

    const lastCheckIn = checkIns.length > 0 ? checkIns[checkIns.length - 1] : null;
    const currentWeight = lastCheckIn?.weight ?? userProfile.weight;
    const currentWaist = lastCheckIn?.waist;
    const currentHips = lastCheckIn?.hips;
    
    const calculateBmi = (weight?: number, height?: number) => {
        if (weight && height && height > 0) {
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

    const bmiChartData = userProfile.height 
        ? checkIns.map(ci => ({
            name: ci.day === 0 ? 'Início' : `Dia ${ci.day}`,
            IMC: parseFloat(calculateBmi(ci.weight, userProfile.height).toFixed(1)),
          }))
        : [];


    return (
        <div className="space-y-6">
            {isModalOpen && <AddMeasurementModal onClose={() => setIsModalOpen(false)} />}
            
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-neutral-900">Meu Perfil</h1>
                    <p className="text-neutral-800">Gerencie suas informações e acompanhe sua evolução.</p>
                </div>
                 <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-md font-semibold hover:bg-primary-dark transition-colors">
                        <PlusCircle size={18} />
                        <span>Adicionar Check-in</span>
                    </button>
                    <a href="mailto:contato@caosaocontrole.com.br" className="flex items-center space-x-2 bg-neutral-800 text-white px-4 py-2 rounded-md font-semibold hover:bg-neutral-900 transition-colors">
                        <Mail size={18} />
                        <span>Contato</span>
                    </a>
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
                            <h2 className="text-lg font-semibold text-neutral-900">Informações Básicas</h2>
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
                            <div className="space-y-4 animate-fade-in">
                                {editError && <div className="text-red-500 text-sm text-center font-semibold bg-red-50 p-3 rounded-md">{editError}</div>}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-neutral-800 block mb-1">Nome</label>
                                        <input type="text" name="name" value={editableProfile.name || ''} onChange={handleProfileChange} className="w-full p-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"/>
                                    </div>
                                    <div>
                                        <label className="text-sm text-neutral-800 block mb-1">Idade</label>
                                        <input type="number" name="age" value={editableProfile.age || ''} onChange={handleProfileChange} placeholder="Sua idade" className="w-full p-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"/>
                                    </div>
                                    <div>
                                        <label className="text-sm text-neutral-800 block mb-1">Altura (cm)</label>
                                        <input type="number" name="height" value={editableProfile.height || ''} onChange={handleProfileChange} placeholder="Sua altura" className="w-full p-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"/>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="text-sm text-neutral-800 block mb-1">Peso Inicial (kg)</label>
                                        <input type="number" name="weight" value={editableProfile.weight || ''} onChange={handleProfileChange} placeholder="Seu peso inicial" className="w-full p-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"/>
                                    </div>
                                </div>
                            </div>
                        ) : (
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                                <InfoItem icon={User} label="Nome" value={userProfile.name} />
                                <InfoItem icon={Calendar} label="Idade" value={userProfile.age ? `${userProfile.age} anos` : undefined} />
                                <InfoItem icon={Ruler} label="Altura" value={userProfile.height ? `${userProfile.height} cm` : undefined} />
                                <InfoItem icon={Scale} label="Peso Atual" value={currentWeight ? `${currentWeight.toFixed(1)} kg` : undefined} />
                            </div>
                        )}
                    </div>

                    {/* Estatísticas Atuais */}
                    <div className="bg-white p-6 rounded-lg shadow-soft">
                        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Estatísticas Atuais</h2>
                         {currentWeight ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center items-center">
                                <div>
                                    <p className="text-lg sm:text-2xl font-bold text-neutral-900">{currentWeight.toFixed(1)}<span className="text-base text-gray-500">kg</span></p>
                                    <p className="text-sm text-neutral-800">Peso</p>
                                </div>
                                 <div>
                                    <p className="text-lg sm:text-2xl font-bold text-neutral-900">{currentBmi.toFixed(1)}</p>
                                    <p className={`text-sm font-semibold ${bmiInfo.color}`}>{bmiInfo.category}</p>

                                </div>
                                 {currentWaist && (
                                    <div>
                                        <p className="text-lg sm:text-2xl font-bold text-neutral-900">{currentWaist}<span className="text-base text-gray-500">cm</span></p>
                                        <p className="text-sm text-neutral-800">Cintura</p>
                                    </div>
                                )}
                                 {currentHips && (
                                    <div>
                                        <p className="text-lg sm:text-2xl font-bold text-neutral-900">{currentHips}<span className="text-base text-gray-500">cm</span></p>
                                        <p className="text-sm text-neutral-800">Quadril</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-center text-neutral-800">Faça seu primeiro check-in para ver suas estatísticas.</p>
                        )}
                    </div>
                     {/* Histórico de Medidas */}
                    <div className="bg-white p-6 rounded-lg shadow-soft">
                        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Histórico de Medidas</h2>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                           {checkIns.length > 0 ? checkIns.slice().reverse().map((checkIn) => {
                                const isCurrent = checkIn.day === (lastCheckIn?.day ?? -1);
                                const date = checkIn.created_at ? new Date(checkIn.created_at) : new Date();
                                const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

                                return (
                                <div key={checkIn.day} className={`p-3 rounded-md flex flex-wrap justify-between items-center gap-2 ${isCurrent ? 'bg-red-50 border border-red-200' : 'bg-neutral-100'}`}>
                                    <div className="font-semibold text-neutral-900">{checkIn.day === 0 ? "Início" : `Dia ${checkIn.day}`} <span className="text-xs font-normal text-neutral-800">({formattedDate})</span></div>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-800">
                                        <span>Peso: <strong>{checkIn.weight.toFixed(1)}kg</strong></span>
                                        {checkIn.waist && <span>Cintura: <strong>{checkIn.waist}cm</strong></span>}
                                        {checkIn.hips && <span>Quadril: <strong>{checkIn.hips}cm</strong></span>}
                                    </div>
                                </div>
                                )
                           }) : <p className="text-center text-neutral-800 text-sm py-4">Nenhum check-in registrado ainda.</p>}
                        </div>
                    </div>
                </div>

                {/* Side Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Evolução das Medidas */}
                    <div className="bg-white p-6 rounded-lg shadow-soft">
                         <h2 className="text-lg font-semibold text-neutral-900 mb-4">Evolução das Medidas</h2>
                         <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} domain={['dataMin - 5', 'dataMax + 5']} />
                                    <Tooltip formatter={(value: number) => value.toFixed(1)} />
                                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                                    <Line type="monotone" dataKey="Peso" stroke="#D32F2F" strokeWidth={2} name="Peso (kg)" />
                                    <Line type="monotone" dataKey="Cintura" stroke="#8884d8" strokeWidth={2} name="Cintura (cm)" />
                                    <Line type="monotone" dataKey="Quadril" stroke="#ff7300" strokeWidth={2} name="Quadril (cm)" />
                                </LineChart>
                            </ResponsiveContainer>
                         </div>
                    </div>
                    {/* Evolução do IMC */}
                    {bmiChartData.length > 1 && (
                        <div className="bg-white p-6 rounded-lg shadow-soft">
                             <h2 className="text-lg font-semibold text-neutral-900 mb-4">Evolução do IMC</h2>
                             <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={bmiChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                        <YAxis tick={{ fontSize: 12 }} domain={['dataMin - 2', 'dataMax + 2']} />
                                        <Tooltip formatter={(value: number) => value.toFixed(1)} />
                                        <Legend wrapperStyle={{ fontSize: "12px" }} />
                                        <Line type="monotone" dataKey="IMC" stroke="#10B981" strokeWidth={2} name="IMC" />
                                    </LineChart>
                                </ResponsiveContainer>
                             </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ProfilePage;