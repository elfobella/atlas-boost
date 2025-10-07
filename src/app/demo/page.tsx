import { ThemeToggle } from "@/components/theme-toggle";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      {/* Header with Theme Toggle */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Dark Mode Demo</h1>
        <ThemeToggle />
      </header>

      {/* Content Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Primary Card */}
        <div className="bg-primary text-primary-foreground p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Primary Card</h2>
          <p className="text-sm opacity-90">
            Bu kart primary renk temasını kullanır ve dark/light mode&apos;da otomatik olarak değişir.
          </p>
        </div>

        {/* Secondary Card */}
        <div className="bg-secondary text-secondary-foreground p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Secondary Card</h2>
          <p className="text-sm">
            Secondary tema renkleri ile güzel bir kontrast oluşturur.
          </p>
        </div>

        {/* Muted Card */}
        <div className="bg-muted text-muted-foreground p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Muted Card</h2>
          <p className="text-sm">
            Muted renkler daha yumuşak bir görünüm sağlar.
          </p>
        </div>

        {/* Accent Card */}
        <div className="bg-accent text-accent-foreground p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Accent Card</h2>
          <p className="text-sm">
            Accent renkleri vurgu yapmak için kullanılır.
          </p>
        </div>

        {/* Border Card */}
        <div className="border border-border bg-card text-card-foreground p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Border Card</h2>
          <p className="text-sm">
            Border ve card renkleri ile çerçeveli bir tasarım.
          </p>
        </div>

        {/* Destructive Card */}
        <div className="bg-destructive text-destructive-foreground p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Destructive Card</h2>
          <p className="text-sm">
            Hata veya silme işlemleri için kırmızı tema.
          </p>
        </div>
      </div>

      {/* Form Example */}
      <div className="mt-12 max-w-md">
        <h2 className="text-2xl font-semibold mb-6">Form Example</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input 
              type="email" 
              className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter your email"
            />
          </div>
          <button className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors">
            Submit
          </button>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="mt-12 bg-muted p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Nasıl Kullanılır?</h2>
        <div className="space-y-2 text-sm">
          <p>• <code className="bg-background px-2 py-1 rounded text-xs">bg-background</code> - Ana arka plan rengi</p>
          <p>• <code className="bg-background px-2 py-1 rounded text-xs">text-foreground</code> - Ana metin rengi</p>
          <p>• <code className="bg-background px-2 py-1 rounded text-xs">bg-card</code> - Kart arka planları</p>
          <p>• <code className="bg-background px-2 py-1 rounded text-xs">border-border</code> - Kenarlık renkleri</p>
          <p>• <code className="bg-background px-2 py-1 rounded text-xs">bg-primary</code> - Birincil renk</p>
          <p>• <code className="bg-background px-2 py-1 rounded text-xs">bg-secondary</code> - İkincil renk</p>
        </div>
      </div>
    </div>
  );
}
