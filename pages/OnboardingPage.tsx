import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { User, Scale, Ruler, Leaf, Target } from 'lucide-react';

const OnboardingPage: React.FC = () => {
    const { userProfile, updateUserProfile } = useApp();
    const [name, setName] = useState('');
    const [age, setAge] = useState<number | undefined>(undefined);
    const [weight, setWeight] = useState<number | undefined>(undefined);
    const [height, setHeight] = useState<number | undefined>(undefined);
    const [weightGoal, setWeightGoal] = useState<number | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (userProfile?.name) {
            setName(userProfile.name);
        }
    }, [userProfile?.name]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !age || !weight || !height || !weightGoal) {
            setError('Todos os campos são obrigatórios.');
            return;
        }
        setError('');
        setLoading(true);

        try {
            await updateUserProfile({
                name,
                age,
                weight, // This will be the initial weight
                height,
                weight_goal: weightGoal,
            });
            // No need to redirect here, the routing in App.tsx will handle it
            // automatically when the userProfile state updates.
        } catch (err) {
            setError('Ocorreu um erro ao salvar. Tente novamente.');
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
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-3 py-3 bg-neutral-100 border-2 border-transparent rounded-md focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
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
                        
                        {error && <p className="text-red-500 text-sm text-center font-semibold bg-red-50 p-2 rounded-md">{error}</p>}
                        
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