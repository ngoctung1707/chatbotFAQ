// Tao (hoac doi mat khau) tai khoan admin Payload qua Local API.
// Chay: pnpm payload run scripts/create-admin.ts <email> <password>
import config from '@payload-config'
import { getPayload } from 'payload'

const [email, password] = process.argv.slice(2)

if (!email || !password) {
  console.error('Usage: pnpm payload run scripts/create-admin.ts <email> <password>')
  process.exit(1)
}

const payload = await getPayload({ config })

const existing = await payload.find({
  collection: 'users',
  where: { email: { equals: email } },
  limit: 1,
})

if (existing.docs.length > 0) {
  await payload.update({
    collection: 'users',
    id: existing.docs[0].id,
    data: { password },
  })
  console.log(`Da doi mat khau cho ${email}`)
} else {
  await payload.create({ collection: 'users', data: { email, password } })
  console.log(`Da tao admin ${email}`)
}

process.exit(0)
