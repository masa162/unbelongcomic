import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { episodesApi, worksApi, type Episode, type Work } from '../lib/api';
import { getImageUrl } from '../lib/utils';
import { ArrowLeft, ChevronLeft, ChevronRight, Menu } from 'lucide-react';

export default function ViewerPage() {
  const { episodeId: slug } = useParams<{ episodeId: string }>();
  const navigate = useNavigate();
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [work, setWork] = useState<Work | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchEpisode(slug);
    }
    
    // Auto-hide controls after 3 seconds
    const timer = setTimeout(() => setShowControls(false), 3000);
    return () => clearTimeout(timer);
  }, [slug]);

  const fetchEpisode = async (slug: string) => {
    try {
      setLoading(true);
      const res = await episodesApi.get(slug);
      if (res.data.success && res.data.data) {
        const epData = res.data.data;
        setEpisode(epData);
        
        // Parse content (JSON array of image IDs)
        if (epData.content) {
          try {
            const parsed = JSON.parse(epData.content);
            if (Array.isArray(parsed)) {
              setImages(parsed);
            }
          } catch (e) {
            console.error('Failed to parse episode content:', e);
          }
        }

        // Fetch work info for breadcrumbs/navigation
        const workRes = await worksApi.get(epData.work_id);
        if (workRes.data.success && workRes.data.data) {
          setWork(workRes.data.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch episode:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleControls = () => setShowControls(!showControls);

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyItems: 'center', background: '#000', color: '#fff', width: '100%' }}><div style={{ width: '100%', textAlign: 'center' }}>読み込み中...</div></div>;
  if (!episode) return <div style={{ padding: '4rem', textAlign: 'center' }}>エピソードが見つかりませんでした</div>;

  return (
    <div 
      style={{ background: '#000', minHeight: '100vh', position: 'relative' }}
      onClick={toggleControls}
    >
      {/* Top Header Controls */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '64px',
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(10px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        padding: '0 1.5rem',
        color: 'white',
        transform: showControls ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s ease-in-out',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}
      onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={() => work ? navigate(`/works/${work.slug}`) : navigate('/')}
          style={{ background: 'none', border: 'none', color: 'white', padding: '0.5rem', cursor: 'pointer', display: 'flex' }}
        >
          <ArrowLeft size={24} />
        </button>
        <div style={{ marginLeft: '1rem', flex: 1 }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{work?.title}</div>
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>第{episode.episode_number}話 {episode.title}</div>
        </div>
      </header>

      {/* Webtooon Viewer (Vertical Scroll) */}
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
        {images.map((imgId, index) => (
          <img
            key={`${imgId}-${index}`}
            src={getImageUrl(imgId, { width: 1200 })}
            alt={`Page ${index + 1}`}
            style={{ width: '100%', display: 'block', height: 'auto' }}
            loading="lazy"
          />
        ))}
        
        {images.length === 0 && (
          <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyItems: 'center', color: '#64748b' }}>
            <div style={{ width: '100%', textAlign: 'center' }}>コンテンツがありません</div>
          </div>
        )}

        {/* End of Episode Button */}
        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
           <Link 
            to={`/works/${work?.slug}`}
            style={{ 
              display: 'inline-block',
              padding: '1rem 3rem', 
              background: '#334155', 
              color: 'white', 
              borderRadius: '99px',
              textDecoration: 'none',
              fontWeight: 700
            }}
           >
             エピソード一覧に戻る
           </Link>
        </div>
      </div>

      {/* Bottom Navigation */}
      <footer style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '80px',
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(10px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        color: 'white',
        transform: showControls ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s ease-in-out',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}
      onClick={(e) => e.stopPropagation()}
      >
        <button style={{ background: 'none', border: 'none', color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <ChevronLeft size={24} />
          <span style={{ fontSize: '0.7rem' }}>前へ</span>
        </button>
        <button 
          onClick={() => work && navigate(`/works/${work.slug}`)}
          style={{ background: 'none', border: 'none', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
        >
          <Menu size={24} />
          <span style={{ fontSize: '0.7rem' }}>目次</span>
        </button>
        <button style={{ background: 'none', border: 'none', color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <ChevronRight size={24} />
          <span style={{ fontSize: '0.7rem' }}>次へ</span>
        </button>
      </footer>
    </div>
  );
}
