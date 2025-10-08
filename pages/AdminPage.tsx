import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../App';
import { getAccessCodes, createAccessCodes, deleteAccessCode } from '../services/supabaseService';
import type { AccessCode } from '../types';
import { Loader, Trash, Key, CheckCircle, Circle, Clipboard, ShieldAlert, PlusCircle } from 'lucide-react';
import { useToast } from '../components/Toast';

const AdminPage: React.FC = () => {
    const [codes, setCodes] = useState<AccessCode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<React.ReactNode | null>(null);
    const [numToGenerate, setNumToGenerate] = useState(1);
    const { addToast } = useToast();

    const fetchCodes = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const fetchedCodes = await getAccessCodes();
            setCodes(fetchedCodes);
        } catch (err: any) {
            if (err.message && (err.message.includes('security policy') || err.message.includes('violates row-level security'))) {
                const rlsErrorGuide = (
                    <div className="text-sm text-left">
                        <div className="flex items-center gap-2 mb-3">
                            <ShieldAlert className="text-red-700" size={24} />
                            <h4 className="font-bold text-lg text-red-700">Acesso Negado! Configure as Permissões de Admin.</h4>
                        </div>
                        <p className="mt-2 text-neutral-800">Para acessar esta página, você precisa dar permissão ao seu usuário de admin no Supabase. Crie <strong>TRÊS</strong> políticas de segurança para a tabela <strong>'access_codes'</strong>.</p>
                        <p className="text-xs text-neutral-800 mt-1">Lembre-se: O ID do seu usuário admin deve estar na variável de ambiente <code className="bg-neutral-200 px-1 rounded">VITE_ADMIN_USER_ID</code>.</p>
                        
                        <div className="mt-4 bg-neutral-100 p-3 rounded-md">
                            <p className="font-semibold text-neutral-900">1ª Política: Permitir Visualização (SELECT)</p>
                             <ol className="list-decimal list-inside mt-1 space-y-1 text-neutral-800">
                                <li>Vá para: <strong>Authentication</strong> → <strong>Policies</strong> e selecione a tabela <strong>access_codes</strong>.</li>
                                <li>Clique em <strong>"New Policy"</strong> → <strong>"From a template"</strong>.</li>
                                <li>Selecione o template: <strong>"Enable read access for all users"</strong>.</li>
                                <li><strong>IMPORTANTE:</strong> Na seção <strong>"Target roles"</strong>, desmarque "public" e digite <strong>authenticated</strong>.</li>
                                <li>Clique em <strong>"Review"</strong> e <strong>"Save policy"</strong>.</li>
                            </ol>
                        </div>
                         <div className="mt-3 bg-neutral-100 p-3 rounded-md">
                            <p className="font-semibold text-neutral-900">2ª Política: Permitir Criação (INSERT)</p>
                            <ol className="list-decimal list-inside mt-1 space-y-1 text-neutral-800">
                                <li>Clique em <strong>"New Policy"</strong> → <strong>"Create a new policy from scratch"</strong>.</li>
                                <li><strong>Policy name:</strong> `Admin pode criar códigos`</li>
                                <li><strong>Allowed operation:</strong> Marque <strong>INSERT</strong>.</li>
                                <li><strong>Target roles:</strong> Marque <strong>authenticated</strong>.</li>
                                 <li>No campo <strong>"WITH CHECK expression"</strong>, cole: <code className="bg-neutral-200 px-1 rounded">auth.uid() = '{process.env.VITE_ADMIN_USER_ID}'</code></li>
                                <li>Clique em <strong>"Review"</strong> e <strong>"Save policy"</strong>.</li>
                            </ol>
                        </div>
                        <div className="mt-3 bg-neutral-100 p-3 rounded-md">
                            <p className="font-semibold text-neutral-900">3ª Política: Permitir Deleção (DELETE)</p>
                             <ol className="list-decimal list-inside mt-1 space-y-1 text-neutral-800">
                                <li>Clique em <strong>"New Policy"</strong> → <strong>"Create a new policy from scratch"</strong>.</li>
                                <li><strong>Policy name:</strong> `Admin pode deletar códigos não usados`</li>
                                <li><strong>Allowed operation:</strong> Marque <strong>DELETE</strong>.</li>
                                <li><strong>Target roles:</strong> Marque <strong>authenticated</strong>.</li>
                                 <li>No campo <strong>"USING expression"</strong>, cole: <code className="bg-neutral-200 px-1 rounded">auth.uid() = '{process.env.VITE_ADMIN_USER_ID}' AND is_used = false</code></li>
                                <li>Clique em <strong>"Review"</strong> e <strong>"Save policy"</strong>.</li>
                            </ol>
                        </div>
                    </div>
                );
                setError(rlsErrorGuide);
            } else {
                setError("Ocorreu um erro ao buscar os códigos. Verifique o console para mais detalhes.");
            }
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCodes();
    }, [fetchCodes]);

    const generateCodes = async () => {
        setIsLoading(true);
        try {
            const newCodes = Array.from({ length: numToGenerate }, () => ({
                code: `MJ-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
            }));
            await createAccessCodes(newCodes);
            addToast(`${numToGenerate} novo(s) código(s) gerado(s) com sucesso!`, 'success');
            fetchCodes();
        } catch (err) {
            setError("Falha ao gerar códigos. Verifique suas permissões de INSERT.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (codeId: number) => {
        if (window.confirm("Tem certeza que deseja excluir este código? Esta ação não pode ser desfeita.")) {
            try {
                await deleteAccessCode(codeId);
                addToast("Código excluído com sucesso.", 'success');
                setCodes(prev => prev.filter(c => c.id !== codeId));
            } catch (err) {
                setError("Falha ao excluir o código. Você só pode excluir códigos não utilizados. Verifique suas permissões de DELETE.");
                console.error(err);
            }
        }
    };
    
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        addToast("Código copiado para a área de transferência!", "success");
    };

    if (error) {
        return <div className="p-6 bg-red-50 rounded-lg border border-red-200 shadow-soft">{error}</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-neutral-900">Gerenciamento de Códigos</h1>
                <p className="text-neutral-800">Crie e gerencie os códigos de acesso para seus clientes.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-soft">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">Gerar Novos Códigos</h2>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[120px]">
                        <label htmlFor="numToGenerate" className="block text-sm font-medium text-neutral-800">Quantidade</label>
                        <input
                            id="numToGenerate"
                            type="number"
                            min="1"
                            max="50"
                            value={numToGenerate}
                            onChange={(e) => setNumToGenerate(Number(e.target.value))}
                            className="mt-1 w-full p-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <button onClick={generateCodes} disabled={isLoading} className="self-end flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-md font-semibold hover:bg-primary-dark transition-colors disabled:bg-red-300">
                        {isLoading ? <Loader size={18} className="animate-spin" /> : <PlusCircle size={18} />}
                        Gerar
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-soft">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">Códigos Existentes</h2>
                {isLoading && !codes.length ? (
                    <div className="flex justify-center items-center py-8">
                        <Loader className="animate-spin text-primary" size={32} />
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                        {codes.map(code => (
                            <div key={code.id} className="p-3 rounded-md bg-neutral-100 flex flex-wrap justify-between items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <Key className="text-neutral-800" size={20}/>
                                    <span className="font-mono font-semibold text-neutral-900">{code.code}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                     <span className={`flex items-center gap-2 text-sm font-medium ${code.is_used ? 'text-neutral-800' : 'text-primary'}`}>
                                        {code.is_used ? <CheckCircle size={16} /> : <Circle size={16} />}
                                        {code.is_used ? 'Usado' : 'Disponível'}
                                    </span>
                                    {!code.is_used && (
                                        <>
                                         <button onClick={() => copyToClipboard(code.code)} title="Copiar" className="text-neutral-800 hover:text-primary-dark p-1.5 rounded-full hover:bg-neutral-200">
                                            <Clipboard size={16} />
                                         </button>
                                         <button onClick={() => handleDelete(code.id)} title="Excluir" className="text-red-500 hover:text-red-700 p-1.5 rounded-full hover:bg-red-100">
                                             <Trash size={16} />
                                         </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                         {codes.length === 0 && <p className="text-center text-neutral-800 py-8">Nenhum código encontrado. Que tal gerar alguns?</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPage;