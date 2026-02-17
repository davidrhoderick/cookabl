import { useForm } from "react-hook-form";
import { Button } from "../ui/Button";

interface CommentPanelProps {
  comments: {
    id: string;
    content: string;
    createdAt: string;
    userId: string;
  }[];
  onSubmit: (content: string) => Promise<void>;
}

interface CommentValues {
  content: string;
}

export const CommentPanel = ({ comments, onSubmit }: CommentPanelProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CommentValues>();

  const submit = async (values: CommentValues) => {
    if (!values.content.trim()) {
      return;
    }

    await onSubmit(values.content.trim());
    reset({ content: "" });
  };

  return (
    <div className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
      <p className="font-medium">Comments</p>
      <ul className="space-y-2 text-sm">
        {comments.map((comment) => (
          <li key={comment.id} className="rounded-xl border border-[var(--line)] p-2">
            <p>{comment.content}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {new Date(comment.createdAt).toLocaleString()} · {comment.userId}
            </p>
          </li>
        ))}
      </ul>

      <form className="space-y-2" onSubmit={handleSubmit(submit)}>
        <textarea
          className="min-h-20 w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm"
          placeholder="Add a comment"
          {...register("content")}
        />
        <Button className="w-full" disabled={isSubmitting} type="submit" variant="ghost">
          {isSubmitting ? "Posting..." : "Add comment"}
        </Button>
      </form>
    </div>
  );
};
