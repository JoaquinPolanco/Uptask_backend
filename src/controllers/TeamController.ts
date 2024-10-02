import type { Request, Response } from "express"
import User from "../models/User"
import Project from "../models/project"
import { populate } from "dotenv"


export class TeamMemberController {
    static findMemberByEmail = async (req: Request, res: Response) => {
        const { email } = req.body

        // finde user
        const user = await User.findOne({ email }).select('id email name')
        if (!user) {
            const error = new Error('usuario No Econtrado')
            return res.status(404).json({ error: error.message })
        }
        res.json(user)
    }

    static getProjecteam = async (req: Request, res: Response) => {
        const project = await Project.findById(req.project.id).populate({
            path: 'team',
            select: 'id email name'
        })
        res.json(project.team)

    }


    static addMemberById = async (req: Request, res: Response) => {
        const { id } = req.body
        // finde user
        const user = await User.findById(id).select('id')
        if (!user) {
            const error = new Error('usuario No Econtrado')
            return res.status(404).json({ error: error.message })
        }
        if (req.project.team.some(team => team.toString() === user.id.toString())) {
            const error = new Error('El usuario ya existe en el proyecto')
            return res.status(409).json({ error: error.message })
        }
        req.project.team.push(user.id)
        await req.project.save()
        res.send('Usuario agreado corectamente')
    }

    static removeMemberById = async (req: Request, res: Response) => {
        const {userid } = req.params

        if (!req.project.team.some(team => team.toString() === userid)) {
            const error = new Error('El usuario no existe en el proyecto')
            return res.status(409).json({ error: error.message })
        }
        req.project.team = req.project.team.filter(teamMember => teamMember.toString() !== userid)

        await req.project.save()
        res.send('Usuario Eliminado corectamente')
    }
}




