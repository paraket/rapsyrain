import PrivacyClient from './PrivacyClient';

export const metadata = {
  title: 'Privacy Policy - Your Files Never Leave Your Window | myPDF',
  description: 'Read our privacy policy. myPDF is built as a secure browser-based tool. We never see, store, or upload your sensitive documents.',
  alternates: {
    canonical: 'https://mypdf.qpkendra.com/privacy',
  },
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}
