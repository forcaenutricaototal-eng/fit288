
export interface UserProfile {
  name: string;
  age: number;
  weight: number;
  height: number;
  goal: string;
  dietaryRestrictions: string[];
  weightGoal: number;
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
}
