'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { createClient } from '@/lib/supabase/client';
import { BookOpen, TrendingUp } from 'lucide-react';

interface MonthlyStatsChartProps {
    userId: string;
    year?: number;
}

interface MonthData {
    name: string;
    books: number;
    month: number;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function MonthlyStatsChart({ userId, year }: MonthlyStatsChartProps) {
    const [data, setData] = useState<MonthData[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalBooks, setTotalBooks] = useState(0);
    const [selectedYear, setSelectedYear] = useState(year || new Date().getFullYear());

    const supabase = createClient();

    useEffect(() => {
        const fetchMonthlyStats = async () => {
            setLoading(true);

            try {
                // Get all completed books for the user in the selected year
                const startDate = `${selectedYear}-01-01`;
                const endDate = `${selectedYear}-12-31`;

                const { data: books, error } = await supabase
                    .from('user_library')
                    .select('finished_at, updated_at')
                    .eq('user_id', userId)
                    .eq('status', 'completed')
                    .gte('updated_at', startDate)
                    .lte('updated_at', endDate);

                if (error) throw error;

                // Group by month
                const monthlyCounts: { [key: number]: number } = {};
                MONTHS.forEach((_, i) => monthlyCounts[i] = 0);

                books?.forEach(book => {
                    const date = new Date(book.finished_at || book.updated_at);
                    const month = date.getMonth();
                    monthlyCounts[month]++;
                });

                const chartData = MONTHS.map((name, i) => ({
                    name,
                    books: monthlyCounts[i],
                    month: i
                }));

                setData(chartData);
                setTotalBooks(books?.length || 0);
            } catch (error) {
                console.error('Error fetching monthly stats:', error);
                // Set empty data
                setData(MONTHS.map((name, i) => ({ name, books: 0, month: i })));
            } finally {
                setLoading(false);
            }
        };

        if (userId) fetchMonthlyStats();
    }, [userId, selectedYear]);

    const currentMonth = new Date().getMonth();
    const averagePerMonth = totalBooks > 0 ? (totalBooks / (currentMonth + 1)).toFixed(1) : '0';

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#1e2749] border border-[#2a3459] rounded-lg px-3 py-2 shadow-lg">
                    <p className="text-white font-medium">{label} {selectedYear}</p>
                    <p className="text-primary-400 text-sm">
                        {payload[0].value} {payload[0].value === 1 ? 'book' : 'books'}
                    </p>
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="bg-[#141b3d]/60 backdrop-blur-xl border border-[#1e2749] rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-slate-700 rounded w-1/3 mb-4" />
                <div className="h-48 bg-slate-700/50 rounded" />
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-[#141b3d]/80 to-[#0d1128]/80 backdrop-blur-xl border border-[#1e2749] rounded-2xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary-500/20 border border-primary-500/30">
                        <TrendingUp className="w-5 h-5 text-primary-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Reading Activity</h3>
                        <p className="text-xs text-slate-400">{selectedYear} • {totalBooks} books</p>
                    </div>
                </div>

                {/* Year Selector */}
                <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="bg-[#0a0e27] border border-[#1e2749] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary-500"
                >
                    {[2024, 2025, 2026].map(y => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
            </div>

            {/* Chart */}
            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 11 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 11 }}
                            allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
                        <Bar
                            dataKey="books"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={32}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.month === currentMonth
                                        ? 'url(#currentMonthGradient)'
                                        : entry.books > 0
                                            ? '#3b82f6'
                                            : '#374151'
                                    }
                                />
                            ))}
                        </Bar>
                        <defs>
                            <linearGradient id="currentMonthGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                        </defs>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Stats Summary */}
            <div className="mt-4 pt-4 border-t border-[#1e2749] grid grid-cols-2 gap-4">
                <div className="text-center">
                    <p className="text-2xl font-bold text-white">{totalBooks}</p>
                    <p className="text-xs text-slate-400">Total Books</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-white">{averagePerMonth}</p>
                    <p className="text-xs text-slate-400">Avg per Month</p>
                </div>
            </div>
        </div>
    );
}
