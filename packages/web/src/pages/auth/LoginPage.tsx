import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { AuthPanel } from "../../components/auth/AuthPanel";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../hooks/useAuth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginValues) => {
    try {
      await login(values);
      navigate("/recipes");
    } catch (error) {
      setError("root", { message: error instanceof Error ? error.message : "Login failed" });
    }
  };

  return (
    <AuthPanel
      title="Welcome back"
      subtitle="Sign in to manage your family recipes"
      footerText="Need an account?"
      footerLinkText="Register"
      footerHref="/register"
    >
      <form aria-label="Sign in" className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1 block text-sm" htmlFor="login-email">Email</label>
          <Input aria-describedby={errors.email ? "login-email-error" : undefined} id="login-email" placeholder="Email" type="email" {...register("email")} />
          {errors.email && <p className="text-xs text-red-600" id="login-email-error" role="alert">{errors.email.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm" htmlFor="login-password">Password</label>
          <Input aria-describedby={errors.password ? "login-password-error" : undefined} id="login-password" placeholder="Password" type="password" {...register("password")} />
          {errors.password && <p className="text-xs text-red-600" id="login-password-error" role="alert">{errors.password.message}</p>}
        </div>

        {errors.root && <p className="text-xs text-red-600" role="alert">{errors.root.message}</p>}
        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </AuthPanel>
  );
};
