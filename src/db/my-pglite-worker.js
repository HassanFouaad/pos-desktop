// my-pglite-worker.js
import { PGlite } from '@electric-sql/pglite'
import { electricSync } from '@electric-sql/pglite-sync'
import { btree_gin } from '@electric-sql/pglite/contrib/btree_gin'
import { tcn } from '@electric-sql/pglite/contrib/tcn'
import { live } from '@electric-sql/pglite/live'
import { worker } from '@electric-sql/pglite/worker'
import { config } from '../config'
worker({
    async init(options) {
        // Create and return a PGlite instance
        const database = new PGlite({
            dataDir: config.DATABASE_NAME,
            ...options,
            extensions: {
                electric: electricSync({ debug: true }),
                live,
                btree_gin,
                tcn
            },
            relaxedDurability: true
        })

        console.log('database', database)


        return database;
    },
})