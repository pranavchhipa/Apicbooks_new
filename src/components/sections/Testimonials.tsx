'use client';

import { Star, Quote } from 'lucide-react';

const testimonials = [
    {
        name: 'Sarah Mitchell',
        role: 'Graduate Student',
        avatar: '👩‍🎓',
        rating: 5,
        text: 'ApicBooks saved me over ₹2000 on textbooks this semester! The price comparison feature is incredibly fast and accurate.',
    },
    {
        name: 'Arjun Mehta',
        role: 'Book Collector',
        avatar: '👨‍💼',
        rating: 5,
        text: 'As a rare book collector, finding the best prices is crucial. This tool has become indispensable for my collection.',
    },
    {
        name: 'Emily Davis',
        role: 'Parent of 3',
        avatar: '👩‍👧‍👦',
        rating: 5,
        text: 'With three kids in school, book expenses add up quickly. ApicBooks helps me find affordable options every time.',
    },
    {
        name: 'Rohan Gupta',
        role: 'Book Club Organizer',
        avatar: '📚',
        rating: 5,
        text: 'I recommend ApicBooks to everyone in my book club. The AI mood search feature is fantastic for discovering new reads!',
    },
    {
        name: 'James Wilson',
        role: 'Librarian',
        avatar: '👨‍🏫',
        rating: 5,
        text: 'A game-changer for budget-conscious readers. The interface is clean and the results are always reliable.',
    },
    {
        name: 'Ananya Desai',
        role: 'Avid Reader',
        avatar: '👩‍💻',
        rating: 5,
        text: 'I love the wishlist feature with price alerts. Got notified when my favorite author\'s book went on sale!',
    },
];

export default function Testimonials() {
    return (
        <section className="py-20 relative overflow-hidden">
            <div className="absolute inset-0 section-gradient" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="text-center mb-12">
                    <span className="badge-primary mb-4">Testimonials</span>
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                        What Our <span className="gradient-text">Users Say</span>
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        Join thousands of satisfied readers who trust ApicBooks for their book shopping needs.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={testimonial.name}
                            className="card-testimonial group hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Quote icon */}
                            <Quote className="absolute top-4 right-4 w-8 h-8 text-slate-700/50 group-hover:text-primary-500/30 transition-colors" />

                            {/* Rating */}
                            <div className="flex gap-1 mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-accent-400 fill-accent-400" />
                                ))}
                            </div>

                            {/* Text */}
                            <p className="text-slate-300 mb-6 relative z-10">
                                "{testimonial.text}"
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center text-2xl">
                                    {testimonial.avatar}
                                </div>
                                <div>
                                    <div className="text-white font-semibold">{testimonial.name}</div>
                                    <div className="text-slate-400 text-sm">{testimonial.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
