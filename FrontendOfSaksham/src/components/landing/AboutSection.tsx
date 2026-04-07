import React, { useRef } from 'react';
import { useLang } from '../../contexts/LanguageContext';
import { t } from '../../i18n/translations';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';

const ValueCard = ({ title, desc, index }: { title: string, desc: string, index: number }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className="p-8 rounded-3xl backdrop-blur-xl relative overflow-hidden group transition-all duration-400"
            style={{
                backgroundColor: "var(--card-bg)",
                borderColor: "var(--card-border)",
                borderWidth: 1,
                boxShadow: "var(--card-shadow)"
            }}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-[#ff7a3d]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
                <div className="text-[#ff7a3d] text-3xl mb-3 font-serif italic">0{index + 1}</div>
                <h3 className="text-xl font-semibold mb-3 text-[var(--text-heading)] transition-colors duration-500">{title}</h3>
                <p className="leading-relaxed font-light text-[var(--text-muted)] transition-colors duration-500">{desc}</p>
            </div>
        </motion.div>
    );
};

export default function AboutSection() {
    const { lang } = useLang();
    const targetRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start end", "end start"]
    });

    const orb1Y = useTransform(scrollYProgress, [0, 1], [-50, 50]);
    const orb2Y = useTransform(scrollYProgress, [0, 1], [50, -50]);

    const springOrb1Y = useSpring(orb1Y, { stiffness: 100, damping: 30 });
    const springOrb2Y = useSpring(orb2Y, { stiffness: 100, damping: 30 });

    return (
        <div ref={targetRef} className="relative py-12 text-[var(--text-primary)] transition-colors duration-500 selection:bg-[#ff7a3d]/30 overflow-hidden">
            {/* Parallax Orbs (relative to section) */}
            <motion.div
                style={{ y: springOrb1Y }}
                className="absolute top-[10%] -left-[10%] w-[50vw] h-[50vw] bg-[#ff7a3d]/5 rounded-full blur-[120px] pointer-events-none"
            />
            <motion.div
                style={{ y: springOrb2Y }}
                className="absolute bottom-[10%] -right-[10%] w-[40vw] h-[40vw] bg-[#ff7a3d]/5 rounded-full blur-[100px] pointer-events-none"
            />

            <div className="relative z-10 max-w-6xl mx-auto px-4">
                {/* Manifesto/Intro */}
                <div className="text-center mb-16">
                    <motion.span
                        initial={{ opacity: 0, letterSpacing: "1em" }}
                        whileInView={{ opacity: 1, letterSpacing: "0.4em" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="text-[#ff7a3d] uppercase text-xs md:text-sm font-semibold mb-6 block"
                    >
                        OUR MANIFESTO
                    </motion.span>
                    <h2 className="text-4xl md:text-7xl font-light font-serif leading-none mb-6 tracking-tighter text-[var(--text-heading)] transition-colors duration-500">
                        Sak<span className="italic text-[#ff7a3d]">sham</span>
                    </h2>
                    <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "150px" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-[1px] bg-gradient-to-r from-transparent via-[#ff7a3d] to-transparent mx-auto mb-8"
                    />
                    <p className="text-lg md:text-xl font-light max-w-2xl mx-auto italic text-[var(--text-muted)] transition-colors duration-500">
                        "We aren't just building a tool; we're architecting a future where talent knows no boundaries."
                    </p>
                </div>

                {/* Mission Section - Restructured, Card Removed */}
                <div className="max-w-4xl mx-auto mb-24 mt-12">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                        viewport={{ once: true }}
                        className="text-center"
                    >
                        <h2 className="text-4xl md:text-5xl font-serif italic mb-6 text-[var(--text-heading)] transition-colors duration-500">{t('about_title', lang)}</h2>
                        <p className="text-base md:text-lg font-light leading-relaxed mb-8 text-[var(--text-muted)] transition-colors duration-500">
                            {t('about_content', lang)}
                        </p>
                        <div className="flex justify-center gap-12 mt-8">
                            <div>
                                <div className="text-3xl md:text-4xl font-serif text-[#ff7a3d] italic mb-1">50k+</div>
                                <div className="text-[10px] uppercase tracking-[0.2em] font-medium text-gray-400">Learners</div>
                            </div>
                            <div className="w-[1px] bg-[#ff7a3d]/20 h-10 self-center" />
                            <div>
                                <div className="text-3xl md:text-4xl font-serif text-[#ff7a3d] italic mb-1">95%</div>
                                <div className="text-[10px] uppercase tracking-[0.2em] font-medium text-gray-400">Satisfaction</div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Values Section */}
                <div className="mb-24">
                    <h2 className="text-center text-4xl font-serif italic mb-12 text-[var(--text-heading)] transition-colors duration-500">{t('values_title', lang)}</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <ValueCard
                            index={0}
                            title={t('value_inclusivity', lang)}
                            desc="Guidance that adapts to every dialect, every background, and every unique aspiration. We make technology accessible."
                        />
                        <ValueCard
                            index={1}
                            title={t('value_intelligence', lang)}
                            desc="Not just raw data, but contextual wisdom. Our AI understands the nuance of your journey better than any resume."
                        />
                        <ValueCard
                            index={2}
                            title={t('value_integrity', lang)}
                            desc="Your data is your legacy. We build with radical transparency and unshakeable ethics at every layer of our stack."
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}
