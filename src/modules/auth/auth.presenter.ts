export class AuthPresenter {
    static presentAuthResponse(data: any) {
      return {
        message: data.message,
        access_token: data.access_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          display_name: data.user.displayName
        }
      }
    }
  
    static presentUser(user: any) {
      return {
        id: user.id,
        email: user.email,
        display_name: user.displayName,
        created_at: user.created_at,
        is_verified: user.isVerified
      }
    }
  }
  