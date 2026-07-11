import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, RotateCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { resolveAudioPath } from "../services/revisionService.js";
import { formatDuration } from "../utils/time.js";
import Button from "./ui/Button.jsx";

export default function RevisionAudioPlayer({ phase, progress, onProgress, onPrevious, onNext, hasPrevious, hasNext }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasAudio, setHasAudio] = useState(Boolean(phase?.audio));
  const [currentTime, setCurrentTime] = useState(progress?.lastPosition || 0);
  const [duration, setDuration] = useState(progress?.durationSeconds || 0);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    setIsPlaying(false);
    setHasAudio(Boolean(phase?.audio));
    setCurrentTime(progress?.lastPosition || 0);
    setDuration(progress?.durationSeconds || 0);
  }, [phase?.id, phase?.audio, progress?.durationSeconds, progress?.lastPosition]);

  function updateProgress(nextTime, nextDuration = duration) {
    const completed = nextDuration > 0 && nextTime / nextDuration >= 0.9;
    onProgress({
      lastPosition: nextTime,
      listenedSeconds: nextTime,
      durationSeconds: nextDuration,
      completed
    });
  }

  function togglePlayback() {
    const audio = audioRef.current;
    if (!audio || !hasAudio) return;
    if (audio.paused) {
      audio.play().then(() => setIsPlaying(true)).catch(() => setHasAudio(false));
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }

  function seek(value) {
    const audio = audioRef.current;
    const nextTime = Number(value);
    if (audio) audio.currentTime = nextTime;
    setCurrentTime(nextTime);
    updateProgress(nextTime);
  }

  function skip(offset) {
    seek(Math.min(Math.max(currentTime + offset, 0), duration || currentTime + offset));
  }

  function changeSpeed() {
    const speeds = [1, 1.25, 1.5, 2];
    const nextSpeed = speeds[(speeds.indexOf(speed) + 1) % speeds.length];
    setSpeed(nextSpeed);
    if (audioRef.current) audioRef.current.playbackRate = nextSpeed;
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white/75 p-4 dark:border-white/10 dark:bg-white/[0.04]">
      {phase?.audio ? (
        <audio
          ref={audioRef}
          src={resolveAudioPath(phase.audio)}
          preload="metadata"
          onLoadedMetadata={(event) => {
            const audio = event.currentTarget;
            const nextDuration = audio.duration || 0;
            audio.playbackRate = speed;
            if (progress?.lastPosition && progress.lastPosition < nextDuration) audio.currentTime = progress.lastPosition;
            setDuration(nextDuration);
            updateProgress(progress?.lastPosition || 0, nextDuration);
          }}
          onTimeUpdate={(event) => {
            const audio = event.currentTarget;
            setCurrentTime(audio.currentTime);
            setDuration(audio.duration || duration);
            updateProgress(audio.currentTime, audio.duration || duration);
          }}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onEnded={() => {
            setIsPlaying(false);
            updateProgress(duration, duration);
          }}
          onError={() => {
            setHasAudio(false);
            setIsPlaying(false);
          }}
        />
      ) : null}

      {!hasAudio ? (
        <div className="mb-3 rounded-lg border border-amber-300/70 bg-amber-100/80 px-3 py-2 text-sm font-semibold text-amber-950 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100">
          <p>{phase?.audio ? "Text-only revision mode. Add the MP3 file to enable audio for this phase." : "Text-only revision mode. Audio is not configured for this phase."}</p>
          {phase?.audio ? <p className="mt-1 text-xs font-bold opacity-80">Expected file: {phase.audio}</p> : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" onClick={onPrevious} disabled={!hasPrevious}>
          <ChevronLeft size={17} />
          Previous
        </Button>
        {hasAudio ? (
          <Button onClick={togglePlayback}>
            {isPlaying ? <Pause size={17} /> : <Play size={17} />}
            {isPlaying ? "Pause" : "Play"}
          </Button>
        ) : null}
        <Button variant="secondary" onClick={onNext} disabled={!hasNext}>
          Next
          <ChevronRight size={17} />
        </Button>
      </div>

      {hasAudio ? (
        <div className="mt-4 grid gap-3">
          <input
            type="range"
            min="0"
            max={Math.max(duration, currentTime, 1)}
            value={Math.min(currentTime, Math.max(duration, currentTime, 1))}
            onChange={(event) => seek(event.target.value)}
            className="w-full accent-teal-500"
          />
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
            <span>{formatDuration(currentTime)}</span>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => skip(-10)}>
                <RotateCcw size={16} />
                10s
              </Button>
              <Button variant="secondary" onClick={changeSpeed}>
                {speed}x
              </Button>
              <Button variant="secondary" onClick={() => skip(10)}>
                10s
                <RotateCw size={16} />
              </Button>
            </div>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
