import { sleep } from 'txstate-utils'
import { ensureAnthemIsEncoded } from './anthem'

async function main () {
  while (true) {
    await ensureAnthemIsEncoded()
    await sleep(1000 * 60 * 5)
  }
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
