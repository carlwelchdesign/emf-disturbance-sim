import { ThemeProvider } from './lab/theme/ThemeProvider';

export const metadata = {
  title: 'EMF Disturbance Lab',
  description: 'Interactive EMF/RF field visualization and analysis tool',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
