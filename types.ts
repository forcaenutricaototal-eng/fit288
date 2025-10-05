

export type BadgeId = 
  | 'firstCheckIn'
  | 'perfectDay'
  | 'streak3'
  | 'streak7'
  | 'pointCollector100'
  | 'pointCollector500'
  | 'goalReached';


export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  icon: string;
  earnedOn: string;
}

export interface GamificationData {
  points: number;
  streak: number;
  longestStreak: number;
  lastCheckInDate: string | null;
  badges: Badge[];
}

export interface UserProfile {
  name: string;
  age: number;
  weight: number;
  height: number;
  dietaryRestrictions: string[];
  weightGoal: number;
  gender: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  isLoading?: boolean;
}

export interface Recipe {
    name: string;
    type: 'Café da Manhã' | 'Almoço' | 'Jantar' | 'Lanche';
    ingredients: string[];
    preparation: string;
    calories: number;
    carbohydrates: number;
    proteins: number;
    fats: number;
}

export interface DailyPlan {
    day: number;
    meals: {
        breakfast: Recipe;
        lunch: Recipe;
        dinner: Recipe;
        snack?: Recipe;
    };
    tasks: string[];
}


export interface CheckInData {
  day: number;
  weight: number;
  waterIntake: number;
  fluidRetention: number; // 1 to 3
  waist?: number;
  hips?: number;
  neck?: number;
  rightArm?: number;
  leftArm?: number;
  rightThigh?: number;
  leftThigh?: number;
  observations?: string;
}