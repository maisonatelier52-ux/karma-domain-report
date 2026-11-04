import './globals.css';

export const metadata = {
  title: 'Domain Report Manager',
  description: 'Track domains, owners, client articles and download reports as PDF, Word or Excel.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
