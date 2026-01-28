'use client';

import { ExternalLink, TrendingDown, Package, Recycle, Clock, ShoppingBag, Store } from 'lucide-react';
import type { Price, PriceSource } from '@/types';
import { useCurrency } from '@/contexts/CurrencyContext';

interface PriceTableProps {
    prices: Price[];
    className?: string;
}

// Retailer configurations with brand colors
const SOURCE_CONFIG: Record<PriceSource, {
    name: string;
    color: string;
    bgColor: string;
    textColor: string;
    initial: string;
}> = {
    amazon: {
        name: 'Amazon',
        color: 'text-[#FF9900]',
        bgColor: 'bg-[#FF9900]',
        textColor: 'text-white',
        initial: 'a'
    },
    flipkart: {
        name: 'Flipkart',
        color: 'text-[#2874F0]',
        bgColor: 'bg-[#FCEFD6]',
        textColor: 'text-[#2874F0]',
        initial: 'f'
    },
    ebay: {
        name: 'eBay',
        color: 'text-[#E53238]',
        bgColor: 'bg-gradient-to-r from-[#E53238] via-[#0064D2] to-[#86B817]',
        textColor: 'text-white',
        initial: 'e'
    },
    abebooks: {
        name: 'AbeBooks',
        color: 'text-[#CC0000]',
        bgColor: 'bg-[#CC0000]',
        textColor: 'text-white',
        initial: 'AB'
    },
    thriftbooks: {
        name: 'ThriftBooks',
        color: 'text-[#00796B]',
        bgColor: 'bg-[#00796B]',
        textColor: 'text-white',
        initial: 'TB'
    },
    bookdepository: {
        name: 'Book Depository',
        color: 'text-[#28A2E3]',
        bgColor: 'bg-[#28A2E3]',
        textColor: 'text-white',
        initial: 'BD'
    },
    google_books: {
        name: 'Google Books',
        color: 'text-[#4285F4]',
        bgColor: 'bg-white',
        textColor: 'text-[#4285F4]',
        initial: 'G'
    },
    itbookstore: {
        name: 'IT Bookstore',
        color: 'text-[#FF6600]',
        bgColor: 'bg-[#FF6600]',
        textColor: 'text-white',
        initial: 'IT'
    },
    barnes_noble: {
        name: 'Barnes & Noble',
        color: 'text-[#2A5934]',
        bgColor: 'bg-[#2A5934]',
        textColor: 'text-white',
        initial: 'BN'
    },
    alibris: {
        name: 'Alibris',
        color: 'text-[#6B2D5B]',
        bgColor: 'bg-[#6B2D5B]',
        textColor: 'text-white',
        initial: 'Al'
    },
    betterworldbooks: {
        name: 'Better World Books',
        color: 'text-[#00A86B]',
        bgColor: 'bg-[#00A86B]',
        textColor: 'text-white',
        initial: 'BW'
    },
    powells: {
        name: "Powell's",
        color: 'text-[#8B0000]',
        bgColor: 'bg-[#8B0000]',
        textColor: 'text-white',
        initial: 'P'
    },
    bookfinder: {
        name: 'BookFinder',
        color: 'text-[#F9A826]',
        bgColor: 'bg-[#2E4057]',
        textColor: 'text-[#F9A826]',
        initial: 'BF'
    },
};

