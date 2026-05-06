// YÖKDİL Sosyal Bilimler - Fallback Soru Bankası
// 54 puan stratejisi: Çeviri > Bağlaç > Kelime > Cloze

export const TRANSLATION_QUESTIONS = [
  { id:'t1', direction:'en-tr',
    stem:'The rapid expansion of urbanization has significantly altered the traditional social structures in many developing countries.',
    options:[
      {id:'a',text:'Hızlı kentleşme, birçok gelişmekte olan ülkede geleneksel sosyal yapıları önemli ölçüde değiştirmiştir.',correct:true},
      {id:'b',text:'Kentleşmenin hızlı büyümesi, gelişmiş ülkelerde sosyal yapıların bozulmasına neden olmuştur.',correct:false},
      {id:'c',text:'Gelişmekte olan ülkelerde kentleşme hızla artmış ve toplumsal değişimlere yol açmıştır.',correct:false},
      {id:'d',text:'Geleneksel yapılar, kentleşmenin yavaş ilerlemesi nedeniyle birçok ülkede değişmemiştir.',correct:false},
      {id:'e',text:'Birçok ülkede sosyal yapılar, kentleşme olmadan da önemli değişikliklere uğramıştır.',correct:false},
    ]},
  { id:'t2', direction:'en-tr',
    stem:'Although consumer behavior is largely influenced by advertising, personal experience also plays a crucial role in purchasing decisions.',
    options:[
      {id:'a',text:'Reklam tüketici davranışını etkiler ancak kişisel deneyimin satın alma kararlarında hiçbir rolü yoktur.',correct:false},
      {id:'b',text:'Tüketici davranışı büyük ölçüde reklamlardan etkilense de kişisel deneyim de satın alma kararlarında önemli bir rol oynar.',correct:true},
      {id:'c',text:'Satın alma kararları yalnızca reklamlarla belirlenir ve kişisel deneyimin etkisi sınırlıdır.',correct:false},
      {id:'d',text:'Kişisel deneyim, tüketici davranışını reklamlardan daha fazla etkileyen tek faktördür.',correct:false},
      {id:'e',text:'Reklamlar ve kişisel deneyim, tüketici davranışını eşit derecede etkileyen unsurlardır.',correct:false},
    ]},
  { id:'t3', direction:'tr-en',
    stem:'Teknolojinin hızla gelişmesi, eğitim sistemlerinin yeniden yapılandırılmasını zorunlu hale getirmiştir.',
    options:[
      {id:'a',text:'Technology has developed so rapidly that education systems have become unnecessary.',correct:false},
      {id:'b',text:'The rapid development of technology has made it necessary to restructure education systems.',correct:true},
      {id:'c',text:'Education systems have been restructured because technology developed slowly.',correct:false},
      {id:'d',text:'Rapid technological changes have prevented education systems from being restructured.',correct:false},
      {id:'e',text:'The restructuring of education has slowed down the development of technology.',correct:false},
    ]},
  { id:'t4', direction:'tr-en',
    stem:'Küreselleşme, yerel kültürlerin korunmasını zorlaştırsa da kültürel çeşitliliğin tamamen ortadan kalkması beklenmemektedir.',
    options:[
      {id:'a',text:'Globalization has completely eliminated cultural diversity and local cultures.',correct:false},
      {id:'b',text:'Local cultures are expected to disappear entirely due to the effects of globalization.',correct:false},
      {id:'c',text:'Although globalization makes it difficult to preserve local cultures, cultural diversity is not expected to disappear entirely.',correct:true},
      {id:'d',text:'Cultural diversity has increased significantly as a result of globalization.',correct:false},
      {id:'e',text:'Globalization has made it easier to preserve local cultures around the world.',correct:false},
    ]},
]

export const VOCAB_GRAMMAR_QUESTIONS = [
  { id:'v1', type:'vocab',
    stem:'The government has taken several measures to ---- the negative effects of unemployment on society.',
    options:[
      {id:'a',text:'alleviate',correct:true},{id:'b',text:'aggravate',correct:false},
      {id:'c',text:'abandon',correct:false},{id:'d',text:'accumulate',correct:false},{id:'e',text:'abolish',correct:false},
    ]},
  { id:'v2', type:'vocab',
    stem:'Recent studies have shown that regular exercise has a ---- impact on mental health.',
    options:[
      {id:'a',text:'harmful',correct:false},{id:'b',text:'negligible',correct:false},
      {id:'c',text:'significant',correct:true},{id:'d',text:'temporary',correct:false},{id:'e',text:'controversial',correct:false},
    ]},
  { id:'v3', type:'grammar',
    stem:'---- the economy has improved considerably, the unemployment rate remains high in rural areas.',
    options:[
      {id:'a',text:'Although',correct:true},{id:'b',text:'Because',correct:false},
      {id:'c',text:'Unless',correct:false},{id:'d',text:'Since',correct:false},{id:'e',text:'As long as',correct:false},
    ]},
  { id:'v4', type:'grammar',
    stem:'If the company ---- more in research, it would have developed better products by now.',
    options:[
      {id:'a',text:'invests',correct:false},{id:'b',text:'invested',correct:false},
      {id:'c',text:'had invested',correct:true},{id:'d',text:'has invested',correct:false},{id:'e',text:'would invest',correct:false},
    ]},
  { id:'v5', type:'grammar',
    stem:'The manager insisted that all employees ---- the new training program before the deadline.',
    options:[
      {id:'a',text:'complete',correct:true},{id:'b',text:'completed',correct:false},
      {id:'c',text:'completing',correct:false},{id:'d',text:'would complete',correct:false},{id:'e',text:'had completed',correct:false},
    ]},
]

