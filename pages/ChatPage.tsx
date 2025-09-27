import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage } from '../types';
import { useApp } from '../App';
import { getGeminiResponse } from '../services/geminiService';
import { Send, BrainCircuit } from 'lucide-react';


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
        } catch (error) {
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: 'Erro ao conectar. Tente novamente.',
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

    return (
        <div className="flex flex-col h-full max-h-[80vh] md:max-h-full bg-white rounded-lg shadow-soft">
            <div className="p-4 border-b border-neutral-200 flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <BrainCircuit className="text-primary-dark" size={28}/>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-neutral-900">Fit28 AI</h2>
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
                        <button key={index} onClick={() => handleQuickReply(reply)} className="flex-shrink-0 bg-green-100 text-primary-dark text-sm px-3 py-1 rounded-full hover:bg-green-200 transition-colors">
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
                    <button onClick={handleSend} disabled={isLoading} className="bg-primary text-white p-2 rounded-md disabled:bg-green-300 hover:bg-primary-dark transition-colors">
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;