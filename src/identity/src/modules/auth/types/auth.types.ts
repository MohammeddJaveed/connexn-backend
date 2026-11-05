
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

export interface loginrRequest{
  email: string
  password: string
}

export interface loginResponse{
  success: boolean
  message: string
  data :{
    token : string
    tokenType: string
    expiresIn: number
    user:{
      userId: string;
      email: string;
      firstName: string;
      lastName: string;
    }
  }
}

export interface EditProfileRequest{
  firstName?: string
  lastName?: string
}
export interface EditProfileResponse{
  success: boolean
  message: string
  user:{
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
  }
}