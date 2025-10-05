import { supabase } from '../components/supabaseClient';
import type { UserProfile, CheckInData, GamificationData } from '../types';

// Profile Functions
export const getProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
  return data;
};

export const createProfile = async (userId: string, profileData: Omit<UserProfile, 'user_id' | 'created_at'>): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from('profiles')
    .insert({ user_id: userId, ...profileData })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateProfile = async (userId: string, updatedData: Partial<UserProfile>): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updatedData)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Check-in Functions
export const getCheckIns = async (userId: string): Promise<CheckInData[]> => {
  const { data, error } = await supabase
    .from('check_ins')
    .select('*')
    .eq('user_id', userId)
    .order('day', { ascending: true });
  if (error) throw error;
  return data;
};

export const addCheckInData = async (userId: string, checkInData: Omit<CheckInData, 'day' | 'user_id' | 'id'>, currentDay: number): Promise<CheckInData> => {
  const { data, error } = await supabase
    .from('check_ins')
    .insert({ user_id: userId, day: currentDay, ...checkInData })
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Gamification Functions
export const getGamification = async (userId: string): Promise<GamificationData | null> => {
  const { data, error } = await supabase
    .from('gamification')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const updateGamificationData = async (userId: string, updatedData: Partial<GamificationData>): Promise<GamificationData> => {
  const { data, error } = await supabase
    .from('gamification')
    .update(updatedData)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateCompletedItems = async (userId: string, completedItems: { [day: number]: { [itemId: string]: boolean } }): Promise<void> => {
  const { error } = await supabase
    .from('gamification')
    .update({ completed_items_by_day: completedItems })
    .eq('user_id', userId);
  if (error) throw error;
};
