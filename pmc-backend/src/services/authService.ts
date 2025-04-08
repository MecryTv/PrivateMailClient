import * as config from '../../config.json';

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
}

export default class AuthService {
  private readonly username: string;
  private readonly password: string;
  
  constructor() {
    this.username = config.auth.loginName || '';
    this.password = config.auth.loginPassword || '';
    
    if (!this.username || !this.password) {
      console.error('Authentication credentials not properly configured in config.json');
    }
  }
  
  /**
   * Authenticate a user with username and password
   * @param username The username to authenticate
   * @param password The password to authenticate
   * @returns AuthResponse with success status and optional token
   */
  public authenticate(username: string, password: string): AuthResponse {
    if (!username || !password) {
      return { success: false, message: 'Username and password are required' };
    }
    
    if (username === this.username && password === this.password) {
      // Generate a simple token (in a production app, use JWT with proper expiration)
      const token = Buffer.from(`${username}:${new Date().getTime()}`).toString('base64');
      return {
        success: true,
        message: 'Authentication successful',
        token
      };
    }
    
    return {
      success: false,
      message: 'Invalid username or password'
    };
  }
  
  /**
   * Verify if a token is valid
   * @param token The authentication token to verify
   * @returns Boolean indicating if token is valid
   */
  public verifyToken(token: string): boolean {
    if (!token) return false;
    
    try {
      // In a real application, you would validate JWT expiration, signature, etc.
      // This is a simplified check for demonstration purposes
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      return decoded.split(':')[0] === this.username;
    } catch (error) {
      return false;
    }
  }
}
