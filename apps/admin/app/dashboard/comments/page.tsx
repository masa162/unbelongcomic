'use client';

import { useEffect, useState } from 'react';
import { commentsApi } from '@/lib/api';
import type { Comment } from '@unbelong/shared';
import { formatDateTime } from '@unbelong/shared';

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadComments();
  }, [filter]);

  const loadComments = async () => {
    try {
      const status = filter === 'all' ? undefined : filter;
      const response = await commentsApi.list(undefined, undefined, status);
      if (response.data.success && response.data.data) {
        setComments(response.data.data);
      }
    } catch (error) {
      console.error('コメントの取得に失敗しました:', error);
      alert('コメントの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await commentsApi.update(id, { status });
      alert('コメントのステータスを更新しました');
      loadComments();
    } catch (error) {
      console.error('コメントの更新に失敗しました:', error);
      alert('コメントの更新に失敗しました');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このコメントを削除しますか？')) return;

    try {
      await commentsApi.delete(id);
      alert('コメントを削除しました');
      loadComments();
    } catch (error) {
      console.error('コメントの削除に失敗しました:', error);
      alert('コメントの削除に失敗しました');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
      spam: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      approved: '承認済み',
      pending: '保留中',
      rejected: '却下',
      spam: 'スパム',
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${badges[status as keyof typeof badges] || badges.pending}`}
      >
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">コメント管理</h1>
        <p className="text-gray-600 mt-2">投稿されたコメントの管理・承認</p>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            全て
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-md ${
              filter === 'approved'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            承認済み
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-md ${
              filter === 'pending'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            保留中
          </button>
          <button
            onClick={() => setFilter('spam')}
            className={`px-4 py-2 rounded-md ${
              filter === 'spam'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            スパム
          </button>
        </div>
      </div>

      {/* コメント一覧 */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                {getStatusBadge(comment.status)}
                <span className="text-sm text-gray-500">
                  {comment.target_type} - {comment.target_id}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {formatDateTime(comment.created_at)}
              </span>
            </div>

            <p className="text-gray-800 mb-4">{comment.content}</p>

            {comment.ip_address && (
              <p className="text-xs text-gray-400 mb-4">IP: {comment.ip_address}</p>
            )}

            <div className="flex space-x-2">
              {comment.status !== 'approved' && (
                <button
                  onClick={() => handleUpdateStatus(comment.id, 'approved')}
                  className="px-4 py-2 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  承認
                </button>
              )}
              {comment.status !== 'rejected' && (
                <button
                  onClick={() => handleUpdateStatus(comment.id, 'rejected')}
                  className="px-4 py-2 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                >
                  却下
                </button>
              )}
              {comment.status !== 'spam' && (
                <button
                  onClick={() => handleUpdateStatus(comment.id, 'spam')}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  スパム
                </button>
              )}
              <button
                onClick={() => handleDelete(comment.id)}
                className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                削除
              </button>
            </div>
          </div>
        ))}
      </div>

      {comments.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500">コメントがまだありません</p>
        </div>
      )}
    </div>
  );
}
