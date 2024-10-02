import type { Request, Response } from 'express'
import User from '../models/User'
import { checkPassword, hashPässword } from '../utils/auth'
import Token from '../models/Token'
import { generateToken } from '../utils/token'
import { AuthEmail } from '../emails/AuthEmail'
import { generateJWT } from '../utils/jwt'

export class AuthController {
    static createAccount = async (req: Request, res: Response) => {
        try {
            const { password, email } = req.body
            // prevenir duplicados
            const useExists = await User.findOne({ email })
            if (useExists) {
                const error = new Error('El usuario ya esta registrado')
                res.status(409).json({ error: error.message })
            }
            //crea un usuario
            const user = new User(req.body)
            // Hash Password
            user.password = await hashPässword(password)

            // generando token 
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            // enviar email
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })

            await Promise.allSettled([user.save(), token.save()])
            res.send('Cuenta Creada Revisa tu email para confirmarla')
        } catch (error) {
            res.status(500).json({ error: 'hubo un error' })
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        try {
            const { token } = req.body

            const tokenExists = await Token.findOne({ token })
            if (!tokenExists) {
                const error = new Error('token no valido')
                return res.status(404).json({ error: error.message })
            }

            const user = await User.findById(tokenExists.user)
            user.confirmed = true
            await Promise.allSettled([user.save(), tokenExists.deleteOne()])
            res.send('cuenta confirmada corectamente')



        } catch (error) {
            res.status(500).json({ error: 'hubo un error' })
        }
    }

    static login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body
            const user = await User.findOne({ email })
            if (!user) {
                const error = new Error('Usuario no encontrado')
                return res.status(404).json({ error: error.message })
            }
            if (!user.confirmed) {
                const token = new Token()
                token.user = user.id
                token.token = generateToken()
                await token.save()
                // enviar email
                AuthEmail.sendConfirmationEmail({
                    email: user.email,
                    name: user.name,
                    token: token.token
                })

                const error = new Error('La Cuenta no ha sido confirmada, hemos enviado un e-mail de confirmacion')
                return res.status(401).json({ error: error.message })
            }

            // revisar pasword 
            const isPasswordCorrect = await checkPassword(password, user.password)
            if (!isPasswordCorrect) {
                const error = new Error('Password Incorrecto')
                return res.status(404).json({ error: error.message })
            }

            const token = generateJWT({ id: user.id })
            res.send(token)
        } catch (error) {
            res.status(500).json({ error: 'hubo un error' })
        }
    }
    static requestConfirmationCode = async (req: Request, res: Response) => {
        try {
            const { email } = req.body
            // usuario existe
            const user = await User.findOne({ email })
            if (!user) {
                const error = new Error('El usuario no esta registrado')
                res.status(409).json({ error: error.message })
            }

            if (user.confirmed) {
                const error = new Error('El usuario ya esta confirmado')
                res.status(409).json({ error: error.message })
            }

            // generando token 
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            // enviar email
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })

            await Promise.allSettled([user.save(), token.save()])
            res.send('se envio un nuevo token a tu email')
        } catch (error) {
            res.status(500).json({ error: 'hubo un error' })
        }
    }

    static forgotPässword = async (req: Request, res: Response) => {
        try {
            const { email } = req.body
            // usuario existe
            const user = await User.findOne({ email })
            if (!user) {
                const error = new Error('El usuario no esta registrado')
                res.status(409).json({ error: error.message })
            }


            // generando token 
            const token = new Token()
            token.token = generateToken()
            token.user = user.id
            await token.save()

            // enviar email
            AuthEmail.sendPasswordResetToken({
                email: user.email,
                name: user.name,
                token: token.token
            })

            res.send('Revisa tu email para instrucciones')
        } catch (error) {
            res.status(500).json({ error: 'hubo un error' })
        }
    }


    static validateToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.body

            const tokenExists = await Token.findOne({ token })
            if (!tokenExists) {
                const error = new Error('token no valido')
                return res.status(404).json({ error: error.message })
            }
            res.send('Token Valido, Define tu nuevos password')

        } catch (error) {
            res.status(500).json({ error: 'hubo un error' })
        }
    }

    static updatePaswordWithToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.params
            const { password } = req.body

            const tokenExists = await Token.findOne({ token })
            if (!tokenExists) {
                const error = new Error('token no valido')
                return res.status(404).json({ error: error.message })
            }

            const user = await User.findById(tokenExists.user)
            user.password = await hashPässword(password)

            await Promise.allSettled([user.save(), tokenExists.deleteOne()])
            res.send('El password se modifico correctamente')

        } catch (error) {
            res.status(500).json({ error: 'hubo un error' })
        }
    }

    static user = async (req: Request, res: Response) => {
        return res.json(req.user)
    }

    static updateProfile = async (req: Request, res: Response) => {
        const { name, email } = req.body

        const userExists = await User.findOne({ email })

        if (userExists && userExists.id.toString() !== req.user.id.toString()) {
            const error = new Error('Ese email ya esta registrado')
            return res.status(409).json({ error: 'Ese email ya esta registrado' })
        }

        req.user.name = name
        req.user.email = email
        try {
            await req.user.save()
            res.send('perfil actualizado correctamente')
        } catch (error) {
            res.status(500).json({ error: 'hubo un error' })
        }
    }

    static updateCurrentUserPassword = async (req: Request, res: Response) => {
        const { current_password, password } = req.body
        const user = await User.findById(req.user.id)

        const isPasswordCorrect = await checkPassword(current_password, user.password)
        if (!isPasswordCorrect) {
            const error = new Error('El password actual es incorrecto')
            return res.status(409).json({ error: error.message })
        }
        try {
            user.password = await hashPässword(password)
            await user.save()
            res.send('El Password se modifico correctamente')
        } catch (error) {
            res.status(500).json({ error: 'hubo un error' })
        }
    }


    static checkPassword = async (req: Request, res: Response) => {
        const { password } = req.body
        
        const user = await User.findById(req.user.id)

        const isPasswordCorrect = await checkPassword(password, user.password)
        if (!isPasswordCorrect) {
            const error = new Error('El password actual es incorrecto')
            return res.status(409).json({ error: error.message })
        }

        res.send('Password correcto')

    }

}