import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

import { randomUUID } from 'node:crypto'
import { knex } from '../database'

export async function mealsRoutes (app: FastifyInstance) {
  app.get('/', {
    preHandler: [checkSessionIdExists]
  }, async (request, reply) => {
    const meals = await knex('meals').where('user_id', request.user?.id).select()

    return { meals }
  })

  app.post('/', {
    preHandler: [checkSessionIdExists]
  }, async (request, reply) => {
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
      user_id: request.user?.id,
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
      user_id: request.user?.id
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

    const meal = await knex('meals').where({
      id,
      user_id: request.user?.id
    }).update({
      name,
      description,
      eaten_in: eatenIn,
      is_diet: isDiet
    })

    if (!meal) {
      return reply.status(404).send()
    }

    return reply.status(204).send()
  })

  app.delete('/:id', {
    preHandler: [checkSessionIdExists]
  }, async (request, reply) => {
    const getmealsParamsSchema = z.object({
      id: z.uuid()
    })

    const { id } = getmealsParamsSchema.parse(request.params)

    const mealDelete = await knex('meals').where({
      id,
      user_id: request.user?.id
    }).del()

    if (!mealDelete) {
      return reply.status(404).send()
    }

    return reply.status(204).send()
  })

  app.get('/metrics', {
    preHandler: [checkSessionIdExists]
  }, async (request, reply) => {
    const meals = await knex('meals').where('user_id', request.user?.id).orderBy('eaten_in', 'asc')

    const totalMeals = meals.length
    const mealsWithinDiet = meals.filter((meal) => meal.is_diet).length
    const mealsOutDiet = meals.filter((meal) => !meal.is_diet).length

    let bestSequenceMeals = 0
    let currentSequenceMeals = 0

    for (const meal of meals) {
      if (meal.is_diet) {
        currentSequenceMeals++

        if (currentSequenceMeals > bestSequenceMeals) {
          bestSequenceMeals = currentSequenceMeals
        }
      } else {
        currentSequenceMeals = 0
      }
    }

    const metrics = {
      totalMeals,
      mealsWithinDiet,
      mealsOutDiet,
      bestSequenceMeals
    }

    return { metrics }
  })
}
