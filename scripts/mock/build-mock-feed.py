import json, re, os
H=os.path.dirname(os.path.abspath(__file__))
brands=json.load(open(os.path.join(H,'brands.json'))); desc=json.load(open(os.path.join(H,'desc.json')))
# destination slug -> (name, type, region)
D={
'antarctica':('Antarctica','continent','poles'),'uruguay':('Uruguay','country','americas'),'uganda':('Uganda','country','africa'),
'tunisia':('Tunisia','country','africa'),'slovenia':('Slovenia','country','europe'),'sao-tome-and-principe':('São Tomé and Príncipe','country','africa'),
'romania':('Romania','country','europe'),'montenegro':('Montenegro','country','europe'),'malta':('Malta','country','europe'),
'the-gambia':('The Gambia','country','africa'),'jamaica':('Jamaica','country','americas'),'guyana':('Guyana','country','americas'),
'czechia':('Czechia','country','europe'),'dominican-republic':('Dominican Republic','country','americas'),'nicaragua':('Nicaragua','country','americas'),
'vietnam':('Vietnam','country','asia'),'united-states':('United States','country','americas'),'thailand':('Thailand','country','asia'),
'kazakhstan':('Kazakhstan','country','asia'),'french-polynesia':('French Polynesia','territory','oceania'),'england-wales':('England and Wales','nation','europe'),
'germany':('Germany','country','europe'),'rwanda':('Rwanda','country','africa'),'fiji':('Fiji','country','oceania'),'austria':('Austria','country','europe'),
'cuba':('Cuba','country','americas'),'china':('China','country','asia'),'cook-islands':('Cook Islands','territory','oceania'),'azerbaijan':('Azerbaijan','country','asia'),
'bolivia':('Bolivia','country','americas'),'estonia':('Estonia','country','europe'),'latvia':('Latvia','country','europe'),'lithuania':('Lithuania','country','europe'),
'albania':('Albania','country','europe'),'cape-verde':('Cape Verde','country','africa'),'armenia':('Armenia','country','asia'),
'united-arab-emirates':('United Arab Emirates','country','middle-east'),'zimbabwe':('Zimbabwe','country','africa'),'zambia':('Zambia','country','africa'),
'uzbekistan':('Uzbekistan','country','asia'),'turkiye':('Türkiye','country','europe'),'portugal':('Portugal','country','europe'),'brazil':('Brazil','country','americas'),
'indonesia':('Indonesia','country','asia'),'kenya':('Kenya','country','africa'),'tanzania':('Tanzania','country','africa'),'taiwan':('Taiwan','territory','asia'),
'sri-lanka':('Sri Lanka','country','asia'),'spain':('Spain','country','europe'),'seychelles':('Seychelles','country','africa'),'senegal':('Senegal','country','africa'),
'south-africa':('South Africa','country','africa'),'botswana':('Botswana','country','africa'),'mauritius':('Mauritius','country','africa'),
'philippines':('Philippines','country','asia'),'panama':('Panama','country','americas'),'new-zealand':('New Zealand','country','oceania'),'namibia':('Namibia','country','africa'),
'mozambique':('Mozambique','country','africa'),'morocco':('Morocco','country','africa'),'mexico':('Mexico','country','americas'),'maldives':('Maldives','country','asia'),
'malaysia':('Malaysia','country','asia'),'malawi':('Malawi','country','africa'),'madagascar':('Madagascar','country','africa'),'laos':('Laos','country','asia'),
'kyrgyzstan':('Kyrgyzstan','country','asia'),'italy':('Italy','country','europe'),'ireland':('Ireland','country','europe'),'northern-ireland':('Northern Ireland','nation','europe'),
'india':('India','country','asia'),'georgia':('Georgia','country','asia'),'ecuador':('Ecuador','country','americas'),'croatia':('Croatia','country','europe'),
'colombia':('Colombia','country','americas'),'chile':('Chile','country','americas'),'canada':('Canada','country','americas'),'cambodia':('Cambodia','country','asia'),
'ghana':('Ghana','country','africa'),'belize':('Belize','country','americas'),'greece':('Greece','country','europe'),'costa-rica':('Costa Rica','country','americas'),
'bhutan':('Bhutan','country','asia'),'norway':('Norway','country','europe'),'sweden':('Sweden','country','europe'),'denmark':('Denmark','country','europe'),'finland':('Finland','country','europe'),
'france':('France','country','europe'),'iceland':('Iceland','country','europe'),'peru':('Peru','country','americas'),'scotland':('Scotland','nation','europe'),
'south-korea':('South Korea','country','asia'),'switzerland':('Switzerland','country','europe'),'nepal':('Nepal','country','asia'),'australia':('Australia','country','oceania'),
'mongolia':('Mongolia','country','asia'),'argentina':('Argentina','country','americas'),'benin':('Benin','country','africa'),'ethiopia':('Ethiopia','country','africa'),
'japan':('Japan','country','asia'),'guatemala':('Guatemala','country','americas'),
# destinations in the feed with no verified company: must NOT generate pages
'chad':('Chad','country','africa'),
}
# subdomain -> (base, delivers_in)
M={'seventhcontinent':('argentina',['antarctica']),'estanciatravel':('uruguay',['uruguay']),'nilesourcesafaris':('uganda',['uganda']),'carthagejourneys':('tunisia',['tunisia']),
'alpstoadriatic':('slovenia',['slovenia']),'chocolateislandstravel':('sao-tome-and-principe',['sao-tome-and-principe']),'carpathiatravel':('romania',['romania']),
'blackmountaintravel':('montenegro',['montenegro']),'knightsisles':('malta',['malta']),'smilingcoasttravel':('the-gambia',['the-gambia']),'bluemountaintravel':('jamaica',['jamaica']),
'rupununijourneys':('guyana',['guyana']),'bohemiajourneys':('czechia',['czechia']),'samanandsierra':('dominican-republic',['dominican-republic']),'lakesandvolcanoes':('nicaragua',['nicaragua']),
'dragonbaytravel':('vietnam',['vietnam']),'coasttocoasttravel':('united-states',['united-states']),'longtailtravel':('thailand',['thailand']),'silkandsnow':('kazakhstan',['kazakhstan']),
'pearllagoontravel':('french-polynesia',['french-polynesia']),'albionjourneys':('england-wales',['england-wales']),'castleroadtravel':('germany',['germany']),'virungajourneys':('rwanda',['rwanda']),
'bulajourneys':('fiji',['fiji']),'danubeandalps':('austria',['austria']),'oldhavanajourneys':('cuba',['cuba']),'middlekingdomjourneys':('china',['china']),'kiaoranatravel':('cook-islands',['cook-islands']),
'caspianjourneys':('azerbaijan',['azerbaijan']),'altiplanojourneys':('bolivia',['bolivia']),'balticlight':('estonia',['estonia','latvia','lithuania']),'eaglecoast':('albania',['albania']),
'tenislandstravel':('cape-verde',['cape-verde']),'araratjourneys':('armenia',['armenia']),'aravia':('united-arab-emirates',['united-arab-emirates']),'mositravel':('zimbabwe',['zimbabwe']),
'luangwasafaris':('zambia',['zambia']),'goldenroad':('uzbekistan',['uzbekistan']),'kervanjourneys':('turkiye',['turkiye']),'tringles':('portugal',['portugal','brazil','indonesia','kenya']),
'uhurujourneys':('tanzania',['tanzania']),'formosajourneys':('taiwan',['taiwan']),'serendibjourneys':('sri-lanka',['sri-lanka']),'sobremesa':('spain',['spain']),'granitecoast':('seychelles',['seychelles']),
'baobabandsea':('senegal',['senegal']),'safarigolftour':('kenya',['kenya','tanzania','south-africa','zimbabwe','botswana','uganda','mauritius']),'sabbatical':('portugal',[]),
'seventhousand':('philippines',['philippines']),'twotides':('panama',['panama']),'aotearoajourneys':('new-zealand',['new-zealand']),'namiblight':('namibia',['namibia']),
'dhowanddune':('mozambique',['mozambique']),'azulmorocco':('morocco',['morocco']),'cenotehouse':('mexico',['mexico']),'kreolcoast':('mauritius',['mauritius']),'atolljourneys':('maldives',['maldives']),
'hornbilltravel':('malaysia',['malaysia']),'lakeofstarstravel':('malawi',['malawi']),'baobabroad':('madagascar',['madagascar']),'slowboat':('laos',['laos']),'celestialmountains':('kyrgyzstan',['kyrgyzstan']),
'safarinjema':('kenya',['kenya']),'campaniletravel':('italy',['italy']),'softday':('ireland',['ireland','northern-ireland']),'musafirtravel':('india',['india']),'supra':('georgia',['georgia']),
'extrafari':('kenya',['kenya','tanzania','botswana']),'encantadasexpeditions':('ecuador',['ecuador']),'maestral':('croatia',['croatia']),'cafetal':('colombia',['colombia']),'latitudechile':('chile',['chile']),
'canadatravelco':('canada',['canada']),'angkortrails':('cambodia',['cambodia']),'solnascente':('brazil',['brazil']),'mokorojourneys':('botswana',['botswana']),'akwaaba':('ghana',['ghana']),
'cayecoast':('belize',['belize']),'kymatravel':('greece',['greece']),'selvora':('costa-rica',['costa-rica']),'dzonghouse':('bhutan',['bhutan']),'gustav':('norway',['norway','sweden','denmark','finland']),
'theislandedit':('indonesia',['indonesia']),'rond-point':('france',['france']),'edgeofnorth':('iceland',['iceland']),'discoverperutravel':('peru',['peru']),'portoseason':('portugal',['portugal']),
'highlandandisle':('scotland',['scotland']),'morningcalmtravel':('south-korea',['south-korea']),'swisshorizon':('switzerland',['switzerland']),'kathmanduandbeyond':('nepal',['nepal']),
'capecompass':('south-africa',['south-africa']),'outbackandreef':('australia',['australia']),'steppeandsky':('mongolia',['mongolia']),'pampasandpeaks':('argentina',['argentina']),
'escalevoyages':('benin',['benin']),'abyssiniajourneys':('ethiopia',['ethiopia']),'komorebi':('japan',['japan']),'antiguaandbeyond':('guatemala',['guatemala'])}
NICHE={'safari':'safari','walking safari':'safari','trekking':'trekking-mountains','hiking/walking':'trekking-mountains','Kilimanjaro/volcano climbs':'trekking-mountains',
'horse riding':'trekking-mountains','culture':'culture-heritage','wildlife':'wildlife-diving','diving/reef':'wildlife-diving','birding':'wildlife-diving',
'gorilla/primate trekking':'wildlife-diving','family':'family','honeymoon/couples':'honeymoon','heritage/diaspora':'heritage-diaspora'}
# Keyword tags applied to the company's own meta description (documented in DATA-FIELDS.md)
KW=[('culture-heritage',r'\b(history|heritage|ruins|Roman|monaster|temple|old town|old city|medina|castle|Angkor|cathedral|court)'),
    ('wildlife-diving',r'\b(wildlife|reef|gorilla|chimp|birds|birding|whales?)\b'),
    ('trekking-mountains',r'\b(trek|treks|trekking|hikes?|hiking|Great Walks|volcano climbs|Kilimanjaro|on foot)'),
    ('safari',r'\bsafaris?\b'),('family',r'\bfamil(y|ies)\b'),('honeymoon',r'\bhoneymoon'),('overland',r'\b(overland|4x4|self-drive|road trips?)\b'),
    ('heritage-diaspora',r'\bdiaspora\b')]
