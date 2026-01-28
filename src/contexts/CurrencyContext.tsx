'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getUserProfile } from '@/lib/api/user';
import { DEFAULT_PREFERENCES, REGIONS } from '@/lib/constants';

// Approximate exchange rates (USD as base)
// These should ideally come from an API, but for now using static rates
const EXCHANGE_RATES: Record<string, number> = {
    USD: 1,
    INR: 83.5,  // 1 USD = 83.5 INR
    GBP: 0.79,  // 1 USD = 0.79 GBP
    CAD: 1.36,  // 1 USD = 1.36 CAD
    AUD: 1.53,  // 1 USD = 1.53 AUD
    EUR: 0.92,  // 1 USD = 0.92 EUR
};

interface CurrencyContextType {
    region: string;
    currency: string;
    symbol: string;
    setRegion: (regionCode: string) => Promise<void>;
    isLoading: boolean;
    convertPrice: (price: number, fromCurrency: string) => number;
    formatPrice: (price: number, fromCurrency?: string) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const [region, setRegionState] = useState(DEFAULT_PREFERENCES.region);
    const [currency, setCurrency] = useState(DEFAULT_PREFERENCES.currency);
    const [symbol, setSymbol] = useState('₹');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initCurrency = async () => {
            try {
                const savedRegion = localStorage.getItem('apicbooks_region');
                if (savedRegion) {
                    updateStateFromRegion(savedRegion);
                }

                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    const profile = await getUserProfile(user.id);
                    if (profile?.preferences?.region) {
                        const regionCode = profile.preferences.region;
                        localStorage.setItem('apicbooks_region', regionCode);
                        updateStateFromRegion(regionCode);
                    }
                }
            } catch (error) {
                console.error('Failed to load currency preferences:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initCurrency();
    }, []);

    const updateStateFromRegion = (regionCode: string) => {
        const regionObj = REGIONS.find(r => r.code === regionCode) || REGIONS[0];
        setRegionState(regionObj.code);
        setCurrency(regionObj.currency);
        setSymbol(regionObj.symbol);
    };

    const setRegion = async (regionCode: string) => {
        localStorage.setItem('apicbooks_region', regionCode);
        updateStateFromRegion(regionCode);

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Let settings page handle backend sync
            }
        } catch (error) {
            console.error('Error syncing region:', error);
        }
    };

    // Convert price from source currency to user's selected currency
    const convertPrice = (price: number, fromCurrency: string): number => {
        if (fromCurrency === currency) return price;

        const fromRate = EXCHANGE_RATES[fromCurrency] || 1;
        const toRate = EXCHANGE_RATES[currency] || 1;

        // Convert: price in fromCurrency -> USD -> toCurrency
        const priceInUSD = price / fromRate;
        const convertedPrice = priceInUSD * toRate;

        return Math.round(convertedPrice * 100) / 100; // Round to 2 decimal places
    };

    // Format price with conversion
    const formatPrice = (price: number, fromCurrency?: string): string => {
        const convertedPrice = fromCurrency ? convertPrice(price, fromCurrency) : price;
        return `${symbol}${convertedPrice.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    return (
        <CurrencyContext.Provider value={{
            region,
            currency,
            symbol,
            setRegion,
            isLoading,
            convertPrice,
            formatPrice
        }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
}
