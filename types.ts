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
  user_id: string;
  points: number;
  streak: number;
  longest_streak: number;
  last_check_in_date: string | null;
  badges: Badge[];
  completed_items_by_day: { [day: number]: { [itemId: string]: boolean } };
}

export interface UserProfile {
  user_id: string;
  name: string;
  age: number;
  weight: number;
  height: number;
  dietary_restrictions: string[];
  weight_goal: number;
  gender: string;
  created_at: string;
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
        snack: Recipe;
    };
    tasks: string[];
}

export interface CheckInData {
  id?: number;
  user_id: string;
  day: number;
  weight: number;
  water_intake: number;
  fluid_retention: number; // 1 to 3
  waist?: number;
  hips?: number;
  neck?: number;
  right_arm?: number;
  left_arm?: number;
  right_thigh?: number;
  left_thigh?: number;
  observations?: string;
  created_at?: string;
}