TIDY={'Knights\' Isles':"Knights' Isles"}
dest_used=set(); companies=[]
by_country={}
for b in brands:
    if b['kind']!='brand': continue
    sub=b['domain'].split('.')[0]; base,dl=M[sub]
    d=desc.get(b['domain']) or b['description']
    n=set(NICHE[x] for x in b['niches'] if x in NICHE)
    for k,rx in KW:
        if re.search(rx,d,re.I): n.add(k)
    city=b['base_city']
    c={'id':sub,'name':b['name'],'kind':'dmc' if False else 'agency','country_base':base,'base_city':city,'delivers_in':dl,'sells_from':[],
       'niches':sorted(n),'tier':'founder','verified':False,'founder_owned':True,'rank':{},
       'summary':d,'summary_attribution':'company_website','website':'https://'+b['domain'],'profile_url':None,'memberships':[],
       'sources':[{'url':'https://'+b['domain']+'/','label':b['name']+' website (homepage, retrieved 8 Nov 2026)'},
                  {'url':'https://tourground.com/','label':'Tourground directory (founding portfolio)'}],
       'checked_by':'Tourground','last_checked':'2026-11-08','example':False}
    companies.append(c); dest_used|=set(dl)|{base}
# The founder brands plan trips and sell them; whether each is legally a DMC or an agency is not stated -> kind decided below
# Brands that say they run trips on the ground from the destination (stated on their homepage) -> dmc; else agency.
DMC_HINT=r'\b(run from|on the ground|local specialist|Bhutanese partner operator|planned and run)\b'
for c in companies:
    c['kind']='dmc' if re.search(DMC_HINT,c['summary'],re.I) else 'agency'
