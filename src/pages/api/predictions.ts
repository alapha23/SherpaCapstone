import { NextApiHandler } from 'next'
import { exec } from 'child_process'
import path from 'path'

const handler: NextApiHandler = (req, res) => {
  const { method } = req

  switch (method) {
    case 'POST':
      // eslint-disable-next-line no-case-declarations
      const { filename, model } = req.body
      console.log(filename, model)

      // eslint-disable-next-line no-case-declarations
      const scriptPath = path.join(__dirname, '../../../../script/'+model+'.py')
      // eslint-disable-next-line no-case-declarations
      const filePath = path.join(__dirname, '../../../../storage/'+ filename)

      exec(`python ${scriptPath} ${filePath}`, (error, stdout, stderr) => {
        if (error) {
          console.warn(error)
        }
        console.log(stdout)

        res.status(200).json({ prediction: stdout })
      })

      break
    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default handler
