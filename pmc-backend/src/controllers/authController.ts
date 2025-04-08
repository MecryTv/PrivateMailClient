import { Request, Response } from 'express';
import AuthService from '../services/authService';

export default class AuthController {
  private authService: AuthService;
  
  constructor() {
    this.authService = new AuthService();
  }
  
  /**
   * Handle login requests
   */
  public login = (req: Request, res: Response): void => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
      return;
    }
    
    const authResponse = this.authService.authenticate(username, password);
    
    if (authResponse.success) {
      res.status(200).json(authResponse);
    } else {
      res.status(401).json(authResponse);
    }
  }
  
  /**
   * Verify if a user is authenticated
   */
  public verifyAuth = (req: Request, res: Response): void => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      res.status(401).json({ 
        success: false, 
        message: 'No authentication token provided' 
      });
      return;
    }
    
    const isValid = this.authService.verifyToken(token);
    
    if (isValid) {
      res.status(200).json({ 
        success: true, 
        message: 'Token is valid' 
      });
    } else {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
  }
}
