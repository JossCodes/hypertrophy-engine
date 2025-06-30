import { getEnv, validateEnv } from 'core/env.js'
import express from 'express'

export async function startServer() {
    validateEnv()
    const env = getEnv()
    const app = express()
    const port = env.PORT

    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    app.get('/', (req, res) => {
        res.send('Hello, Hypertrophy Engine!')
    })

    app.listen(port, () => {
        console.log(`Server is running in ${env.NODE_ENV} mode on port ${port}`)
    })
}