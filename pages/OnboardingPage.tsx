

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserProfile } from '../types';
import { useApp } from '../App';
import { ChevronRight, Scale, Ruler, User, ChevronLeft, PersonStanding, Dumbbell } from 'lucide-react';

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile & { retainsLiquids: boolean; }>>({
    name: '',
    age: undefined,
    weight: undefined,
    height: undefined,
    weightGoal: undefined,
    gender: 'Feminino',
    activityLevel: 'Sedentário',
    retainsLiquids: false,
    goal: 'Perda de peso',
    dietaryRestrictions: [],
  });
  
  const numericFields = ['age', 'weight', 'height', 'weightGoal'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: numericFields.includes(name) ? (value === '' ? undefined : Number(value)) : value }));
  };
  
  const handleToggle = (name: string, value: boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (step < totalSteps) setStep((prev) => prev + 1);
    else handleSubmit();
  };
  
  const prevStep = () => {
    if (step > 1) setStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    const isDataValid =
      formData.name && formData.name.trim() !== '' &&
      typeof formData.age === 'number' && !isNaN(formData.age) && formData.age > 0 &&
      typeof formData.weight === 'number' && !isNaN(formData.weight) && formData.weight > 0 &&
      typeof formData.height === 'number' && !isNaN(formData.height) && formData.height > 0 &&
      typeof formData.weightGoal === 'number' && !isNaN(formData.weightGoal) && formData.weightGoal > 0 &&
      formData.goal && formData.gender && formData.activityLevel;

    if (isDataValid) {
      const { retainsLiquids, ...profile } = formData;
      completeOnboarding(profile as UserProfile);
      navigate('/dashboard');
    } else {
      alert("Ops! Parece que alguns dados obrigatórios não foram preenchidos ou são inválidos. Por favor, verifique os passos anteriores e tente novamente.");
    }
  };
  
  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h2 className="text-3xl font-bold text-neutral-900 mb-2">Seu ponto de partida!</h2>
            <p className="text-neutral-800 mb-8">Informações básicas</p>
            <div className="bg-white p-6 rounded-lg shadow-soft space-y-4">
               <h3 className="font-semibold text-neutral-900 text-center">Qual o seu nome e idade?</h3>
               <div className="flex items-center bg-neutral-100 rounded-md p-3">
                  <User className="text-gray-400 mr-3" size={20} />
                  <input type="text" name="name" placeholder="Seu nome" className="w-full bg-transparent focus:outline-none" value={formData.name} onChange={handleChange} />
               </div>
                <div className="flex items-center bg-neutral-100 rounded-md p-3">
                    <User className="text-gray-400 mr-3" size={20} />
                    <input type="number" name="age" placeholder="Sua idade" className="w-full bg-transparent focus:outline-none" value={formData.age === undefined ? '' : formData.age} onChange={handleChange} />
                </div>
            </div>
          </>
        );
      case 2:
        return (
           <>
            <h2 className="text-3xl font-bold text-neutral-900 mb-2">Sobre você</h2>
            <p className="text-neutral-800 mb-8">Esses dados ajudam a personalizar o plano.</p>
            <div className="bg-white p-6 rounded-lg shadow-soft space-y-6">
               <div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Gênero</h3>
                  <div className="flex items-center bg-neutral-100 rounded-md p-3">
                     <PersonStanding className="text-gray-400 mr-3" size={20} />
                     <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-transparent focus:outline-none">
                        <option>Feminino</option>
                        <option>Masculino</option>
                        <option>Outro</option>
                        <option>Prefiro não dizer</option>
                     </select>
                  </div>
               </div>
               <div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Nível de Atividade Física</h3>
                  <div className="flex items-center bg-neutral-100 rounded-md p-3">
                     <Dumbbell className="text-gray-400 mr-3" size={20} />
                     <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="w-full bg-transparent focus:outline-none">
                        <option>Sedentário (pouco ou nenhum exercício)</option>
                        <option>Levemente Ativo (exercício leve 1-3 dias/semana)</option>
                        <option>Moderadamente Ativo (exercício moderado 3-5 dias/semana)</option>
                        <option>Muito Ativo (exercício intenso 6-7 dias/semana)</option>
                     </select>
                  </div>
               </div>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <h2 className="text-3xl font-bold text-neutral-900 mb-2">Suas medidas atuais</h2>
            <p className="text-neutral-800 mb-8">Esses dados nos ajudam a acompanhar sua evolução.</p>
            <div className="bg-white p-6 rounded-lg shadow-soft space-y-4">
              <h3 className="font-semibold text-neutral-900">Peso e altura</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center bg-neutral-100 rounded-md p-3">
                  <Scale className="text-gray-400 mr-2" size={20} />
                  <input type="number" name="weight" placeholder="Peso (kg)" className="w-full bg-transparent focus:outline-none" value={formData.weight === undefined ? '' : formData.weight} onChange={handleChange} />
                </div>
                <div className="flex items-center bg-neutral-100 rounded-md p-3">
                  <Ruler className="text-gray-400 mr-2" size={20} />
                  <input type="number" name="height" placeholder="Altura (cm)" className="w-full bg-transparent focus:outline-none" value={formData.height === undefined ? '' : formData.height} onChange={handleChange} />
                </div>
              </div>
            </div>
          </>
        );
      case 4:
         return (
          <>
            <h2 className="text-3xl font-bold text-neutral-900 mb-2">Definindo suas metas</h2>
            <p className="text-neutral-800 mb-8">Onde você quer chegar?</p>
            <div className="bg-white p-6 rounded-lg shadow-soft space-y-6">
                <div>
                    <h3 className="font-semibold text-neutral-900 mb-2">Qual sua meta de peso para 28 dias?</h3>
                     <div className="flex items-center bg-neutral-100 rounded-md p-3">
                        <Scale className="text-gray-400 mr-2" size={20} />
                        <input type="number" name="weightGoal" placeholder="Meta de peso (kg)" className="w-full bg-transparent focus:outline-none" value={formData.weightGoal === undefined ? '' : formData.weightGoal} onChange={handleChange} />
                    </div>
                </div>
                 <div>
                    <h3 className="font-semibold text-neutral-900 mb-3">Você costuma reter líquidos?</h3>
                     <div className="flex bg-neutral-200 rounded-full p-1">
                        <button onClick={() => handleToggle('retainsLiquids', true)} className={`w-1/2 py-2 rounded-full font-semibold transition-colors ${formData.retainsLiquids ? 'bg-white shadow' : 'text-neutral-800'}`}>Sim</button>
                        <button onClick={() => handleToggle('retainsLiquids', false)} className={`w-1/2 py-2 rounded-full font-semibold transition-colors ${!formData.retainsLiquids ? 'bg-white shadow' : 'text-neutral-800'}`}>Não</button>
                    </div>
                </div>
            </div>
          </>
        );
      case 5:
         return (
          <>
            <h2 className="text-3xl font-bold text-neutral-900 mb-2">Preferências</h2>
            <p className="text-neutral-800 mb-8">Vamos finalizar os detalhes do seu plano.</p>
            <div className="bg-white p-6 rounded-lg shadow-soft space-y-4">
              <h3 className="font-semibold text-neutral-900">Qual seu principal objetivo?</h3>
              <select name="goal" id="goal" value={formData.goal} onChange={handleChange} className="w-full p-3 bg-neutral-100 rounded-md focus:outline-none border-2 border-transparent focus:border-primary">
                <option>Perda de peso</option>
                <option>Reduzir retenção hídrica</option>
                <option>Melhorar sensibilidade metabólica</option>
                <option>Mais energia e disposição</option>
              </select>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col justify-between p-6">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-8">
            <p className="text-center text-primary font-semibold mb-2">Passo {step} de {totalSteps}</p>
            <div className="overflow-hidden h-2 text-xs flex rounded-full bg-neutral-200">
                <div style={{ width: `${progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-500"></div>
            </div>
        </div>
        
        <div className="text-center">
            {renderStepContent()}
        </div>
      </div>

      <div className="w-full max-w-md mx-auto mt-8 flex items-center gap-4">
          {step > 1 && (
            <button
                onClick={prevStep}
                className="bg-white text-primary font-bold py-4 px-6 rounded-lg hover:bg-neutral-200 transition-colors shadow-soft flex items-center justify-center"
                aria-label="Voltar para o passo anterior"
            >
                <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <button 
            onClick={nextStep} 
            className="flex-1 bg-primary text-white font-bold py-4 rounded-lg hover:bg-primary-dark transition-all duration-300 transform hover:scale-105 shadow-md flex items-center justify-center"
          >
            {step < totalSteps ? 'Continuar' : 'Concluir'} <ChevronRight className="ml-2 h-5 w-5"/>
          </button>
      </div>
    </div>
  );
};

export default OnboardingPage;