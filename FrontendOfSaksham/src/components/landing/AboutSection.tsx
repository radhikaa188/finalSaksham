import React, { useRef } from 'react';
import { useLang } from '../contexts/LanguageContext';
import { t } from '../i18n/translations';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';

const ValueCard = ({ title, desc, index }: { title: string, desc: string, index: number }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl relative overflow-hidden group"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-[#ff7a3d]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
                <div className="text-[#ff7a3d] text-4xl mb-4 font-serif italic">0{index + 1}</div>
                <h3 className="text-2xl font-semibold mb-4">{title}</h3>
                <p className="text-gray-400 leading-relaxed font-light">{desc}</p>
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

    const orb1Y = useTransform(scrollYProgress, [0, 1], [-100, 100]);
    const orb2Y = useTransform(scrollYProgress, [0, 1], [100, -100]);

    const springOrb1Y = useSpring(orb1Y, { stiffness: 100, damping: 30 });
    const springOrb2Y = useSpring(orb2Y, { stiffness: 100, damping: 30 });

    return (
        <div ref={targetRef} className="relative py-24 bg-[#080a14] text-white selection:bg-[#ff7a3d]/30 overflow-hidden">
            {/* Parallax Orbs (relative to section) */}
            <motion.div
                style={{ y: springOrb1Y }}
                className="absolute top-[10%] -left-[10%] w-[50vw] h-[50vw] bg-[#ff7a3d]/5 rounded-full blur-[120px] pointer-events-none"
            />
            <motion.div
                style={{ y: springOrb2Y }}
                className="absolute bottom-[10%] -right-[10%] w-[40vw] h-[40vw] bg-[#ff7a3d]/5 rounded-full blur-[100px] pointer-events-none"
            />

            <div className="relative z-10 max-w-7xl mx-auto px-4">
                {/* Manifesto/Intro */}
                <div className="text-center mb-32">
                    <motion.span
                        initial={{ opacity: 0, letterSpacing: "1em" }}
                        whileInView={{ opacity: 1, letterSpacing: "0.4em" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="text-[#ff7a3d] uppercase text-xs md:text-sm font-semibold mb-8 block"
                    >
                        OUR MANIFESTO
                    </motion.span>
                    <h2 className="text-5xl md:text-8xl font-light font-serif leading-none mb-8 tracking-tighter">
                        Sak<span className="italic text-[#ff7a3d]">sham</span>
                    </h2>
                    <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "200px" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-[1px] bg-gradient-to-r from-transparent via-[#ff7a3d] to-transparent mx-auto mb-12"
                    />
                    <p className="text-xl md:text-2xl text-gray-400 font-light max-w-2xl mx-auto italic">
                        "We aren't just building a tool; we're architecting a future where talent knows no boundaries."
                    </p>
                </div>

                {/* Mission Section */}
                <div className="grid lg:grid-cols-2 gap-24 items-center mb-48">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-6xl font-serif italic mb-8">{t('about_title', lang)}</h2>
                        <p className="text-lg md:text-xl text-gray-300 font-light leading-relaxed mb-8">
                            {t('about_content', lang)}
                        </p>
                        <div className="flex gap-12 mt-12">
                            <div>
                                <div className="text-4xl font-serif text-[#ff7a3d] italic mb-1">50k+</div>
                                <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Learners</div>
                            </div>
                            <div className="w-[1px] bg-white/10 h-10 self-center" />
                            <div>
                                <div className="text-4xl font-serif text-[#ff7a3d] italic mb-1">95%</div>
                                <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Satisfaction</div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, rotateY: 45 }}
                        whileInView={{ opacity: 1, rotateY: 0 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        viewport={{ once: true }}
                        className="relative aspect-square perspective-1000"
                    >
                        <div className="absolute inset-0 border border-[#ff7a3d]/20 rounded-full animate-pulse" />
                        <div className="w-full h-full rounded-3xl overflow-hidden bg-gradient-to-br from-[#ff7a3d]/20 via-transparent to-transparent flex items-center justify-center group">
                            <div className="text-9xl text-[#ff7a3d] font-serif italic opacity-10 group-hover:opacity-30 transition-opacity">S</div>
                        </div>
                    </motion.div>
                </div>

                {/* Values Section */}
                <div className="mb-48">
                    <h2 className="text-center text-5xl font-serif italic mb-20">{t('values_title', lang)}</h2>
                    <div className="grid md:grid-cols-3 gap-8">
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

                {/* The Journey */}
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-5xl font-serif italic mb-12">{t('journey_title', lang)}</h2>
                        <div className="space-y-12 relative">
                            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-[#ff7a3d] to-transparent -translate-x-1/2 opacity-20" />

                            <div className="relative">
                                <div className="w-4 h-4 rounded-full bg-[#ff7a3d] mx-auto z-10 relative box-content border-[8px] border-[#080a14]" />
                                <div className="mt-4">
                                    <h4 className="text-[#ff7a3d] font-semibold text-sm tracking-widest uppercase">2024 Launch</h4>
                                    <p className="text-gray-400 font-light mt-2 max-w-sm mx-auto italic">Igniting the spark of inclusive career guidance across the nation.</p>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="w-4 h-4 rounded-full bg-white/20 mx-auto z-10 relative box-content border-[8px] border-[#080a14]" />
                                <div className="mt-4">
                                    <h4 className="text-white/40 font-semibold text-sm tracking-widest uppercase italic">2026 Vision</h4>
                                    <p className="text-gray-600 font-light mt-2 max-w-sm mx-auto">Expanding our AI model to support 50+ local dialects and global opportunities.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
