import React, { useState } from 'react';
import { Lock, AtSign, User, TrendingUp, Star, DollarSign, SmilePlus, HeartPulse, Droplets, Sparkles, Sunrise, Leaf, Ticket, Settings, Key, Clipboard, ClipboardCheck, RefreshCw, DatabaseZap, AlertCircle } from 'lucide-react';
import { useApp } from '../App';
import { useToast } from '../components/Toast';

const SetupGuide: React.FC<{ errorType: 'TABLE_NOT_FOUND' | 'RLS_UPDATE_POLICY_MISSING' | 'RLS_SELECT_POLICY_MISSING'; onRetry: () => void }> = ({ errorType, onRetry }) => {
    const { addToast } = useToast();
    const [isCopied, setIsCopied] = useState(false);
    const [isCopiedUsing, setIsCopiedUsing] = useState(false);

    const handleCopy = (text: string, type: 'table' | 'using') => {
        navigator.clipboard.writeText(text);
        if (type === 'table') setIsCopied(true);
        if (type === 'using') setIsCopiedUsing(true);
        addToast("Texto copiado!", 'success');
        setTimeout(() => {
          setIsCopied(false);
          setIsCopiedUsing(false);
        }, 2000);
    };

    const renderTableNotFoundGuide = () => (
        <div className="bg-white p-8 rounded-lg shadow-soft animate-fade-in text-sm text-left">
            <div className="flex items-center gap-3 mb-4">
                <DatabaseZap className="text-blue-600 flex-shrink-0" size={40} />
                <h4 className="font-bold text-xl text-blue-700">Último Passo: Corrigir Nome da Tabela</h4>
            </div>
            <p className="text-neutral-800">
                Encontramos o problema! O aplicativo está configurado para usar uma tabela chamada <strong>`access_codes`</strong>, mas ela não foi encontrada.
            </p>
            <p className="mt-2 text-neutral-800">
                Pelas suas imagens, vimos que você está usando uma tabela chamada <strong>`simone11`</strong>. Para resolver, você só precisa renomeá-la.
            </p>
            
            <div className="mt-4 bg-neutral-100 p-4 rounded-lg border border-neutral-200">
                <p className="font-bold text-neutral-900 mb-2 text-base">Solução: Renomeie a Tabela `simone11`</p>
                <ol className="list-decimal list-inside space-y-2 text-neutral-800">
                    <li>No painel do Supabase, vá para: <strong>Table Editor</strong> (ícone de tabela).</li>
                    <li>Encontre a tabela <strong>`simone11`</strong> na lista à esquerda.</li>
                    <li className="font-bold text-primary-dark bg-red-50 p-3 rounded-md">Cuidado: Clique nos três pontinhos (<strong>...</strong>) ao lado do nome, não no nome da tabela em si.</li>
                    <li>No menu, selecione <strong>"Rename table"</strong>.</li>
                    <li className="p-3 bg-neutral-200 border border-neutral-300 rounded-md mt-1">
                        <strong>Novo nome:</strong> Digite o nome exato abaixo. Use o botão para evitar erros.
                        <div className="my-2 p-2 pr-12 bg-gray-800 rounded-md relative flex items-center">
                            <code className="text-white select-all">access_codes</code>
                            <button type="button" onClick={() => handleCopy('access_codes', 'table')} className="absolute right-2 p-1 rounded-md hover:bg-gray-600 transition-colors">
                                {isCopied ? <ClipboardCheck size={16} className="text-green-400" /> : <Clipboard size={16} className="text-gray-400" />}
                            </button>
                        </div>
                    </li>
                    <li>Clique em <strong>"Confirm"</strong>.</li>
                </ol>
            </div>

            <div className="mt-4 border-t pt-4">
                <p className="font-semibold text-neutral-900">Está na tela errada?</p>
                <p className="text-xs text-neutral-800 mt-1">Se você vir uma tela com o título "Update table simone11" e uma mensagem sobre "Composite primary key", você clicou no lugar errado. Apenas clique em <strong>"Cancel"</strong> e siga os passos acima novamente, clicando nos <strong>três pontinhos</strong>.</p>
            </div>

            <p className="mt-4 text-xs text-center text-neutral-800">Após renomear a tabela, clique no botão abaixo para tentar o cadastro novamente.</p>
            <button onClick={onRetry} className="mt-4 w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 rounded-md hover:bg-primary-dark transition-all">
                <RefreshCw size={18} />
                Já corrigi, tentar novamente!
            </button>
        </div>
    );
    
    const renderRLSUpdateGuide = () => (
         <div className="bg-white p-8 rounded-lg shadow-soft animate-fade-in text-sm text-left">
            <div className="flex items-center gap-3 mb-4">
                <Key className="text-blue-600 flex-shrink-0" size={40} />
                <h4 className="font-bold text-xl text-blue-700">Último Passo da Configuração</h4>
            </div>
            <p className="text-neutral-800">O aplicativo precisa de uma permissão final para funcionar. Sem ela, ninguém consegue se cadastrar. Vamos criar a permissão de <strong>USO (UPDATE)</strong> agora.</p>
            
            <div className="mt-4 bg-neutral-100 p-4 rounded-lg border border-neutral-200">
                <p className="font-bold text-neutral-900 mb-2 text-base">Solução: Crie a Política de UPDATE (Uso)</p>
                <ol className="list-decimal list-inside space-y-3 text-neutral-800">
                    <li>No painel do Supabase, vá para: <strong>Authentication</strong> → <strong>Policies</strong>.</li>
                    <li>Na tabela <strong>`access_codes`</strong>, clique em <strong>"New Policy"</strong> → <strong>"Create a new policy from scratch"</strong>.</li>
                    <li><strong>Policy name:</strong> Dê um nome, como `Permitir uso de códigos`.</li>
                    <li className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <strong className="text-blue-800 text-base">Allowed operation (O PASSO MAIS IMPORTANTE):</strong>
                        <p className="mt-1 text-neutral-800">Nesta seção, você verá várias opções. Certifique-se de que <strong>APENAS a opção `UPDATE`</strong> esteja marcada.</p>
                        <div className="my-2 p-2 bg-gray-800 rounded-md text-center">
                            <code className="text-white select-all text-xs">[ ] SELECT &nbsp; [ ] INSERT &nbsp; [X] UPDATE &nbsp; [ ] DELETE</code>
                        </div>
                        <p className="mt-1 text-xs font-bold text-red-700">⚠️ Se você marcar `SELECT` por engano, a regra não funcionará para o cadastro.</p>
                    </li>
                    <li><strong>Target roles:</strong> Marque <strong>`anon`</strong>.</li>
                    <li className="p-3 bg-neutral-200 border border-neutral-300 rounded-md">
                        <strong>USING expression:</strong>
                        <p className="mt-1 text-neutral-800">Este é o segundo passo mais importante! No campo chamado <strong>"USING expression"</strong>, cole o texto exato abaixo. Use o botão para evitar erros de digitação.</p>
                        <div className="my-2 p-2 pr-12 bg-gray-800 rounded-md relative flex items-center">
                            <code className="text-white select-all">is_used = false</code>
                            <button type="button" onClick={() => handleCopy('is_used = false', 'using')} className="absolute right-2 p-1 rounded-md hover:bg-gray-600 transition-colors">
                                {isCopiedUsing ? <ClipboardCheck size={16} className="text-green-400" /> : <Clipboard size={16} className="text-gray-400" />}
                            </button>
                        </div>
                         <p className="mt-2 text-xs font-bold text-red-700">⚠️ ATENÇÃO: Deixe o campo "WITH CHECK expression" vazio e a caixa "Use check expression" desmarcada. A regra deve ser colocada apenas no campo "USING".</p>
                    </li>
                    <li>Clique em <strong>"Review"</strong> e depois em <strong>"Save policy"</strong>.</li>
                </ol>
            </div>
            
            <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2">
                    <AlertCircle className="text-yellow-600" size={20} />
                    <h5 className="font-bold text-yellow-800">Solução de Problemas</h5>
                </div>
                <p className="mt-2 text-yellow-900 text-xs">
                    <strong>Problema: Os botões (INSERT, UPDATE) estão cinzas e não consigo clicar?</strong>
                    <br/>
                    Isso significa que você criou a regra com o tipo errado (ex: `SELECT`). O Supabase não permite alterar o tipo de uma regra existente.
                    <br/>
                    <strong>Solução:</strong> Volte para a lista de políticas, <strong>APAGUE</strong> a regra incorreta e depois crie uma <strong>NOVA</strong> do zero seguindo os passos acima.
                </p>
            </div>

             <p className="mt-4 text-xs text-center text-neutral-800">Após criar esta regra, volte para esta página e clique no botão abaixo.</p>
             <button onClick={onRetry} className="mt-4 w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 rounded-md hover:bg-primary-dark transition-all">
                <RefreshCw size={18} />
                Já corrigi, tentar cadastro novamente!
            </button>
        </div>
    );
    
    const renderRLSSelectGuide = () => (
         <div className="bg-white p-8 rounded-lg shadow-soft animate-fade-in text-sm text-left">
            <div className="flex items-center gap-3 mb-4">
                <Key className="text-blue-600 flex-shrink-0" size={40} />
                <h4 className="font-bold text-xl text-blue-700">Configuração de Permissão (Leitura)</h4>
            </div>
            <p className="text-neutral-800">O sistema também precisa de permissão para <strong>VERIFICAR (SELECT)</strong> seu código de acesso. Sem isso, o cadastro não funciona.</p>
            
            <div className="mt-4 bg-neutral-100 p-4 rounded-lg border border-neutral-200">
                <p className="font-bold text-neutral-900 mb-2 text-base">Solução: Crie a Política de SELECT (Leitura)</p>
                <p className="text-xs text-neutral-800 mb-3">A forma mais fácil é usar um modelo pronto do Supabase.</p>
                <ol className="list-decimal list-inside space-y-3 text-neutral-800">
                    <li>No painel do Supabase, vá para: <strong>Authentication</strong> → <strong>Policies</strong>.</li>
                    <li>Na tabela <strong>`access_codes`</strong>, clique em <strong>"New Policy"</strong>.</li>
                    <li>Selecione a opção: <strong>"From a template"</strong>.</li>
                    <li className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <strong className="text-blue-800 text-base">Selecione o Template Correto:</strong>
                        <p className="mt-1 text-neutral-800">Na lista de modelos, escolha a opção que diz: <strong>"Enable read access for all users"</strong>.</p>
                        <div className="my-2 p-2 bg-gray-800 rounded-md text-center">
                            <code className="text-white select-all text-xs">Enable read access for all users</code>
                        </div>
                    </li>
                    <li className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <strong className="text-yellow-800 text-base">Target Roles (Opcional):</strong>
                      <p className="mt-1 text-yellow-900">Na interface do Supabase, você verá um campo chamado "Target Roles". <strong className="font-bold">DEIXE ESTE CAMPO EM BRANCO.</strong> O Supabase irá aplicar a regra a todos (public), que é o correto para esta política.</p>
                    </li>
                    <li>Clique em <strong>"Review"</strong> e depois em <strong>"Save policy"</strong>.</li>
                </ol>
                <p className="mt-3 text-xs font-bold text-neutral-800">Isso irá criar a regra de leitura (`SELECT`) necessária. Certifique-se também de que a regra de `UPDATE` (mostrada no outro guia) também existe.</p>
            </div>
            
             <p className="mt-4 text-xs text-center text-neutral-800">Após criar esta regra, volte para esta página e clique no botão abaixo.</p>
             <button onClick={onRetry} className="mt-4 w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 rounded-md hover:bg-primary-dark transition-all">
                <RefreshCw size={18} />
                Já corrigi, tentar cadastro novamente!
            </button>
        </div>
    );


    if (errorType === 'TABLE_NOT_FOUND') {
        return renderTableNotFoundGuide();
    }
    if (errorType === 'RLS_UPDATE_POLICY_MISSING') {
        return renderRLSUpdateGuide();
    }
     if (errorType === 'RLS_SELECT_POLICY_MISSING') {
        return renderRLSSelectGuide();
    }
    return null;
};


const LandingPage: React.FC = () => {
    const { login, signup, resetPassword } = useApp();
    const { addToast } = useToast();
    
    const [authMode, setAuthMode] = useState<'signup' | 'login' | 'recover'>('signup');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [accessCode, setAccessCode] = useState('');
    const [error, setError] = useState<string>('');
    const [setupErrorType, setSetupErrorType] = useState<'TABLE_NOT_FOUND' | 'RLS_UPDATE_POLICY_MISSING' | 'RLS_SELECT_POLICY_MISSING' | null>(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);
        setSetupErrorType(null);

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
                     if (result.error.message === 'RLS_UPDATE_POLICY_MISSING' || result.error.message === 'TABLE_NOT_FOUND' || result.error.message === 'RLS_SELECT_POLICY_MISSING') {
                        setSetupErrorType(result.error.message as 'RLS_UPDATE_POLICY_MISSING' | 'TABLE_NOT_FOUND' | 'RLS_SELECT_POLICY_MISSING');
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
        setSetupErrorType(null);
        setPassword('');
        setAccessCode('');
    };

    const renderAuthForm = () => (
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
                    {setupErrorType ? <SetupGuide errorType={setupErrorType} onRetry={() => setSetupErrorType(null)} /> : renderAuthForm()}
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
