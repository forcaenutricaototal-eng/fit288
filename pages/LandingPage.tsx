import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { Lock, Leaf, AtSign, User, Zap, BrainCircuit, FlaskConical, TrendingUp, Star } from 'lucide-react';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useApp();
    const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');

    const handleAuth = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you'd have actual auth logic.
        login();
        navigate('/onboarding');
    };

    const toggleAuthMode = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setAuthMode(prev => prev === 'login' ? 'signup' : 'login');
    }

    const benefits = [
        { icon: Zap, text: "Ativa naturalmente GLP-1 e GIP (mesmos hormônios do Monjaro)" },
        { icon: BrainCircuit, text: "Reduz compulsão alimentar e aumenta a saciedade" },
        { icon: FlaskConical, text: "Baseado em ciência e tradição japonesa" },
        { icon: TrendingUp, text: "Resultados reais e duradouros" },
    ];

    return (
        <div className="min-h-screen bg-primary-light flex items-center justify-center p-4 lg:p-8 font-sans">
            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left Column: Content */}
                <div className="space-y-6 text-center lg:text-left animate-fade-in-right">
                    <div className="flex items-center justify-center lg:justify-start space-x-3 mb-4">
                        <Leaf size={32} className="text-primary" />
                        <span className="text-3xl font-bold text-neutral-900">Fit28</span>
                    </div>

                    <h1 className="text-4xl lg:text-5xl font-extrabold text-neutral-900 leading-tight">
                        <span className="text-primary-dark">Monjaro Japonês:</span> a alternativa 100% natural para emagrecimento real.
                    </h1>

                    <p className="text-lg text-neutral-800">
                        O mesmo poder do Monjaro, mas em versão natural e japonesa.
                    </p>
                    
                    <ul className="space-y-3 pt-4 text-left inline-block">
                        {benefits.map((benefit, index) => (
                            <li key={index} className="flex items-center space-x-3">
                                <benefit.icon className="text-primary flex-shrink-0" size={20} />
                                <span className="text-neutral-900">{benefit.text}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="flex items-center space-x-4 pt-4 justify-center lg:justify-start">
                        <div className="text-sm font-semibold border-2 border-primary text-primary px-4 py-1 rounded-full">100% Natural</div>
                        <div className="text-sm font-semibold text-neutral-800">Baseado em ciência</div>
                    </div>
                </div>

                {/* Right Column: Auth Card */}
                <div className="w-full max-w-md mx-auto bg-white p-8 rounded-lg shadow-soft animate-fade-in-left">
                    <h2 className="text-2xl font-bold text-center text-neutral-900 mb-6">
                        {authMode === 'signup' ? 'Inicie sua transformação' : 'Bem-vindo de volta'}
                    </h2>
                    
                    <form onSubmit={handleAuth} className="space-y-5">
                        {authMode === 'signup' && (
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Nome Completo"
                                    required
                                    className="w-full pl-10 pr-3 py-3 bg-neutral-100 border-2 border-transparent rounded-md focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                        )}
                        <div className="relative">
                            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="email"
                                placeholder="Seu melhor e-mail"
                                required
                                className="w-full pl-10 pr-3 py-3 bg-neutral-100 border-2 border-transparent rounded-md focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="password"
                                placeholder="Crie uma senha"
                                required
                                className="w-full pl-10 pr-3 py-3 bg-neutral-100 border-2 border-transparent rounded-md focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        
                        <button
                            type="submit"
                            className="w-full bg-primary text-white font-bold py-3.5 rounded-md hover:bg-primary-dark transition-all duration-300 transform hover:scale-105 shadow-md"
                        >
                            Iniciar minha transformação
                        </button>
                    </form>

                    <p className="text-center text-sm text-neutral-800 mt-6">
                        {authMode === 'signup' 
                            ? "Já tem uma conta? "
                            : "Primeira vez aqui? "
                        }
                        <button onClick={toggleAuthMode} className="font-semibold text-primary-dark hover:underline">
                            {authMode === 'signup' ? "Faça login" : "Criar conta aqui"}
                        </button>
                    </p>

                    <div className="border-t border-neutral-200 mt-6 pt-6 text-center">
                        <div className="flex justify-center text-yellow-400 mb-2">
                            {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
                        </div>
                        <p className="text-sm text-neutral-800 italic">"Resultados incríveis! Uma abordagem que realmente funciona."</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;