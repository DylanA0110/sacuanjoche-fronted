export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-5xl font-display text-gradient-fire mb-3">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Bienvenido al panel de administración
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Aquí puedes agregar cards de estadísticas */}
      </div>
    </div>
  );
}

