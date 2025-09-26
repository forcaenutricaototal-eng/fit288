import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage } from '../types';
import { useApp } from '../App';
import { getGeminiResponse } from '../services/geminiService';
import { Send, CornerDownLeft, BrainCircuit } from 'lucide-react';


const ChatPage: React.FC = () => {
    const { userProfile } = useApp();
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', text: `Olá, ${userProfile?.name}! Sou sua nutricionista IA. Como posso te ajudar hoje?`, sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = useCallback(async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: ChatMessage = { id: Date.now().toString(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const loadingMessage: ChatMessage = { id: 'loading', text: '...', sender: 'ai', isLoading: true };
        setMessages(prev => [...prev, loadingMessage]);

        const chatHistory = messages.map(m => ({
            role: m.sender === 'user' ? 'user' as const : 'model' as const,
            parts: [{ text: m.text }],
        }));

        try {
            const aiResponseText = await getGeminiResponse(chatHistory, input, userProfile);
            const aiMessage: ChatMessage = { id: (Date.now() + 1).toString(), text: aiResponseText, sender: 'ai' };
            setMessages(prev => [...prev.filter(m => !m.isLoading), aiMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = { id: (Date.now() + 1).toString(), text: 'Erro ao conectar. Tente novamente.', sender: 'ai' };
            setMessages(prev => [...prev.filter(m => !m.isLoading), errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, messages, userProfile]);
    
    const quickReplies = [
        "O que posso comer no café da manhã?",
        "Me dê uma dica para não sair da dieta.",
        "Posso trocar frango por peixe hoje?"
    ];

    const handleQuickReply = (text: string) => {
        setInput(text);
    };

    return (
        <div className="flex flex-col h-full max-h-[80vh] md:max-h-full bg-white rounded-2xl shadow-lg">
            <div className="p-4 border-b flex items-center space-x-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <BrainCircuit className="text-emerald-600" size={28}/>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Fit28 AI</h2>
                    <p className="text-sm text-gray-500 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Online
                    </p>
                </div>
            </div>
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${msg.sender === 'user' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                                {msg.isLoading ? (
                                    <div className="flex items-center space-x-1">
                                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></span>
                                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-75"></span>
                                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></span>
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
            
            <div className="p-4 border-t">
                 <div className="flex space-x-2 mb-3 overflow-x-auto pb-2">
                    {quickReplies.map((reply, index) => (
                        <button key={index} onClick={() => handleQuickReply(reply)} className="flex-shrink-0 bg-emerald-100 text-emerald-800 text-sm px-3 py-1 rounded-full hover:bg-emerald-200 transition-colors">
                           {reply}
                        </button>
                    ))}
                </div>
                <div className="flex items-center bg-gray-100 rounded-xl p-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 bg-transparent border-none focus:ring-0 outline-none px-2"
                        disabled={isLoading}
                    />
                    <button onClick={handleSend} disabled={isLoading} className="bg-emerald-600 text-white p-2 rounded-lg disabled:bg-emerald-300 hover:bg-emerald-700 transition-colors">
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;