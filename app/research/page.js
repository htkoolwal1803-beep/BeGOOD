import Link from 'next/link'
import NutritionTable from '@/components/NutritionTable'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata('A-Bar Research, Nutrition & Evidence | BeGood', 'Explore A-Bar nutrition, its ingredient research, and the limits of the evidence. Sweetened with dates and honey; nutrition per 40 g bar.', '/research')

const studies = [
  { name: 'L-theanine and stress-related symptoms', text: 'Hidese et al. (2019) studied 30 adults in a randomized, double-blind, placebo-controlled crossover trial using 200 mg of L-theanine daily for four weeks. The study reported changes in some stress-related measures. It did not test A-Bar or demonstrate an effect within 20 minutes.', url: 'https://pubmed.ncbi.nlm.nih.gov/31623400/' },
  { name: 'L-theanine with caffeine and attention', text: 'Giesbrecht et al. (2010) studied 97 mg L-theanine with 40 mg caffeine in 44 adults. The combination improved selected attention and alertness measures compared with placebo. This is not evidence that A-Bar treats anxiety or eliminates caffeine-related jitters.', url: 'https://pubmed.ncbi.nlm.nih.gov/21040626/' },
  { name: 'Magnesium, anxiety and stress research', text: 'Boyle et al. (2017) reviewed 18 studies of magnesium supplementation. Findings were suggestive in some groups, but the authors judged the overall evidence quality poor. This review does not establish an anxiety-treatment effect for A-Bar.', url: 'https://pubmed.ncbi.nlm.nih.gov/28445426/' },
]

export default function ResearchPage() {
  return <div className="brand-page py-14 sm:py-20">
    <article className="brand-container max-w-5xl space-y-10">
      <header>
        <p className="brand-pill">BeGood A-Bar</p>
        <h1 className="mt-5 font-playfair text-4xl font-bold sm:text-5xl">Ingredients, nutrition and the evidence</h1>
        <p className="mt-5 text-lg leading-8 text-[#59615b]">A-Bar is a 40 g functional chocolate bar made with L-theanine, magnesium glycinate and chicory root, and sweetened with dates and honey. Here we explain the research behind those ingredient choices and what has been measured in the product.</p>
        <p className="mt-3 text-sm text-[#59615b]">Prepared by BeGood · Updated 24 September 2026</p>
      </header>
      <section className="brand-panel p-6 sm:p-8">
        <h2 className="font-playfair text-3xl font-bold">What the evidence can tell us</h2>
        <p className="mt-4 leading-7">Ingredient studies use specific doses, formulations and populations. Their findings do not automatically establish the effects of a finished food. The documents reviewed for this page do not include a human clinical trial of A-Bar.</p>
        <p className="mt-4 leading-7">Our formulation documents include a literature-based scientific rationale and an academic opinion letter dated 19 January 2026. The letter reviews the conceptual formulation; it expressly does not provide product endorsement, clinical validation, efficacy certification or regulatory approval.</p>
      </section>
      <section>
        <h2 className="font-playfair text-3xl font-bold">Ingredient research</h2>
        <div className="mt-6 space-y-5">{studies.map(study => <section key={study.url} className="brand-card p-6"><h3 className="text-xl font-bold">{study.name}</h3><p className="mt-3 leading-7 text-[#59615b]">{study.text}</p><a href={study.url} className="mt-4 inline-block font-semibold underline text-[#1f4b3c]">Read the published study</a></section>)}</div>
      </section>
      <NutritionTable />
      <section className="brand-panel p-6 sm:p-8 space-y-6">
        <h2 className="font-playfair text-3xl font-bold">Questions about A-Bar and stress relief</h2>
        <div><h3 className="text-xl font-semibold">Is A-Bar a treatment for anxiety?</h3><p className="mt-2 leading-7">No. A-Bar is a food, not a treatment for anxiety or another mental-health condition. It is not a substitute for professional care. If anxiety or stress is persistent or affects daily life, seek qualified support.</p></div>
        <div><h3 className="text-xl font-semibold">Does A-Bar work within 20 minutes?</h3><p className="mt-2 leading-7">A specific onset time has not been established for A-Bar by the evidence reviewed here. Individual customer experiences do not establish a predictable effect or timeline.</p></div>
        <div><h3 className="text-xl font-semibold">What did the laboratory test?</h3><p className="mt-2 leading-7">The June 2026 report measured nutritional composition in a submitted sample. It did not test stress relief, clinical efficacy, onset time, L-theanine content or caffeine content. Nutritional testing is not proof of a health benefit.</p></div>
        <div><h3 className="text-xl font-semibold">Is A-Bar sugar-free?</h3><p className="mt-2 leading-7">No. A-Bar is sweetened with dates and honey. The tested sample contained 20.05 g total sugars per 100 g, equivalent to approximately 8.02 g per 40 g bar.</p></div>
      </section>
      <p className="leading-7"><Link href="/product/begood-abar-001" className="font-semibold underline text-[#1f4b3c]">See A-Bar ingredients and buying options</Link> · <Link href="/contact" className="underline">Contact BeGood with a product question</Link></p>
    </article>
  </div>
}