# ranks: placeholder order inside each country = specialist based in the country first, then multi-country, alphabetical. MOCK ONLY.
for c in companies:
    for s in c['delivers_in']: by_country.setdefault(s,[]).append(c)
for s,lst in by_country.items():
    lst.sort(key=lambda c:(c['country_base']!=s, len(c['delivers_in']), c['name']))
    for i,c in enumerate(lst,1): c['rank'][s]=i
# Example records (fake, clearly labelled)
companies += [
 {'id':'example-operator-kenya','name':'Example Operator (Kenya)','kind':'dmc','country_base':'kenya','base_city':None,'delivers_in':['kenya','tanzania'],
  'sells_from':['united-kingdom','united-states'],'niches':['safari','family'],'tier':'platinum','verified':True,'founder_owned':False,'rank':{'kenya':len(by_country['kenya'])+1,'tanzania':len(by_country['tanzania'])+1},
  'summary':'EXAMPLE RECORD. This is not a real company. It exists in the mock feed to show how a Platinum (paid plan) listing renders, including the sponsored link to its own website.',
  'summary_attribution':'example','website':'https://example.com/','profile_url':None,'memberships':['ATTA (example only)'],
  'sources':[{'url':'https://example.com/','label':'Example source (not real)'}],'checked_by':'Tourground','last_checked':'2026-11-08','example':True},
 {'id':'example-operator-peru','name':'Example Operator (Peru)','kind':'agency','country_base':'peru','base_city':None,'delivers_in':['peru','bolivia'],
  'sells_from':['brazil'],'niches':['trekking-mountains','culture-heritage'],'tier':'black','verified':True,'founder_owned':False,'rank':{'peru':len(by_country['peru'])+1,'bolivia':len(by_country['bolivia'])+1},
  'summary':'EXAMPLE RECORD. This is not a real company. It exists in the mock feed to show how a Black tier listing renders.',
  'summary_attribution':'example','website':'https://example.org/','profile_url':None,'memberships':[],
  'sources':[{'url':'https://example.org/','label':'Example source (not real)'}],'checked_by':'Tourground','last_checked':'2026-11-08','example':True},
 {'id':'example-prospect-unverified','name':'Example Prospect (unverified, must never publish)','kind':'agency','country_base':'kenya','base_city':None,'delivers_in':['kenya'],
  'sells_from':[],'niches':['safari'],'tier':'verified','verified':False,'founder_owned':False,'rank':{'kenya':99},
  'summary':'EXAMPLE RECORD used by the build check. Not verified and not founder-owned, so the build must exclude it.','summary_attribution':'example',
  'website':'https://example.net/','profile_url':None,'memberships':[],'sources':[{'url':'https://example.net/','label':'Example'}],'checked_by':None,'last_checked':'2026-11-08','example':True},
]
BOOST={'bolivia':'https://boliviaunpacked.tourground.com','antarctica':'https://southbound.tourground.com','japan':'https://thejapantraveller.tourground.com'}
dests=[]
for s in sorted(dest_used|{'chad'}, key=lambda s:D[s][0]):
    n,t,r=D[s]; dests.append({'slug':s,'name':n,'type':t,'region':r,'content_dir':'countries/'+s,'booster_url':BOOST.get(s)})
feed={'_meta':{'source':'mock','generated':'2026-11-08','note':'MOCK FEED. Founder-owned brand records are built from each brand\'s live homepage (retrieved 2026-11-08). Ranks are placeholders. Records with example=true are fake.'},
      'destinations':dests,'companies':companies}
json.dump(feed,open(os.path.join(H,'..','..','data','feed.mock.json'),'w'),ensure_ascii=False,indent=2)
print(len(dests),'destinations',len(companies),'companies')
from collections import Counter
print(Counter(n for c in companies for n in c['niches'])); print(Counter(c['kind'] for c in companies))
print([ (s,[c['id'] for c in l]) for s,l in by_country.items() if len(l)>1])
