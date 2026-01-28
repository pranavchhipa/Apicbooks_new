'use client';

export default function RetailerLogos() {
    const retailers = [
        { name: 'Amazon', color: '#FF9900' },
        { name: 'eBay', color: '#E53238' },
        { name: 'AbeBooks', color: '#F5A623' },
        { name: 'ThriftBooks', color: '#4CAF50' },
        { name: 'Barnes & Noble', color: '#006E51' },
        { name: 'Better World Books', color: '#1E88E5' },
        { name: 'Alibris', color: '#8B4513' },
        { name: 'Powell\'s Books', color: '#E74C3C' },
    ];

    return (
        <section className="py-16 bg-slate-900/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">
                        We compare prices from
                    </p>
                    <h3 className="text-xl font-display font-semibold text-white">
                        Top Book Retailers Worldwide
                    </h3>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
                    {retailers.map((retailer) => (
                        <div
                            key={retailer.name}
                            className="group flex items-center justify-center"
                        >
                            <div
                                className="text-slate-500 font-display font-bold text-lg md:text-xl 
                                           group-hover:text-white transition-colors duration-300
                                           opacity-60 group-hover:opacity-100"
                                style={{
                                    '--hover-color': retailer.color,
                                } as React.CSSProperties}
                            >
                                {retailer.name}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-10">
                    <p className="text-slate-500 text-sm">
                        ...and 100+ more retailers across the globe
                    </p>
                </div>
            </div>
        </section>
    );
}
