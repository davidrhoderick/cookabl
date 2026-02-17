import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { AuthPanel } from "../../components/auth/AuthPanel";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../hooks/useAuth";
import { useGroup } from "../../hooks/useGroup";
import { CREATE_GROUP_MUTATION } from "../../graphql/mutations/groups";
import { GroupView } from "../../types";

const registerSchema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(8),
});

const groupSchema = z.object({
  name: z.string().min(1, "Group name is required").max(80),
});

type RegisterValues = z.infer<typeof registerSchema>;
type GroupValues = z.infer<typeof groupSchema>;

export const RegisterPage = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const { register: registerUser } = useAuth();
  const { setActiveGroupId } = useGroup();
  const navigate = useNavigate();

  const [createGroup] = useMutation<{ createGroup: GroupView }>(CREATE_GROUP_MUTATION);

  const accountForm = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });
  const groupForm = useForm<GroupValues>({ resolver: zodResolver(groupSchema) });

  const onAccountSubmit = accountForm.handleSubmit(async (values) => {
    try {
      await registerUser(values);
      setStep(2);
    } catch (error) {
      accountForm.setError("root", { message: error instanceof Error ? error.message : "Registration failed" });
    }
  });

  const onGroupSubmit = groupForm.handleSubmit(async (values) => {
    try {
      const result = await createGroup({ variables: { name: values.name.trim() } });
      const newGroupId = result.data?.createGroup?.id;
      if (newGroupId) {
        setActiveGroupId(newGroupId);
      }
      navigate("/recipes");
    } catch (error) {
      groupForm.setError("root", { message: error instanceof Error ? error.message : "Could not create group" });
    }
  });

  if (step === 2) {
    return (
      <AuthPanel
        title="Create your group"
        subtitle="Step 2 of 2 — Name the group your recipes will belong to"
      >
        <form aria-label="Create group" className="space-y-3" onSubmit={onGroupSubmit}>
          <div>
            <label className="mb-1 block text-sm" htmlFor="reg-group-name">Group name</label>
            <Input
              aria-describedby={groupForm.formState.errors.name ? "reg-group-name-error" : undefined}
              id="reg-group-name"
              placeholder="e.g. The Smith Family"
              {...groupForm.register("name")}
            />
            {groupForm.formState.errors.name && (
              <p className="text-xs text-red-600" id="reg-group-name-error" role="alert">
                {groupForm.formState.errors.name.message}
              </p>
            )}
          </div>

          {groupForm.formState.errors.root && (
            <p className="text-xs text-red-600" role="alert">{groupForm.formState.errors.root.message}</p>
          )}
          <Button className="w-full" disabled={groupForm.formState.isSubmitting} type="submit">
            {groupForm.formState.isSubmitting ? "Creating..." : "Create group"}
          </Button>
        </form>
      </AuthPanel>
    );
  }

  return (
    <AuthPanel
      title="Create account"
      subtitle="Step 1 of 2 — Join your family on Cookabl"
      footerText="Already have an account?"
      footerLinkText="Login"
      footerHref="/login"
    >
      <form aria-label="Create account" className="space-y-3" onSubmit={onAccountSubmit}>
        <div>
          <label className="mb-1 block text-sm" htmlFor="reg-name">Name</label>
          <Input aria-describedby={accountForm.formState.errors.name ? "reg-name-error" : undefined} id="reg-name" placeholder="Name" {...accountForm.register("name")} />
          {accountForm.formState.errors.name && <p className="text-xs text-red-600" id="reg-name-error" role="alert">{accountForm.formState.errors.name.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm" htmlFor="reg-email">Email</label>
          <Input aria-describedby={accountForm.formState.errors.email ? "reg-email-error" : undefined} id="reg-email" placeholder="Email" type="email" {...accountForm.register("email")} />
          {accountForm.formState.errors.email && <p className="text-xs text-red-600" id="reg-email-error" role="alert">{accountForm.formState.errors.email.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm" htmlFor="reg-password">Password</label>
          <Input aria-describedby={accountForm.formState.errors.password ? "reg-password-error" : undefined} id="reg-password" placeholder="Password" type="password" {...accountForm.register("password")} />
          {accountForm.formState.errors.password && <p className="text-xs text-red-600" id="reg-password-error" role="alert">{accountForm.formState.errors.password.message}</p>}
        </div>

        {accountForm.formState.errors.root && <p className="text-xs text-red-600" role="alert">{accountForm.formState.errors.root.message}</p>}
        <Button className="w-full" disabled={accountForm.formState.isSubmitting} type="submit">
          {accountForm.formState.isSubmitting ? "Creating..." : "Continue"}
        </Button>
      </form>
    </AuthPanel>
  );
};
