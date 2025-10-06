
import React, { useState } from 'react';
import { Lock, Leaf, AtSign, User, TrendingUp, Star, DollarSign, SmilePlus, HeartPulse, Droplets, Sparkles } from 'lucide-react';
import { useApp } from '../App';

const LandingPage: React.FC = () => {
    const { login, signup, resetPassword } = useApp();
    
    const [authMode, setAuthMode] = useState<'signup' | 'login' | 'recover'>('signup');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            if (authMode === 'recover') {
                const { error: resetError } = await resetPassword(email);
                if (resetError) {
                    setError(resetError.message);
                } else {
                    setSuccessMessage("Link de recuperação enviado! Verifique seu e-mail.");
                    setAuthMode('login'); // Switch back to login view after request
                }
            } else if (authMode === 'login') {
                const { error: loginError } = await login(email, password);
                if (loginError) setError(loginError.message);
            } else { // signup
                if (password.length < 6) {
                    setError("A senha deve ter pelo menos 6 caracteres.");
                    setLoading(false);
                    return;
                }
                const result = await signup(email, password, name);
                if (result.error) {
                    setError(result.error.message);
                } else if (result.data.user && !result.data.session) {
                    setSuccessMessage("Cadastro realizado! Verifique seu e-mail para confirmar sua conta e poder fazer o login.");
                    setAuthMode('login');
                    setName('');
                    setPassword('');
                }
            }
        } catch (e: any) {
            setError("Ocorreu um erro inesperado. Por favor, tente novamente.");
            console.error("Auth error:", e);
        } finally {
            setLoading(false);
        }
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
    
    const toggleAuthMode = (mode: 'login' | 'signup' | 'recover') => {
        setAuthMode(mode);
        setError('');
        setSuccessMessage('');
        setPassword('');
    };

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
                </div>

                {/* Right Column: Auth Card */}
                <div className="w-full max-w-md mx-auto animate-fade-in-left">
                    <div className="bg-white p-8 rounded-lg shadow-soft">
                        <h2 className="text-2xl font-bold text-center text-neutral-900 mb-2">
                            {authMode === 'login' && 'Bem-vindo de volta'}
                            {authMode === 'signup' && 'Inicie sua transformação'}
                            {authMode === 'recover' && 'Recuperar Senha'}
                        </h2>
                        <p className="text-center text-neutral-800 mb-6">
                            {authMode === 'login' && 'Acesse sua conta para continuar.'}
                            {authMode === 'signup' && 'Crie sua conta para começar.'}
                            {authMode === 'recover' && 'Insira seu e-mail para receber o link.'}
                        </p>
                        
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {authMode === 'signup' && (
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text" placeholder="Nome Completo" required value={name} onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-10 pr-3 py-3 bg-neutral-100 border-2 border-transparent rounded-md focus:outline-none focus:border-primary transition-colors"
                                    />
                                </div>
                            )}
                            <div className="relative">
                                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email" placeholder="Seu melhor e-mail" required value={email} onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-3 py-3 bg-neutral-100 border-2 border-transparent rounded-md focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                            {authMode !== 'recover' && (
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="password" placeholder={authMode === 'login' ? "Sua senha" : "Crie uma senha (mín. 6 caracteres)"} required value={password} onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-3 py-3 bg-neutral-100 border-2 border-transparent rounded-md focus:outline-none focus:border-primary transition-colors"
                                    />
                                </div>
                            )}
                            
                            {authMode === 'login' && (
                                <div className="text-right -mt-2">
                                    <button type="button" onClick={() => toggleAuthMode('recover')} className="text-sm font-semibold text-primary-dark hover:underline">
                                        Esqueceu a senha?
                                    </button>
                                </div>
                            )}

                            {error && <p className="text-red-500 text-sm text-center font-semibold bg-red-50 p-2 rounded-md">{error}</p>}
                            {successMessage && <p className="text-green-600 text-sm text-center font-semibold bg-green-50 p-2 rounded-md">{successMessage}</p>}
                            
                            <button type="submit" disabled={loading} className="w-full bg-primary text-white font-bold py-3.5 rounded-md hover:bg-primary-dark transition-all duration-300 transform hover:scale-105 shadow-md disabled:bg-green-300 disabled:scale-100">
                                {loading ? 'Carregando...' : (
                                    authMode === 'login' ? 'Fazer Login' :
                                    authMode === 'signup' ? 'Iniciar minha transformação' :
                                    'Enviar link de recuperação'
                                )}
                            </button>
                        </form>

                        <p className="text-center text-sm text-neutral-800 mt-6">
                            {authMode === 'signup' ? (
                                <>
                                    Já tem uma conta?{' '}
                                    <button onClick={() => toggleAuthMode('login')} className="font-semibold text-primary-dark hover:underline">
                                        Fazer Login
                                    </button>
                                </>
                            ) : authMode === 'login' ? (
                                <>
                                    Não tem uma conta?{' '}
                                    <button onClick={() => toggleAuthMode('signup')} className="font-semibold text-primary-dark hover:underline">
                                        Crie uma agora
                                    </button>
                                </>
                            ) : (
                                <>
                                    Lembrou a senha?{' '}
                                    <button onClick={() => toggleAuthMode('login')} className="font-semibold text-primary-dark hover:underline">
                                        Fazer Login
                                    </button>
                                </>
                            )}
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
        </div>
    );
};

export default LandingPage;