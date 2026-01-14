import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { worksApi, episodesApi, type Work, type Episode } from '../lib/api';
import { getImageUrl, formatDate } from '../lib/utils';
import { ArrowLeft, Play } from 'lucide-react';

export default function WorkPage() {
  const { workId: slug } = useParams<{ workId: string }>();
  const [work, setWork] = useState<Work | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchData(slug);
    }
  }, [slug]);

  const fetchData = async (slug: string) => {
    try {
      const workRes = await worksApi.get(slug);
      if (workRes.data.success && workRes.data.data) {
        const workData = workRes.data.data;
        setWork(workData);
        
        const episodesRes = await episodesApi.list(workData.id);
        if (episodesRes.data.success && episodesRes.data.data) {
          setEpisodes(episodesRes.data.data.filter(e => e.status === 'published'));
        }
      }
    } catch (error) {
      console.error('Failed to fetch work data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>読み込み中...</div>;
  if (!work) return <div style={{ padding: '4rem', textAlign: 'center' }}>作品が見つかりませんでした</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '2rem' }}>
        <ArrowLeft size={20} />
        トップに戻る
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '3rem', marginBottom: '4rem' }}>
        <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
          <img
            src={getImageUrl(work.thumbnail_image_id || '', { width: 600 })}
            alt={work.title}
            style={{ width: '100%', display: 'block' }}
          />
        </div>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 800 }}>{work.title}</h1>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
             <span style={{ padding: '0.25rem 0.75rem', background: '#3b82f6', color: 'white', borderRadius: '99px', fontSize: '0.875rem' }}>
               {work.status === 'published' ? '公開中' : '準備中'}
             </span>
          </div>
          <p style={{ lineHeight: 1.7, color: '#94a3b8', fontSize: '1.1rem' }}>
            {work.description || '作品の説明はありません。'}
          </p>
        </div>
      </div>

      <div style={{ marginTop: '4rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', borderBottom: '2px solid #334155', paddingBottom: '1rem' }}>エピソード</h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {episodes.map((episode) => (
            <Link 
              key={episode.id} 
              to={`/viewer/${episode.slug}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="glass" style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1.25rem',
                borderRadius: '12px',
                gap: '1.5rem',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                <div style={{ width: '120px', aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden', background: '#1e293b' }}>
                   {episode.thumbnail_image_id && (
                     <img src={getImageUrl(episode.thumbnail_image_id, { width: 240 })} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                   )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>第{episode.episode_number}話 {episode.title}</div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{formatDate(episode.created_at)}</div>
                </div>
                <Play size={24} style={{ color: '#3b82f6' }} />
              </div>
            </Link>
          ))}
          {episodes.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              エピソードはまだありません。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
