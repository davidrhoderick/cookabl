import { useForm } from "react-hook-form";
import { Button } from "../ui/Button";

interface SharePanelProps {
  shareToken?: string;
  onUpdate: (input: { accessType: string; maxViews?: number; expiresAt?: string }) => Promise<void>;
}

interface ShareValues {
  accessType: "public" | "inviteOnly";
  maxViews?: number;
  expiresAt?: string;
}

export const SharePanel = ({ shareToken, onUpdate }: SharePanelProps) => {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ShareValues>({
    defaultValues: {
      accessType: "public",
    },
  });

  return (
    <div className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
      <p className="font-medium">Sharing</p>
      {shareToken && (
        <p className="break-all text-sm text-[var(--muted)]">
          Share link: {`${globalThis.location.origin}/shared/${shareToken}`}
        </p>
      )}

      <form
        className="space-y-2"
        onSubmit={handleSubmit(async (values) => {
          await onUpdate(values);
        })}
      >
        <select className="w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2" {...register("accessType")}>
          <option value="public">Public</option>
          <option value="inviteOnly">Invite only</option>
        </select>

        <input
          className="w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm"
          placeholder="Max views"
          type="number"
          {...register("maxViews", { valueAsNumber: true })}
        />

        <input
          className="w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm"
          type="datetime-local"
          {...register("expiresAt")}
        />

        <Button className="w-full" disabled={isSubmitting} type="submit" variant="ghost">
          {isSubmitting ? "Updating..." : "Update share settings"}
        </Button>
      </form>
    </div>
  );
};
