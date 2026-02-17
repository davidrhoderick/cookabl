const encoder = new TextEncoder();

const digest = async (value: string): Promise<string> => {
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

export const hashPassword = async (password: string): Promise<string> => {
  return digest(password);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return (await digest(password)) === hash;
};
