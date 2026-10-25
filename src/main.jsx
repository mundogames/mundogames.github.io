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
function App() {
  const [reels, setReels] = useState(DEMO_REELS);
  const [likedIds, setLikedIds] = useState(new Set());
  const [activeId, setActiveId] = useState('demo-1');
  const [user, setUser] = useState(null);
  const [modal, setModal] = useState('');
  const [selectedReel, setSelectedReel] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('Para ti');
  const [mobileTab, setMobileTab] = useState('Início');

  const showNotice = message => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3000);
  };

  const apiStatus = API_BASE
    ? 'GUNNER · API ligada'
    : 'GUNNER · Modo demonstração';

  useEffect(() => {
    const savedUser = localStorage.getItem('gunner-user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {}
    }

    if (API_BASE) {
      fetch(`${API_BASE}/api/reels`)
        .then(response => {
          if (!response.ok) throw new Error('API indisponível');
          return response.json();
        })
        .then(data => {
          const list = Array.isArray(data) ? data : data.reels;
          if (Array.isArray(list) && list.length) {
            setReels(list.map(r => ({
              ...r,
              src: r.src || r.video_url || r.videoUrl,
              username: r.username || r.user?.username || 'utilizador',
              displayName: r.displayName || r.username || 'Utilizador',
              likes: r.likes ?? r.likes_count ?? 0,
              comments: r.comments ?? r.comments_count ?? 0
            })));
          }
        })
        .catch(() => showNotice('A API não respondeu. A mostrar vídeos de demonstração.'));
    }
  }, []);

  useEffect(() => {
    const feed = document.querySelector('.feed');
    if (!feed) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.65) {
          setActiveId(entry.target.dataset.reelId);
        }
      });
    }, { root: feed, threshold: [0.65] });

    feed.querySelectorAll('.reel').forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [reels, tab, query]);

  async function apiRequest(path, options = {}) {
    const headers = { ...(options.headers || {}) };

    if (user?.token) {
      headers.Authorization = `Bearer ${user.token}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Ocorreu um erro.');
    }

    if (response.status === 204) return null;
    return response.json();
  }

  async function likeReel(reel) {
    if (!user) {
      setSelectedReel(reel);
      setModal('auth');
      return;
    }

    const alreadyLiked = likedIds.has(reel.id);

    setLikedIds(previous => {
      const next = new Set(previous);
      alreadyLiked ? next.delete(reel.id) : next.add(reel.id);
      return next;
    });

    setReels(previous => previous.map(item =>
      item.id === reel.id
        ? { ...item, likes: Math.max(0, item.likes + (alreadyLiked ? -1 : 1)) }
        : item
    ));

    if (API_BASE) {
      try {
        await apiRequest(`/api/reels/${reel.id}/like`, {
          method: 'POST'
        });
      } catch {
        showNotice('Não foi possível guardar o gosto no servidor.');
      }
    }
  }

  async function openComments(reel) {
    setSelectedReel(reel);
    setComments([]);
    setModal('comments');

    if (!API_BASE) {
      setComments([]);
      return;
    }

    try {
      const data = await apiRequest(`/api/reels/${reel.id}/comments`);
      setComments(Array.isArray(data) ? data : data.comments || []);
    } catch {
      showNotice('Não foi possível carregar os comentários.');
    }
  }

  async function submitComment(event) {
    event.preventDefault();

    if (!user) {
      setModal('auth');
      showNotice('Entra na tua conta para comentar.');
      return;
    }

    if (!commentText.trim() || !selectedReel) return;

    if (!API_BASE) {
      showNotice('Os comentários precisam de uma API ligada.');
      return;
    }

    try {
      const comment = await apiRequest(
        `/api/reels/${selectedReel.id}/comments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: commentText.trim() })
        }
      );

      setComments(previous => [
        ...previous,
        comment.comment || comment
      ]);

      setCommentText('');
      showNotice('Comentário publicado!');
    } catch (error) {
      showNotice(error.message || 'Erro ao comentar.');
    }
  }

  async function shareReel(reel) {
    const url = `${window.location.origin}${window.location.pathname}#${reel.id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'GUNNER',
          text: reel.caption,
          url
        });
      } else {
        await navigator.clipboard.writeText(url);
        showNotice('Link copiado!');
      }
    } catch {}
  }

  function openProfile(username) {
    const reel = reels.find(item => item.username === username);
    setSelectedReel(reel || null);
    setModal('profile');
  }

  async function authAction(event, mode) {
    event.preventDefault();

    if (!API_BASE) {
      showNotice('Para criar contas reais, é necessário ligar o backend.');
      return;
    }

    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    try {
      const data = await apiRequest(
        mode === 'register' ? '/api/auth/register' : '/api/auth/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      const account = data.user || data;
      const token = data.token || data.access_token;

      const loggedUser = {
        ...account,
        token,
        username: account.username || payload.username,
        email: account.email || payload.email
      };

      setUser(loggedUser);
      localStorage.setItem('gunner-user', JSON.stringify(loggedUser));
      setModal('');
      showNotice('Sessão iniciada!');
    } catch (error) {
      showNotice(error.message || 'Não foi possível entrar.');
    }
  }

  async function uploadReel(event) {
    event.preventDefault();

    if (!user) {
      setModal('auth');
      showNotice('Entra na tua conta para publicar.');
      return;
    }

    if (!uploadFile) {
      showNotice('Escolhe um vídeo primeiro.');
      return;
    }

    if (!API_BASE) {
      const localReel = {
        id: `local-${Date.now()}`,
        username: user.username || 'utilizador',
        displayName: user.username || 'Utilizador',
        caption: uploadCaption,
        music: 'Som original · GUNNER',
        likes: 0,
        comments: 0,
        src: URL.createObjectURL(uploadFile),
        poster: ''
      };

      setReels(previous => [localReel, ...previous]);
      setActiveId(localReel.id);
      setModal('');
      setUploadFile(null);
      setUploadCaption('');
      showNotice('Vídeo adicionado apenas a esta sessão.');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('video', uploadFile);
      formData.append('caption', uploadCaption);

      const data = await apiRequest('/api/reels', {
        method: 'POST',
        body: formData
      });

      const created = data.reel || data;

      setReels(previous => [{
        ...created,
        id: created.id || `uploaded-${Date.now()}`,
        username: user.username,
        displayName: user.username,
        src: created.src || created.video_url,
        caption: created.caption || uploadCaption,
        likes: created.likes || 0,
        comments: created.comments || 0,
        music: 'Som original · GUNNER'
      }, ...previous]);

      setModal('');
      setUploadFile(null);
      setUploadCaption('');
      showNotice('Vídeo publicado!');
    } catch (error) {
      showNotice(error.message || 'Falha ao publicar o vídeo.');
    } finally {
      setUploading(false);
    }
  }

  const filteredReels = reels.filter(reel =>
    `${reel.username} ${reel.caption}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => {
          setTab('Para ti');
          setMobileTab('Início');
        }}>
          GUN<span>NER</span>
        </button>

        <div className="top-tabs">
          <button
            className={tab === 'Seguindo' ? 'active' : ''}
            onClick={() => setTab('Seguindo')}
          >
            Seguindo
          </button>
          <button
            className={tab === 'Para ti' ? 'active' : ''}
            onClick={() => setTab('Para ti')}
          >
            Para ti
          </button>
        </div>

        <button
          className="icon-btn"
          onClick={() => setModal('search')}
          aria-label="Pesquisar"
        >
          <Search />
        </button>
      </header>

      <main className="feed" key={tab}>
        {filteredReels.length ? filteredReels.map(reel => (
          <ReelCard
            key={reel.id}
            reel={reel}
            active={activeId === reel.id}
            liked={likedIds.has(reel.id)}
            onLike={likeReel}
            onComment={openComments}
            onShare={shareReel}
            onProfile={openProfile}
          />
        )) : (
          <div className="no-results">
            <Search size={34} />
            <h2>Nenhum vídeo encontrado</h2>
            <p>Tenta outra pesquisa ou publica um vídeo.</p>
          </div>
        )}
      </main>

      <nav className="bottom-nav">
        <button
          className={mobileTab === 'Início' ? 'selected' : ''}
          onClick={() => {
            setMobileTab('Início');
            setTab('Para ti');
            document.querySelector('.feed')?.scrollTo({ top: 0 });
          }}
        >
          <Home /><span>Início</span>
        </button>

        <button onClick={() => {
          setMobileTab('Descobrir');
          setModal('search');
        }}>
          <Compass /><span>Descobrir</span>
        </button>

        <button
          className="create-nav"
          onClick={() => setModal('upload')}
          aria-label="Publicar vídeo"
        >
          <span><Plus /></span>
        </button>

        <button onClick={() => showNotice('A caixa de entrada será adicionada numa próxima etapa.')}>
          <Inbox /><span>Inbox</span>
        </button>

        <button onClick={() => {
          setMobileTab('Perfil');
          setModal('profile');
        }}>
          <UserRound /><span>Perfil</span>
        </button>
      </nav>

      <div className="status-pill">{apiStatus}</div>

      {notice && <div className="toast">{notice}</div>}

      {modal && (
        <div
          className="modal-backdrop"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setModal('');
          }}
        >
          <section className="modal">
            <div className="modal-head">
              <strong>
                {modal === 'comments' ? 'Comentários' :
                 modal === 'upload' ? 'Publicar vídeo' :
                 modal === 'search' ? 'Descobrir' :
                 modal === 'auth' ? 'Entrar ou criar conta' : 'Perfil'}
              </strong>

              <button className="icon-btn" onClick={() => setModal('')}>
                <X />
              </button>
            </div>

            {modal === 'comments' && (
              <>
                <div className="comment-list">
                  {comments.length ? comments.map((comment, index) => (
                    <div className="comment-row" key={comment.id || index}>
                      <span className="avatar small">G</span>
                      <div>
                        <b>@{comment.username || comment.user?.username || 'utilizador'}</b>
                        <p>{comment.text || comment.content}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="empty-state">
                      <MessageCircle size={30} />
                      <p>Sê o primeiro a comentar.</p>
                    </div>
                  )}
                </div>

                <form className="comment-form" onSubmit={submitComment}>
                  <input
                    value={commentText}
                    onChange={event => setCommentText(event.target.value)}
                    placeholder="Adicionar comentário…"
                    maxLength={500}
                  />
                  <button disabled={!commentText.trim()}>
                    <Send size={19} />
                  </button>
                </form>
              </>
            )}

            {modal === 'search' && (
              <div className="search-panel">
                <label>Pesquisar vídeos e criadores</label>
                <div className="search-input">
                  <Search />
                  <input
                    autoFocus
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    placeholder="Ex.: dança, música, natureza"
                  />
                </div>
                <button className="primary-btn" onClick={() => setModal('')}>
                  Ver resultados
                </button>
              </div>
            )}

            {modal === 'upload' && (
              <form className="upload-form" onSubmit={uploadReel}>
                <label className="file-drop">
                  <Upload size={32} />
                  <b>{uploadFile ? uploadFile.name : 'Escolher um vídeo'}</b>
                  <span>MP4, WebM ou MOV</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/*"
                    onChange={event => setUploadFile(event.target.files?.[0] || null)}
                  />
                </label>

                <label>
                  Legenda
                  <textarea
                    value={uploadCaption}
                    onChange={event => setUploadCaption(event.target.value)}
                    maxLength={2200}
                    placeholder="Escreve uma legenda…"
                  />
                </label>

                <button className="primary-btn" disabled={uploading}>
                  {uploading ? 'A enviar…' : 'Publicar vídeo'}
                </button>
              </form>
            )}

            {modal === 'auth' && (
              <div className="auth-panel">
                <p>Entra na tua conta ou cria uma conta.</p>

                <form onSubmit={event => authAction(event, 'register')}>
                  <label>
                    Nome de utilizador
                    <input name="username" required minLength="3" placeholder="o_teu_nome" />
                  </label>

                  <label>
                    Email
                    <input name="email" type="email" required placeholder="tu@exemplo.com" />
                  </label>

                  <label>
                    Palavra-passe
                    <input name="password" type="password" required minLength="8" />
                  </label>

                  <button className="primary-btn">Criar conta</button>
                </form>

                <form onSubmit={event => authAction(event, 'login')}>
                  <label>
                    Email
                    <input name="email" type="email" required />
                  </label>

                  <label>
                    Palavra-passe
                    <input name="password" type="password" required />
                  </label>

                  <button className="secondary-btn">
                    <LogIn size={17} /> Entrar
                  </button>
                </form>
              </div>
            )}

            {modal === 'profile' && (
              <div className="profile-panel">
                <div className="profile-avatar"><UserRound size={36} /></div>

                <h2>
                  {user
                    ? '@' + (user.username || user.email)
                    : selectedReel
                      ? '@' + selectedReel.username
                      : 'O teu perfil'}
                </h2>

                <p className="muted">
                  {user
                    ? user.email || 'Conta GUNNER'
                    : 'Entra ou cria uma conta para teres o teu perfil.'}
                </p>

                {user ? (
                  <button
                    className="secondary-btn"
                    onClick={() => {
                      setUser(null);
                      localStorage.removeItem('gunner-user');
                      showNotice('Sessão terminada.');
                      setModal('');
                    }}
                  >
                    Terminar sessão
                  </button>
                ) : (
                  <button className="primary-btn" onClick={() => setModal('auth')}>
                    Entrar / Criar conta
                  </button>
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
