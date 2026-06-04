import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'
import request from 'supertest'

describe('Users and meals routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a user', async () => {
    await request(app.server).post('/users').send({
      name: 'Luan',
      email: 'luan@dev.com'
    }).expect(201)
  })

  it('should be able to create a meal', async () => {
    const createUser = await request(app.server).post('/users').send({
      name: 'Luan',
      email: 'luan@dev.com'
    })

    const cookies = createUser.get('Set-Cookie')![0]

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Meal',
      description: 'Description Meal',
      isDiet: false
    }).expect(201)
  })

  it('should be able to edit a meal', async () => {
    const createUser = await request(app.server).post('/users').send({
      name: 'Luan',
      email: 'luan@dev.com'
    })

    const cookies = createUser.get('Set-Cookie')![0]

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Meal',
      description: 'Description Meal',
      isDiet: false
    })

    const listMealsResponse = await request(app.server).get('/meals').set('Cookie', cookies).expect(200)

    const mealId = listMealsResponse.body.meals[0].id

    await request(app.server).put(`/meals/${mealId}`).set('Cookie', cookies).send({
      name: 'Meal',
      description: 'Description Meal',
      isDiet: true,
      eatenIn: '2026-06-03T18:00:00.000Z'
    }).expect(204)
  })

  it('should be able to delete a meal', async () => {
    const createUser = await request(app.server).post('/users').send({
      name: 'Luan',
      email: 'luan@dev.com'
    })

    const cookies = createUser.get('Set-Cookie')![0]

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Meal',
      description: 'Description Meal',
      isDiet: false
    })

    const listMealsResponse = await request(app.server).get('/meals').set('Cookie', cookies).expect(200)

    const mealId = listMealsResponse.body.meals[0].id

    await request(app.server).delete(`/meals/${mealId}`).set('Cookie', cookies).expect(204)
  })

  it('should be able to get a single meal', async () => {
    const createUser = await request(app.server).post('/users').send({
      name: 'Luan',
      email: 'luan@dev.com'
    })

    const cookies = createUser.get('Set-Cookie')![0]

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Meal',
      description: 'Description Meal',
      isDiet: false
    })

    const listMealsResponse = await request(app.server).get('/meals').set('Cookie', cookies).expect(200)

    const mealId = listMealsResponse.body.meals[0].id

    const mealResponse = await request(app.server).get(`/meals/${mealId}`).set('Cookie', cookies).expect(200)

    expect(mealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: 'Meal',
        description: 'Description Meal',
      })
    )
  })

  it('should be able to list all meals from a user', async () => {
    const createUser = await request(app.server).post('/users').send({
      name: 'Luan',
      email: 'luan@dev.com'
    })

    const cookies = createUser.get('Set-Cookie')![0]

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Meal',
      description: 'Description Meal',
      isDiet: false
    })

    const listMealsResponse = await request(app.server).get('/meals').set('Cookie', cookies).expect(200)

    expect(listMealsResponse.body.meals).toEqual([
      expect.objectContaining({
        name: 'Meal',
        description: 'Description Meal',

      })
    ])
  })

  it('should be able to get the metrics from a user', async () => {
    const createUser = await request(app.server).post('/users').send({
      name: 'Luan',
      email: 'luan@dev.com'
    })

    const cookies = createUser.get('Set-Cookie')![0]

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Meal',
      description: 'Description Meal',
      isDiet: false
    })

    const metricsResponse = await request(app.server).get('/meals/metrics').set('Cookie', cookies).expect(200)

    expect(metricsResponse.body.metrics).toEqual(
      expect.objectContaining({
        totalMeals: 1,
        mealsWithinDiet: 0,
        mealsOutDiet: 1,
        bestSequenceMeals: 0
      })
    )
  })

  it('should not list meals created by another user', async () => {
    const createUser1 = await request(app.server).post('/users').send({
      name: 'Luan',
      email: 'luan@dev.com'
    })

    const cookies1 = createUser1.get('Set-Cookie')![0]

    const createUser2 = await request(app.server).post('/users').send({
      name: 'user2',
      email: 'user2@dev.com'
    })

    const cookies2 = createUser2.get('Set-Cookie')![0]

    await request(app.server).post('/meals').set('Cookie', cookies1).send({
      name: 'Meal',
      description: 'Description Meal',
      isDiet: false
    })

    await request(app.server).post('/meals').set('Cookie', cookies2).send({
      name: 'Meal 2',
      description: 'Meals error',
      isDiet: true
    })

    const listMealsResponse = await request(app.server).get('/meals').set('Cookie', cookies1).expect(200)

    expect(listMealsResponse.body.meals).not.toContainEqual(
      expect.objectContaining({ name: 'Meal 2' })
    )
  })

  it('should not be able to get a single meal created by another user', async () => {
    const createUser1 = await request(app.server).post('/users').send({
      name: 'Luan',
      email: 'luan@dev.com'
    })

    const cookies1 = createUser1.get('Set-Cookie')![0]

    const createUser2 = await request(app.server).post('/users').send({
      name: 'user2',
      email: 'user2@dev.com'
    })

    const cookies2 = createUser2.get('Set-Cookie')![0]

    await request(app.server).post('/meals').set('Cookie', cookies1).send({
      name: 'Meal',
      description: 'Description Meal',
      isDiet: false
    })

    await request(app.server).post('/meals').set('Cookie', cookies2).send({
      name: 'Meal 2',
      description: 'Meals error',
      isDiet: true
    })

    const listMealsResponse = await request(app.server).get('/meals').set('Cookie', cookies2).expect(200)

    const mealId = listMealsResponse.body.meals[0].id

    const mealResponse = await request(app.server).get(`/meals/${mealId}`).set('Cookie', cookies1).expect(200)

    expect(mealResponse.body.meal).toBeUndefined()
  })

  it('should not be able to edit a meal created by another user', async () => {
    const createUser1 = await request(app.server).post('/users').send({
      name: 'Luan',
      email: 'luan@dev.com'
    })

    const cookies1 = createUser1.get('Set-Cookie')![0]

    const createUser2 = await request(app.server).post('/users').send({
      name: 'user2',
      email: 'user2@dev.com'
    })

    const cookies2 = createUser2.get('Set-Cookie')![0]

    await request(app.server).post('/meals').set('Cookie', cookies1).send({
      name: 'Meal',
      description: 'Description Meal',
      isDiet: false
    })

    await request(app.server).post('/meals').set('Cookie', cookies2).send({
      name: 'Meal 2',
      description: 'Meals error',
      isDiet: true
    })

    const listMealsResponse = await request(app.server).get('/meals').set('Cookie', cookies2).expect(200)

    const mealId = listMealsResponse.body.meals[0].id

    await request(app.server).put(`/meals/${mealId}`).set('Cookie', cookies1).send({
      name: 'Meal edited',
      description: 'Description Meal',
      isDiet: true,
      eatenIn: '2026-06-03T18:00:00.000Z'
    }).expect(404)
  })

  it('should not be able to delete a meal created by another user', async () => {
    const createUser1 = await request(app.server).post('/users').send({
      name: 'Luan',
      email: 'luan@dev.com'
    })

    const cookies1 = createUser1.get('Set-Cookie')![0]

    const createUser2 = await request(app.server).post('/users').send({
      name: 'user2',
      email: 'user2@dev.com'
    })

    const cookies2 = createUser2.get('Set-Cookie')![0]

    await request(app.server).post('/meals').set('Cookie', cookies1).send({
      name: 'Meal',
      description: 'Description Meal',
      isDiet: false
    })

    await request(app.server).post('/meals').set('Cookie', cookies2).send({
      name: 'Meal 2',
      description: 'Meals error',
      isDiet: true
    })

    const listMealsResponse = await request(app.server).get('/meals').set('Cookie', cookies2).expect(200)

    const mealId = listMealsResponse.body.meals[0].id

    await request(app.server).delete(`/meals/${mealId}`).set('Cookie', cookies1).expect(404)
  })
})
