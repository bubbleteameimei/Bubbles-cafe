import { XMLParser } from 'fast-xml-parser';
import { promises as fs } from 'fs';
import { db } from '../server/db';
import { posts, users, comments } from '../shared/schema';
import { eq } from 'drizzle-orm';
import path from 'path';

async function importWordPressMetadata() {
  try {
    // Read the WordPress export file
    const xmlData = await fs.readFile(
      path.join(process.cwd(), 'attached_assets/bubblescafe.wordpress.2025-02-04.000.xml'),
      'utf-8'
    );

    // Parse XML with options to preserve CDATA
    const parser = new XMLParser({
      ignoreAttributes: false,
      parseTagValue: true,
      parseAttributeValue: true,
      textNodeName: "__text"
    });
    const jsonObj = parser.parse(xmlData);

    // Extract channel information
    const channel = jsonObj.rss.channel;

    // Create admin user if not exists
    const authorEmail = channel['wp:author']['wp:author_email'];
    const adminUser = await db.select().from(users).where(eq(users.email, authorEmail)).limit(1);
    let adminUserId: number;

    if (!adminUser.length) {
      const [newAdmin] = await db.insert(users).values({
        username: channel['wp:author']['wp:author_login'],
        email: authorEmail,
        password_hash: '$2b$10$dummyHashForImport', // Temporary hash, admin will need to reset
        isAdmin: true
      }).returning({ id: users.id });
      adminUserId = newAdmin.id;
    } else {
      adminUserId = adminUser[0].id;
    }

    // Import post metadata and comments
    for (const item of channel.item) {
      const title = item.title.__cdata || item.title;
      const content = item['content:encoded'].__cdata || item['content:encoded'];

      // Generate slug from title
      const slug = title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Calculate estimated reading time (roughly 200 words per minute)
      const wordCount = content.split(/\s+/).length;
      const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

      // Enhanced trigger warnings with broader patterns
      const triggerWarnings = ['horror']; // Base tag
      const triggerKeywords = {
        'gore': /blood|gore|guts|viscera|flesh|wound|mutilat|dismember|entrails|organ/i,
        'violence': /murder|kill|stab|shot|violence|brutal|assault|attack|fight|struggle|strangle/i,
        'body-horror': /transform|mutate|deform|grotesque|twist|morph|flesh|skin|bone|decay/i,
        'psychological': /mind|sanity|madness|paranoia|hallucination|delusion|reality|conscious|dream|nightmare/i,
        'existential': /existence|meaning|purpose|void|empty|hollow|eternal|infinite|cosmic|universe/i,
        'mindbending': /reality.*bend|perception|truth|illusion|fake|real|believe|trust|doubt/i,
        'death': /death|die|corpse|dead|funeral|morgue|grave|cemetery|tomb|bury/i,
        'suicide': /suicide|self-harm|end.*life|jump|blade|pills|overdose|despair/i,
        'stalking': /follow|watch|stalk|spy|observe|trail|track|hunt|pursue|shadow/i,
        'home-invasion': /break.*in|intruder|invaded|uninvited|stranger|door|window|lock|safe/i,
        'isolation': /alone|lonely|isolated|abandoned|empty|desert|remote|cut.*off|trap/i,
        'supernatural': /ghost|spirit|demon|haunt|paranormal|possess|curse|hex|witch|occult/i,
        'cosmic-horror': /ancient|elder|cosmic|universe|vast|incomprehensible|knowledge|forbidden|cult/i,
        'religious': /god|devil|hell|heaven|sin|divine|sacred|unholy|ritual|worship/i,
        'claustrophobia': /tight|closed|trapped|confined|tunnel|cave|box|coffin|buried|space/i,
        'darkness': /dark|shadow|black|night|blind|light.*fade|dim|visibility|sight/i,
        'nature': /forest|ocean|mountain|wild|animal|creature|beast|predator|hunt/i,
        'technology': /machine|computer|digital|virtual|cyber|network|screen|program|code|system/i,
        'surveillance': /camera|watch|monitor|record|tape|video|footage|evidence|proof|document/i
      };

      Object.entries(triggerKeywords).forEach(([warning, regex]) => {
        if (regex.test(content)) {
          triggerWarnings.push(warning);
        }
      });

      // Generate smart excerpt
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const impactfulSentences = sentences.filter(s => 
        /blood|death|scream|horror|dark|fear|terror|nightmare/i.test(s)
      );
      const excerpt = impactfulSentences.length > 0 
        ? impactfulSentences[0].trim() 
        : sentences[0].trim();

      // Calculate content intensity rating (1-5)
      const intensityFactors = {
        triggerCount: triggerWarnings.length,
        violentContent: (content.match(/blood|gore|kill|death|corpse/gi) || []).length,
        psychologicalContent: (content.match(/mind|sanity|mad|paranoia|reality/gi) || []).length,
        supernaturalContent: (content.match(/ghost|spirit|demon|curse|haunt/gi) || []).length
      };

      const intensityScore = Math.min(5, Math.ceil(
        (intensityFactors.triggerCount * 0.5 + 
         intensityFactors.violentContent * 0.3 +
         intensityFactors.psychologicalContent * 0.2 +
         intensityFactors.supernaturalContent * 0.2) / 2
      ));

      // Import post metadata only
      const [newPost] = await db.insert(posts).values({
        title,
        content, // Keep content for analysis
        excerpt: excerpt.substring(0, 200) + '...', // Limit excerpt length
        slug,
        authorId: adminUserId,
        originalSource: item.link,
        originalAuthor: item['dc:creator'],
        originalPublishDate: new Date(item.pubDate),
        matureContent: intensityScore > 3,
        readingTimeMinutes,
        triggerWarnings: [...new Set(triggerWarnings)] // Remove duplicates
      }).returning({ id: posts.id });

      // Import comments if any
      if (item['wp:comment']) {
        const postComments = Array.isArray(item['wp:comment']) ? item['wp:comment'] : [item['wp:comment']];
        for (const comment of postComments) {
          await db.insert(comments).values({
            postId: newPost.id,
            content: comment['wp:comment_content'],
            author: comment['wp:comment_author'],
          });
        }
      }
    }

    console.log('Metadata import completed successfully');
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  }
}

importWordPressMetadata();