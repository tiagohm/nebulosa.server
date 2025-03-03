import { Elysia } from 'elysia'
import { atlas } from './src/atlas'
import { framing } from './src/framing'
import { image } from './src/image'

const app = new Elysia().use(atlas()).use(framing()).use(image()).listen(3000)
