import { useEffect, useState } from "react";
import { Package, FolderOpen, Mail } from "lucide-react";
import { getProducts, getCategories } from "../../services/api";
import api from "../../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, categories: 0, enquiries: 0 });

  useEffect(() => {
    Promise.allSettled([
      getProducts(),
      getCategories(),
      api.get("/contact"),
    ]).then(([p, c, e]) => {
      setStats({
        products: p.status === "fulfilled" ? p.value.data.data.length : 0,
        categories: c.status === "fulfilled" ? c.value.data.data.length : 0,
        enquiries: e.status === "fulfilled" ? e.value.data.data.length : 0,
      });
    });
  }, []);

  const cards = [
    { label: "Total Products", value: stats.products, icon: Package, color: "bg-accent-light text-accent" },
    { label: "Categories", value: stats.categories, icon: FolderOpen, color: "bg-blue-50 text-blue-600" },
    { label: "Enquiries", value: stats.enquiries, icon: Mail, color: "bg-green-50 text-green-600" },
  ];

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl font-semibold text-text-primary mb-2">Dashboard</h1>
      <p className="text-text-secondary text-sm mb-8">Welcome back. Here is what is happening.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white border border-border p-6 flex items-center gap-4">
            <div className={`w-12 h-12 rounded flex items-center justify-center ${card.color}`}>
              <card.icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-text-primary">{card.value}</p>
              <p className="text-sm text-text-muted">{card.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}