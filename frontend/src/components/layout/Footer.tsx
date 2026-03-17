import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook } from "lucide-react";
import api from "../../services/api";

interface ContactData {
  phone: string;
  email: string;
  address: string;
  instagramUrl: string;
  facebookUrl: string;
}

function SocialIcon({ url, label, children }: { url: string; label: string; children: React.ReactNode }) {
  const base = "w-9 h-9 border flex items-center justify-center transition-all";
  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" aria-label={label} className={base + " border-white/20 text-white/60 hover:text-white hover:border-white/60 hover:bg-white/10"}>
        {children}
      </a>
    );
  }
  return (
    <span className={base + " border-white/10 text-white/20 cursor-default"}>
      {children}
    </span>
  );
}

export default function Footer() {
  const [contact, setContact] = useState<ContactData | null>(null);

  useEffect(() => {
    api.get("/content/contact").then((r) => setContact(r.data.data)).catch(() => {});
  }, []);

  const quickLinks = [
    { label: "Home", to: "/" },
    { label: "Collections", to: "/collections" },
    // { label: "Catalogue", to: "/catalogue" },
    { label: "Payment", to: "/payment" },
    // { label: "Contact", to: "/contact" },
  ];

  const infoLinks = [
    { label: "About Us", to: "/about" },
    { label: "FAQ", to: "/faq" },
  ];

  const instagramUrl = contact?.instagramUrl || "";
  const facebookUrl = contact?.facebookUrl || "";

  return (
    <footer className="bg-admin-dark text-white">
      <div className="container-max px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Column 1 — Brand + Social */}
          <div className="md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <span className="font-display text-xl font-semibold text-white">Carpet Petals</span>
              <span className="block text-[10px] tracking-[0.2em] uppercase text-white/40 mt-0.5">Varanasi, India</span>
            </Link>
            <p className="text-sm text-white/55 leading-relaxed mb-6">
              Manufacturer, Supplier and Exporter of premium handmade carpets from Varanasi. Est. 2016.
            </p>
            <div className="flex items-center gap-3">
              <SocialIcon url={instagramUrl} label="Follow us on Instagram">
                <Instagram size={16} />
              </SocialIcon>
              <SocialIcon url={facebookUrl} label="Follow us on Facebook">
                <Facebook size={16} />
              </SocialIcon>
            </div>
            {!instagramUrl && !facebookUrl && (
              <p className="text-[11px] text-white/25 mt-2 italic">
                Add social links in Admin → Content → Contact
              </p>
            )}
          </div>

          {/* Column 2 — Navigation */}
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-white/40 mb-5">Navigation</p>
            <ul className="space-y-2.5">
              {quickLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-white/60 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Information */}
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-white/40 mb-5">Information</p>
            <ul className="space-y-2.5">
              {infoLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-white/60 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Contact */}
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-white/40 mb-5">Contact</p>
            <ul className="space-y-3">
              {contact?.phone && (
                <li>
                  <a href={"tel:" + contact.phone} className="text-sm text-white/60 hover:text-white transition-colors">
                    {contact.phone}
                  </a>
                </li>
              )}
              {contact?.whatsapp && (
                <li>
                  <a href={"https://wa.me/" + contact.whatsapp} target="_blank" rel="noopener noreferrer" className="text-sm text-white/60 hover:text-white transition-colors">
                    WhatsApp
                  </a>
                </li>
              )}
              {contact?.email && (
                <li>
                  <a href={"mailto:" + contact.email} className="text-sm text-white/60 hover:text-white transition-colors">
                    {contact.email}
                  </a>
                </li>
              )}
              {contact?.address && (
                <li>
                  <p className="text-sm text-white/40 leading-relaxed">{contact.address}</p>
                </li>
              )}
              {!contact?.phone && !contact?.email && (
                <li>
                  <p className="text-sm text-white/30 italic">Add contact details in admin</p>
                </li>
              )}
            </ul>
          </div>

        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-max px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} Carpet Petals. All rights reserved.
          </p>
          <p className="text-xs text-white/20">Handmade in Varanasi, India</p>
        </div>
      </div>
    </footer>
  );
}