import ApiResponse from '../utils/ApiResponse';
import asyncHandler from '../utils/asyncHandler';
import { Request, Response } from 'express';
const healthcheck = asyncHandler(async (req: Request, res: Response) => {
  //TODO: build a healthcheck response that simply returns the OK status as json with a message
  res.status(200).send(new ApiResponse(200, 'OK'));
});

export { healthcheck };
