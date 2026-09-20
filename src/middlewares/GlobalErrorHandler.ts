import type { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { z } from "zod";
import { AppError } from "../errors/AppError.ts";

export const errorHandler: ErrorRequestHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
): any => {
    if (error instanceof z.ZodError) {
        return res.status(400).json({
            status: "error",
            message: "Erro de validação nos dados enviados",
            details: z.flattenError(error).fieldErrors,
        });
    }

    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            status: "error",
            message: error.message || "Erro interno não especificado",
        });
    }

    console.error(error);

    return res.status(500).json({
        status: "error",
        message: "Erro interno no servidor",
    });
}