import ProtectedRoute from '@/app/components/auth/ProtectedRoute';
import EnglishJourney from '@/app/components/english/EnglishJourney';

export default function EnglishPage() {
  return (
    <ProtectedRoute>
      <EnglishJourney />
    </ProtectedRoute>
  );
}
