import type { Request, Response } from 'express';
import type { UserService } from '../services/user.service.ts';
import type { listUsersDTO } from '../dtos/user.dto.ts';

export class UserController {
  private readonly userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  public findAll = async (req: Request, res: Response) => {
    const query = res.locals.query as listUsersDTO;
    const result = await this.userService.findAll(query);

    return res.status(200).json(result);
  };

  public findById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await this.userService.findById({ id: id as string });

    return res.status(200).json(user);
  };

  public update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await this.userService.updateUser({ id: id as string }, req.body);

    return res.status(200).json(user);
  };
}
