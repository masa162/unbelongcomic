import EpisodeForm from '@/components/EpisodeForm';

export default function NewEpisodePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">新規エピソード作成</h1>
        <p className="text-gray-600 mt-2">新しいエピソード（話数）を追加します</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <EpisodeForm />
      </div>
    </div>
  );
}
