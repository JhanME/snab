import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar — simple, con CTA visible */}
      <nav className="border-b border-border px-8 py-4 flex items-center justify-between">
        <span className="font-bold text-lg tracking-tight">SNAB</span>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Iniciar sesion
          </Link>
          <Button asChild size="sm">
            <Link to="/register" className="font-mono text-xs uppercase tracking-widest">
              Jugar gratis
            </Link>
          </Button>
        </div>
      </nav>

      {/* HERO — título que vende el beneficio, no el nombre */}
      <section className="max-w-4xl mx-auto px-8 pt-24 md:pt-32 pb-16 text-center">
        <div className="inline-block mb-6 border border-accent/30 bg-accent/5 rounded-full px-4 py-1.5">
          <p className="font-mono text-[11px] uppercase tracking-widest text-accent">
            Gratis &middot; Sin descargas &middot; Multijugador
          </p>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.05] mb-6">
          Reta a tus amigos.<br />
          <span className="text-muted-foreground">3 minutos bastan.</span>
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
          Sopa de letras competitiva en tiempo real. Crea una sala, comparte el link y descubre quien encuentra mas palabras antes de que se acabe el tiempo.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/register" className="font-mono text-sm uppercase tracking-widest px-8">
              Crear partida
            </Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link to="/login" className="font-mono text-sm uppercase tracking-widest px-8">
              Ya tengo cuenta
            </Link>
          </Button>
        </div>
      </section>

      {/* GAME PREVIEW — el usuario necesita VER el juego */}
      <section className="max-w-4xl mx-auto px-8 pb-20">
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {/* Simulated game header */}
          <div className="border-b border-border px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Partida en vivo</span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-accent">02:47</span>
          </div>
          {/* Simulated grid preview */}
          <div className="p-6 md:p-8 flex flex-col items-center">
            <div className="grid grid-cols-8 gap-[2px] mb-6">
              {["R","E","T","A","M","O","S","P",
                "L","I","B","R","O","X","A","E",
                "G","A","T","O","Z","K","L","R",
                "U","N","W","Q","F","R","I","R",
                "E","S","O","L","J","E","D","O",
                "M","P","A","N","T","S","A","V",
                "R","E","D","H","A","A","R","I",
                "C","O","D","I","G","O","X","A"
              ].map((letter, i) => {
                const highlighted = [2,3,4, 16,17,18,19, 40,41,42, 56,57,58,59,60,61].includes(i);
                return (
                  <div
                    key={i}
                    className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center font-mono text-sm font-medium rounded-sm transition-colors"
                    style={{
                      backgroundColor: highlighted ? "oklch(0.488 0.243 264.376 / 0.25)" : "oklch(0.185 0 0)",
                      color: highlighted ? "oklch(0.488 0.243 264.376)" : "oklch(0.556 0 0)",
                    }}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {["GATO", "CODIGO", "RED"].map((word) => (
                <span key={word} className="font-mono text-xs uppercase tracking-widest px-3 py-1.5 border border-accent/30 text-accent bg-accent/5 rounded-sm line-through">
                  {word}
                </span>
              ))}
              {["PERRO", "SALIDA"].map((word) => (
                <span key={word} className="font-mono text-xs uppercase tracking-widest px-3 py-1.5 border border-border text-muted-foreground rounded-sm">
                  {word}
                </span>
              ))}
            </div>
          </div>
          {/* Simulated players bar */}
          <div className="border-t border-border px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center">
                  <span className="text-[9px] font-mono text-accent">T</span>
                </div>
                <span className="text-xs">Tu — <strong className="text-accent">3</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center">
                  <span className="text-[9px] font-mono">A</span>
                </div>
                <span className="text-xs text-muted-foreground">Amigo — <strong>1</strong></span>
              </div>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">2 jugadores</span>
          </div>
        </div>
      </section>

      <Separator />

      {/* HOW IT WORKS — 3 pasos, ultra simple */}
      <section className="max-w-4xl mx-auto px-8 py-20">
        <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3 text-center">Como funciona</p>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-12">
          De cero a jugando en 30 segundos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Crea una sala",
              desc: "Un click y tu sala esta lista. Sin configurar nada.",
            },
            {
              step: "02",
              title: "Comparte el link",
              desc: "Tu amigo entra con el link. No necesita cuenta ni descargar nada.",
            },
            {
              step: "03",
              title: "Compite en vivo",
              desc: "3 minutos. Quien encuentre mas palabras, gana. Asi de simple.",
            },
          ].map((s) => (
            <div key={s.step} className="bg-card border border-border rounded-lg p-6 text-center">
              <div className="w-10 h-10 rounded-full border border-accent/30 bg-accent/5 flex items-center justify-center mx-auto mb-4">
                <span className="font-mono text-xs text-accent font-bold">{s.step}</span>
              </div>
              <h3 className="font-semibold mb-2">{s.title}</h3>
              <p className="text-muted-foreground text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* BENEFITS — por qué esto y no otra cosa */}
      <section className="max-w-4xl mx-auto px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg p-8">
            <h3 className="text-xl font-bold mb-4">Sin friccion</h3>
            <p className="text-muted-foreground leading-relaxed">
              No hay que descargar nada. No hay que esperar matchmaking. Creas la sala, mandas el link por WhatsApp y listo. Tu amigo entra con un nickname y ya esta jugando.
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-8">
            <h3 className="text-xl font-bold mb-4">Competencia real</h3>
            <p className="text-muted-foreground leading-relaxed">
              Ves el cursor de tu rival en tiempo real. Sabes que esta buscando la misma palabra que tu. Cada segundo cuenta. Eso es lo que lo hace adictivo.
            </p>
          </div>
        </div>
      </section>

      <Separator />

      {/* SOCIAL PROOF — stats que generan confianza */}
      <section className="px-8 py-12">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-12 md:gap-20">
          {[
            { value: "100+", label: "Partidas jugadas" },
            { value: "<1s", label: "Tiempo de carga" },
            { value: "0", label: "Descargas necesarias" },
            { value: "2-4", label: "Jugadores por sala" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-accent">{s.value}</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* FINAL CTA — repetir, más directo */}
      <section className="py-20 md:py-28 text-center px-8">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
          Tu amigo ya esta esperando.
        </h2>
        <p className="text-muted-foreground mb-8 text-lg">
          Crea una sala gratis y comparte el link. Toma 10 segundos.
        </p>
        <Button asChild size="lg">
          <Link to="/register" className="font-mono text-sm uppercase tracking-widest px-10">
            Crear partida gratis
          </Link>
        </Button>
      </section>

      {/* Footer — mínimo */}
      <Separator />
      <footer className="px-8 py-6 flex items-center justify-between">
        <span className="font-bold text-sm tracking-tight">SNAB</span>
        <div className="flex gap-6">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Twitter</span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Discord</span>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">&copy; 2025 SNAB</span>
      </footer>
    </div>
  );
}
