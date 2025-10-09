import React, { useState, useEffect, useCallback } from 'react';
import { getAccessCodes, createAccessCodes, deleteAccessCode } from '../services/supabaseService';
import type { AccessCode } from '../types';
import { useApp } from '../App';
import { Shield, Plus, Trash2, Loader, Copy, Database, AlertTriangle } from 'lucide-react';
import { useToast } from '../components/Toast';

const RLSGuide: React.FC = () => (
    <div className="bg-red-50 p-6 rounded-lg border border-red-200 shadow-soft text-sm text-left">
        <div className="flex items-start gap-4">
            <Shield className="text-red-600 flex-shrink-0" size={24}/>
            <div>
                <h4 className="font-bold text-lg text-red-700">Falha de Permissão de Admin (RLS)</h4>
                <p className="mt-2 text-neutral-800">
                    Ocorreu um erro de permissão. Isso geralmente acontece quando as regras de segurança (Policies) para o administrador não estão configuradas corretamente no banco de dados.
                </p>
                <p className="mt-2 text-neutral-900 font-semibold">
                    Solução: Use a "Ferramenta de Sincronização do Banco de Dados" para executar o script de setup completo. Ele irá configurar todas as permissões necessárias para você.
                </p>
            </div>
        </div>
    </div>
);


const DbSyncCard: React.FC = () => {
    const { setShowDbSyncTool } = useApp();
    return (
        <div className="bg-white p-6 rounded-lg shadow-soft border-l-4 border-yellow-500">
            <div className="flex items-start gap-4">
                <AlertTriangle className="text-yellow-600 flex-shrink-0" size={24} />
                <div>
                    <h2 className="text-lg font-semibold text-neutral-900 mb-2">Ferramenta de Sincronização do Banco de Dados</h2>
                    <p className="text-neutral-800 text-sm mb-4">
                        Se o cadastro de novos usuários estiver falhando com um erro de "código inválido" ou similar, seu banco de dados pode estar dessincronizado. Use esta ferramenta para acessar o script de reset completo e corrigir a estrutura das tabelas, funções e permissões.
                    </p>
                    <button
                        onClick={() => setShowDbSyncTool(true)}
                        className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-yellow-600 transition-colors"
                    >
                        <Database size={18} />
                        Abrir Ferramenta de Sincronização
                    </button>
                </div>
            </div>
        </div>
    );
};


const AdminPage: React.FC = () => {
    const { user, setShowDbSyncTool } = useApp();
    const { addToast } = useToast();
    const [codes, setCodes] = useState<AccessCode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generateCount, setGenerateCount] = useState(1);
    
    const fetchCodes = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const fetchedCodes = await getAccessCodes();
            setCodes(fetchedCodes);
        } catch (err: any) {
             if (err.message && (err.message.includes('security policy') || err.message.includes('violates row-level security'))) {
                setError("RLS_ERROR");
             } else {
                setError("Ocorreu um erro ao buscar os códigos. Tente recarregar a página.");
             }
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCodes();
    }, [fetchCodes]);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError(null);
        try {
            const newCodes = await createAccessCodes(generateCount);
            addToast(`${newCodes.length} novo(s) código(s) gerado(s) com sucesso!`, 'success');
            await fetchCodes(); // Recarrega a lista para garantir consistência
        } catch (err: any) {
            console.error(err);
            if (err.message && (err.message.includes('security policy') || err.message.includes('violates row-level security'))) {
                setError("RLS_ERROR");
            } else {
                addToast("Falha ao gerar códigos. Verifique se as permissões (RLS) de Admin estão configuradas.", 'info');
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Tem certeza que deseja apagar este código? Esta ação não pode ser desfeita.")) {
            try {
                await deleteAccessCode(id);
                setCodes(prev => prev.filter(code => code.id !== id));
                addToast("Código apagado com sucesso.", 'success');
            } catch (err) {
                console.error(err);
                addToast("Falha ao apagar o código. Ele pode já estar em uso.", 'info');
            }
        }
    };
    
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        addToast("Código copiado!", 'success');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-neutral-900 flex items-center gap-2">
                        <Shield className="text-primary"/>
                        Painel de Administração
                    </h1>
                    <p className="text-neutral-800">Gere e gerencie os códigos de acesso para seus clientes.</p>
                </div>
            </div>
            
            <DbSyncCard />
            
            {error === "RLS_ERROR" && <RLSGuide />}
            
            {error && error !== "RLS_ERROR" && <div className="text-center text-red-500 font-semibold">{error}</div>}

            {/* Gerador de Códigos */}
            <div className="bg-white p-6 rounded-lg shadow-soft">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">Gerar Novos Códigos</h2>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label htmlFor="code-count" className="font-medium text-neutral-800">Quantidade:</label>
                        <input
                            id="code-count"
                            type="number"
                            min="1"
                            max="20"
                            value={generateCount}
                            onChange={(e) => setGenerateCount(Number(e.target.value))}
                            className="w-20 p-2 border border-neutral-200 rounded-md text-center"
                        />
                    </div>
                    <button onClick={handleGenerate} disabled={isGenerating} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md font-semibold hover:bg-primary-dark transition-colors disabled:bg-red-300">
                        {isGenerating ? <Loader className="animate-spin" size={18} /> : <Plus size={18} />}
                        <span>{isGenerating ? 'Gerando...' : `Gerar ${generateCount} Código(s)`}</span>
                    </button>
                </div>
            </div>

            {/* Lista de Códigos */}
            <div className="bg-white p-6 rounded-lg shadow-soft">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-neutral-900">Códigos de Acesso</h2>
                    <div className="flex gap-4 text-sm font-medium">
                        <span className="text-green-600">Disponíveis: {codes.filter(c => !c.is_used).length}</span>
                        <span className="text-red-600">Usados: {codes.filter(c => c.is_used).length}</span>
                        <span>Total: {codes.length}</span>
                    </div>
                </div>
                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader className="animate-spin text-primary" size={32} />
                    </div>
                ) : (
                    <div className="max-h-[60vh] overflow-y-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-neutral-100 sticky top-0">
                                <tr>
                                    <th className="p-3 font-semibold">Código</th>
                                    <th className="p-3 font-semibold">Status</th>
                                    <th className="p-3 font-semibold">Data de Criação</th>
                                    <th className="p-3 font-semibold text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {codes.map(code => (
                                    <tr key={code.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                                        <td className="p-3 font-mono text-neutral-900">{code.code}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${code.is_used ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                {code.is_used ? 'Usado' : 'Disponível'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-neutral-800">{new Date(code.created_at).toLocaleDateString('pt-BR')}</td>
                                        <td className="p-3 text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                {!code.is_used && (
                                                    <>
                                                        <button onClick={() => copyToClipboard(code.code)} title="Copiar código" className="p-2 text-neutral-800 hover:bg-neutral-200 rounded-full">
                                                            <Copy size={16} />
                                                        </button>
                                                        <button onClick={() => handleDelete(code.id)} title="Apagar código" className="p-2 text-red-500 hover:bg-red-100 rounded-full">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPage;
