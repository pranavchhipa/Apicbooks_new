import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useStreak() {
    const supabase = createClient();

    useEffect(() => {
        const checkStreak = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('current_streak, last_visited_at')
                .eq('id', user.id)
                .single();

            if (!profile) return;

            const now = new Date();
            const lastVisit = new Date(profile.last_visited_at);

            // Normalize to midnight to compare "days" provided it's local time or simplified UTC handling
            // For robustness, let's use UTC days.
            const todayStr = now.toISOString().split('T')[0];
            const lastVisitStr = lastVisit.toISOString().split('T')[0];

            if (todayStr === lastVisitStr) {
                // Already visited today, do nothing
                return;
            }

            // Check if last visit was yesterday
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            let newStreak = profile.current_streak;

            if (lastVisitStr === yesterdayStr) {
                // Consecutive day
                newStreak += 1;
            } else {
                // Broken streak
                newStreak = 1;
            }

            // Update DB
            await supabase
                .from('profiles')
                .update({
                    current_streak: newStreak,
                    last_visited_at: now.toISOString()
                })
                .eq('id', user.id);

            console.log(`Streak updated to ${newStreak}`);
        };

        checkStreak();
    }, []);
}
