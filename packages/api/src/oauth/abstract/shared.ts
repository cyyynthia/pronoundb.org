/*
 * Copyright (c) 2020-2021 Cynthia K. Rey, All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import type { MongoAccount, ExternalUser } from '../../database.js'

export type OAuthIntent = 'register' | 'login' | 'link'

async function updateExternalAccount (this: FastifyInstance, account: MongoAccount, user: ExternalUser) {
  const savedAccount = account.accounts.find((a) => a.id === user.id && a.platform === user.platform)
  if (savedAccount && savedAccount.name !== user.name) {
    await this.mongo.db!.collection<MongoAccount>('accounts').updateOne(
      { _id: account._id },
      { $set: { 'accounts.$[account].name': user.name } },
      { arrayFilters: [ { 'account.platform': savedAccount.platform, 'account.id': savedAccount.id } ] }
    )
  }
}

export async function finishUp (this: FastifyInstance, request: FastifyRequest, reply: FastifyReply, intent: OAuthIntent, user: ExternalUser) {
  const collection = this.mongo.db!.collection<MongoAccount>('accounts')
  const account = await collection.findOne({ 'accounts.id': user.id, 'accounts.platform': user.platform })

  let id = null
  switch (intent) {
    case 'register': {
      if (account) return reply.redirect('/?error=ERR_ALREADY_EXISTS')
      const res = await collection.insertOne({ accounts: [ user ] })
      id = res.insertedId.toString()
      break
    }
    case 'login':
      if (!account) return reply.redirect('/?error=ERR_NOT_FOUND')
      await updateExternalAccount.call(this, account, user)
      id = account._id.toString()
      break
    case 'link':
      // The following should almost never be true, unless someone is deliberately trying to break things up.
      if (!Object.prototype.hasOwnProperty.call(request, 'user')) return reply.redirect('/?error=ERR_NOT_LOGGED_IN')
      if (account) {
        if (account._id.toString() !== (request as any).user._id.toString()) return reply.redirect('/me?error=ERR_ALREADY_LINKED')
        await updateExternalAccount.call(this, account, user)
      } else {
        await collection.updateOne({ _id: (request as any).user._id }, { $push: { accounts: user } })
      }
      return reply.redirect('/me')
  }

  if (id) {
    const tok = this.tokenize.generate(id)
    reply.setCookie('token', tok, { maxAge: 365 * 24 * 3600, path: '/' })
  }

  reply.redirect('/me')
}
