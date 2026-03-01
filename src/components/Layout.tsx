import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  FlaskConical, Home, Calendar, MessageSquare, Users, LogOut, Menu, X, LayoutDashboard, Search
} from "lucide-react";
import { useState } from "react";

const navByRole: Record<string, { label: string; to: string; icon: React.ReactNode }[]> = {
  patient: [
    { label: "Find Labs", to: "/labs", icon: <Search className="h-4 w-4" /> },
    { label: "My Bookings", to: "/dashboard", icon: <Calendar className="h-4 w-4" /> },
  ],
  lab: [
    { label: "Dashboard", to: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  ],
  collector: [
    { label: "Dashboard", to: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  ],
  admin: [
    { label: "Dashboard", to: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: "Users", to: "/admin/users", icon: <Users className="h-4 w-4" /> },
  ],
};

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = role ? navByRole[role] || [] : [];

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <FlaskConical className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">DirectLab</span>
          </Link>

          {/* Desktop nav */}
          {user && (
            <nav className="hidden items-center gap-1 md:flex">
              {links.map((link) => (
                <Link key={link.to} to={link.to}>
                  <Button
                    variant={location.pathname === link.to ? "secondary" : "ghost"}
                    size="sm"
                    className="gap-2"
                  >
                    {link.icon}
                    {link.label}
                  </Button>
                </Link>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="hidden text-sm text-muted-foreground md:inline">
                  {role && <span className="mr-2 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground capitalize">{role}</span>}
                </span>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:inline">Sign Out</span>
                </Button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link to="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
                <Link to="/signup"><Button size="sm">Get Started</Button></Link>
              </div>
            )}
            {/* Mobile menu */}
            {user && (
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && user && (
          <nav className="border-t border-border bg-card p-4 md:hidden animate-fade-in">
            {links.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2 mb-1">
                  {link.icon}
                  {link.label}
                </Button>
              </Link>
            ))}
          </nav>
        )}
      </header>

      {/* Main content */}
      <main className="animate-fade-in">{children}</main>
    </div>
  );
}
