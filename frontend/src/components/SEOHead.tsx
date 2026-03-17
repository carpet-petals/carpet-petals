import { useEffect } from "react";

interface Props {
  title?: string;
  description?: string;
}

export default function SEOHead({ title, description }: Props) {
  useEffect(() => {
    const baseTitle = "Carpet Petals — Handmade Carpets from Varanasi";
    document.title = title ? `${title} | Carpet Petals` : baseTitle;

    let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = description || "Manufacturer, Supplier and Exporter of Handmade Carpets, Tibetan Rugs and Persian Rugs from Varanasi, India. Est. 2016.";

    return () => {
      document.title = baseTitle;
    };
  }, [title, description]);

  return null;
}