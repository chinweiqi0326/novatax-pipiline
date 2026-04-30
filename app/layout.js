export const metadata = {
  title: 'Nova Tax SG - Sales Pipeline',
  description: 'Sales Pipeline Tracker',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
