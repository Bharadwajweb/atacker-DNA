import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, FastForward, Clock, SkipForward } from "lucide-react";
import { playTacticalClick } from "../utils/audio";

export default function AttackReplayScrubber({ totalEvents = 0, currentIndex = 0, onIndexChange }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1x, 2x, 5x
  const timerRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      const intervalMs = Math.max(300, 1200 / playbackSpeed);
      timerRef.current = setInterval(() => {
        onIndexChange(prev => {
          if (prev >= totalEvents - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isPlaying, playbackSpeed, totalEvents, onIndexChange]);

  const handleSliderChange = (e) => {
    const val = parseInt(e.target.value, 10);
    onIndexChange(val);
  };

  const handleRewind = () => {
    playTacticalClick();
    setIsPlaying(false);
    onIndexChange(0);
  };

  const handleStepForward = () => {
    playTacticalClick();
    if (currentIndex < totalEvents - 1) {
      onIndexChange(currentIndex + 1);
    }
  };

  const cycleSpeed = () => {
    playTacticalClick();
    const speeds = [1, 2, 5];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
  };

  const progressPercent = totalEvents > 1 ? ((currentIndex / (totalEvents - 1)) * 100).toFixed(0) : 100;

  return (
    <div
      className="glass-panel"
      style={{
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
        flexWrap: "wrap",
        borderTop: "1px solid rgba(0, 240, 255, 0.3)"
      }}
    >
      {/* Left: Status & Current Event */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span
          className="cyber-badge"
          style={{
            background: isPlaying ? "rgba(16, 185, 129, 0.15)" : "rgba(30, 58, 95, 0.5)",
            color: isPlaying ? "var(--emerald-neon)" : "#94a3b8"
          }}
        >
          <Clock size={12} /> {isPlaying ? "REPLAY ACTIVE" : "TIME SCRUBBER"}
        </span>
        <div style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "#f8fafc" }}>
          SEQUENCE STEP <strong style={{ color: "var(--cyan-neon)" }}>{currentIndex + 1}</strong> OF{" "}
          <strong>{totalEvents}</strong> ({progressPercent}%)
        </div>
      </div>

      {/* Center: Interactive Scrubber Slider */}
      <div style={{ flex: 1, minWidth: 260, display: "flex", alignItems: "center", gap: 12 }}>
        <input
          type="range"
          min={0}
          max={Math.max(0, totalEvents - 1)}
          value={currentIndex}
          onChange={handleSliderChange}
          style={{
            width: "100%",
            accentColor: "var(--cyan-neon)",
            cursor: "pointer"
          }}
        />
      </div>

      {/* Right: Playback Buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          className="cyber-btn"
          style={{ padding: "6px 12px", background: "rgba(30, 58, 95, 0.4)", color: "#cbd5e1" }}
          onClick={handleRewind}
          title="Rewind to Step 1"
        >
          <RotateCcw size={14} /> REWIND
        </button>

        <button
          className="cyber-btn cyber-btn-cyan"
          style={{ padding: "6px 16px" }}
          onClick={() => {
            playTacticalClick();
            setIsPlaying(!isPlaying);
          }}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          {isPlaying ? "PAUSE" : "PLAY"}
        </button>

        <button
          className="cyber-btn"
          style={{ padding: "6px 12px", background: "rgba(30, 58, 95, 0.4)", color: "#cbd5e1" }}
          onClick={handleStepForward}
          title="Step 1 Event Forward"
        >
          <SkipForward size={14} />
        </button>

        <button
          className="cyber-btn"
          style={{ padding: "6px 12px", background: "rgba(0, 240, 255, 0.08)", color: "var(--cyan-neon)", border: "1px solid rgba(0, 240, 255, 0.3)" }}
          onClick={cycleSpeed}
          title="Toggle Playback Speed"
        >
          <FastForward size={14} /> {playbackSpeed}X
        </button>
      </div>
    </div>
  );
}
