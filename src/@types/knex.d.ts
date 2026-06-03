// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables'{
  export interface Tables {
    users: {
      id: string
      name: string
      email: string
      session_id?: string
    },
    meals: {
      id: string,
      name: string,
      description: string,
      eaten_in: Date,
      user_id: string,
      is_diet: boolean
    }
  }
}
