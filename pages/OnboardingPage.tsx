import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { User, Scale, Ruler, Leaf, Target, Calendar } from 'lucide-react';

const OnboardingPage: React.FC = () => {
    const { userProfile, updateUserProfile } = useApp();
    const [name, setName] = useState('');
    const [age, setAge] = useState<number | undefined>(undefined);
    const [weight, setWeight] = useState<number | undefined>(undefined);
    const [height, setHeight] = useState<number | undefined>(undefined);
    const [weightGoal, setWeightGoal] = useState<number | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<React.ReactNode | null>(null);

    useEffect(() => {
        if (userProfile?.name) {
            setName(userProfile.name);
        }
    }, [userProfile?.name]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!age || !weight || !height || !weightGoal) {
            setError('Todos os campos são obrigatórios.');
            return;
        }
        setError(null);
        setLoading(true);

        try {
            await updateUserProfile({
                age,
                weight, // This will be the initial weight
                height,
                weight_goal: weightGoal,
            });
        } catch (err: any) {
            const defaultMessage = 'Ocorreu um erro ao salvar. Tente novamente.';
            
            if (err.message && (err.message.includes('security policy') || err.message.includes('violates row-level security'))) {
                 const rlsErrorGuide = (
                    <div className="text-sm text-left">
                        <h4 className="font-bold text-red-700">Falha de Permissão no Banco de Dados (RLS)</h4>
                        <p className="mt-2 text-neutral-800">Este é o erro mais comum e é fácil de resolver! Significa que seu banco de dados precisa de uma regra para permitir que você salve suas próprias informações.</p>
                        <p className="mt-2 text-neutral-900 font-semibold">Ação Necessária:</p>
                        <ol className="list-decimal list-inside mt-1 space-y-1 text-neutral-800 bg-neutral-100 p-3 rounded-md">
                            <li>Abra seu projeto no <a href="https://supabase.com/" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold underline">Supabase</a>.</li>
                            <li>No menu à esquerda, vá para: <strong>Authentication</strong> → <strong>Policies</strong>.</li>
                            <li>Na lista de tabelas, selecione a <strong>profiles</strong>.</li>
                            <li>Clique em <strong>"New Policy"</strong> e depois <strong>"From a template"</strong>.</li>
                            <li>Selecione o template chamado <strong>"Enable update access for users based on their UID"</strong>.</li>
                            <li>Não altere nada no template, apenas clique em <strong>"Review"</strong> e depois em <strong>"Save policy"</strong>.</li>
                        </ol>
                        <p className="mt-2 text-xs text-neutral-800">Após adicionar a política, recarregue esta página (F5) e tente salvar novamente.</p>
                    </div>
                );
                setError(rlsErrorGuide);
            } else {
                setError(err.message || defaultMessage);
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-primary-light flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md mx-auto animate-fade-in">
                <div className="bg-white p-8 rounded-lg shadow-soft">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                        <Leaf size={28} className="text-primary" />
                        <span className="text-2xl font-bold text-neutral-900">Fit28</span>
                    </div>
                    <h2 className="text-2xl font-bold text-center text-neutral-900 mb-2">
                        Complete seu Perfil
                    </h2>
                    <p className="text-center text-neutral-800 mb-6">
                        Faltam só mais alguns detalhes para começarmos.
                    </p>
                    
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text" placeholder="Seu nome completo" required value={name} 
                                disabled
                                className="w-full pl-10 pr-3 py-3 bg-neutral-200 border-2 border-transparent rounded-md focus:outline-none focus:border-primary transition-colors cursor-not-allowed"
                            />
                        </div>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="number" placeholder="Sua idade" required value={age ?? ''} 
                                onChange={(e) => setAge(e.target.value ? Number(e.target.value) : undefined)}
                                className="w-full pl-10 pr-3 py-3 bg-neutral-100 border-2 border-transparent rounded-md focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div className="relative">
                            <Scale className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="number" step="0.1" placeholder="Seu peso inicial (kg)" required value={weight ?? ''} 
                                onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : undefined)}
                                className="w-full pl-10 pr-3 py-3 bg-neutral-100 border-2 border-transparent rounded-md focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                         <div className="relative">
                            <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="number" placeholder="Sua altura (cm)" required value={height ?? ''} 
                                onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : undefined)}
                                className="w-full pl-10 pr-3 py-3 bg-neutral-100 border-2 border-transparent rounded-md focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                         <div className="relative">
                            <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="number" step="0.1" placeholder="Sua meta de peso (kg)" required value={weightGoal ?? ''} 
                                onChange={(e) => setWeightGoal(e.target.value ? Number(e.target.value) : undefined)}
                                className="w-full pl-10 pr-3 py-3 bg-neutral-100 border-2 border-transparent rounded-md focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        
                        {error && <div className="text-red-500 text-sm text-center font-semibold bg-red-50 p-3 rounded-md">{error}</div>}
                        
                        <button type="submit" disabled={loading} className="w-full bg-primary text-white font-bold py-3.5 rounded-md hover:bg-primary-dark transition-all duration-300 transform hover:scale-105 shadow-md disabled:bg-green-300 disabled:scale-100">
                            {loading ? 'Salvando...' : 'Salvar e Continuar'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OnboardingPage;