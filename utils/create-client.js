#! /usr/bin/env node

'use strict'
let Api

try {
    Api = require('@dadi/api')
} catch (ex) {
    Api = require(__dirname + '/../main')
}

const Connection = Api.Connection
const config = Api.Config

const connection = Connection(config.get('auth.database'))
const clientCollectionName = config.get('auth.clientCollection')

const prompt = require('cli-prompt')

let connected = false

// Temporarily restore original console
delete console.log

connection.on('connect', db => {
  if (connected) return

  connected = true

  setTimeout(() => {
    console.log()
    console.log('==================================')
    console.log(' DADI API Client Record Generator ')
    console.log('==================================')
    console.log()

    prompt.multi([
      {
        label: '-> Client identifier',
        key: 'clientId',
        default: 'testClient'
      },
      {
        label: '-> Secret access key',
        key: 'secret',
        default: 'secretSquirrel'
      },
      {
        label: '-> Access type (admin, user)',
        key: 'type',
        default: 'user'
      },
      {
        label: '(!) Is this ok?',
        key: 'confirm',
        type: 'boolean'
      }
    ], options => {
      if (options.confirm) {
        delete options.confirm

        db.collection(clientCollectionName).insert(options, err => {
          if (err) throw err

          console.log()
          console.log('(*) Client created successfully:')
          console.log()
          console.log(options)
          console.log()

          db.close()
        })
      } else {
        db.close()
      }
    })
  }, 1000)
})
