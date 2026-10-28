import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

/** The upload-flow proposal behind "With proposed fields" on the Publication Detail page: one optional card in the existing
 *  Details step, the same for every resource type. A mock built from the form's own controls; nothing is saved. */

const POWERS: [string, string][] = [
  ['Key highlights', 'Three numbered blocks in the type’s colour, the second row of the hero.'],
  ['Pull quote', 'A large quote after the files.'],
]

function UploadProposalDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="center" className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="pr-8">Proposal: one optional card in the upload flow</DialogTitle>
          <DialogDescription>
            Added to Step 1 · Details, after Classification. Every field is optional and works the same for every resource type, so
            the existing flow stays the only flow. The Content step is unchanged: the file order already decides the main file.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 px-6 pb-6">
          <Card>
            <CardHeader>
              <CardTitle>Highlights</CardTitle>
              <CardDescription>Optional. Helps readers see what this publication is about before they open the file.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label>Key highlights</Label>
                <p className="type-caption text-text-subdued">Up to three short points, one line each.</p>
                {[1, 2, 3].map((n) => (
                  <Input key={n} aria-label={`Highlight ${n}`} placeholder={n === 1 ? 'e.g. 1 in 4 government schools sits in a district with 20+ heatwave days a year' : `Highlight ${n}`} />
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <div>
                  <Label htmlFor="proposal-quote">Pull quote</Label>
                  <Textarea id="proposal-quote" className="mt-1.5" rows={2} placeholder="A sentence from the publication worth quoting" />
                </div>
                <div>
                  <Label htmlFor="proposal-attribution">Attribution</Label>
                  <Input id="proposal-attribution" className="mt-1.5" placeholder="e.g. Dr. Priya Raman" />
                </div>
              </div>
            </CardContent>
          </Card>

          <section aria-label="What each field powers" className="flex flex-col gap-3">
            <h3 className="type-heading-3 text-text-default">What each field powers on the consumer page</h3>
            <dl className="grid auto-rows-fr gap-3 sm:grid-cols-2">
              {POWERS.map(([field, effect]) => (
                <div key={field} className="rounded-2xl bg-secondary p-4">
                  <dt className="type-label text-text-default">{field}</dt>
                  <dd className="type-body mt-1 text-text-secondary">{effect}</dd>
                </div>
              ))}
            </dl>
            <p className="type-caption text-text-subdued">
              Everything else on the page comes from today’s fields, the uploaded files themselves (read one by one in the file
              viewer) or links other records already make (Connected on CivicDataSpace).
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { UploadProposalDialog }
