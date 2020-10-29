import cron from 'cron'
import { ensureAnthemIsEncoded } from './anthem'

cron.job('0 */5 * * * *', () => {
  ensureAnthemIsEncoded().catch(e => console.error(e))
}, null, true, 'America/Chicago')
