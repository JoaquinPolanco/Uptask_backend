import type { Request, Response, NextFunction } from 'express'
import Project, { IProject } from '../models/project'

declare global {
    namespace Express {
        interface Request{
            project: IProject
        }
    }
}

export async function projectExists(req: Request, res: Response, next: NextFunction) {
    try {
        const { projectid } = req.params
        const project = await Project.findById(projectid)
        if (!project) {
            const error = new Error('Proyecto no econtradado')
            return res.status(404).json({ error: error.message })
        }
        req.project = project
        next()
    } catch (error) {
        return res.status(400).json({ errors: 'Hubo un error' })
    }

}