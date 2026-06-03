import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { checkSessionIdExists } from '../middlewares/check-sessioon-id-exists'

import { randomUUID } from 'node:crypto'
import { knex } from '../database'

export async function mealsRoutes (app: FastifyInstance) {
  app.get('/', {
    preHandler: [checkSessionIdExists]
  }, async (request, reply) => {
    const { sessionId } = request.cookies

    const meals = await knex('meals').where('user_id', sessionId).select()

    return { meals }
  })

  app.post('/', {
    preHandler: [checkSessionIdExists]
  }, async (request, reply) => {
    const { sessionId } = request.cookies

    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      eatenIn: z.coerce.date().optional(),
      isDiet: z.boolean()
    })

    const { name, description, eatenIn, isDiet } = createMealBodySchema.parse(
      request.body
    )

    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      eaten_in: eatenIn ?? new Date(),
      user_id: sessionId,
      is_diet: isDiet
    })

    return reply.status(201).send()
  })

  app.get('/:id', {
    preHandler: [checkSessionIdExists]
  }, async (request, reply) => {
    const getmealsParamsSchema = z.object({
      id: z.uuid()
    })

    const { id } = getmealsParamsSchema.parse(request.params)

    const meal = await knex('meals').where({
      id,
    }).first()

    return { meal }
  })

  app.put('/:id', {
    preHandler: [checkSessionIdExists]
  }, async (request, reply) => {
    const getmealsParamsSchema = z.object({
      id: z.uuid()
    })

    const { id } = getmealsParamsSchema.parse(request.params)

    const updateMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      eatenIn: z.coerce.date(),
      isDiet: z.boolean()
    })

    const { name, description, eatenIn, isDiet } = updateMealBodySchema.parse(request.body)

    await knex('meals').where({
      id,
    }).update({
      name,
      description,
      eaten_in: eatenIn,
      is_diet: isDiet
    })

    return reply.status(204).send()
  })
}
