# Facts to verify before launch

Every fact below is published on the site (or drives what is published) and needs a human check. "Checked" is the date the source was read while building the site. Status: **Open** until a named person signs it off.

Legal sign-off needed before launch: **US, UK, EU and Brazil** for every string in `disclosure` in `src/config/site.config.ts`, and for the Privacy Policy, Terms and Cookie Policy.

## 1. Publisher details (owner rules)

| # | Fact | Where used | Source | Checked | Status |
| --- | --- | --- | --- | --- | --- |
| 1.1 | **Business address**: the most premium coworking space in the city where Tourground's publishing desk sits. Currently a **placeholder** (`site.address`, `isPlaceholder: true`); the site prints "Our postal address is being confirmed" instead. | About, Corrections, legal pages | Founders | 2026-11-08 | **Open: founders to confirm city and address** |
| 1.2 | Legal entity name of the publisher ("Tourground") and its country of establishment. The Terms say they are governed by "the law of the country in which the publisher is established". | Privacy (controller), Terms §1, §11 | Founders / counsel | 2026-11-08 | Open |
| 1.3 | Correction and removal URL. Placeholder `https://tourground.com/#join` (Tourground's FAQ says claims, updates and removals go through the Join page). | Every company page, Corrections | tourground.com FAQ | 2026-11-08 | Open: replace with the dedicated flow |
| 1.4 | Tourground profile URLs. No public profile pages were found on tourground.com, so `profile_url` is null and links fall back to `https://tourground.com/`. | Every company page | tourground.com | 2026-11-08 | Open |
| 1.5 | Label "Founder-owned (Tourground Geotrax)": confirm "Tourground Geotrax" is the right entity name. | Everywhere a founder brand appears | Brief | 2026-11-08 | Open |
| 1.6 | Email retention period "up to two years" for correction/removal correspondence. | Privacy Policy | Policy choice, not a sourced fact | 2026-11-08 | Open: counsel to confirm |

## 2. What Tourground verification actually checks

The tier text in `tiers` (`site.config.ts`) is taken from Tourground's own published wording. The site claims nothing beyond it. Confirm each line matches what the directory team really does.

| # | Tier | Line published | Source | Checked | Status |
| --- | --- | --- | --- | --- | --- |
| 2.1 | Verified | "The company claimed its own profile on Tourground." | tourground.com FAQ: "Verified means the company claimed its profile." | 2026-11-08 | Open |
| 2.2 | Verified | "Tourground checked that the company is real" (quoting the Plans wording "your company is real and checked"). **What exactly is checked is not published by Tourground** (registration? licence? address? ownership?). | tourground.com Plans | 2026-11-08 | **Open: directory team to list the actual steps** |
| 2.3 | Verified | "The facts on this page were compared with the sources listed." | Site process | 2026-11-08 | Open |
| 2.4 | Black | "Its data is proven: real bookings and performance, with proof. Proof from suppliers also counts." | tourground.com FAQ | 2026-11-08 | Open |
| 2.5 | Black | Shown as **not paid**. The tourground.com FAQ says "Verified and Black are free" while the Plans section lists Black as a paid plan ("price to be set"). | tourground.com | 2026-11-08 | **Open: contradiction on tourground.com** |
| 2.6 | Platinum | "A paid plan with services (a marketing push and access to Tourground tools). Always labelled as paid. Paying does not give Black's proof. Does not change rank." | tourground.com FAQ and Plans | 2026-11-08 | Open |
| 2.7 | Founder | "Belongs to Tourground's founders; same fees and ranking rules as everyone." tourground.com describes a "founding portfolio" of Launchpad brands that are "not for sale" and follow "the same fees and ranking rules". It does not define a "founder" tier. | tourground.com | 2026-11-08 | Open |
| 2.8 | Ranking | "Rank is earned, not paid"; Tourground's proposed merit weights (reply time 30%, quote accuracy 25%, conversion 25%, verified reviews 20%) are **not** published on this site, because they are marked "proposed". | tourground.com | 2026-11-08 | Open |
| 2.9 | Founder brands' `verified` flag is `false` in the mock (unknown). | Verification cards | Mock | 2026-11-08 | Open: real export decides |

## 3. Membership bodies: what they are and what they certify

| # | Fact as published | Source | Checked | Status |
| --- | --- | --- | --- | --- |
| 3.1 | ATTA is a trade association for adventure travel businesses worldwide; not a regulator or financial protection scheme. | https://www.adventuretravel.biz/ | 2026-11-08 | Open |
| 3.2 | IAATO is the body for companies operating tourism in Antarctica; promotes safe and environmentally responsible private-sector travel; members agree to follow its procedures. | https://iaato.org/ | 2026-11-08 | Open |
| 3.3 | ASTA is the American Society of Travel Advisors; members agree to its code of ethics. | https://www.asta.org/ | 2026-11-08 | Open (site blocked automated check of code-of-ethics page) |
| 3.4 | ABTA members follow its Code of Conduct; ABTA provides financial protection for many package holidays booked with members. | https://www.abta.com/ (returned 403 to automated checks) | 2026-11-08 | Open |
| 3.5 | ATOL is a licence issued by the UK CAA protecting flight-inclusive packages sold by ATOL holders. | https://www.caa.co.uk/atol-protection/ | 2026-11-08 | Open |
| 3.6 | ADMEI's description of a DMC (paraphrased). | https://www.admei.org/ | 2026-11-08 | Open: confirm wording on ADMEI's definition page |

## 4. Licensing and registers

| # | Fact as published | Source | Checked | Status |
| --- | --- | --- | --- | --- |
| 4.1 | Brazil: tourism service providers, including tour operators and agencies, must register with Cadastur under Lei nº 11.771/2008; the register is searchable. | https://cadastur.turismo.gov.br/ ; https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2008/lei/l11771.htm | 2026-11-08 | Open |
| 4.2 | Kenya: the Tourism Regulatory Authority regulates and licenses tourism enterprises including tour operators. | https://www.tourismauthority.go.ke/ | 2026-11-08 | Open |
| 4.3 | California requires sellers of travel to register with the Attorney General's Seller of Travel program; some other US states have similar laws. | https://oag.ca.gov/travel | 2026-11-08 | Open: list which states |

## 5. Payment protection by market (consumer law)

| # | Fact as published | Source | Checked | Status |
| --- | --- | --- | --- | --- |
| 5.1 | EU: organisers established in a member state must provide security for refunds on insolvency (Art. 17, Directive (EU) 2015/2302). | https://eur-lex.europa.eu/eli/dir/2015/2302/oj | 2026-11-08 (text read) | Open |
| 5.2 | EU: if the organiser terminates, it must refund all payments without undue delay and within 14 days (Art. 12). | same | 2026-11-08 (text read) | Open |
| 5.3 | UK: Package Travel and Linked Travel Arrangements Regulations 2018 give similar protections for packages sold in the UK. | https://www.legislation.gov.uk/uksi/2018/634/contents | 2026-11-08 | Open: counsel to confirm "similar" |
| 5.4 | UK: section 75 Consumer Credit Act 1974 applies to items with a cash price over £100 and up to £30,000. | https://www.legislation.gov.uk/ukpga/1974/39/section/75 | 2026-11-08 (text read) | Open |
| 5.5 | US: no federal package-travel payment protection scheme; credit card billing disputes under federal rules (FTC guidance; 60-day written dispute window per FTC). | https://consumer.ftc.gov/articles/using-credit-cards-and-disputing-charges | 2026-11-08 | Open |
| 5.6 | Brazil: Código de Defesa do Consumidor (Lei nº 8.078/1990) applies to suppliers of services including travel companies selling in Brazil. Comparison table says "No general insolvency scheme identified". | https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm | 2026-11-08 | **Open: Brazilian counsel to confirm** |
| 5.7 | Consumer agencies warn bank transfer, money-transfer and cryptocurrency payments are hard to reverse. | FTC https://consumer.ftc.gov/articles/avoid-scams-when-you-travel ; Action Fraud https://www.actionfraud.police.uk/a-z-of-fraud/holiday-fraud | 2026-11-08 | Open |
| 5.8 | No law or official guidance sets a standard deposit; no reliable data on typical deposits or on whether booking direct is cheaper (stated as absence of data). | Desk research | 2026-11-08 | Open |

## 6. Insurance

| # | Fact as published | Source | Checked | Status |
| --- | --- | --- | --- | --- |
| 6.1 | UK and US governments advise travellers to have travel insurance. | https://www.gov.uk/guidance/foreign-travel-insurance ; https://travel.state.gov/content/travel/en/international-travel/before-you-go/your-health-abroad/insurance-coverage-overseas.html | 2026-11-08 | Open |
| 6.2 | Advice to buy cover when you book so cancellation cover starts early. | FCDO page above | 2026-11-08 | Open: confirm FCDO wording |

## 7. Country snapshots

| # | Fact as published | Source | Checked | Status |
| --- | --- | --- | --- | --- |
| 7.1 | Japan: spring (roughly March–May) and autumn (late Sept–early Dec) are the most popular seasons; typhoon risk Aug–Sept; busiest periods Golden Week, Obon, New Year. | https://www.japan.travel/en/plan/weather/ | 2026-11-08 | Open |
| 7.2 | Japan: British visitors can enter for tourism up to 90 days without applying in advance (FCDO). | https://www.gov.uk/foreign-travel-advice/japan/entry-requirements | 2026-11-08 | Open |
| 7.3 | Tanzania: most visitors need a visa; FCDO says apply for an e-visa before travel (Tanzania Immigration Department portal). Best months deliberately omitted (no reviewed source). | https://www.gov.uk/foreign-travel-advice/tanzania/entry-requirements | 2026-11-08 | Open |
| 7.4 | Benin: British visitors need a visa (evisa.bj) and a yellow fever certificate. | https://www.gov.uk/foreign-travel-advice/benin/entry-requirements | 2026-11-08 | Open |
| 7.5 | Benin: FCDO advises against all travel to Pendjari, Parc du W and border areas; all but essential travel to rest of Alibori and Atacora (updated 4 Nov 2026). **Re-check before every launch: travel advice changes often.** | https://www.gov.uk/foreign-travel-advice/benin | 2026-11-08 | Open |
| 7.6 | Benin: Royal Palaces of Abomey and W-Arly-Pendjari are UNESCO World Heritage sites. | https://whc.unesco.org/en/list/323 ; https://whc.unesco.org/en/list/749 | 2026-11-08 (403 to automated check) | Open |

## 8. Data feed

| # | Fact | Source | Checked | Status |
| --- | --- | --- | --- | --- |
| 8.1 | 99 founder-owned brand records, their domains, base cities and summaries. | Each brand's homepage, Vercel team project domains | 2026-11-08 | Open: replace with directory export |
| 8.2 | Country reference ("booster") sites: Bolivia (boliviaunpacked), Antarctica (southbound), Japan (thejapantraveller). | Live sites | 2026-11-08 | Open: other boosters may exist without a custom domain yet |
| 8.3 | All mock ranks are placeholders. | Mock generator | 2026-11-08 | Open |

## 9. Vercel Web Analytics privacy claims

| # | Fact as published | Source | Checked | Status |
| --- | --- | --- | --- | --- |
| 9.1 | No cookies; visitor hash from the request, discarded after 24 hours; data points listed in the Privacy Policy. | https://vercel.com/docs/analytics/privacy-policy (last updated 2026-06-26) | 2026-11-08 | Open |
