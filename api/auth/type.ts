export type TUser = {
  id: string;
  name: string;
  username: string;
  createdAt: string;
};

export type TLoginPayload = {
  username: string;
  password: string;
};

export type TRegisterPayload = {
  name: string;
  username: string;
  password: string;
};

export type TStoredUser = TUser & {
  password: string;
};
