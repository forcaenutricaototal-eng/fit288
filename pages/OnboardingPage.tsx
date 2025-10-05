import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { ChevronRight, Scale, Ruler, User, ChevronLeft, PersonStanding, Target, Loader } from 'lucide-react';
import type { UserProfile } from '../types';


const OnboardingPage: React.FC = () => {
  const { completeOnboarding, user } = useApp();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    age: undefined,
    weight: undefined,
    height: undefined,
    weight_goal: undefined,
    dietary_restrictions: [],
  });
  
  const numericFields = ['age', 'weight', 'height', 'weight_goal'];
  
  useEffect(() => {
    if (user?.user_metadata?.name && !formData.name) {
      setFormData(prev => ({ ...prev, name: user.user_metadata.name as string }));
    }
  }, [user, formData.name]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: numericFields.includes(name) ? (value === '' ? undefined : Number(value)) : value }));
  };

  const totalSteps = 2;
  
  const handleSubmit = async () => {
    setError(null);
    const isDataValid =
      formData.name && formData.name.trim() !== '' &&
      typeof formData.age === 'number' && !isNaN(formData.age) && formData.age > 0 &&
      typeof formData.weight === 'number' && !isNaN(formData.weight) && formData.weight > 0 &&
      typeof formData.height === 'number' && !isNaN(formData.height) && formData.height > 0 &&
      typeof formData.weight_goal === 'number' && !isNaN(formData.weight_goal) && formData.weight_goal > 0;

    if (isDataValid && user) {
        setIsLoading(true);
        try {
            await completeOnboarding(formData as Omit<UserProfile, 'id' | 'created_at'>);
            // App.tsx will handle redirection
        } catch (e: any) {
            console.error("Erro ao completar onboarding:", e);
            setError(e.message || "Ocorreu um erro ao salvar seu perfil. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    } else {
      setError("Ops! Parece que alguns dados obrigatórios não foram preenchidos ou são inválidos. Por favor, verifique os passos e tente novamente.");
    }
  };

  const nextStep = () => {
    if (step < totalSteps) setStep((prev) => prev + 1);
    else handleSubmit();
  };
  
  const prevStep = () => {
    if (step > 1) setStep(prev => prev - 1);
  };
  
  const progress = (step / totalSteps) * 100;

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h2 className="text-3xl font-bold text-neutral-900 mb-2">Seu perfil!</h2>
            <p className="text-neutral-800 mb-8">Informações básicas para personalizar seu plano.</p>
            <div className="bg-white p-6 rounded-lg shadow-soft space-y-6">
               <div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Seu nome</h3>
                  <div className="flex items-center bg-neutral-100 rounded-md p-3">
                      <User className="text-gray-400 mr-3" size={20} />
                      <input type="text" name="name" placeholder="Nome completo" className="w-full bg-transparent focus:outline-none" value={formData.name} onChange={handleChange} />
                  </div>
               </div>
               <div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Qual a sua idade?</h3>
                  <div className="flex items-center bg-neutral-100 rounded-md p-3">
                      <User className="text-gray-400 mr-3" size={20} />
                      <input type="number" name="age" placeholder="Sua idade" className="w-full bg-transparent focus:outline-none" value={formData.age === undefined ? '' : formData.age} onChange={handleChange} />
                  </div>
               </div>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <h2 className="text-3xl font-bold text-neutral-900 mb-2">Suas medidas e metas</h2>
            <p className="text-neutral-800 mb-8">Esses dados nos ajudam a acompanhar sua evolução.</p>
            <div className="bg-white p-6 rounded-lg shadow-soft space-y-6">
              <div>
                <h3 className="font-semibold text-neutral-900">Qual seu peso e altura?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
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
              <div>
                <h3 className="font-semibold text-neutral-900">Qual sua meta de peso para 28 dias?</h3>
                 <div className="flex items-center bg-neutral-100 rounded-md p-3 mt-2">
                    <Target className="text-gray-400 mr-2" size={20} />
                    <input type="number" name="weight_goal" placeholder="Meta de peso (kg)" className="w-full bg-transparent focus:outline-none" value={formData.weight_goal === undefined ? '' : formData.weight_goal} onChange={handleChange} />
                </div>
              </div>
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
            {error && <p className="text-center text-red-500 font-semibold mt-4 bg-red-50 p-3 rounded-md">{error}</p>}
        </div>
      </div>

      <div className="w-full max-w-md mx-auto mt-8 flex items-center gap-4">
          {step > 1 && (
            <button
                onClick={prevStep}
                disabled={isLoading}
                className="bg-white text-primary font-bold py-4 px-6 rounded-lg hover:bg-neutral-200 transition-colors shadow-soft flex items-center justify-center disabled:opacity-50"
                aria-label="Voltar para o passo anterior"
            >
                <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <button 
            onClick={nextStep} 
            disabled={isLoading}
            className="flex-1 bg-primary text-white font-bold py-4 rounded-lg hover:bg-primary-dark transition-all duration-300 transform hover:scale-105 shadow-md flex items-center justify-center disabled:bg-green-300 disabled:scale-100"
          >
            {isLoading ? <Loader className="animate-spin" size={20}/> : (step < totalSteps ? 'Continuar' : 'Concluir')} 
            {!isLoading && <ChevronRight className="ml-2 h-5 w-5"/>}
          </button>
      </div>
    </div>
  );
};

export default OnboardingPage;