export const CLOZE_PARAGRAPHS = [
  { id:'c1', title:'The Role of Social Media in Modern Marketing',
    text:'Social media has become an essential tool for businesses (1)____ to reach their target audience. Companies now spend a significant portion of their marketing budgets (2)____ digital platforms. (3)____ traditional advertising methods are still used, the shift towards online marketing is undeniable. Businesses that fail to adapt (4)____ these changes risk losing their competitive advantage. Research suggests that consumers (5)____ more likely to purchase products recommended by social media influencers than those advertised through conventional channels.',
    gaps:[
      {id:1, options:[{id:'a',text:'seeking',correct:true},{id:'b',text:'sought',correct:false},{id:'c',text:'seeks',correct:false},{id:'d',text:'to seek',correct:false},{id:'e',text:'having sought',correct:false}]},
      {id:2, options:[{id:'a',text:'in',correct:false},{id:'b',text:'on',correct:true},{id:'c',text:'at',correct:false},{id:'d',text:'for',correct:false},{id:'e',text:'with',correct:false}]},
      {id:3, options:[{id:'a',text:'Because',correct:false},{id:'b',text:'Unless',correct:false},{id:'c',text:'Although',correct:true},{id:'d',text:'Since',correct:false},{id:'e',text:'If',correct:false}]},
      {id:4, options:[{id:'a',text:'for',correct:false},{id:'b',text:'with',correct:false},{id:'c',text:'to',correct:true},{id:'d',text:'from',correct:false},{id:'e',text:'by',correct:false}]},
      {id:5, options:[{id:'a',text:'is',correct:false},{id:'b',text:'are',correct:true},{id:'c',text:'was',correct:false},{id:'d',text:'being',correct:false},{id:'e',text:'been',correct:false}]},
    ]},
]

export const SENTENCE_COMPLETION = [
  { id:'s1',
    stem:'The success of a business depends not only on its products but also ----.',
    options:[
      {id:'a',text:'on how effectively it communicates with its customers',correct:true},
      {id:'b',text:'the products are of high quality',correct:false},
      {id:'c',text:'because it has a large marketing budget',correct:false},
      {id:'d',text:'whether they can reduce production costs',correct:false},
      {id:'e',text:'so that profits increase every year',correct:false},
    ]},
  { id:'s2',
    stem:'---- , many small businesses were forced to close permanently during the pandemic.',
    options:[
      {id:'a',text:'Although governments provided financial aid',correct:false},
      {id:'b',text:'Since the economy recovered quickly',correct:false},
      {id:'c',text:'Despite the support provided by local communities',correct:true},
      {id:'d',text:'Because online sales increased dramatically',correct:false},
      {id:'e',text:'As long as restrictions were lifted on time',correct:false},
    ]},
  { id:'s3',
    stem:'Had the researchers conducted a more thorough analysis, ----.',
    options:[
      {id:'a',text:'the results will be more reliable',correct:false},
      {id:'b',text:'they would have identified the problem earlier',correct:true},
      {id:'c',text:'the experiment has been successful',correct:false},
      {id:'d',text:'more funding is provided for the project',correct:false},
      {id:'e',text:'the team was able to publish their findings',correct:false},
    ]},
]

