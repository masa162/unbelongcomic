import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { worksApi, type Work } from '../lib/api';
import { getImageUrl } from '../lib/utils';

export default function HomePage() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorks();
  }, []);

  const fetchWorks = async () => {
    try {
      const response = await worksApi.list('comic');
      if (response.data.success && response.data.data) {
        setWorks(response.data.data.filter(w => w.type === 'comic' && w.status === 'published'));
      }
    } catch (error) {
      console.error('Failed to fetch works:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '0.5rem', fontWeight: 800 }}>unbelong comic</h1>
        <p style={{ color: '#64748b' }}>オリジナル漫画・Webtoon作品集</p>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>読み込み中...</div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '2rem'
        }}>
          {works.map((work) => (
            <Link 
              key={work.id} 
              to={`/works/${work.slug}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="glass" style={{
                borderRadius: '16px',
                overflow: 'hidden',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <div style={{ aspectRatio: '3/4', position: 'relative', overflow: 'hidden' }}>
                  <img
                    src={getImageUrl(work.thumbnail_image_id || '', { width: 600, fit: 'cover' })}
                    alt={work.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '1.5rem',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                    color: 'white'
                  }}>
                    <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>{work.title}</h2>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      background: 'rgba(255,255,255,0.2)', 
                      padding: '0.2rem 0.5rem', 
                      borderRadius: '4px',
                      marginTop: '0.5rem',
                      display: 'inline-block'
                    }}>
                      {work.status === 'published' ? '公開中' : '準備中'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
