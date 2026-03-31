'use client';

import { useState, useMemo, useEffect } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { TrendingUp, Clock, BookOpen } from 'lucide-react';
import { getAllReadingSessions } from '@/lib/api/library';

interface ReadingActivityProps {
    books: any[];
    userId?: string;
}

type TimeRange = 'week' | 'month' | 'year';
type ViewMode = 'books' | 'time';

export default function ReadingActivity({ books, userId }: ReadingActivityProps) {
    const [timeRange, setTimeRange] = useState<TimeRange>('year');
    const [viewMode, setViewMode] = useState<ViewMode>('books');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [readingSessions, setReadingSessions] = useState<any[]>([]);

    useEffect(() => {
        if (userId) {
            getAllReadingSessions(userId).then(setReadingSessions);
        }
    }, [userId]);

    // Process data based on selected time range
    const data = useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        // Helper to check if a date is valid
        const isValidDate = (d: any) => d instanceof Date && !isNaN(d.getTime());

        // Parse book dates
        const bookDates = books
            .map(b => {
                const dateStr = b.finished_at || b.updated_at;
                return dateStr ? new Date(dateStr) : null;
            })
            .filter(isValidDate) as Date[];

        // Filter sessions based on date validity
        const validSessions = readingSessions.filter(s => isValidDate(new Date(s.started_at)));

        const getCountForDate = (date: Date) => {
            if (viewMode === 'books') {
                return bookDates.filter(d =>
                    d.getDate() === date.getDate() &&
                    d.getMonth() === date.getMonth() &&
                    d.getFullYear() === date.getFullYear()
                ).length;
            } else {
                // Sum minutes for this day
                const minutes = validSessions
                    .filter(s => {
                        const d = new Date(s.started_at);
                        return d.getDate() === date.getDate() &&
                            d.getMonth() === date.getMonth() &&
                            d.getFullYear() === date.getFullYear();
                    })
                    .reduce((acc, curr) => acc + (curr.duration_minutes || 0), 0);
                return Math.round((minutes / 60) * 10) / 10; // Convert to hours
            }
        };

        const getCountForMonth = (monthIndex: number, year: number) => {
            if (viewMode === 'books') {
                return bookDates.filter(d =>
                    d.getMonth() === monthIndex &&
                    d.getFullYear() === year
                ).length;
            } else {
                const minutes = validSessions
                    .filter(s => {
                        const d = new Date(s.started_at);
                        return d.getMonth() === monthIndex &&
                            d.getFullYear() === year;
                    })
                    .reduce((acc, curr) => acc + (curr.duration_minutes || 0), 0);
                return Math.round((minutes / 60) * 10) / 10;
            }
        };

        if (timeRange === 'week') {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const last7Days = [...Array(7)].map((_, i) => {
                const d = new Date();
                d.setDate(now.getDate() - (6 - i));
                return d;
            });

            return last7Days.map(day => {
                const dayName = days[day.getDay()];
                const count = getCountForDate(day);
                return { name: dayName, count };
            });

        } else if (timeRange === 'month') {
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            const days = [...Array(daysInMonth)].map((_, i) => i + 1);

            return days.map(day => {
                const date = new Date(currentYear, currentMonth, day);
                const count = getCountForDate(date);
                return { name: day.toString(), count };
            });

        } else {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return months.map((month, index) => {
                const count = getCountForMonth(index, selectedYear);
                return { name: month, count };
            });
        }
    }, [books, readingSessions, timeRange, selectedYear, viewMode]);

    // Calculate totals for summary and trend
    const totalPeriod = data.reduce((acc, curr) => acc + curr.count, 0);
    // Safe division
    const avgPerPeriod = data.length > 0 ? (totalPeriod / data.length).toFixed(1) : '0.0';

    // Calculate Previous Period Trend
    const trendStats = useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        // Helper to check if a date is valid
        const isValidDate = (d: any) => d instanceof Date && !isNaN(d.getTime());
        const bookDates = books.map(b => b.finished_at || b.updated_at).filter(d => d).map(d => new Date(d)).filter(isValidDate);
        const validSessions = readingSessions.filter(s => isValidDate(new Date(s.started_at)));

        const getCountForTimeWindow = (startDate: Date, endDate: Date) => {
            if (viewMode === 'books') {
                return bookDates.filter(d => d >= startDate && d <= endDate).length;
            } else {
                return validSessions
                    .filter(s => {
                        const d = new Date(s.started_at);
                        return d >= startDate && d <= endDate;
                    })
                    .reduce((acc, curr) => acc + (curr.duration_minutes || 0), 0) / 60;
            }
        };

        let currentTotal = totalPeriod; // We already have this, but for consistency we could recalc or just use it. 
        // Note: 'totalPeriod' from 'data' depends on the complex binning logic above. 
        // For trend, simple date ranges are safer and easier.

        // Redefine Total to be purely time-based to match the trend comparison exactly
        let prevTotal = 0;
        let cTotal = 0;

        if (timeRange === 'week') {
            // Last 7 days vs 7 days before that
            const startOfCurrent = new Date();
            startOfCurrent.setDate(now.getDate() - 6);
            startOfCurrent.setHours(0, 0, 0, 0);

            const startOfPrev = new Date(startOfCurrent);
            startOfPrev.setDate(startOfCurrent.getDate() - 7);

            cTotal = getCountForTimeWindow(startOfCurrent, now);
            prevTotal = getCountForTimeWindow(startOfPrev, new Date(startOfCurrent.getTime() - 1));

        } else if (timeRange === 'month') {
            // Current Month vs Previous Month
            const startOfCurrent = new Date(currentYear, currentMonth, 1);
            const startOfPrev = new Date(currentYear, currentMonth - 1, 1);
            const endOfPrev = new Date(currentYear, currentMonth, 0);

            cTotal = getCountForTimeWindow(startOfCurrent, now);
            prevTotal = getCountForTimeWindow(startOfPrev, endOfPrev);

        } else {
            // Year vs Previous Year
            const startOfCurrent = new Date(selectedYear, 0, 1);
            const startOfPrev = new Date(selectedYear - 1, 0, 1);
            const endOfPrev = new Date(selectedYear - 1, 11, 31);

            cTotal = getCountForTimeWindow(startOfCurrent, now); // Or end of year
            prevTotal = getCountForTimeWindow(startOfPrev, endOfPrev);
        }

        const percentage = prevTotal === 0
            ? cTotal > 0 ? 100 : 0
            : Math.round(((cTotal - prevTotal) / prevTotal) * 100);

        return { percentage, direction: percentage >= 0 ? 'up' : 'down' };
    }, [books, readingSessions, timeRange, selectedYear, viewMode, totalPeriod]);

    return (
        <div className="bg-gradient-to-br from-[#141b3d]/80 to-[#0d1128]/80 backdrop-blur-xl border border-card-border rounded-2xl p-6 lg:col-span-2">

            {/* Header with Filters */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary-400" />
                        Reading Activity
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        {timeRange === 'week' ? 'Past 7 Days' : timeRange === 'month' ? 'Current Month' : `${selectedYear} Overview`}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-1 bg-[#0a0e27]/50 p-1 rounded-xl border border-card-border">
                        <button
                            onClick={() => setViewMode('books')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${viewMode === 'books'
                                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-elevated'
                                }`}
                        >
                            <BookOpen className="w-3 h-3" />
                            Books
                        </button>
                        <button
                            onClick={() => setViewMode('time')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${viewMode === 'time'
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-elevated'
                                }`}
                        >
                            <Clock className="w-3 h-3" />
                            Time
                        </button>
                    </div>

                    <div className="h-6 w-px bg-elevated hidden sm:block" />

                    {/* Time Range Toggle */}
                    <div className="flex items-center gap-1 bg-[#0a0e27]/50 p-1 rounded-xl border border-card-border">
                        {(['week', 'month', 'year'] as TimeRange[]).map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${timeRange === range
                                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-elevated'
                                    }`}
                            >
                                {range.charAt(0).toUpperCase() + range.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Chart Area */}
            <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={viewMode === 'books' ? '#6366f1' : '#10b981'} stopOpacity={0.4} />
                                <stop offset="95%" stopColor={viewMode === 'books' ? '#6366f1' : '#10b981'} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e2749" vertical={false} />
                        <XAxis
                            dataKey="name"
                            stroke="#64748b"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                        />
                        <YAxis
                            stroke="#64748b"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={viewMode === 'time'}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#0a0e27',
                                borderColor: '#1e2749',
                                borderRadius: '12px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                            }}
                            itemStyle={{ color: '#fff' }}
                            cursor={{ stroke: viewMode === 'books' ? '#6366f1' : '#10b981', strokeWidth: 2 }}
                            formatter={(value?: number) => [
                                viewMode === 'books' ? `${value || 0} Books` : `${value || 0} Hours`,
                                viewMode === 'books' ? 'Read' : 'Time'
                            ] as [string, string]}
                        />
                        <Area
                            type="monotone"
                            dataKey="count"
                            stroke={viewMode === 'books' ? '#6366f1' : '#10b981'}
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorCount)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Summary Stats Footer */}
            <div className="mt-6 pt-6 border-t border-card-border grid grid-cols-3 gap-4">
                <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1">
                        {viewMode === 'books' ? 'Total Books' : 'Total Hours'}
                    </p>
                    <p className="text-2xl font-bold text-white">
                        {viewMode === 'books' ? totalPeriod : totalPeriod.toFixed(1)}
                    </p>
                </div>
                <div className="text-center border-l border-card-border">
                    <p className="text-xs text-slate-500 mb-1">Daily Avg</p>
                    <p className="text-2xl font-bold text-white">
                        {timeRange === 'week' ? (totalPeriod / 7).toFixed(1)
                            : timeRange === 'month' ? (totalPeriod / 30).toFixed(1)
                                : (totalPeriod / 365).toFixed(2)}
                        <span className="text-xs font-normal text-slate-500 ml-1">
                            {viewMode === 'books' ? '' : 'hrs'}
                        </span>
                    </p>
                </div>
                <div className="text-center border-l border-card-border">
                    <p className="text-xs text-slate-500 mb-1">Trend</p>
                    <div className={`flex items-center justify-center gap-1 ${trendStats.percentage >= 0 ? 'text-green-400' : 'text-rose-400'}`}>
                        <TrendingUp className={`w-3 h-3 ${trendStats.percentage < 0 ? 'rotate-180' : ''}`} />
                        <span className="text-sm font-bold">
                            {trendStats.percentage >= 0 ? '+' : ''}{trendStats.percentage}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
