import { getAllPresentations } from '@/lib/presentations.server';
import PresentationPageClient from './presentation-page-client';

export default async function PresentationPage() {
  const presentations = await getAllPresentations();

  return <PresentationPageClient presentations={presentations} />;
}