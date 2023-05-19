import { NextApiHandler } from 'next'

const handler: NextApiHandler = (req, res) => {
  const { method } = req

  switch (method) {
    case 'POST':
      // Handle the POST request here and return the appropriate prediction
      res.status(200).json({ prediction: 0 })
      break
    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default handler
