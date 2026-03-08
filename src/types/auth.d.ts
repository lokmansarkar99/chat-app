export interface ILoginData {
    email: string,
    pasword: string
}

export interface IAuthResetPassword {
  newPassword:     string
  confirmPassword: string
}

export interface IChangePassword {
  currentPassword: string
  newPassword:     string
  confirmPassword: string
}