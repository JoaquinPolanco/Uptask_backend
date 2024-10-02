import jwt from 'jsonwebtoken'
import Types from 'mongoose'

type UserPayload = {
    id: Types.ObjectId
}

export const generateJWT = (Payload: UserPayload) => {

    const token = jwt.sign(Payload, process.env.JWT_SECRET, {
        expiresIn:'180d'
    })
    return token
}