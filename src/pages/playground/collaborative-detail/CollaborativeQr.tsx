import * as React from 'react'
import QRCode from 'qrcode'

/** A QR code for the collaborative's own page, generated here from its address: nobody uploads one. It is drawn as an image (a data
 *  URL) so that the exported visual carries it as it is, and it fills the width it is given (a square). White modules on a transparent
 *  ground, to sit directly on a dark surface; current scanners read inverted codes. */
function CollaborativeQr({ url, className }: { url: string; className?: string }) {
  const [src, setSrc] = React.useState<string | null>(null)
  React.useEffect(() => {
    let current = true
    QRCode.toDataURL(url, { margin: 0, width: 480, errorCorrectionLevel: 'M', color: { dark: '#ffffff', light: '#00000000' } })
      .then((data) => current && setSrc(data))
      .catch(() => current && setSrc(null))
    return () => {
      current = false
    }
  }, [url])
  return (
    <div className={className}>
      {src && <img src={src} alt="QR code that opens this collaborative's page" className="block size-full" />}
    </div>
  )
}

export { CollaborativeQr }
