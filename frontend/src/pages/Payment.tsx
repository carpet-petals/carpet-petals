import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { getPaymentContent } from "../services/api";
import type { PaymentContent } from "../types";

export default function Payment() {
  const [content, setContent] = useState<PaymentContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPaymentContent()
      .then((res) => setContent(res.data.data))
      .catch(() => setContent(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-24 pb-20 bg-background min-h-screen">
      <div className="container-max px-4 sm:px-6 lg:px-8 max-w-3xl">

        <div className="mb-12">
          <p className="text-xs tracking-[0.25em] uppercase text-accent mb-3">Payment</p>
          <h1 className="section-title mb-4">Payment Information</h1>
          <p className="text-text-secondary leading-relaxed">
            We accept payments via UPI and direct bank transfer. Please contact us before making any payment.
          </p>
        </div>

        {/* Disclaimer Banner */}
        <div className="flex items-start gap-3 bg-accent-light border border-accent/20 p-4 mb-10">
          <AlertCircle size={18} className="text-accent mt-0.5 shrink-0" />
          <p className="text-sm text-accent leading-relaxed">
            <strong>Important:</strong> Please contact us before making any payment. We will confirm your order and provide final payment instructions.
          </p>
        </div>

        {loading && (
          <div className="space-y-4">
            <div className="h-32 bg-surface animate-pulse" />
            <div className="h-32 bg-surface animate-pulse" />
          </div>
        )}

        {!loading && !content && (
          <div className="text-center py-16">
            <p className="text-text-muted text-sm">Payment details will be updated soon. Please contact us directly.</p>
          </div>
        )}

        {!loading && content && (
          <div className="space-y-6">

            {/* UPI */}
            {content.upi && (
              <div className="bg-surface border border-border p-6">
                <h2 className="font-display text-lg font-semibold text-text-primary mb-4">UPI Payment</h2>
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  {content.upiQrImage && (
                    <img src={content.upiQrImage} alt="UPI QR Code" className="w-36 h-36 object-contain border border-border" />
                  )}
                  <div>
                    <p className="text-xs uppercase tracking-widest text-text-muted mb-1">UPI ID</p>
                    <p className="text-lg font-medium text-text-primary font-mono">{content.upi}</p>
                    <p className="text-sm text-text-secondary mt-2">Scan the QR code or use the UPI ID above to pay.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Bank Transfer */}
            {content.bankName && (
              <div className="bg-surface border border-border p-6">
                <h2 className="font-display text-lg font-semibold text-text-primary mb-4">Bank Transfer</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-text-muted mb-1">Bank Name</p>
                    <p className="text-sm font-medium text-text-primary">{content.bankName}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-text-muted mb-1">Account Name</p>
                    <p className="text-sm font-medium text-text-primary">{content.accountName}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-text-muted mb-1">Account Number</p>
                    <p className="text-sm font-medium text-text-primary font-mono">{content.accountNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-text-muted mb-1">IFSC Code</p>
                    <p className="text-sm font-medium text-text-primary font-mono">{content.ifsc}</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}