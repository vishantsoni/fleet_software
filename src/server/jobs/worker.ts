import { Worker } from 'bullmq'
import { complianceQueue, pnlQueue, odometerQueue } from './queue'

const worker = new Worker(
  'fleet-jobs',
  async (job) => {
    switch (job.name) {
      case 'compliance-alert':
        return processComplianceAlerts(job.data)
      case 'pnl-calculation':
        return processPnLCalculation(job.data)
      case 'odometer-sync':
        return processOdometerSync(job.data)
      default:
        throw new Error(`Unknown job type: ${job.name}`)
    }
  },
  {
    connection: complianceQueue.connection,
    concurrency: 5,
  }
)

async function processComplianceAlerts(data: any) {
  console.log('Processing compliance alert:', data)
  return data
}

async function processPnLCalculation(data: any) {
  console.log('Processing P&L calculation:', data)
  return data
}

async function processOdometerSync(data: any) {
  console.log('Processing odometer sync:', data)
  return data
}

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`)
})

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err)
})

process.on('SIGINT', async () => {
  await worker.close()
  process.exit(0)
})

console.log('Fleet jobs worker started')
