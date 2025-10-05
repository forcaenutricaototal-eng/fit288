import { supabase } from '../components/supabaseClient';
import type { UserProfile, CheckInData, GamificationData } from '../types';

// Profile Functions
export const getProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
  return data;
};

export const createProfile = async (userId: string, name: string): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from('profiles')
    .insert({ id: userId, name: name, dietary_restrictions: [] })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateProfile = async (userId: string, updatedData: Partial<UserProfile>): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updatedData)
    .eq('id', userId)
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
    .select('user_id, completed_items_by_day')
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const createGamificationData = async (userId: string): Promise<GamificationData> => {
  const initialData = {
    user_id: userId,
    points: 0,
    streak: 0,
    longest_streak: 0,
    last_check_in_date: null,
    badges: [],
    completed_items_by_day: {},
  };
  const { data, error } = await supabase
    .from('gamification')
    .insert(initialData)
    .select('user_id, completed_items_by_day')
    .single();
  if (error) {
    console.error('Error creating gamification data:', error);
    throw error;
  }
  return data;
};

export const updateCompletedItems = async (userId: string, completedItems: { [day: number]: { [itemId: string]: boolean } }): Promise<void> => {
  const { error } = await supabase
    .from('gamification')
    .update({ completed_items_by_day: completedItems })
    .eq('user_id', userId);
  if (error) throw error;
};