import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Collections", to: "/collections" },
  { label: "Catalogue", to: "/catalogue" },
  { label: "Payment", to: "/payment" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  const isHome = pathname === "/";
  const transparent = isHome && !scrolled && !menuOpen;

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        transparent
          ? "bg-transparent"
          : "bg-background/95 backdrop-blur-sm shadow-sm border-b border-border"
      }`}
    >
      <div className="container-max px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          <Link to="/" className="flex flex-col leading-none group" aria-label="Carpet Petals Home">
            <span className={`font-display text-xl md:text-2xl font-semibold transition-colors duration-300 group-hover:text-accent ${transparent ? "text-white" : "text-text-primary"}`}>
              Carpet Petals
            </span>
            <span className={`text-[10px] tracking-[0.2em] uppercase mt-0.5 hidden sm:block transition-colors duration-300 ${transparent ? "text-white/60" : "text-text-muted"}`}>
              Varanasi, India
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `text-sm font-medium tracking-wide transition-colors duration-200 pb-0.5 ${
                    isActive
                      ? "text-accent border-b border-accent"
                      : transparent
                      ? "text-white/80 hover:text-white"
                      : "text-text-secondary hover:text-text-primary"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Link
              to="/contact"
              className={`text-xs px-5 py-2.5 font-medium tracking-wide transition-colors duration-200 ${
                transparent
                  ? "border border-white/50 text-white hover:bg-white/10"
                  : "btn-primary"
              }`}
            >
              Get in Touch
            </Link>
          </nav>

          <button
            className={`md:hidden p-2 transition-colors hover:text-accent ${transparent ? "text-white" : "text-text-primary"}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-background border-t border-border">
          <nav className="container-max px-4 py-6 flex flex-col gap-1" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `py-3 px-3 text-sm font-medium rounded transition-colors duration-150 ${
                    isActive ? "text-accent bg-accent-light" : "text-text-secondary hover:text-text-primary hover:bg-surface"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Link to="/contact" className="btn-primary mt-4 justify-center text-sm">
              Get in Touch
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}