import { transporter } from '../config/nodemailer'

interface IEmail {
    email: string
    name: string
    token: string
}

export class AuthEmail {
    static sendConfirmationEmail = async ( user: IEmail ) => {
        const info = await transporter.sendMail({
            from: 'Uptask <admin@updtask.com>',
            to: user.email,
            subject: 'Uptask - Confirme tu cuenta',
            text: 'Uptask - confirma mtu cuenta',
            html: `<p>Hola: ${user.name}, has creado tu cuenta en Upstask, ya casi esta todo listo,
            solo debes confirmar tu cuenta</p>
            
            <p>Visita el siguiente enlace:</p>
            <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirmar cuenta</a>
            <p>E Ingresa el codigo: <b>${user.token}</b> </p>
            <p>Este token expira en: 10 minutos</p>
            
            `

        })
        console.log('mensaje enviado', info.messageId);
        
    }
    static sendPasswordResetToken = async ( user: IEmail ) => {
        const info = await transporter.sendMail({
            from: 'Uptask <admin@updtask.com>',
            to: user.email,
            subject: 'Uptask - Restablece tu password',
            text: 'Uptask - Restablece tu password',
            html: `<p>Hola: ${user.name}, has solicitado restablece tu password.</p>
            
            <p>Visita el siguiente enlace:</p>
            <a href="${process.env.FRONTEND_URL}/auth/new-password">Restablecer password</a>
            <p>E Ingresa el codigo: <b>${user.token}</b> </p>
            <p>Este token expira en: 10 minutos</p>
            
            `

        })
        console.log('mensaje enviado', info.messageId);
        
    }
}