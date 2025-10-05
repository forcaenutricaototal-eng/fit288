export interface UserProfile {
  id: string;
  name: string;
  age?: number;
  weight?: number;
  height?: number;
  dietary_restrictions?: string[];
  weight_goal?: number;
  created_at: string;
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
