import React from 'react';
import { BookText } from 'lucide-react';

const EbookPage: React.FC = () => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-neutral-900 flex items-center gap-2">
                    <BookText className="text-primary"/>
                    E-book: Monjaro Japonês
                </h1>
                <p className="text-neutral-800">Seu guia para a transformação.</p>
            </div>

            <article className="bg-white p-6 md:p-8 rounded-lg shadow-soft prose prose-sm md:prose-base max-w-none">
                <h2 className="text-lg md:text-xl font-bold text-neutral-900 !mb-1">
                   Monjaro Japonês — Programa Simone Tavares
                </h2>
                <h3 className="text-md md:text-lg font-semibold text-primary-dark !mt-2 !mb-4">
                   Conclusão — Próximos passos
                </h3>

                <p>
                    O Monjaro Japonês é um convite para reaprender a comer, se mover e viver com atenção. É um método de autocuidado que ensina o corpo a liberar seus próprios mensageiros de saciedade — naturalmente.
                </p>
                
            </article>
        </div>
    );
};

export default EbookPage;