export const READING_PASSAGES = [
  { id:'r1', title:'Consumer Psychology',
    text:'Consumer psychology examines how people make decisions about what they buy, need, want, or act regarding a product, service, or company. It involves understanding the mental processes behind consumer choices. Researchers in this field study how emotions, attitudes, and preferences influence buying behavior. One key finding is that consumers often make purchasing decisions based on emotional responses rather than rational analysis. For example, brand loyalty is frequently driven by emotional attachment rather than objective evaluation of product quality. Additionally, social factors such as peer pressure and cultural norms play a significant role in shaping consumer preferences. Understanding these psychological mechanisms allows businesses to develop more effective marketing strategies.',
    questions:[
      {id:'r1q1',question:'What is the main focus of consumer psychology?',
        options:[{id:'a',text:'Analyzing product manufacturing processes',correct:false},{id:'b',text:'Understanding mental processes behind consumer choices',correct:true},{id:'c',text:'Developing new advertising technologies',correct:false},{id:'d',text:'Training sales professionals',correct:false},{id:'e',text:'Reducing production costs',correct:false}]},
      {id:'r1q2',question:'According to the passage, brand loyalty is mainly driven by ----.',
        options:[{id:'a',text:'rational product comparison',correct:false},{id:'b',text:'low prices',correct:false},{id:'c',text:'emotional attachment',correct:true},{id:'d',text:'advertising frequency',correct:false},{id:'e',text:'product availability',correct:false}]},
      {id:'r1q3',question:'Which of the following is NOT mentioned as a factor influencing consumer behavior?',
        options:[{id:'a',text:'Emotions and attitudes',correct:false},{id:'b',text:'Government regulations',correct:true},{id:'c',text:'Peer pressure',correct:false},{id:'d',text:'Cultural norms',correct:false},{id:'e',text:'Personal preferences',correct:false}]},
    ]},
]

export const PARA_COMPLETION = [
  { id:'p1',
    text:'Education plays a fundamental role in shaping a society\'s future. ---- This is because education not only provides individuals with knowledge and skills but also fosters critical thinking and social awareness. Countries that invest heavily in their education systems tend to experience faster economic growth and greater social stability.',
    options:[
      {id:'a',text:'However, many students prefer vocational training over traditional education.',correct:false},
      {id:'b',text:'It is widely regarded as the most important factor in national development.',correct:true},
      {id:'c',text:'Nevertheless, some argue that experience is more valuable than formal education.',correct:false},
      {id:'d',text:'For instance, Finland has one of the best education systems in the world.',correct:false},
      {id:'e',text:'On the other hand, technology has replaced many traditional teaching methods.',correct:false},
    ]},
]

export const IRRELEVANT_SENTENCE = [
  { id:'i1',
    sentences:[
      {num:1,text:'Remote work has become increasingly common since the global pandemic.'},
      {num:2,text:'Many companies have discovered that employees can be equally productive when working from home.'},
      {num:3,text:'The price of office furniture has increased by 30 percent in the last decade.'},
      {num:4,text:'This shift has also led to significant cost savings for businesses in terms of office space and utilities.'},
      {num:5,text:'As a result, a growing number of organizations are adopting hybrid work models permanently.'},
    ],
    answer:3},
  { id:'i2',
    sentences:[
      {num:1,text:'Tourism is one of the largest industries in the global economy.'},
      {num:2,text:'It generates employment opportunities and contributes significantly to GDP in many countries.'},
      {num:3,text:'The invention of the printing press in the 15th century revolutionized communication.'},
      {num:4,text:'However, the environmental impact of mass tourism has raised serious concerns among environmentalists.'},
      {num:5,text:'Sustainable tourism practices are now being promoted to balance economic benefits with environmental protection.'},
    ],
    answer:3},
]

export const SECTION_INFO = {
  vocab: { label:'Kelime & Gramer', count:'20 soru', icon:'📝', color:'#f59e0b', tip:'Bağlaçlara (although, however, despite) odaklan — sınavın iskeleti!' },
  cloze: { label:'Cloze Test', count:'10 soru', icon:'📄', color:'var(--color-neon-cyan)', tip:'Paragraftaki boşlukları doldur. Bağlaç + edat bilgisi kritik.' },
  sentence: { label:'Cümle Tamamlama', count:'11 soru', icon:'✏️', color:'#818cf8', tip:'Yarım cümleyi anlam+gramer açısından tamamla.' },
  translation: { label:'Çeviri (EN↔TR)', count:'12 soru', icon:'🔄', color:'var(--color-neon-green)', tip:'⭐ CAN SİMİDİ! Özne-Yüklem eşleştirmesiyle 12/12 yapılabilir.' },
  reading: { label:'Paragraf Okuma', count:'15 soru', icon:'📖', color:'#ec4899', tip:'5 paragraf × 3 soru. Sosyal bilimler konuları.' },
  para_complete: { label:'Paragraf Tamamlama', count:'6 soru', icon:'🧩', color:'#a78bfa', tip:'Paragrafın akışına en uygun cümleyi seç.' },
  irrelevant: { label:'Anlam Bütünlüğü', count:'6 soru', icon:'🚫', color:'#ef4444', tip:'Paragraftaki konuyu bozan cümleyi bul.' },
}
