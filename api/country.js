export default function handler (req, res) {
  const country = (req.headers['cf-ipcountry'] || '').toUpperCase()
  res.status(200).json({ country })
}
