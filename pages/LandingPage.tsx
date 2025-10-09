

import React, { useState } from 'react';
import { Lock, AtSign, User, TrendingUp, Star, DollarSign, SmilePlus, HeartPulse, Droplets, Sparkles, Sunrise, Leaf, Ticket, HelpCircle, Copy, Check } from 'lucide-react';
import { useApp } from '../App';

// Componente de ajuda que aparece dentro do formulário, em vez de tomar a tela inteira.
const InlineRlsGuide: React.FC<{ type: 'RPC_CLAIM' | 'RPC_VALIDATE' | 'TABLE' }> = ({ type }) => {
    const [copiedStates, setCopiedStates] = useState<{[key: number]: boolean}>({});

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedStates(prev => ({ ...prev, [index]: true }));
        setTimeout(() => setCopiedStates(prev => ({ ...prev, [index]: false })), 2000);
    };

    const CodeBlock: React.FC<{ textToCopy: string; index: number }> = ({ textToCopy, index }) => (
        <div className="my-2 p-2 bg-gray-800 rounded-md relative group ml-4">
            <pre className="text-white text-xs whitespace-pre-wrap select-all"><code>{textToCopy}</code></pre>
            <button onClick={() => copyToClipboard(textToCopy, index)} className="absolute top-2 right-2 text-white p-1 bg-gray-700 rounded-md opacity-50 group-hover:opacity-100 transition-opacity">
                {copiedStates[index] ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
            </button>
        </div>
    );

    const getContent = () => {
        switch (type) {
            case 'RPC_VALIDATE':
                return {
                    title: 'Ação Requerida: Configurar Função de Validação',
                    steps: [
                        'O cadastro falhou porque uma função segura de validação de código não foi encontrada no banco de dados. Esta é a solução definitiva para o erro de "código inválido".',
                        'No seu painel Supabase, vá para: SQL Editor → New query.',
                        'Copie e cole o bloco de código SQL abaixo no editor.',
                        { code: `CREATE OR REPLACE FUNCTION validate_access_code(code_to_validate TEXT)\nRETURNS TABLE(is_valid BOOLEAN, is_used BOOLEAN) AS $$\nBEGIN\n  RETURN QUERY\n  SELECT\n    (count(*) > 0), -- is_valid\n    (bool_or(ac.is_used)) -- is_used\n  FROM public.access_codes ac\n  WHERE trim(upper(ac.code)) = trim(upper(code_to_validate));\nEND;\n$$ LANGUAGE plpgsql SECURITY DEFINER;\n\n-- Permite que qualquer pessoa (mesmo não logada) possa chamar a função\nGRANT EXECUTE ON FUNCTION public.validate_access_code(text) TO PUBLIC;` },
                        'Clique em "RUN" para criar a função.',
                        'Esta função permite que o sistema verifique se um código existe e está disponível, de forma segura e à prova de falhas de permissão.'
                    ]
                };
            case 'RPC_CLAIM':
                return {
                    title: 'Ação Requerida: Configurar Função de Reivindicação de Código',
                    steps: [
                        'O cadastro requer uma função segura no banco de dados para "queimar" o código de acesso após o uso.',
                        'No seu painel Supabase, vá para: SQL Editor → New query.',
                        'Cole o bloco de código SQL abaixo na íntegra no editor.',
                        { code: `CREATE OR REPLACE FUNCTION claim_access_code(code_to_claim TEXT)\nRETURNS SETOF access_codes AS $$\nBEGIN\n  RETURN QUERY\n  UPDATE public.access_codes\n  SET\n    is_used = TRUE,\n    used_by_user_id = auth.uid()\n  WHERE code = code_to_claim AND is_used = FALSE\n  RETURNING *;\nEND;\n$$ LANGUAGE plpgsql SECURITY DEFINER;\n\n-- Permite que usuários logados possam chamar a função\nGRANT EXECUTE ON FUNCTION public.claim_access_code(text) TO authenticated;` },
                        'Clique em "RUN" para criar a função.',
                    ]
                };
            case 'TABLE':
                return {
                    title: 'Ação Requerida: Tabela `access_codes` Não Encontrada',
                    steps: [
                        'O aplicativo não encontrou a tabela de códigos de acesso para validar o cadastro.',
                        'Use o script completo fornecido na tela de erro de sincronização do banco de dados (que aparece após o login) para criar todas as tabelas de uma vez.',
                    ]
                };
            default: return null;
        }
    }

    const content = getContent();
    if (!content) return null;

    return (
        <div className="bg-red-50 p-4 rounded-md border border-red-200 mb-6 text-sm text-left animate-fade-in">
            <div className="flex items-start space-x-3">
                <HelpCircle className="text-red-600 flex-shrink-0 mt-1" size={20} />
                <div>
                    <h3 className="font-bold text-red-700">{content.title}</h3>
                    <p className="text-neutral-800 mt-1">O cadastro falhou por um problema de configuração no seu projeto Supabase. Siga os passos abaixo para resolver o problema detectado:</p>
                    <ol className="list-decimal list-inside mt-3 space-y-2 text-neutral-800">
                        {content.steps.map((step, i) => (
                            typeof step === 'object' && 'code' in step 
                            ? <CodeBlock key={i} textToCopy={step.code} index={i} />
                            : <li key={i}>{step}</li>
                        ))}
                    </ol>
                    <p className="text-xs text-neutral-800 mt-3 font-semibold">Após aplicar a correção, tente se cadastrar novamente.</p>
                </div>
            </div>
        </div>
    );
};


