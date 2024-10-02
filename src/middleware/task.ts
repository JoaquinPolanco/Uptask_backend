import type { Request, Response, NextFunction } from 'express'
import Task, { ITask } from '../models/Task'

declare global {
    namespace Express {
        interface Request {
            task: ITask
        }
    }
}

export async function taskExists(req: Request, res: Response, next: NextFunction) {
    try {
        const { taskId } = req.params
        const task = await Task.findById(taskId)
        if (!Task) {
            const error = new Error('Tarea no econtrada')
            return res.status(404).json({ error: error.message })
        }
        req.task = task
        next()
    } catch (error) {
        return res.status(400).json({ errors: 'Hubo un error' })
    }

}

export function taskBelongsToProject(req: Request, res: Response, next: NextFunction) {
    if (req.task.project.toString() !== req.project.id.toString()) {
        const error = new Error('Accion No valida')
        return res.status(400).json({ error: error.message })
    }
    next()
}


export function hasAuthorization(req: Request, res: Response, next: NextFunction) {
    if (req.user.id.toString() !== req.project.manager.toString()) {
        const error = new Error('Accion No valida')
        return res.status(400).json({ error: error.message })
    }
    next()
}