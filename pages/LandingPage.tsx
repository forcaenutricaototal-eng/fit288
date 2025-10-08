import React, { useState } from 'react';
import { Lock, AtSign, User, TrendingUp, Star, DollarSign, SmilePlus, HeartPulse, Droplets, Sparkles, Sunrise, Leaf, Ticket, ShieldOff, Clipboard, ClipboardCheck } from 'lucide-react';
import { useApp } from '../App';
import { useToast } from '../components/Toast';

const LandingPage: React.FC = () => {
    const { login, signup, resetPassword } = useApp();
    const { addToast } = useToast();
    
    const [authMode, setAuthMode] = useState<'signup' | 'login' | 'recover'>('signup');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [accessCode, setAccessCode] = useState('');
    const [error, setError] = useState<React.ReactNode>('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setIsCopied(true);
        addToast("Texto copiado!", 'success');
        setTimeout(() => setIsCopied(false), 2000);
    };

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
                const trimmedName = name.trim();
                const trimmedCode = accessCode.trim();
                
                if (!trimmedName) {
                    setError("O nome é obrigatório e não pode ficar em branco.");
                    setLoading(false);
                    return;
                }
                 if (!trimmedCode) {
                    setError("O código de acesso é obrigatório.");
                    setLoading(false);
                    return;
                }
                if (password.length < 6) {
                    setError("A senha deve ter pelo menos 6 caracteres.");
                    setLoading(false);
                    return;
                }
                
                const result = await signup(email, password, trimmedName, trimmedCode);
                
                if (result.error) {
                     if (result.error.message === 'RLS_UPDATE_POLICY_MISSING') {
                        const rlsUpdateErrorGuide = (
                            <div className="text-sm text-left animate-fade-in">
                                <div className="flex items-center gap-3 mb-3">
                                    <ShieldOff className="text-red-600" size={32} />
                                    <h4 className="font-bold text-lg text-red-700">Ação Urgente: Permissão Faltando</h4>
                                </div>
                                <p className="text-neutral-800">O sistema foi **impedido** de usar seu código de acesso. Isso acontece porque a permissão de <strong>UPDATE (uso)</strong> está faltando no seu banco de dados Supabase.</p>
                                
                                <div className="mt-4 bg-neutral-100 p-4 rounded-lg border border-neutral-200">
                                    <p className="font-bold text-neutral-900 mb-2">Solução: Crie a Política de UPDATE (Uso)</p>
                                    <ol className="list-decimal list-inside space-y-2 text-neutral-800">
                                        <li>No painel do Supabase, vá para: <strong>Authentication</strong> → <strong>Policies</strong>.</li>
                                        <li>Na tabela <strong>`access_codes`</strong>, clique em <strong>"New Policy"</strong> → <strong>"Create a new policy from scratch"</strong>.</li>
                                        <li><strong>Policy name:</strong> Dê um nome, como `Permitir uso de códigos`.</li>
                                        <li><strong className="text-primary-dark">Allowed operation:</strong> Marque <strong>APENAS UPDATE</strong>. (Este é o passo que falta!).</li>
                                        <li><strong>Target roles:</strong> Marque <strong>`anon`</strong>.</li>
                                        <li className="p-3 bg-red-50 border border-red-200 rounded-md mt-1">
                                            <strong>USING expression:</strong>
                                            <p className="mt-1 text-neutral-800">Neste campo, cole o texto exato abaixo. Use o botão para evitar erros de digitação.</p>
                                            <div className="my-2 p-2 pr-12 bg-gray-800 rounded-md relative flex items-center">
                                                <code className="text-white select-all">is_used = false</code>
                                                <button type="button" onClick={() => handleCopy('is_used = false')} className="absolute right-2 p-1 rounded-md hover:bg-gray-600 transition-colors">
                                                    {isCopied ? <ClipboardCheck size={16} className="text-green-400" /> : <Clipboard size={16} className="text-gray-400" />}
                                                </button>
                                            </div>
                                        </li>
                                        <li>Clique em <strong>"Review"</strong> e depois em <strong>"Save policy"</strong>.</li>
                                    </ol>
                                </div>
                                <p className="mt-4 text-xs text-neutral-800">Após criar esta regra, recarregue a página (F5) e tente o cadastro novamente. O problema estará resolvido.</p>
                            </div>
                        );
                        setError(rlsUpdateErrorGuide);
                    } else {
                        setError(result.error.message);
                    }
                } else if (result.data.user && !result.data.session) {
                    setSuccessMessage("Cadastro realizado! Verifique seu e-mail para confirmar sua conta e poder fazer o login.");
                    setAuthMode('login');
                    setName('');
                    setPassword('');
                    setAccessCode('');
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
        setAccessCode('');
    };

    return (
        <div className="min-h-screen bg-primary-light flex items-center justify-center p-4 lg:p-8 font-sans">
            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left Column: Content */}
                <div className="space-y-6 text-center lg:text-left animate-fade-in-right">
                    <div className="flex items-center justify-center lg:justify-start space-x-3 mb-4">
                        <Sunrise size={24} className="text-primary" />
                        <span className="text-lg font-bold text-neutral-900">Monjaro Japonês</span>
                    </div>
                    <h1 className="text-xl md:text-3xl font-bold text-neutral-900 leading-tight">
                        <span className="text-primary-dark">Monjaro Japonês:</span> O mesmo poder do Monjaro farmacêutico, mas em versão natural e mais potente.
                    </h1>
                    <p className="text-base lg:text-lg text-neutral-800">
                       Acompanhe seu progresso, receba planos alimentares personalizados e converse com nossa IA para tirar dúvidas.
                    </p>
                    <div className="pt-4 text-left inline-block">
                        <h2 className="text-lg lg:text-xl font-bold text-neutral-900 mb-3">Benefícios do Monjaro Japonês 🍵</h2>
                        <ul className="space-y-3">
                            {benefits.map((benefit, index) => (
                                <li key={index} className="flex items-center space-x-3">
                                    <benefit.icon className="text-primary flex-shrink-0" size={20} />
                                    <span className="text-neutral-900 text-sm sm:text-base">{benefit.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Right Column: Auth Card */}
                <div className="w-full max-w-md mx-auto animate-fade-in-left">
                    <div className="bg-white p-8 rounded-lg shadow-soft">
                        <h2 className="text-lg sm:text-xl font-bold text-center text-neutral-900 mb-2">
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
                                <>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="text" placeholder="Nome Completo" required value={name} onChange={(e) => setName(e.target.value)}
                                            className="w-full pl-10 pr-3 py-3 bg-neutral-100 border-2 border-transparent rounded-md focus:outline-none focus:border-primary transition-colors"
                                        />
                                    </div>
                                </>
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
                             {authMode === 'signup' && (
                                <div className="relative">
                                    <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text" placeholder="Código de Acesso" required value={accessCode} onChange={(e) => setAccessCode(e.target.value)}
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

                            {error && <div className="text-red-500 font-semibold bg-red-50 p-4 rounded-md">{typeof error === 'string' ? <p className="text-center">{error}</p> : error}</div>}
                            {successMessage && <p className="text-green-600 text-sm text-center font-semibold bg-green-50 p-2 rounded-md">{successMessage}</p>}
                            
                            <button type="submit" disabled={loading} className="w-full bg-primary text-white font-bold py-3.5 rounded-md hover:bg-primary-dark transition-all duration-300 transform hover:scale-105 shadow-md disabled:bg-red-300 disabled:scale-100">
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