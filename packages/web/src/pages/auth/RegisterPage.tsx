import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { AuthPanel } from "../../components/auth/AuthPanel";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../hooks/useAuth";

const registerSchema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(8),
});

type RegisterValues = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterValues) => {
    try {
      await registerUser(values);
      navigate("/recipes");
    } catch (error) {
      setError("root", { message: error instanceof Error ? error.message : "Registration failed" });
    }
  };

  return (
    <AuthPanel
      title="Create account"
      subtitle="Join your family on Cookabl"
      footerText="Already have an account?"
      footerLinkText="Login"
      footerHref="/login"
    >
      <form aria-label="Create account" className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1 block text-sm" htmlFor="reg-name">Name</label>
          <Input aria-describedby={errors.name ? "reg-name-error" : undefined} id="reg-name" placeholder="Name" {...register("name")} />
          {errors.name && <p className="text-xs text-red-600" id="reg-name-error" role="alert">{errors.name.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm" htmlFor="reg-email">Email</label>
          <Input aria-describedby={errors.email ? "reg-email-error" : undefined} id="reg-email" placeholder="Email" type="email" {...register("email")} />
          {errors.email && <p className="text-xs text-red-600" id="reg-email-error" role="alert">{errors.email.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm" htmlFor="reg-password">Password</label>
          <Input aria-describedby={errors.password ? "reg-password-error" : undefined} id="reg-password" placeholder="Password" type="password" {...register("password")} />
          {errors.password && <p className="text-xs text-red-600" id="reg-password-error" role="alert">{errors.password.message}</p>}
        </div>

        {errors.root && <p className="text-xs text-red-600" role="alert">{errors.root.message}</p>}
        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Creating..." : "Create account"}
        </Button>
      </form>
    </AuthPanel>
  );
};