// Retailer badge component
function RetailerBadge({ source }: { source: PriceSource }) {
    const config = SOURCE_CONFIG[source];
    if (!config) {
        return (
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-700 text-white">
                <Store className="w-5 h-5" />
            </div>
        );
    }

    return (
        <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${config.bgColor} ${config.textColor} font-bold text-sm shadow-md`}>
            {config.initial}
        </div>
    );
}

export default function PriceTable({ prices, className = '' }: PriceTableProps) {
    const { formatPrice, symbol } = useCurrency();

    if (prices.length === 0) {
        return (
            <div className={`bg-[#141b3d]/60 backdrop-blur-xl border border-[#1e2749] rounded-2xl text-center py-8 px-6 ${className}`}>
                <p className="text-slate-400">No price data available</p>
            </div>
        );
    }

    // Filter and sanitize prices, converting to user's currency
    const validPrices = prices.map(p => ({
        ...p,
        priceNew: p.priceNew !== null && p.priceNew > 0 && p.priceNew < 100000 ? p.priceNew : null,
        priceUsed: p.priceUsed !== null && p.priceUsed > 0 && p.priceUsed < 100000 ? p.priceUsed : null,
    }));

    // Separate prices with data vs links only
    const pricesWithData = validPrices.filter(p => p.priceNew !== null || p.priceUsed !== null);
    const linksOnly = validPrices.filter(p => p.priceNew === null && p.priceUsed === null);

    // Find best prices (comparing after conversion to user's currency)
    const allNewPrices = pricesWithData
        .filter(p => p.priceNew !== null)
        .map(p => ({
            source: p.source,
            originalPrice: p.priceNew!,
            currency: p.currency
        }));
    const allUsedPrices = pricesWithData
        .filter(p => p.priceUsed !== null)
        .map(p => ({
            source: p.source,
            originalPrice: p.priceUsed!,
            currency: p.currency
        }));

    const bestNew = allNewPrices.length > 0
        ? allNewPrices.reduce((min, p) => {
            const minFormatted = formatPrice(min.originalPrice, min.currency);
            const pFormatted = formatPrice(p.originalPrice, p.currency);
            // Compare numeric values after stripping currency symbol
            const minValue = parseFloat(minFormatted.replace(/[^0-9.]/g, ''));
            const pValue = parseFloat(pFormatted.replace(/[^0-9.]/g, ''));
            return pValue < minValue ? p : min;
        })
        : null;

    const bestUsed = allUsedPrices.length > 0
        ? allUsedPrices.reduce((min, p) => {
            const minFormatted = formatPrice(min.originalPrice, min.currency);
            const pFormatted = formatPrice(p.originalPrice, p.currency);
            const minValue = parseFloat(minFormatted.replace(/[^0-9.]/g, ''));
            const pValue = parseFloat(pFormatted.replace(/[^0-9.]/g, ''));
            return pValue < minValue ? p : min;
        })
        : null;

    // Sort prices: best deals first (lowest converted price)
    const sortedPricesWithData = [...pricesWithData].sort((a, b) => {
        // Get the lowest price for each retailer (new or used)
        const aNewConverted = a.priceNew ? parseFloat(formatPrice(a.priceNew, a.currency).replace(/[^0-9.]/g, '')) : Infinity;
        const aUsedConverted = a.priceUsed ? parseFloat(formatPrice(a.priceUsed, a.currency).replace(/[^0-9.]/g, '')) : Infinity;
        const aLowest = Math.min(aNewConverted, aUsedConverted);

        const bNewConverted = b.priceNew ? parseFloat(formatPrice(b.priceNew, b.currency).replace(/[^0-9.]/g, '')) : Infinity;
        const bUsedConverted = b.priceUsed ? parseFloat(formatPrice(b.priceUsed, b.currency).replace(/[^0-9.]/g, '')) : Infinity;
        const bLowest = Math.min(bNewConverted, bUsedConverted);

        return aLowest - bLowest;
    });

    const lastUpdated = prices[0]?.fetchedAt ? new Date(prices[0].fetchedAt).toLocaleString() : null;

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Summary Cards */}
            {(bestNew || bestUsed) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Best New Price */}
                    <div className="relative bg-gradient-to-br from-emerald-900/40 to-emerald-950/60 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-5 overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-bl-full" />
                        <div className="relative flex items-start gap-4">
                            <div className="p-2.5 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                                <Package className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div className="flex-1">
                                <span className="text-sm text-emerald-300/80 font-medium">Best New Price</span>
                                {bestNew ? (
                                    <>
                                        <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
                                            {formatPrice(bestNew.originalPrice, bestNew.currency)}
                                        </p>
                                        <p className="text-sm text-emerald-400 mt-0.5">
                                            on {SOURCE_CONFIG[bestNew.source]?.name || bestNew.source}
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-slate-400 mt-1">Not available</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Best Used Price */}
                    <div className="relative bg-gradient-to-br from-amber-900/40 to-amber-950/60 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-5 overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-400/20 to-transparent rounded-bl-full" />
                        <div className="relative flex items-start gap-4">
                            <div className="p-2.5 bg-amber-500/20 rounded-xl border border-amber-500/30">
                                <Recycle className="w-6 h-6 text-amber-400" />
                            </div>
                            <div className="flex-1">
                                <span className="text-sm text-amber-300/80 font-medium">Best Used Price</span>
                                {bestUsed ? (
                                    <>
                                        <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
                                            {formatPrice(bestUsed.originalPrice, bestUsed.currency)}
                                        </p>
                                        <p className="text-sm text-amber-400 mt-0.5">
                                            on {SOURCE_CONFIG[bestUsed.source]?.name || bestUsed.source}
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-slate-400 mt-1">Not available</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Savings Callout */}
            {bestNew && bestUsed && (
                (() => {
                    const newPrice = parseFloat(formatPrice(bestNew.originalPrice, bestNew.currency).replace(/[^0-9.]/g, ''));
                    const usedPrice = parseFloat(formatPrice(bestUsed.originalPrice, bestUsed.currency).replace(/[^0-9.]/g, ''));
                    const savings = newPrice - usedPrice;
                    const savingsPercent = Math.round((1 - usedPrice / newPrice) * 100);

                    if (savings > 0) {
                        return (
                            <div className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-violet-500/10 border border-violet-500/30">
                                <TrendingDown className="w-5 h-5 text-violet-400" />
                                <span className="text-violet-300 font-medium text-sm">
                                    Save {symbol}{savings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({savingsPercent}%) buying used!
                                </span>
                            </div>
                        );
                    }
                    return null;
                })()
            )}

            {/* Main Price Table */}
            {pricesWithData.length > 0 && (
                <div className="bg-[#141b3d]/60 backdrop-blur-xl border border-[#1e2749] rounded-2xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#1e2749] bg-[#0d1229]/50">
                        <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4" /> Price Comparison <span className="text-xs text-slate-500 ml-1">(in {symbol})</span>
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#1e2749]">
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Retailer</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">New</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Used</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#1e2749]/50">
                                {sortedPricesWithData.map((price) => {
                                    const config = SOURCE_CONFIG[price.source] || { name: price.source, color: 'text-slate-400' };
                                    const isBestNew = bestNew?.source === price.source && bestNew?.originalPrice === price.priceNew;
                                    const isBestUsed = bestUsed?.source === price.source && bestUsed?.originalPrice === price.priceUsed;

                                    return (
                                        <tr key={price.id} className="hover:bg-[#1a2341]/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <RetailerBadge source={price.source} />
                                                    <span className={`font-medium ${config.color}`}>{config.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {price.priceNew !== null ? (
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <span className={`font-semibold ${isBestNew ? 'text-emerald-400' : 'text-white'}`}>
                                                            {formatPrice(price.priceNew, price.currency)}
                                                        </span>
                                                        {isBestNew && <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-300 font-medium">BEST</span>}
                                                    </div>
                                                ) : <span className="text-slate-600">—</span>}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {price.priceUsed !== null ? (
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <span className={`font-semibold ${isBestUsed ? 'text-amber-400' : 'text-white'}`}>
                                                            {formatPrice(price.priceUsed, price.currency)}
                                                        </span>
                                                        {isBestUsed && <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300 font-medium">BEST</span>}
                                                    </div>
                                                ) : <span className="text-slate-600">—</span>}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {price.url && (
                                                    <a href={price.url} target="_blank" rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 text-xs font-medium transition-all border border-blue-500/20 hover:border-blue-500/40">
                                                        View <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Quick Links - Sites without prices */}
            {linksOnly.length > 0 && (
                <div className="bg-[#141b3d]/40 backdrop-blur-xl border border-[#1e2749]/50 rounded-2xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#1e2749]/50 bg-[#0d1229]/30">
                        <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                            <Store className="w-4 h-4" /> More Places to Check
                        </h3>
                    </div>
                    <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {linksOnly.map((price) => {
                            const config = SOURCE_CONFIG[price.source] || { name: price.source, color: 'text-slate-400', bgColor: 'bg-slate-700', textColor: 'text-white', initial: '?' };
                            return (
                                <a
                                    key={price.id}
                                    href={price.url || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#1a2341]/50 hover:bg-[#1e2749] border border-transparent hover:border-[#2a3655] transition-all group"
                                >
                                    <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${config.bgColor} ${config.textColor} font-bold text-xs shadow-sm`}>
                                        {config.initial}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className={`text-sm font-medium ${config.color} truncate block`}>{config.name}</span>
                                        <span className="text-[10px] text-slate-500 group-hover:text-blue-400 transition-colors">Check price →</span>
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Last Updated */}
            {lastUpdated && (
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>Updated: {lastUpdated}</span>
                </div>
            )}
        </div>
    );
}

export function PriceTableSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-2 gap-4">
                <div className="h-28 rounded-2xl bg-[#1e2749]" />
                <div className="h-28 rounded-2xl bg-[#1e2749]" />
            </div>
            <div className="h-48 rounded-2xl bg-[#1e2749]" />
            <div className="h-32 rounded-2xl bg-[#1e2749]" />
        </div>
    );
}
