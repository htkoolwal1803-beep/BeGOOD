import Link from 'next/link'
import { nutrition, formatNutrient } from '@/lib/nutrition.mjs'

export default function NutritionTable() {
  return <section className="brand-panel p-6 sm:p-8" aria-labelledby="abar-nutrition">
    <p className="brand-pill">Sweetened with dates and honey</p>
    <h2 id="abar-nutrition" className="mt-4 font-playfair text-3xl font-bold">A-Bar nutrition</h2>
    <p className="mt-3 leading-7 text-[#59615b]">One bar is 40 g. For bundles, the serving values below are for one bar, not the whole pack.</p>
    <div className="mt-6 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">A-Bar nutrition per 100 g and per 40 g bar</caption>
        <thead><tr className="border-b border-[#d9cbb5]"><th scope="col" className="p-3">Nutrient</th><th scope="col" className="p-3">Per 100 g</th><th scope="col" className="p-3">Per 40 g bar</th></tr></thead>
        <tbody>{nutrition.map(([name, value, unit]) => <tr key={name} className="border-b border-[#e9dfcf]"><th scope="row" className="p-3 font-medium">{name}</th><td className="p-3 whitespace-nowrap">{formatNutrient(value, unit)}</td><td className="p-3 whitespace-nowrap">{formatNutrient(value, unit, 40)}</td></tr>)}</tbody>
      </table>
    </div>
    <p className="mt-5 text-sm leading-6 text-[#59615b]">Source: Jagdamba Laboratories report JLFD260604023, released 10 June 2026, for a submitted A-BAR sample. Per-bar values are calculated from the per-100 g results and rounded. These are sample results, not tests of every batch. BeGood confirms that the current 40 g bar uses the tested formulation.</p>
    <p className="mt-3 text-sm leading-6 text-[#59615b]">Contains walnuts, almonds and soy. Contains honey and is not vegan. This product contains sugars. Check the pack for the full ingredient list and suitability information.</p>
    <Link href="/research" className="mt-4 inline-block font-semibold underline text-[#1f4b3c]">Read about the evidence and its limits</Link>
  </section>
}
