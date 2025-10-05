import type { GamificationData, UserProfile, CheckInData, Badge } from '../types';
import { ALL_BADGES } from '../data/badges';

export const checkAndAwardBadges = (
    gamificationData: GamificationData,
    userProfile: UserProfile | null,
    checkIns: CheckInData[]
): Badge[] => {
    const newlyEarned: Badge[] = [];
    const now = new Date().toISOString();

    if (!userProfile) return [];

    const hasBadge = (id: string) => gamificationData.badges.some(b => b.id === id);

    // First Check-in Badge (after onboarding check-in)
    if (checkIns.length > 0 && !hasBadge('firstCheckIn')) {
        newlyEarned.push({ ...ALL_BADGES.firstCheckIn, earnedOn: now });
    }
    
    // Streak Badges
    if (gamificationData.streak >= 3 && !hasBadge('streak3')) {
        newlyEarned.push({ ...ALL_BADGES.streak3, earnedOn: now });
    }
    if (gamificationData.streak >= 7 && !hasBadge('streak7')) {
        newlyEarned.push({ ...ALL_BADGES.streak7, earnedOn: now });
    }

    // Point Collector Badges
    if (gamificationData.points >= 100 && !hasBadge('pointCollector100')) {
        newlyEarned.push({ ...ALL_BADGES.pointCollector100, earnedOn: now });
    }
    if (gamificationData.points >= 500 && !hasBadge('pointCollector500')) {
        newlyEarned.push({ ...ALL_BADGES.pointCollector500, earnedOn: now });
    }
    
    // Goal Reached Badge - now with safety checks for optional properties
    if (userProfile.weight && userProfile.weight_goal && userProfile.weight <= userProfile.weight_goal && !hasBadge('goalReached')) {
         newlyEarned.push({ ...ALL_BADGES.goalReached, earnedOn: now });
    }

    return newlyEarned;
};