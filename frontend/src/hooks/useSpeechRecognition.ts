"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface SpeechRecognitionHook {
    transcript: string;
    isListening: boolean;
    isSupported: boolean;
    start: () => void;
    stop: () => void;
    resetTranscript: () => void;
}

export function useSpeechRecognition(): SpeechRecognitionHook {
    const [transcript, setTranscript] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const SpeechRecognition =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;

        if (SpeechRecognition) {
            setIsSupported(true);
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = "en-US";

            recognition.onresult = (event: any) => {
                let finalText = "";
                for (let i = 0; i < event.results.length; i++) {
                    finalText += event.results[i][0].transcript;
                }
                setTranscript(finalText);
            };

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error:", event.error);
                if (event.error !== "no-speech") {
                    setIsListening(false);
                }
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }
    }, []);

    const start = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            setTranscript("");
            recognitionRef.current.start();
            setIsListening(true);
        }
    }, [isListening]);

    const stop = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, [isListening]);

    const resetTranscript = useCallback(() => {
        setTranscript("");
    }, []);

    return {
        transcript,
        isListening,
        isSupported,
        start,
        stop,
        resetTranscript,
    };
}
