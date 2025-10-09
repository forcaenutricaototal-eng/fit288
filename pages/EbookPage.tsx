import React from 'react';
import { BookText, BookOpen, Leaf, Pill, Brain, Sparkles, MessageCircle, Flower } from 'lucide-react';

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

            <article className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-soft prose prose-neutral prose-sm md:prose-base max-w-none 
                                prose-h2:text-center prose-h2:text-xl prose-h2:sm:text-2xl prose-h2:md:text-3xl prose-h2:font-bold prose-h2:text-neutral-900
                                prose-h3:text-lg prose-h3:sm:text-xl prose-h3:font-bold prose-h3:flex prose-h3:items-center prose-h3:gap-3 prose-h3:mt-8
                                prose-h4:font-semibold prose-h4:mt-6
                                prose-p:leading-relaxed
                                prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:py-2 prose-blockquote:bg-primary-light prose-blockquote:text-primary-dark prose-blockquote:font-semibold prose-blockquote:italic
                                ">
                <h2>📘 Monjaro Japonês: O Segredo Natural dos Japoneses para Permanecerem Magros</h2>
                <p className="text-center italic text-base md:text-lg text-neutral-800 !mt-2 !mb-8">Como hábitos milenares estimulam naturalmente os hormônios da saciedade e substituem a necessidade de remédios modernos</p>

                <hr className="!my-8 border-neutral-200" />
                
                <h3><BookOpen className="text-primary"/>Introdução – O Poder da Cultura Japonesa</h3>
                <p>Por que o Japão é um dos países mais magros e longevos do mundo, mesmo sendo altamente desenvolvido e cheio de opções alimentares modernas?</p>
                <p>A resposta está na filosofia de vida e na forma como os japoneses se relacionam com a comida, o corpo e o ambiente. Enquanto no Ocidente a busca pela perda de peso se apoia em medicamentos e dietas restritivas, os japoneses estimulam naturalmente seus hormônios da saciedade através de uma rotina simples, consciente e prazerosa.</p>
                <p>Esse é o princípio do que chamamos de “Monjaro Japonês” — o método natural que ativa os mesmos mecanismos do remédio moderno Mounjaro (tirzepatida), mas de forma fisiológica, equilibrada e sustentável.</p>

                <hr className="!my-8 border-neutral-200" />

                <h3>🇯🇵 Capítulo 1 – Por que os Japoneses São Magros e Saudáveis</h3>
                <h4>Alimentação natural e equilibrada</h4>
                <p>A dieta japonesa é rica em peixes, vegetais, chás, arroz, algas e alimentos fermentados — ingredientes que nutrem, reduzem inflamações e mantêm o intestino saudável. ➝ O intestino equilibrado libera mais GLP-1, PYY e CCK, hormônios ligados à saciedade e ao controle natural da fome.</p>
                <h4>Hara Hachi Bu – Comer até 80% da saciedade</h4>
                <p>Um dos princípios centrais da cultura japonesa é parar de comer antes de se sentir completamente cheio. Isso mantém o sistema digestivo leve, reduz picos de insulina e ajuda o corpo a liberar GLP-1 e leptina de maneira constante — evitando a fome emocional e o comer por impulso.</p>
                <h4>Koshoku – Pequenas porções e variedade</h4>
                <p>Ao invés de um prato único e cheio, os japoneses servem várias pequenas porções coloridas e equilibradas. Essa variedade estimula diferentes vias hormonais e neurais de prazer e saciedade, sem sobrecarregar o sistema digestivo.</p>
                <h4>Alimentação consciente (Mindful Eating)</h4>
                <p>Comer devagar, mastigar bem, estar presente e saborear cada refeição. ➝ Esse simples hábito melhora a sinalização dos hormônios CCK e PYY, além de aumentar a dopamina e serotonina, neurotransmissores do prazer e do bem-estar.</p>
                <h4>Movimento constante e respiração consciente</h4>
                <p>No Japão, o movimento é natural — caminhar, andar de bicicleta, praticar alongamentos, cultivar jardins. ➝ A atividade física leve e frequente estimula GLP-1, noradrenalina e dopamina, equilibrando o centro da saciedade no cérebro.</p>
                
                <hr className="!my-8 border-neutral-200" />

                <h3><Pill className="text-primary"/>Capítulo 2 – O Mounjaro Medicamentoso e os Hormônios da Saciedade</h3>
                <p>O Mounjaro (tirzepatida) é um medicamento moderno que age imitando os hormônios GLP-1 e GIP, responsáveis por:</p>
                <ul>
                    <li>Reduzir o apetite,</li>
                    <li>Aumentar a saciedade,</li>
                    <li>Diminuir a velocidade de esvaziamento gástrico,</li>
                    <li>Melhorar a sensibilidade à insulina.</li>
                </ul>
                <p>Mas o que quase ninguém sabe é que a alimentação e o estilo de vida japoneses estimulam esses mesmos hormônios naturalmente — e ainda ativam outros mensageiros importantes que o medicamento não alcança, como:</p>
                <div className="overflow-x-auto my-6">
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th>Sistema Natural</th>
                                <th>Efeito</th>
                                <th>Estímulo Japonês</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>GLP-1</td>
                                <td>Sinaliza saciedade e regula glicemia</td>
                                <td>Comer devagar, fibras, chás e alimentos fermentados</td>
                            </tr>
                            <tr>
                                <td>CCK</td>
                                <td>Reduz o apetite após a refeição</td>
                                <td>Mastigação prolongada e gorduras boas (como peixes)</td>
                            </tr>
                            <tr>
                                <td>PYY</td>
                                <td>Controla o apetite no intestino</td>
                                <td>Pequenas porções e refeições equilibradas</td>
                            </tr>
                            <tr>
                                <td>Leptina</td>
                                <td>Mantém o equilíbrio de gordura corporal</td>
                                <td>Sono adequado, constância e alimentação natural</td>
                            </tr>
                             <tr>
                                <td>Dopamina / Serotonina / Noradrenalina</td>
                                <td>Controlam prazer, humor e impulsos alimentares</td>
                                <td>Exercício leve, chá verde, respiração e equilíbrio emocional</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <hr className="!my-8 border-neutral-200" />

                <h3><Leaf className="text-primary"/>Capítulo 3 – O “Monjaro Japonês” Natural</h3>
                <p>Chamamos de Monjaro Japonês o método natural e estratégico de alimentação e estilo de vida que ativa os mesmos mecanismos de saciedade do remédio, mas sem dependência química ou efeitos colaterais.</p>
                <p>👉 Ele é mais eficaz a longo prazo porque:</p>
                <ul>
                    <li>Atua em múltiplos hormônios e neurotransmissores, não apenas em um ou dois.</li>
                    <li>Reforça a autonomia do corpo para regular fome e saciedade.</li>
                    <li>Promove equilíbrio mental e emocional, reduzindo compulsões.</li>
                </ul>
                <h4>Os 5 pilares do Monjaro Japonês Natural:</h4>
                <ol>
                    <li><strong>Hara Hachi Bu</strong> – Pare antes de estar cheio.</li>
                    <li><strong>Comida de verdade</strong> – Natural, colorida e anti-inflamatória.</li>
                    <li><strong>Mindful Eating</strong> – Coma com atenção, sem distrações.</li>
                    <li><strong>Movimento constante</strong> – Caminhe, respire e alongue-se.</li>
                    <li><strong>Rotina equilibrada</strong> – Sono, chá verde e serenidade.</li>
                </ol>

                <hr className="!my-8 border-neutral-200" />

                <h3><Brain className="text-primary"/>Capítulo 4 – Como Estimular Naturalmente o GLP-1 e os Hormônios da Saciedade</h3>
                <h4>🥢 Alimentação estratégica:</h4>
                <p>Inclua proteínas magras, fibras solúveis, chás e gorduras boas — eles ativam o GLP-1 natural.</p>
                <h4>🧘‍♀️ Respiração e relaxamento:</h4>
                <p>O estresse reduz dopamina e serotonina, sabotando a saciedade. Técnicas japonesas de respiração lenta e atenção plena restauram o equilíbrio.</p>
                <h4>🚶 Movimento leve e constante:</h4>
                <p>O exercício regular estimula GLP-1 e dopamina, melhorando humor e controle do apetite.</p>
                <h4>🌿 Sono e rotina:</h4>
                <p>Dormir bem regula leptina e grelina, hormônios diretamente ligados ao peso corporal.</p>

                <hr className="!my-8 border-neutral-200" />

                <h3><Sparkles className="text-primary"/>Capítulo 5 – Monjaro Medicamentoso x Monjaro Japonês Natural</h3>
                 <div className="overflow-x-auto my-6">
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th>Aspecto</th>
                                <th>Mounjaro Medicamentoso</th>
                                <th>Monjaro Japonês Natural</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Mecanismo</td>
                                <td>Imita GLP-1 e GIP</td>
                                <td>Estimula GLP-1, CCK, PYY, leptina e neurotransmissores</td>
                            </tr>
                            <tr>
                                <td>Resultados</td>
                                <td>Rápidos, mas dependentes do uso</td>
                                <td>Progressivos e permanentes</td>
                            </tr>
                            <tr>
                                <td>Efeitos colaterais</td>
                                <td>Náuseas, enjoo, risco de reganho</td>
                                <td>Nenhum</td>
                            </tr>
                            <tr>
                                <td>Custo</td>
                                <td>Alto, com prescrição médica</td>
                                <td>Natural e gratuito</td>
                            </tr>
                             <tr>
                                <td>Filosofia</td>
                                <td>Dependência de medicação</td>
                                <td>Autonomia e consciência corporal</td>
                            </tr>
                        </tbody>
                    </table>
                 </div>

                <hr className="!my-8 border-neutral-200" />

                <h3><MessageCircle className="text-primary"/>Capítulo 6 – O Corpo Fala a Linguagem da Natureza</h3>
                <p>Quando você aprende a se alimentar de forma consciente e estratégica, o corpo responde. A fome se estabiliza, a vontade de comer doce diminui e o prazer volta a vir da leveza — não do excesso.</p>
                <p>É isso que torna o Monjaro Japonês mais eficaz que qualquer remédio: Ele ensina o corpo a produzir seus próprios mensageiros de saciedade e bem-estar — GLP-1, CCK, PYY, leptina, dopamina, serotonina e noradrenalina — de forma natural, contínua e sustentável.</p>
                
                <hr className="!my-8 border-neutral-200" />

                <h3><Flower className="text-primary"/>Conclusão – O Caminho Japonês para o Emagrecimento Natural</h3>
                <p>O segredo japonês não está em contar calorias, e sim em respeitar o corpo, a fome e o tempo. É um método de consciência, leveza e repetição diária — não de pressa ou restrição.</p>
                <blockquote>“Quando você muda a forma de viver, o corpo se ajusta naturalmente.”</blockquote>
                <p className="!mt-6">🌿 Seja o seu próprio laboratório de equilíbrio.<br/>🍵 Viva o Monjaro Japonês.</p>
            </article>
        </div>
    );
};

export default EbookPage;