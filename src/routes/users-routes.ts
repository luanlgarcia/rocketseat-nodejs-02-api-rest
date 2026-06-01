import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'

export async function usersRoutes (app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUsersBodySchema = z.object({
      name: z.string(),
      email: z.email(),
    })

    const { name, email } = createUsersBodySchema.parse(request.body)

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7
      })
    }

    await knex('users').insert({
      id: randomUUID(),
      name,
      email,
      session_id: sessionId
    })

    return reply.status(201).send()
  })
}
