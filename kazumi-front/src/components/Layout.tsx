import { Outlet, Link, useLocation } from "react-router-dom";
import { Home, MessageSquare, Calendar, BookOpen, User } from "lucide-react";

const Layout = () => {
  const location = useLocation();
  
  const navItems = [
    { path: "/", icon: Home, label: "Início" },
    { path: "/mensagens", icon: MessageSquare, label: "Mensagens" },
    { path: "/agenda", icon: Calendar, label: "Agenda" },
    { path: "/conteudos", icon: BookOpen, label: "Conteúdos" },
    { path: "/aluno", icon: User, label: "Aluno" },
    { path: "/perfil", icon: User, label: "Perfil" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header com Logo */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/logo.jpg" 
              alt="Kazumi" 
              className="h-10 w-auto object-contain"
            />
          </Link>
        </div>
      </header>
      
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      
      {/* Tab Bar Acessível */}
      <nav 
        className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50"
        role="navigation"
        aria-label="Navegação principal"
      >
        <div className="flex justify-around items-center px-2 py-2 max-w-screen-lg mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[72px] ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-6 w-6" aria-hidden="true" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
