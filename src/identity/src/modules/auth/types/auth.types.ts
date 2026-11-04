
export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SignupResponse {
  message: string;
  user: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}
