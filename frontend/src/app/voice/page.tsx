"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Mic,
  Square,
  Volume2,
  VolumeX,
  Send,
  WifiOff,
  Loader2,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { VoiceCommandResult } from "@/lib/types";
import { useAppStore } from "@/store/useAppStore";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type RecState = "idle" | "recording" | "transcribing";

export default function VoicePage() {
  const pushAction = useAppStore((s) => s.pushAction);

  const [recState, setRecState] = React.useState<RecState>("idle");
  const [transcript, setTranscript] = React.useState("");
  const [command, setCommand] = React.useState<VoiceCommandResult | null>(null);
  const [running, setRunning] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [elapsed, setElapsed] = React.useState(0);
  const [supported, setSupported] = React.useState(true);
  const [speaking, setSpeaking] = React.useState(false);

  const recorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const streamRef = React.useRef<MediaStream | null>(null);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  React.useEffect(() => {
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      typeof window === "undefined" ||
      typeof window.MediaRecorder === "undefined"
    ) {
      setSupported(false);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, []);

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        stream.getTracks().forEach((t) => t.stop());
        transcribe(blob);
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecState("recording");
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } catch {
      setError(
        "Microphone access was denied. Enable it in your browser settings to record.",
      );
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    recorderRef.current?.stop();
  };

  const transcribe = async (blob: Blob) => {
    setRecState("transcribing");
    try {
      const res = await api.transcribeVoice(blob);
      setTranscript(res.text);
      pushAction({
        id: Date.now(),
        action: "transcribe",
        module: "voice",
        summary: res.text.slice(0, 60) || "Transcribed audio",
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Transcription failed.",
      );
    } finally {
      setRecState("idle");
    }
  };

  const sendCommand = async () => {
    if (!transcript.trim()) return;
    setRunning(true);
    setCommand(null);
    setError(null);
    try {
      const res = await api.voiceCommand(transcript);
      setCommand(res);
      pushAction({
        id: Date.now(),
        action: "command",
        module: "voice",
        summary: `Intent: ${res.intent}`,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Command failed.");
    } finally {
      setRunning(false);
    }
  };

  const speak = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utter);
  };

  const mmss = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(
    elapsed % 60,
  ).padStart(2, "0")}`;

  return (
    <div>
      <PageHeader
        title="Voice Assistant"
        description="Push to talk, transcribe with local Whisper, and issue commands — no audio ever leaves your machine."
        icon={Mic}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <GlassCard className="flex flex-col items-center justify-center gap-6 py-12">
          {!supported ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <WifiOff className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Recording isn&apos;t supported in this browser. You can still
                type a command below.
              </p>
            </div>
          ) : (
            <>
              <motion.button
                type="button"
                onClick={
                  recState === "recording" ? stopRecording : startRecording
                }
                disabled={recState === "transcribing"}
                whileTap={{ scale: 0.94 }}
                className={`relative flex h-32 w-32 items-center justify-center rounded-full text-white shadow-glow transition-colors disabled:opacity-60 ${
                  recState === "recording"
                    ? "bg-destructive"
                    : "bg-gradient-brand"
                }`}
              >
                {recState === "recording" ? (
                  <span className="absolute inset-0 animate-pulse-ring rounded-full" />
                ) : null}
                {recState === "transcribing" ? (
                  <Loader2 className="h-10 w-10 animate-spin" />
                ) : recState === "recording" ? (
                  <Square className="h-10 w-10 fill-current" />
                ) : (
                  <Mic className="h-12 w-12" />
                )}
              </motion.button>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  {recState === "recording"
                    ? `Recording · ${mmss}`
                    : recState === "transcribing"
                      ? "Transcribing locally…"
                      : "Tap to start recording"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {recState === "recording"
                    ? "Tap again to stop"
                    : "Uses your microphone via MediaRecorder"}
                </p>
              </div>
            </>
          )}
        </GlassCard>

        <div className="space-y-5">
          <GlassCard className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Transcript
              </h3>
              {transcript ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => speak(transcript)}
                >
                  {speaking ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                  {speaking ? "Stop" : "Read"}
                </Button>
              ) : null}
            </div>
            <Textarea
              value={transcript}
              placeholder="Your transcript appears here — or type a command manually."
              onChange={(e) => setTranscript(e.target.value)}
              className="min-h-[120px]"
            />
            <div className="flex justify-end">
              <Button
                variant="gradient"
                onClick={sendCommand}
                disabled={running || !transcript.trim()}
              >
                {running ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Run command
              </Button>
            </div>
          </GlassCard>

          {error ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <AnimatePresence>
            {command ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <GlassCard className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">
                      Response
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        intent: {command.intent}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => speak(command.response)}
                      >
                        {speaking ? (
                          <VolumeX className="h-4 w-4" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                    {command.response}
                  </p>
                </GlassCard>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
