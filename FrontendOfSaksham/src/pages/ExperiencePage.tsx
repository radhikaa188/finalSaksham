import React from 'react';
import Navbar from '../components/Navbar';
import { useLang } from '../contexts/LanguageContext';
import { t } from '../i18n/translations';
import { motion } from 'framer-motion';

const testimonials = [
    {
        name: "Arjun Sharma",
        role: "Full Stack Developer",
        content: "Saksham AI changed how I looked at my career. The AI suggestions were spot on, and the learning paths were incredibly structured.",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun"
    },
    {
        name: "Priya Patel",
        role: "Data Analyst",
        content: "I didn't know where to start after my break. Saksham's skill assessment helped me identify my strengths and find the right courses.",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya"
    },
    {
        name: "Rahul Verma",
        role: "UX Designer",
        content: "The voice input feature is amazing! I could speak in Hindi and get career paths that actually made sense for my background.",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul"
    }
];

export default function ExperiencePage() {
    const { lang } = useLang();

    return (
        <div className="min-h-screen bg-[#080a14] text-white">
            <Navbar />
            <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-5xl md:text-7xl font-light mb-6 font-serif">
                        User <span className="italic text-[#ff7a3d]">Experiences</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
                        {t('exp_subtitle', lang)}
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((test, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.2, duration: 0.8 }}
                            className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:border-[#ff7a3d]/30 transition-all group"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <img src={test.image} alt={test.name} className="w-16 h-16 rounded-full bg-white/10" />
                                <div>
                                    <h3 className="font-semibold text-lg">{test.name}</h3>
                                    <p className="text-[#ff7a3d] text-sm uppercase tracking-wider">{test.role}</p>
                                </div>
                            </div>
                            <p className="text-gray-300 leading-relaxed italic">"{test.content}"</p>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-24 text-center p-12 rounded-3xl bg-[#ff7a3d]/5 border border-[#ff7a3d]/10"
                >
                    <h2 className="text-3xl font-serif mb-6 italic">Ready to write your own story?</h2>
                    <button className="px-12 py-4 bg-[#ff7a3d] rounded-full font-semibold uppercase tracking-widest text-sm hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,122,61,0.3)]">
                        Start Your Journey
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