const LandingPage: React.FC = () => {
    const { login, signup, resetPassword } = useApp();
    
    const [authMode, setAuthMode] = useState<'signup' | 'login' | 'recover'>('signup');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [accessCode, setAccessCode] = useState('');
    const [error, setError] = useState<string>('');
    const [rlsErrorType, setRlsErrorType] = useState<'RPC_CLAIM' | 'RPC_VALIDATE' | 'TABLE' | null>(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setRlsErrorType(null);
        setSuccessMessage('');
        setLoading(true);

        try {
            if (authMode === 'recover') {
                const { error: resetError } = await resetPassword(email);
                if (resetError) {
                    setError(resetError.message);
                } else {
                    setSuccessMessage("Link de recuperação enviado! Verifique seu e-mail.");
                    setAuthMode('login'); 
                }
            } else if (authMode === 'login') {
                const { error: loginError } = await login(email, password);
                if (loginError) setError(loginError.message);
            } else { // signup
                const trimmedName = name.trim();
                const trimmedCode = accessCode.trim();
                
                if (!trimmedName || !trimmedCode || password.length < 6) {
                    setError("Preencha todos os campos. A senha deve ter no mínimo 6 caracteres.");
                    setLoading(false);
                    return;
                }
                
                const result = await signup(email, password, trimmedName, trimmedCode);
                
                if (result.error) {
                    switch (result.error.message) {
                        case 'RPC_VALIDATE_FUNCTION_MISSING':
                            setRlsErrorType('RPC_VALIDATE');
                            break;
                        case 'RPC_CLAIM_FUNCTION_MISSING':
                            setRlsErrorType('RPC_CLAIM');
                            break;
                        case 'TABLE_NOT_FOUND':
                            setRlsErrorType('TABLE');
                            break;
                        default:
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
        setRlsErrorType(null);
        setSuccessMessage('');
        setPassword('');
        setAccessCode('');
    };

    const renderAuthForm = () => (
         <div className="bg-white p-8 rounded-lg shadow-soft">
            {rlsErrorType && <InlineRlsGuide type={rlsErrorType} />}
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
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input type="text" placeholder="Nome Completo" required value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-10 pr-3 py-3 bg-neutral-100 border-2 border-transparent rounded-md focus:outline-none focus:border-primary transition-colors" />
                    </div>
                )}
                <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="email" placeholder="Seu melhor e-mail" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-3 py-3 bg-neutral-100 border-2 border-transparent rounded-md focus:outline-none focus:border-primary transition-colors" />
                </div>
                {authMode !== 'recover' && (
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input type="password" placeholder={authMode === 'login' ? "Sua senha" : "Crie uma senha (mín. 6 caracteres)"} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-3 py-3 bg-neutral-100 border-2 border-transparent rounded-md focus:outline-none focus:border-primary transition-colors" />
                    </div>
                )}
                {authMode === 'signup' && (
                    <div className="relative">
                        <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input type="text" placeholder="Código de Acesso" required value={accessCode} onChange={(e) => setAccessCode(e.target.value)} className="w-full pl-10 pr-3 py-3 bg-neutral-100 border-2 border-transparent rounded-md focus:outline-none focus:border-primary transition-colors" />
                    </div>
                )}
                
                {authMode === 'login' && ( <div className="text-right -mt-2"><button type="button" onClick={() => toggleAuthMode('recover')} className="text-sm font-semibold text-primary-dark hover:underline">Esqueceu a senha?</button></div> )}
                {error && <div className="text-red-500 font-semibold bg-red-50 p-4 rounded-md text-center">{error}</div>}
                {successMessage && <p className="text-green-600 text-sm text-center font-semibold bg-green-50 p-2 rounded-md">{successMessage}</p>}
                
                <button type="submit" disabled={loading} className="w-full bg-primary text-white font-bold py-3.5 rounded-md hover:bg-primary-dark transition-all duration-300 transform hover:scale-105 shadow-md disabled:bg-red-300 disabled:scale-100">
                    {loading ? 'Carregando...' : ( authMode === 'login' ? 'Fazer Login' : authMode === 'signup' ? 'Iniciar minha transformação' : 'Enviar link de recuperação' )}
                </button>
            </form>

            <p className="text-center text-sm text-neutral-800 mt-6">
                {authMode === 'signup' ? (<>Já tem uma conta? <button onClick={() => toggleAuthMode('login')} className="font-semibold text-primary-dark hover:underline">Fazer Login</button></>) 
                : authMode === 'login' ? (<>Não tem uma conta? <button onClick={() => toggleAuthMode('signup')} className="font-semibold text-primary-dark hover:underline">Crie uma agora</button></>) 
                : (<>Lembrou a senha? <button onClick={() => toggleAuthMode('login')} className="font-semibold text-primary-dark hover:underline">Fazer Login</button></>)}
            </p>
            
            <div className="border-t border-neutral-200 mt-6 pt-6 text-center">
                <div className="flex justify-center text-yellow-400 mb-2">{[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}</div>
                <p className="text-sm text-neutral-800 italic">"Resultados incríveis! Uma abordagem que realmente funciona."</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-primary-light flex items-center justify-center p-4 lg:p-8 font-sans">
            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6 text-center lg:text-left animate-fade-in-right">
                    <div className="flex items-center justify-center lg:justify-start space-x-3 mb-4">
                        <Sunrise size={24} className="text-primary" />
                        <span className="text-lg font-bold text-neutral-900">Monjaro Japonês</span>
                    </div>
                    <h1 className="text-xl md:text-3xl font-bold text-neutral-900 leading-tight">
                        <span className="text-primary-dark">Monjaro Japonês:</span> O mesmo poder do Monjaro farmacêutico, mas em versão natural e mais potente.
                    </h1>
                    <p className="text-base lg:text-lg text-neutral-800">Acompanhe seu progresso, receba planos alimentares personalizados e converse com nossa IA para tirar dúvidas.</p>
                    <div className="pt-4 text-left inline-block">
                        <h2 className="text-lg lg:text-xl font-bold text-neutral-900 mb-3">Benefícios do Monjaro Japonês 🍵</h2>
                        <ul className="space-y-3">{benefits.map((benefit, index) => (<li key={index} className="flex items-center space-x-3"><benefit.icon className="text-primary flex-shrink-0" size={20} /><span className="text-neutral-900 text-sm sm:text-base">{benefit.text}</span></li>))}</ul>
                    </div>
                </div>
                <div className="w-full max-w-md mx-auto animate-fade-in-left">
                   {renderAuthForm()}
                </div>
            </div>
        </div>
    );
};

export default LandingPage;