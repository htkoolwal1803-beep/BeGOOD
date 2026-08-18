import { socialDb } from '@/lib/social/server'

export const metadata = {
  title: 'Data deletion | BeGood',
  description: 'Status and instructions for deleting BeGood social publishing authorization data.'
}

export const dynamic = 'force-dynamic'

export default async function DataDeletionPage({ searchParams }) {
  const code = String(searchParams?.code || '')
  const deletion = code
    ? await socialDb().then((db) => db.collection('social_data_deletions').findOne({ confirmationCode: code })).catch(() => null)
    : null
  return (
    <main className="min-h-screen bg-[#f6f3eb] px-4 py-20">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="font-playfair text-4xl font-bold">Social authorization data deletion</h1>
        {deletion ? (
          <>
            <p className="mt-5 text-gray-700">The stored Meta authorization connected to this request has been removed.</p>
            <p className="mt-3 text-sm text-gray-600">Confirmation code: <span className="font-mono">{code}</span></p>
          </>
        ) : (
          <>
            <p className="mt-5 text-gray-700">To remove BeGood’s access from Meta, remove the BeGood Social Publisher integration from your Facebook Business Integrations settings.</p>
            <p className="mt-3 text-gray-700">You may also contact BeGood through the website contact page and request deletion of the stored social authorization.</p>
          </>
        )}
      </div>
    </main>
  )
}
