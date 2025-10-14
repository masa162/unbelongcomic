import IllustrationForm from '@/components/IllustrationForm';

export default function NewIllustrationPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">新規イラスト作成</h1>
        <p className="text-gray-600 mt-2">新しいイラスト作品を追加します</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <IllustrationForm />
      </div>
    </div>
  );
}
