import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { Lock, Leaf, AtSign, User } from 'lucide-react';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useApp();
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

    const handleAuth = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you'd have actual auth logic.
        // For this demo, we'll just log in and go to onboarding.
        login();
        navigate('/onboarding');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-400 to-cyan-400 flex flex-col justify-center items-center p-4">
            <div className="text-center mb-8">
                <div className="flex items-center justify-center space-x-2">
                    <Leaf size={40} className="text-white" />
                    <h1 className="text-5xl font-bold text-white">Fit28</h1>
                </div>
                <p className="text-white/90 mt-2">Seu plano Low-Carb de 28 dias.</p>
            </div>

            <div className="w-full max-w-sm bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
                <div className="flex border-b-2 border-gray-200 mb-6">
                    <button
                        onClick={() => setAuthMode('login')}
                        className={`w-1/2 py-3 font-semibold text-center transition-colors ${
                            authMode === 'login' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500'
                        }`}
                    >
                        Entrar
                    </button>
                    <button
                        onClick={() => setAuthMode('signup')}
                        className={`w-1/2 py-3 font-semibold text-center transition-colors ${
                            authMode === 'signup' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500'
                        }`}
                    >
                        Cadastrar
                    </button>
                </div>

                <form onSubmit={handleAuth} className="space-y-6">
                    {authMode === 'signup' && (
                         <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Nome Completo"
                                required
                                className="w-full pl-10 pr-3 py-3 bg-gray-100 border-2 border-transparent rounded-lg focus:outline-none focus:border-emerald-400 transition-colors"
                            />
                        </div>
                    )}
                    <div className="relative">
                        <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="email"
                            placeholder="Email"
                            required
                            className="w-full pl-10 pr-3 py-3 bg-gray-100 border-2 border-transparent rounded-lg focus:outline-none focus:border-emerald-400 transition-colors"
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="password"
                            placeholder="Senha"
                            required
                            className="w-full pl-10 pr-3 py-3 bg-gray-100 border-2 border-transparent rounded-lg focus:outline-none focus:border-emerald-400 transition-colors"
                        />
                    </div>
                    
                    {authMode === 'login' && (
                        <div className="flex items-center justify-between text-sm">
                            <a href="#" className="font-medium text-emerald-600 hover:text-emerald-500">
                                Esqueceu sua senha?
                            </a>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-emerald-500 text-white font-bold py-3 rounded-lg hover:bg-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                        {authMode === 'login' ? 'Entrar' : 'Criar Conta'}
                    </button>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Ou entre com</span>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-center space-x-4">
                        <button aria-label="Login with Google" className="w-12 h-12 flex items-center justify-center border-2 border-gray-200 rounded-full hover:bg-gray-100">
                           <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6"/>
                        </button>
                         <button aria-label="Login with Facebook" className="w-12 h-12 flex items-center justify-center border-2 border-gray-200 rounded-full hover:bg-gray-100">
                           <svg className="w-6 h-6 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-1.5c-.86 0-1.04.41-1.04 1.02V12h2.5l-.33 3H13.5v6.8c4.56-.93 8-4.96 8-9.8z" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;