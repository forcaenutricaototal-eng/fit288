
export interface UserProfile {
  name: string;
  age: number;
  weight: number;
  height: number;
  goal: string;
  dietaryRestrictions: string[];
}

export interface Recipe {
  id: number;
  name: string;
  description: string;
  image: string;
  ingredients: string[];
  instructions: string[];
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  isLoading?: boolean;
}

export interface DailyPlan {
    day: number;
    meals: {
        breakfast: string;
        lunch: string;
        dinner: string;
        snack?: string;
    };
    tasks: string[];
}
