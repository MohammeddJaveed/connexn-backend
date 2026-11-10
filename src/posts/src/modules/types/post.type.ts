export interface postRequest{
    title: string
    description: string
} 

export interface postResponse{
    success: boolean,
    message: string,
    posts:{
      title: string,
      description: string
    }
}