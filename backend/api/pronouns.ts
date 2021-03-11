import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { Pronouns } from '../shared';

async function pronouns (this: FastifyInstance, _: FastifyRequest, reply: FastifyReply) {
  reply.header('access-control-allow-origin', '*')
  reply.send(Pronouns)
}

export default async function (fastify: FastifyInstance) {
  fastify.get('/pronouns', pronouns)
}
