import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthPanel } from "../../components/auth/AuthPanel";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { authClient } from "../../api/auth-client";

const acceptSchema = z.object({
  name: z.string().min(1).max(80),
  password: z.string().min(8),
});

type AcceptValues = z.infer<typeof acceptSchema>;

export const AcceptInvitationPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<AcceptValues>({ resolver: zodResolver(acceptSchema) });

  const onSubmit = async (values: AcceptValues) => {
    try {
      await authClient.acceptInvitation({ token, ...values });
      navigate("/recipes");
    } catch (error) {
      setError("root", { message: error instanceof Error ? error.message : "Could not accept" });
    }
  };

  return (
    <AuthPanel
      title="Accept invitation"
      subtitle="Set your account details to join the group"
      footerText="Already registered?"
      footerLinkText="Login"
      footerHref="/login"
    >
      {!token && (
        <p className="mb-3 text-sm text-red-600" role="alert">
          Invitation token is missing.
        </p>
      )}
      <form aria-label="Accept invitation" className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1 block text-sm" htmlFor="accept-name">
            Name
          </label>
          <Input id="accept-name" placeholder="Name" {...register("name")} />
        </div>
        <div>
          <label className="mb-1 block text-sm" htmlFor="accept-password">
            Password
          </label>
          <Input
            id="accept-password"
            placeholder="Password"
            type="password"
            {...register("password")}
          />
        </div>
        {errors.root && (
          <p className="text-xs text-red-600" role="alert">
            {errors.root.message}
          </p>
        )}
        <Button className="w-full" disabled={isSubmitting || !token} type="submit">
          {isSubmitting ? "Joining..." : "Join group"}
        </Button>
      </form>
    </AuthPanel>
  );
};
