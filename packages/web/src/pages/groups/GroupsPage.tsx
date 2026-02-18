import { useMutation, useQuery } from "@apollo/client";
import { useForm } from "react-hook-form";
import { CREATE_GROUP_MUTATION } from "../../graphql/mutations/groups";
import { INVITE_USER_MUTATION } from "../../graphql/mutations/invitations";
import { GROUPS_QUERY, USERS_QUERY } from "../../graphql/queries/groups";
import { useGroup } from "../../hooks/useGroup";
import { GroupView } from "../../types";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

interface CreateGroupValues {
  name: string;
}

interface InviteValues {
  email: string;
  groupId: string;
}

export const GroupsPage = () => {
  const { activeGroupId, setActiveGroupId } = useGroup();
  const { data, refetch } = useQuery<{ groups: GroupView[] }>(GROUPS_QUERY);
  const { data: usersData } = useQuery<{ users: { id: string; email: string; name: string }[] }>(
    USERS_QUERY,
  );

  const [createGroup] = useMutation(CREATE_GROUP_MUTATION);
  const [inviteUser] = useMutation(INVITE_USER_MUTATION);

  const createForm = useForm<CreateGroupValues>();
  const inviteForm = useForm<InviteValues>();

  const groups = data?.groups ?? [];

  const onCreateGroup = createForm.handleSubmit(async (values) => {
    if (!values.name?.trim()) {
      return;
    }

    await createGroup({ variables: { name: values.name.trim() } });
    createForm.reset({ name: "" });
    await refetch();
  });

  const onInvite = inviteForm.handleSubmit(async (values) => {
    if (!values.email || !values.groupId) {
      return;
    }

    await inviteUser({
      variables: {
        input: {
          email: values.email,
          groupId: values.groupId,
        },
      },
    });

    inviteForm.reset({ email: "", groupId: values.groupId });
  });

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <Card>
        <h2 className="mb-3 text-lg font-semibold">Your groups</h2>

        <ul className="space-y-2">
          {groups.map((group) => (
            <li key={group.id}>
              <button
                className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${
                  activeGroupId === group.id
                    ? "border-[var(--accent)] text-[var(--text)]"
                    : "border-[var(--line)] text-[var(--muted)]"
                }`}
                onClick={() => setActiveGroupId(group.id)}
                type="button"
              >
                {group.name}
              </button>
            </li>
          ))}
        </ul>

        <form className="mt-4 space-y-2" onSubmit={onCreateGroup}>
          <input
            className="w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm"
            placeholder="New group name"
            {...createForm.register("name")}
          />
          <Button className="w-full" type="submit">
            Create group
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">Invite member</h2>
        <form className="space-y-2" onSubmit={onInvite}>
          <select
            className="w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm"
            {...inviteForm.register("groupId")}
          >
            <option value="">Select group</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>

          <input
            className="w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm"
            placeholder="Email"
            type="email"
            {...inviteForm.register("email")}
          />

          <Button className="w-full" type="submit" variant="ghost">
            Send invitation
          </Button>
        </form>

        <h3 className="mb-2 mt-5 text-sm font-medium">Members in your groups</h3>
        <ul className="space-y-1 text-sm text-[var(--muted)]">
          {(usersData?.users ?? []).map((user) => (
            <li key={user.id}>
              {user.name} · {user.email}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};
