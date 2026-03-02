export default function CardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-svh bg-muted/30">
      {children}
    </div>
  )
}
