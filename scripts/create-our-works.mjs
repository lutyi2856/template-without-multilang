import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

const OUT_DIR = 'D:/template/kan-data';

const CATEGORY_MAP = {
  'kan-stanislav-aleksandrovich': ['orthodontics'],
  'kan-anna-aleksandrovna': ['prosthetics'],
  'yugaj-elena-igorevna': ['treatment', 'pediatric'],
  'tulegenova-asel-turahanovna': ['whitening'],
  'pak-olga-veniaminovna': ['treatment'],
  'kim-ekaterina-aleksandrovna': ['treatment'],
  'askarov-mansur-anvarovich': ['implantation'],
  'tulkunov-ojbek-ahmadzhanovich': ['terapiya', 'endodontiya', 'ortopediya'],
  'kim-anastasiya-radikovna': ['orthodontics'],
  'shahzod-shorahmatovich': ['treatment'],
  'abed-zuhra-zhalalovna': ['orthodontics'],
};

function wp(cmd) {
  try {
    const result = execSync(`docker exec wp-new-wordpress wp --allow-root ${cmd}`, { 
      encoding: 'utf8', timeout: 30000 
    });
    return result.trim().split('\n').pop().trim();
  } catch (err) {
    const msg = (err.stderr || err.message || '').toString().replace(/Deprecated:[^\n]+\n/g, '').trim();
    if (msg) console.error(`    WP-CLI: ${msg.split('\n')[0]}`);
    return null;
  }
}

function dockerCp(localPath, remotePath) {
  execSync(`docker cp "${localPath}" wp-new-wordpress:${remotePath}`, { encoding: 'utf8', timeout: 15000 });
}

function importImage(localPath, title) {
  if (!localPath || !existsSync(localPath)) return null;
  const filename = localPath.split('/').pop().split('\\').pop();
  const remotePath = `/tmp/${filename}`;
  dockerCp(localPath, remotePath);
  const result = wp(`media import ${remotePath} --title="${title}" --porcelain`);
  if (result && !isNaN(parseInt(result))) return parseInt(result);
  return null;
}

function serializePhpArray(ids) {
  const parts = ids.map((id, i) => `i:${i};s:${String(id).length}:"${id}";`);
  return `a:${ids.length}:{${parts.join('')}}`;
}

async function main() {
  const data = JSON.parse(readFileSync(`${OUT_DIR}/all-doctors-data-v2.json`, 'utf8'));
  const createdDoctors = JSON.parse(readFileSync(`${OUT_DIR}/created-doctors.json`, 'utf8'));

  const doctorPostMap = {};
  for (const cd of createdDoctors) {
    doctorPostMap[cd.slug] = cd.postId;
  }

  const createdWorks = [];
  let workIndex = 0;

  for (const d of data) {
    if (!d.beforeAfter || d.beforeAfter.length === 0) continue;

    const doctorPostId = doctorPostMap[d.slug] || doctorPostMap[d.slug + '-2'];
    if (!doctorPostId) {
      console.log(`SKIP: No doctor post for ${d.slug}`);
      continue;
    }

    console.log(`\n--- ${d.name} (${d.beforeAfter.length} pairs) ---`);

    for (let i = 0; i < d.beforeAfter.length; i++) {
      workIndex++;
      const ba = d.beforeAfter[i];
      const pairNum = i + 1;
      const title = `${d.name} — Кейс ${pairNum}`;
      const slug = `${d.slug}-case-${pairNum}`;

      console.log(`  [${workIndex}] ${title}`);

      const beforePath = ba.beforeProcessed || ba.beforeLocal;
      const afterPath = ba.afterProcessed || ba.afterLocal;

      const beforeId = importImage(beforePath, `${d.name} — До (${pairNum})`);
      if (beforeId) console.log(`    Before image: ID ${beforeId}`);

      const afterId = importImage(afterPath, `${d.name} — После (${pairNum})`);
      if (afterId) console.log(`    After image: ID ${afterId}`);

      const postId = wp(`post create --post_type=our-works --post_title="${title}" --post_name="${slug}" --post_status=publish --porcelain`);
      
      if (!postId || isNaN(parseInt(postId))) {
        console.log(`    ERROR: Failed to create post`);
        continue;
      }
      console.log(`    Post ID: ${postId}`);

      if (afterId) {
        wp(`post meta update ${postId} _thumbnail_id ${afterId}`);
      }

      if (beforeId) {
        wp(`post meta update ${postId} photo_before ${beforeId}`);
        wp(`post meta update ${postId} _photo_before field_work_photo_before`);
      }

      if (afterId) {
        wp(`post meta update ${postId} photo_after ${afterId}`);
        wp(`post meta update ${postId} _photo_after field_work_photo_after`);
      }

      wp(`post meta update ${postId} use_general_photo 0`);
      wp(`post meta update ${postId} _use_general_photo field_work_use_general_photo`);

      const serializedDoctors = serializePhpArray([doctorPostId]);
      wp(`post meta update ${postId} related_doctors '${serializedDoctors}'`);
      wp(`post meta update ${postId} _related_doctors field_work_related_doctors`);

      const cats = CATEGORY_MAP[d.slug];
      if (cats && cats.length > 0) {
        wp(`post term set ${postId} service_categories ${cats.join(' ')}`);
        console.log(`    Categories: ${cats.join(', ')}`);
      }

      createdWorks.push({
        postId: parseInt(postId),
        slug,
        title,
        doctorSlug: d.slug,
        doctorPostId,
        beforeImageId: beforeId,
        afterImageId: afterId,
        pairIndex: i,
      });

      console.log(`    DONE`);
    }
  }

  writeFileSync(`${OUT_DIR}/created-our-works.json`, JSON.stringify(createdWorks, null, 2), 'utf8');

  console.log('\n==========================================');
  console.log(`=== OUR-WORKS CREATED: ${createdWorks.length} ===`);
  createdWorks.forEach(w => console.log(`  #${w.postId} ${w.title}`));
  console.log('==========================================');

  // Step 6: Bidirectional relationships — update doctor.related_works
  console.log('\n--- Setting bidirectional relationships ---');
  const worksByDoctor = {};
  for (const w of createdWorks) {
    if (!worksByDoctor[w.doctorPostId]) worksByDoctor[w.doctorPostId] = [];
    worksByDoctor[w.doctorPostId].push(w.postId);
  }

  for (const [doctorId, workIds] of Object.entries(worksByDoctor)) {
    const serialized = serializePhpArray(workIds);
    wp(`post meta update ${doctorId} related_works '${serialized}'`);
    wp(`post meta update ${doctorId} _related_works field_doctor_related_works`);
    console.log(`  Doctor #${doctorId} -> ${workIds.length} works: [${workIds.join(', ')}]`);
  }

  console.log('\n=== ALL DONE ===');
}

main().catch(console.error);
