"use client";

import { useState, useCallback, useEffect, useRef } from "react";

interface TTSHook {
    speak: (text: string) => void;
    stop: () => void;
    isSpeaking: boolean;
    speakingId: string | null;
    isSupported: boolean;
}

function stripMarkdown(text: string): string {
    return text
        .replace(/```[\s\S]*?```/g, " code block ")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/\*([^*]+)\*/g, "$1")
        .replace(/__([^_]+)__/g, "$1")
        .replace(/_([^_]+)_/g, "$1")
        .replace(/~~([^~]+)~~/g, "$1")
        .replace(/#{1,6}\s*/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
        .replace(/^\s*[-*+]\s+/gm, "")
        .replace(/^\s*\d+\.\s+/gm, "")
        .replace(/^\s*>\s+/gm, "")
        .replace(/\n{2,}/g, ". ")
        .replace(/\n/g, " ")
        .trim();
}

export function useTTS(): TTSHook {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [speakingId, setSpeakingId] = useState<string | null>(null);
    const [isSupported, setIsSupported] = useState(false);
    const utterancesRef = useRef<SpeechSynthesisUtterance[]>([]);

    useEffect(() => {
        setIsSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    }, []);

    const stop = useCallback(() => {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }
        utterancesRef.current = [];
        setIsSpeaking(false);
        setSpeakingId(null);
    }, []);

    const speak = useCallback(
        (text: string, id?: string) => {
            if (!isSupported) return;

            stop();

            const cleaned = stripMarkdown(text);
            if (!cleaned) return;

            // Split into chunks by sentence for better handling of long text
            const sentences = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [cleaned];
            const chunks: string[] = [];
            let current = "";

            for (const sentence of sentences) {
                if ((current + sentence).length > 200) {
                    if (current) chunks.push(current.trim());
                    current = sentence;
                } else {
                    current += sentence;
                }
            }
            if (current.trim()) chunks.push(current.trim());

            setSpeakingId(id || null);
            setIsSpeaking(true);

            const utts: SpeechSynthesisUtterance[] = [];

            chunks.forEach((chunk, index) => {
                const utterance = new SpeechSynthesisUtterance(chunk);
                utterance.rate = 1.0;
                utterance.pitch = 1.0;

                if (index === chunks.length - 1) {
                    utterance.onend = () => {
                        setIsSpeaking(false);
                        setSpeakingId(null);
                    };
                }

                utterance.onerror = () => {
                    setIsSpeaking(false);
                    setSpeakingId(null);
                };

                utts.push(utterance);
            });

            utterancesRef.current = utts;
            utts.forEach((u) => window.speechSynthesis.speak(u));
        },
        [isSupported, stop]
    );

    return { speak, stop, isSpeaking, speakingId, isSupported };
}
