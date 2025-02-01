import { Elysia } from 'elysia'
import { image } from './src/image'

const app = new Elysia().use(image).listen(3000)
