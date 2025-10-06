import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { User, Scale, Ruler, Leaf, Target, Calendar } from 'lucide-react';

const OnboardingPage: React.FC = () => {
    const { userProfile, updateUserProfile } = useApp();
    const [age, setAge] = useState<number | undefined>(undefined);
    const [weight, setWeight] = useState<number | undefined>(undefined);
    const [height, setHeight] = useState<number | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<React.ReactNode | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!age || !weight || !height) {
            setError('Todos os campos são obrigatórios.');
            return;
        }
        setError(null);
        setLoading(true);

        try {
            await updateUserProfile({
                name: userProfile?.name, // Safeguard: ensure name is passed along
                age,
                weight, // This will be the initial weight
                height,
            });
        } catch (err: any) {
            const defaultMessage = 'Ocorreu um erro ao salvar. Tente novamente.';
            
            if (err.message && err.message.includes('relation "profiles" does not exist')) {
                 setError(
                    <div className="text-sm text-left">
                        <h4 className="font-bold text-red-700">Tabela Não Encontrada no Banco de Dados</h4>
                        <p className="mt-2 text-neutral-800">O app não conseguiu encontrar a tabela <strong>'profiles'</strong>. Sua tabela pode estar com um nome diferente (ex: 'perfis').</p>
                         <p className="mt-2 text-neutral-900 font-semibold">Como Resolver:</p>
                        <ol className="list-decimal list-inside mt-1 text-neutral-800 bg-neutral-100 p-3 rounded-md">
                            <li>Vá para o <strong>Table Editor</strong> no seu projeto Supabase.</li>
                            <li>Encontre sua tabela de usuários (provavelmente 'perfis').</li>
                            <li>Renomeie a tabela para <strong>profiles</strong>.</li>
                        </ol>
                    </div>
                );
            } else if (err.message && (err.message.includes('security policy') || err.message.includes('violates row-level security'))) {
                 const rlsErrorGuide = (
                    <div className="text-sm text-left">
                        <h4 className="font-bold text-red-700">Falha de Permissão no Banco de Dados (RLS)</h4>
                        <p className="mt-2 text-neutral-800">Este é o erro mais comum! Significa que seu banco de dados precisa de regras para permitir que você veja e salve suas próprias informações. Você precisa criar <strong>DUAS</strong> políticas.</p>
                        
                        <div className="mt-4 bg-neutral-100 p-3 rounded-md">
                            <p className="font-semibold text-neutral-900">1ª Política: Permitir Leitura (SELECT)</p>
                            <ol className="list-decimal list-inside mt-1 space-y-1 text-neutral-800">
                                <li>No menu do Supabase, vá para: <strong>Authentication</strong> → <strong>Policies</strong>.</li>
                                <li>Na tabela <strong>profiles</strong>, clique em <strong>"New Policy"</strong> → <strong>"From a template"</strong>.</li>
                                <li>Selecione o template: <strong>"Enable read access for users based on their UID"</strong>.</li>
                                <li>Clique em <strong>"Review"</strong> e depois em <strong>"Save policy"</strong>.</li>
                            </ol>
                        </div>

                         <div className="mt-3 bg-neutral-100 p-3 rounded-md">
                            <p className="font-semibold text-neutral-900">2ª Política: Permitir Atualização (UPDATE)</p>
                            <ol className="list-decimal list-inside mt-1 space-y-1 text-neutral-800">
                                <li>Na mesma tela, clique em <strong>"New Policy"</strong> → <strong>"From a template"</strong> novamente.</li>
                                <li>Selecione o template: <strong>"Enable update access for users based on their UID"</strong>.</li>
                                <li>Clique em <strong>"Review"</strong> e depois em <strong>"Save policy"</strong>.</li>
                            </ol>
                        </div>
                        <p className="mt-3 text-xs text-neutral-800">Após criar as duas políticas, recarregue esta página (F5) e tente salvar novamente.</p>
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
                        Olá, {userProfile?.name}! Faltam só mais alguns detalhes para começarmos.
                    </p>
                    
                    <form onSubmit={handleSubmit} className="space-y-5">
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