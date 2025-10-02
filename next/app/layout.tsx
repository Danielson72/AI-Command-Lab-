export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body>
        <header className="p-4 border-b">
          <h1 className="text-xl font-bold">AI Command Lab</h1>
        </header>
        <main className="p-6">{children}</main>
        <footer className="p-4 border-t text-sm text-center">
          © {new Date().getFullYear()} AI Command Lab
        </footer>
      </body>
    </html>
  )
}
