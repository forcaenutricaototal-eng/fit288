

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Leaf, AtSign, User, TrendingUp, Star, DollarSign, SmilePlus, HeartPulse, Droplets, Sparkles } from 'lucide-react';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');


    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        // For signup, we just proceed to onboarding. The user profile will be created there.
        navigate('/onboarding', { state: { name } });
    };

    const benefits = [
        { icon: DollarSign, text: "Infinitamente mais barato que o farmacêutico" },
        { icon: Leaf, text: "Não invasivo e 100% natural" },
        { icon: SmilePlus, text: "Eleva naturalmente a saciedade" },
        { icon: HeartPulse, text: "Ajuda no tratamento do lipedema (sem crises inflamatórias)" },
        { icon: Droplets, text: "Auxilia no controle do diabetes tipo 2" },
        { icon: Sparkles, text: "Ajuda a combater sintomas de depressão e ansiedade" },
        { icon: TrendingUp, text: "Resultados duradouros e reeducativos" },
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
                    
                    <div className="pt-4 text-left inline-block">
                        <h2 className="text-2xl font-bold text-neutral-900 mb-3">Benefícios do Monjaro Japonês 🍵</h2>
                        <ul className="space-y-3">
                            {benefits.map((benefit, index) => (
                                <li key={index} className="flex items-center space-x-3">
                                    <benefit.icon className="text-primary flex-shrink-0" size={20} />
                                    <span className="text-neutral-900">{benefit.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex items-center space-x-4 pt-4 justify-center lg:justify-start">
                        <div className="text-sm font-semibold border-2 border-primary text-primary px-4 py-1 rounded-full">100% Natural</div>
                        <div className="text-sm font-semibold text-neutral-800">Baseado em ciência</div>
                    </div>
                </div>

                {/* Right Column: Auth Card */}
                <div className="w-full max-w-md mx-auto bg-white p-8 rounded-lg shadow-soft animate-fade-in-left">
                    <h2 className="text-2xl font-bold text-center text-neutral-900 mb-6">
                        Inicie sua transformação
                    </h2>
                    
                    <form onSubmit={handleSignup} className="space-y-5">
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Nome Completo"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-3 py-3 bg-neutral-100 border-2 border-transparent rounded-md focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div className="relative">
                            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="email"
                                placeholder="Seu melhor e-mail"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-3 py-3 bg-neutral-100 border-2 border-transparent rounded-md focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="password"
                                placeholder="Crie uma senha"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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