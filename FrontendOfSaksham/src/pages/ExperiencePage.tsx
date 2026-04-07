import React from 'react';
import Navbar from '../components/Navbar';
import { useLang } from '../contexts/LanguageContext';
import { t } from '../i18n/translations';
import { motion } from 'framer-motion';

import { useClerk, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const testimonials = [
    {
        name: "Arjun Sharma",
        role: "Full Stack Developer",
        role_hi: "फुल स्टैक डेवलपर",
        content: "Saksham AI changed how I looked at my career. The AI suggestions were spot on, and the learning paths were incredibly structured.",
        content_hi: "सक्षम एआई ने मेरे करियर को देखने का नजरिया बदल दिया। एआई के सुझाव बिल्कुल सटीक थे, और सीखने के रास्ते अविश्वसनीय रूप से व्यवस्थित थे।"
    },
    {
        name: "Priya Patel",
        role: "Data Analyst",
        role_hi: "डेटा एनालिस्ट",
        content: "I didn't know where to start after my break. Saksham's skill assessment helped me identify my strengths and find the right courses.",
        content_hi: "ब्रेक के बाद मुझे नहीं पता था कि कहाँ से शुरू करूँ। सक्षम के कौशल मूल्यांकन ने मुझे अपनी ताकत पहचानने और सही पाठ्यक्रम खोजने में मदद की।"
    },
    {
        name: "Rahul Verma",
        role: "UX Designer",
        role_hi: "यूएक्स डिज़ाइनर",
        content: "The voice input feature is amazing! I could speak in Hindi and get career paths that actually made sense for my background.",
        content_hi: "वॉयस इनपुट सुविधा अद्भुत है! मैं हिंदी में बोल सका और मुझे ऐसे करियर के रास्ते मिले जो वास्तव में मेरी पृष्ठभूमि के लिए सही थे।"
    }
];

export default function ExperiencePage() {
    const { lang } = useLang();
    const { openSignIn } = useClerk();
    const { isSignedIn } = useUser();
    const navigate = useNavigate();

    const handleStartJourney = () => {
        if (isSignedIn) navigate("/start");
        else openSignIn({ redirectUrl: "/start" });
    };

    return (
        <div className="min-h-screen transition-colors duration-500 text-[var(--text-primary)]" style={{ background: "var(--section-bg)" }}>
            <Navbar />
            <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-5xl md:text-7xl font-light mb-6 font-serif text-[var(--text-heading)] transition-colors duration-500">
                        {lang === 'en' ? <>User <span className="italic text-[#ff7a3d]">Experiences</span></> : <>उपयोगकर्ता <span className="italic text-[#ff7a3d]">अनुभव</span></>}
                    </h1>
                    <p className="text-xl max-w-2xl mx-auto font-light text-[var(--text-muted)] transition-colors duration-500">
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
                            className="p-8 rounded-3xl border backdrop-blur-xl transition-all duration-400 group"
                            style={{
                                backgroundColor: "var(--card-bg)",
                                borderColor: "var(--card-border)",
                                boxShadow: "var(--card-shadow)"
                            }}
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 rounded-full flex items-center justify-center font-serif text-2xl" style={{ backgroundColor: "var(--section-bg)", color: "#ff7a3d", border: "1px solid var(--card-border)" }}>
                                    {test.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-[var(--text-heading)] transition-colors duration-500">{test.name}</h3>
                                    <p className="text-[#ff7a3d] text-sm uppercase tracking-wider">{lang === 'en' ? test.role : test.role_hi}</p>
                                </div>
                            </div>
                            <p className="leading-relaxed italic text-[var(--text-muted)] transition-colors duration-500">"{lang === 'en' ? test.content : test.content_hi}"</p>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-24 text-center p-12 rounded-3xl"
                    style={{
                        backgroundColor: "var(--card-bg)",
                        borderColor: "var(--card-border)",
                        borderWidth: 1,
                        boxShadow: "var(--card-shadow)"
                    }}
                >
                    <h2 className="text-3xl font-serif mb-6 italic text-[var(--text-heading)] transition-colors duration-500">{lang === 'en' ? "Ready to write your own story?" : "क्या आप अपनी कहानी लिखने के लिए तैयार हैं?"}</h2>
                    <button 
                        onClick={handleStartJourney}
                        className="px-12 py-4 bg-[#ff7a3d] text-white rounded-full font-semibold uppercase tracking-widest text-sm hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,122,61,0.3)] hover:shadow-[0_0_50px_rgba(255,122,61,0.5)]">
                        {lang === 'en' ? "Start Your Journey" : "अपनी यात्रा शुरू करें"}
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
