import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage } from '../types';
import { useApp } from '../App';
import { getGeminiResponse } from '../services/geminiService';
import { Send, BrainCircuit } from 'lucide-react';

const ApiKeyErrorComponent: React.FC<{ onRetry: () => void; featureName: string }> = ({ onRetry, featureName }) => (
    <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200 shadow-soft animate-fade-in h-full flex flex-col justify-center">
        <div>
            <h3 className="font-bold text-lg text-red-700 mb-2">Configuração da API Necessária</h3>
            <p className="text-neutral-800 mb-4 max-w-2xl mx-auto">
                Para que {featureName} funcione, o aplicativo precisa se conectar ao serviço de inteligência artificial (Google Gemini). A chave da API não foi encontrada.
            </p>
            <div className="bg-white p-4 rounded-md border border-neutral-200 text-left space-y-3">
                <p className="font-semibold text-neutral-900">Como Resolver (Passo Final):</p>
                <ol className="list-decimal list-inside space-y-3 text-sm text-neutral-800">
                    <li>
                        <strong>Verifique a Chave na Vercel:</strong> Confirme se a variável <code className="bg-neutral-200 px-1 rounded">VITE_API_KEY</code> existe em <code className="bg-neutral-200 px-1 rounded">Settings → Environment Variables</code>. O nome deve começar com <code className="bg-neutral-200 px-1 rounded">VITE_</code>.
                    </li>
                    <li>
                        <strong>Faça o Redeploy Forçado (com Cache Limpo):</strong> Esta etapa é <strong>essencial</strong> para garantir que a Vercel use a nova chave. Às vezes, o cache antigo pode causar problemas.
                        <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                            <li>Vá para a aba <code className="bg-neutral-200 px-1 rounded">Deployments</code> no seu projeto Vercel.</li>
                            <li>Encontre o deploy mais recente, clique no menu de três pontinhos (•••) e selecione <strong>"Redeploy"</strong>.</li>
                            <li>Na janela de confirmação, <strong>desmarque a opção "Use existing Build Cache"</strong> e clique em "Redeploy".</li>
                        </ul>
                    </li>
                </ol>
            </div>
            <button 
                onClick={onRetry} 
                className="mt-6 bg-primary text-white font-semibold px-6 py-2 rounded-md hover:bg-primary-dark transition-colors"
            >
                Tentar Novamente
            </button>
        </div>
    </div>
);


const ChatPage: React.FC = () => {
    const { userProfile } = useApp();
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', text: `Olá, ${userProfile?.name}! Eu sou a Luna, sua nutricionista virtual. Fico muito feliz em te acompanhar na sua jornada! 😊\n\nPara começarmos com o pé direito, eu tenho uma recomendação especial: o nosso e-book "Monjaro Japonês". É um guia fantástico que te ensina a reaprender a comer e a viver com mais atenção. É o primeiro passo perfeito para a sua transformação! ✨\n\nVocê pode acessá-lo a qualquer momento na seção "E-book" do menu.\n\nComo posso te ajudar agora?`, sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [configError, setConfigError] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessageAndGetResponse = useCallback(async (messageText: string) => {
        if (messageText.trim() === '' || isLoading) return;

        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          text: messageText,
          sender: 'user',
        };
        
        setIsLoading(true);
        // Add user message and a loading message to the state
        setMessages(prev => [
          ...prev,
          userMessage,
          { id: 'loading', text: '...', sender: 'ai', isLoading: true },
        ]);
        
        // Construct history from the previous messages
        const chatHistory = messages
          .filter(msg => msg.id !== '1') // Filter out the initial greeting
          .map(m => ({
            role: m.sender === 'user' ? ('user' as const) : ('model' as const),
            parts: [{ text: m.text }],
          }));

        try {
            const aiResponseText = await getGeminiResponse(chatHistory, messageText, userProfile);
            const aiMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: aiResponseText,
                sender: 'ai',
            };
            // Replace loading message with the actual AI response
            setMessages(prev => [...prev.filter(m => !m.isLoading), aiMessage]);
        } catch (error: any) {
            console.error("Chat Error:", error);
            if (error.message && error.message.includes("A chave da API Gemini não foi encontrada")) {
                setConfigError(error.message);
                setMessages(prev => prev.filter(m => !m.isLoading && m.id !== userMessage.id)); // Remove loading and user message
                return;
            }
            // The error message from geminiService is already user-friendly.
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: error.message,
                sender: 'ai',
            };
            setMessages(prev => [...prev.filter(m => !m.isLoading), errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, messages, userProfile]);
    
    const handleSend = () => {
        if (input.trim()) {
            sendMessageAndGetResponse(input);
            setInput('');
        }
    };

    const handleQuickReply = (text: string) => {
        sendMessageAndGetResponse(text);
    };

    const quickReplies = [
        "O que posso comer no café da manhã?",
        "Me dê uma dica para não sair da dieta.",
        "Posso trocar frango por peixe hoje?"
    ];

    if (configError) {
        return <ApiKeyErrorComponent onRetry={() => setConfigError(null)} featureName="o chat com a IA" />;
    }

    return (
        <div className="flex flex-col h-full max-h-[80vh] md:max-h-full bg-white rounded-lg shadow-soft">
            <div className="p-4 border-b border-neutral-200 flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
                    <BrainCircuit className="text-primary-dark" size={28}/>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-neutral-900">Monjaro Japonês AI</h2>
                    <p className="text-sm text-neutral-800 flex items-center">
                        <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                        Online
                    </p>
                </div>
            </div>
            <div className="flex-1 p-6 overflow-y-auto bg-neutral-100">
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex items-end ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${msg.sender === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-white text-neutral-900 rounded-bl-none border border-neutral-200'}`}>
                                {msg.isLoading ? (
                                    <div className="flex items-center space-x-1">
                                        <span className="w-2 h-2 bg-neutral-800 rounded-full animate-pulse"></span>
                                        <span className="w-2 h-2 bg-neutral-800 rounded-full animate-pulse delay-75"></span>
                                        <span className="w-2 h-2 bg-neutral-800 rounded-full animate-pulse delay-150"></span>
                                    </div>
                                ) : (
                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <div ref={chatEndRef} />
            </div>
            
            <div className="p-4 border-t border-neutral-200 bg-white rounded-b-lg">
                 <div className="flex space-x-2 mb-3 overflow-x-auto pb-2">
                    {quickReplies.map((reply, index) => (
                        <button key={index} onClick={() => handleQuickReply(reply)} className="flex-shrink-0 bg-primary-light text-primary-dark text-sm px-3 py-1 rounded-full hover:bg-red-200 transition-colors">
                           {reply}
                        </button>
                    ))}
                </div>
                <div className="flex items-center bg-neutral-100 rounded-md p-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 bg-transparent border-none focus:ring-0 outline-none px-2 text-neutral-900"
                        disabled={isLoading}
                    />
                    <button onClick={handleSend} disabled={isLoading} className="bg-primary text-white p-2 rounded-md disabled:bg-red-300 hover:bg-primary-dark transition-colors">
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
