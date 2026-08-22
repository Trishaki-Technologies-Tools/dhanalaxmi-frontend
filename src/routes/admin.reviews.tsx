import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Check, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

export const Route = createFileRoute("/admin/reviews")({
  component: AdminReviews,
});

function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);

  const fetchReviews = async () => {
    try {
      const res = await api.reviews.getAllAdmin();
      setReviews(res.reviews);
    } catch (err) {
      toast.error("Failed to load reviews");
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.reviews.updateStatus(id, status);
      toast.success(`Review ${status.toLowerCase()}`);
      fetchReviews();
    } catch (err) {
      toast.error("Failed to update review status");
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      await api.reviews.delete(id);
      toast.success("Review deleted");
      fetchReviews();
    } catch (err) {
      toast.error("Failed to delete review");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-maroon">Storefront</p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl">Reviews</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Moderate customer reviews before they appear on the site.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-background overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Comment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {reviews.map((r) => (
              <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-semibold text-xs">{r.product.name}</td>
                <td className="px-4 py-3 text-xs">
                  {r.user?.name || "Unknown"}
                  <div className="text-[10px] text-muted-foreground">{r.user?.email}</div>
                </td>
                <td className="px-4 py-3 font-semibold text-maroon">{r.rating} ★</td>
                <td className="px-4 py-3 text-xs max-w-xs truncate" title={r.comment}>
                  {r.comment}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${
                      r.status === "APPROVED"
                        ? "bg-green-100 text-green-700"
                        : r.status === "REJECTED"
                        ? "bg-red-100 text-red-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {r.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => updateStatus(r.id, "APPROVED")}
                        className="mr-3 text-green-600 hover:text-green-800"
                        title="Approve"
                      >
                        <Check className="size-4" />
                      </button>
                      <button
                        onClick={() => updateStatus(r.id, "REJECTED")}
                        className="mr-3 text-red-600 hover:text-red-800"
                        title="Reject"
                      >
                        <X className="size-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => remove(r.id)}
                    className="text-muted-foreground hover:text-maroon"
                    title="Delete permanently"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No reviews found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
