import './globals.css';

export const metadata = {
  title: 'TicketVerse',
  description: 'Temukan dan pesan tiket konser favorit Anda dengan mudah di TicketVerse',
  keywords: 'tiket konser, pesan tiket, konser, musik, event',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="font-poppins antialiased">
        {children}
      </body>
    </html>
  );
}