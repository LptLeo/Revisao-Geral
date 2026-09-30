import type { Request, Response } from 'express';
import type { UserService } from '../services/user.service.ts';

export class UserController {
  private readonly userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  public findAll = async (req: Request, res: Response) => {
    const allUsers = await this.userService.findAll();

    return res.status(200).json(allUsers);
  };

  public findById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await this.userService.findById({ id: id as string });

    return res.status(200).json(user);
  };
}
