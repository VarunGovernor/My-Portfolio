export default function GradientBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {/* Primary purple blob — top left */}
      <div
        className="blob blob-1"
        style={{ top: '-10%', left: '-8%' }}
      />
      {/* Pink blob — top right */}
      <div
        className="blob blob-2"
        style={{ top: '5%', right: '-5%' }}
      />
      {/* Cyan blob — bottom center */}
      <div
        className="blob blob-3"
        style={{ bottom: '10%', left: '40%', transform: 'translateX(-50%)' }}
      />
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(124,58,237,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124,58,237,0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  )
}
