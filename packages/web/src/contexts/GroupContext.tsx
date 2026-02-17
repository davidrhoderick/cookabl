import { createContext, PropsWithChildren, useMemo, useState } from "react";

interface GroupContextValue {
  activeGroupId: string | null;
  setActiveGroupId: (groupId: string | null) => void;
}

export const GroupContext = createContext<GroupContextValue | undefined>(undefined);

export const GroupProvider = ({ children }: PropsWithChildren) => {
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  const value = useMemo(
    () => ({
      activeGroupId,
      setActiveGroupId,
    }),
    [activeGroupId],
  );

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>;
};
