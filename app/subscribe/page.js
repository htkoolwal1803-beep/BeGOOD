import { redirect } from 'next/navigation'

// The A-Bar subscription has been retired. Anyone landing here from an old
// link, a bookmark or a search result goes to the shop instead of a dead page.
export default function SubscribePage() {
  redirect('/shop')
}
