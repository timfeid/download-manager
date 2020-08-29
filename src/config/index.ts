import dotenv from 'dotenv'

export const config = {
  env: dotenv.config().parsed,
}
