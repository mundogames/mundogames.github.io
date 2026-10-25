import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Home, Search, Plus, Inbox, UserRound, Heart, MessageCircle, Share2,
  Music2, Volume2, VolumeX, MoreHorizontal, Play, Pause, X, Upload,
  Bookmark, Send, ChevronDown, Compass, LogIn, Clapperboard
} from 'lucide-react';
import './style.css';

const DEMO_REELS = [
  {
    id: 'demo-1', username: 'natureza', displayName: 'Natureza', verified: false,
    caption: 'A natureza nunca deixa de surpreender 🌼 #natureza #reels',
    music: 'Som original · Natureza', likes: 12400, comments: 238,
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    poster: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1000&q=85'
  },
  {
    id: 'demo-2', username: 'descobrir', displayName: 'Descobrir', verified: false,
    caption: 'Pequenos momentos, grandes memórias ✨ #vida #momentos',
    music: 'Som de demonstração · Descobrir', likes: 8201, comments: 104,
    src: 'https://www.w3schools.com/html/mov_bbb.mp4',
    poster: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=85'
  },
  {
    id: 'demo-3', username: 'animais', displayName: 'Amigos animais', verified: false,
    caption: 'Um momento fofo para alegrar o teu dia 🐾',
    music: 'Som original · Animais', likes: 5678, comments: 89,
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    poster: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1000&q=85'
  }
];

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const fmt = n =>
  n >= 1000000
    ? (n / 1000000).toFixed(1).replace('.', ',') + ' mi'
    : n >= 10000
      ? (n / 1000).toFixed(1).replace('.', ',') + ' mil'
      : String(n);

function ReelCard({ reel, active, onLike, liked, onComment, onShare, onProfile }) {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (active) {
      video.muted = true;
      setMuted(true);
      const p = video.play();
      if (p?.catch) p.catch(() => {});
      setPaused(false);
    } else {
      video.pause();
      video.currentTime = 0;
      setPaused(false);
    }
  }, [active, reel.src]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;

    if (v.paused) {
      v.play().catch(() => {});
      setPaused(false);
    } else {
      v.pause();
      setPaused(true);
    }
  };

  const toggleMute = e => {
    e.stopPropagation();
    const next = !muted;
    setMuted(next);

    if (videoRef.current) videoRef.current.muted = next;

    document.querySelectorAll('video').forEach(v => {
      if (v !== videoRef.current) v.muted = true;
    });
  };

  return (
    <section className="reel" data-reel-id={reel.id}>
      <video
        ref={videoRef}
        className="reel-video"
        src={reel.src}
        poster={reel.poster}
        playsInline
        loop
        muted
        preload={active ? 'auto' : 'metadata'}
        onClick={togglePlay}
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
      />

      <button
        className="sound-toggle glass"
        onClick={toggleMute}
        aria-label={muted ? 'Ativar som' : 'Desativar som'}
      >
        {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
        <span>{muted ? 'Som desligado' : 'Som ligado'}</span>
      </button>

      {paused && (
        <button
          className="play-overlay"
          onClick={togglePlay}
          aria-label="Reproduzir"
        >
          <Play size={42} fill="white" />
        </button>
      )}

      <div className="reel-gradient" />

      <div className="reel-info">
        <button className="creator-line" onClick={() => onProfile(reel.username)}>
          <span className="avatar">
            {(reel.displayName || reel.username || 'R').slice(0, 1).toUpperCase()}
          </span>

          <strong>@{reel.username}</strong>

          {reel.verified && <span className="verified">✓</span>}

          <span
            className={'follow-btn ' + (following ? 'following' : '')}
            onClick={e => {
              e.stopPropagation();
              setFollowing(!following);
            }}
          >
            {following ? 'A seguir' : 'Seguir'}
          </span>
        </button>

        <p className="caption">{reel.caption}</p>

        <div className="music-line">
          <Music2 size={14} />
          <span>{reel.music || 'Som original'}</span>
        </div>
      </div>

      <aside className="reel-actions">
        <button
          className={'action-btn ' + (liked ? 'is-liked' : '')}
          onClick={() => onLike(reel)}
          aria-label="Gosto"
        >
          <span className="action-icon">
            <Heart size={29} fill={liked ? 'currentColor' : 'none'} />
          </span>
          <small>{fmt(reel.likes + (liked ? 1 : 0))}</small>
        </button>

        <button className="action-btn" onClick={() => onComment(reel)}>
          <span className="action-icon"><MessageCircle size={28} /></span>
          <small>{fmt(reel.comments || 0)}</small>
        </button>

        <button className="action-btn" onClick={() => onShare(reel)}>
          <span className="action-icon"><Share2 size={27} /></span>
          <small>Partilhar</small>
        </button>

        <button className="action-btn" onClick={toggleMute}>
          <span className="action-icon disc"><Music2 size={22} /></span>
          <small>Som</small>
        </button>
      </aside>
    </section>
  );
}
