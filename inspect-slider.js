/**
 * COMPREHENSIVE INSPECTION SCRIPT
 * For "Наши работы" Section - Before/After Slider Issue
 * 
 * INSTRUCTIONS:
 * 1. Open http://localhost:3001 in Chrome/Edge
 * 2. Scroll to "Наши работы" section
 * 3. Click pagination dot #4 to navigate to slide with "Ким Анастасия Радиковна — Кейс 1"
 * 4. Open DevTools: F12 (or Ctrl+Shift+I)
 * 5. Go to Console tab
 * 6. Paste this entire script and press Enter
 * 7. Copy ALL console output and send to developer
 */

(function inspectSliderIssue() {
  console.clear();
  console.log('🔍 INSPECTION: "Наши работы" Before/After Slider Issue');
  console.log('═'.repeat(70));
  console.log('\n');

  // Find the section
  const sectionHeading = Array.from(document.querySelectorAll('h2, h3'))
    .find(el => el.textContent.includes('Наши работы'));
  
  if (!sectionHeading) {
    console.error('❌ ERROR: Could not find "Наши работы" section');
    console.log('\n💡 TIP: Make sure you scrolled to the section');
    return;
  }

  const section = sectionHeading.closest('section') || sectionHeading.parentElement;
  console.log('✅ Found "Наши работы" section');

  // Find Embla carousel container
  const emblaContainer = section.querySelector('[data-slider="our-works"]');
  if (!emblaContainer) {
    console.error('❌ ERROR: Could not find Embla slider container');
    return;
  }

  // Find all slides
  const slides = emblaContainer.querySelectorAll('[class*="flex-\\[0_0_100%\\]"]');
  console.log(`\n📊 Total slides found: ${slides.length}`);

  // Check current slide (should be slide 4 = index 3)
  const slide4 = slides[3];
  if (!slide4) {
    console.error(`❌ ERROR: Slide 4 not found. Available slides: ${slides.length}`);
    console.log('💡 TIP: Click pagination dot #4 to navigate to slide 4');
    return;
  }

  console.log('✅ Found slide 4 (index 3)');

  // Find all cards in slide 4
  const cardsInSlide = slide4.querySelectorAll('[class*="Card"]');
  console.log(`\n📦 Cards in slide 4: ${cardsInSlide.length}`);

  // Find the problematic card
  let problematicCard = null;
  let cardIndex = -1;
  
  cardsInSlide.forEach((card, index) => {
    const text = card.textContent;
    if (text.includes('Ким Анастасия Радиковна') || text.includes('Кейс 1')) {
      problematicCard = card;
      cardIndex = index;
    }
  });

  if (!problematicCard) {
    console.warn('⚠️ WARNING: Could not auto-find "Ким Анастасия Радиковна" card');
    console.log('\nAvailable cards in slide 4:');
    cardsInSlide.forEach((card, i) => {
      const title = card.querySelector('h3')?.textContent || 'No title';
      console.log(`  ${i + 1}. ${title}`);
    });
    console.log('\n💡 TIP: Manually select the card and run: inspectElement($0)');
    return;
  }

  console.log(`\n✅ Found problematic card at position ${cardIndex + 1} in slide 4`);

  // Find ReactCompareSlider root
  const sliderRoot = problematicCard.querySelector('[class*="ReactCompareSlider"]');
  if (!sliderRoot) {
    console.error('❌ ERROR: No ReactCompareSlider found in this card');
    return;
  }

  console.log('\n' + '═'.repeat(70));
  console.log('📦 REACTCOMPARESLIDER ROOT ELEMENT');
  console.log('═'.repeat(70));
  console.log(sliderRoot);

  // Get computed styles of ReactCompareSlider root
  const rootStyles = window.getComputedStyle(sliderRoot);
  console.log('\n📏 COMPUTED CSS (ReactCompareSlider root):');
  console.log('─'.repeat(70));
  console.log(`  width:        ${rootStyles.width}`);
  console.log(`  height:       ${rootStyles.height} ⬅️ KEY VALUE`);
  console.log(`  display:      ${rootStyles.display}`);
  console.log(`  position:     ${rootStyles.position}`);
  console.log(`  overflow:     ${rootStyles.overflow}`);
  console.log(`  aspectRatio:  ${rootStyles.aspectRatio}`);
  console.log(`  inlineStyle:  ${sliderRoot.getAttribute('style')}`);

  // Get parent container
  const parentContainer = sliderRoot.parentElement;
  const parentStyles = window.getComputedStyle(parentContainer);
  console.log('\n📦 PARENT CONTAINER (div.relative.rounded-[25px]...):');
  console.log('─'.repeat(70));
  console.log(`  className:    ${parentContainer.className}`);
  console.log(`  width:        ${parentStyles.width}`);
  console.log(`  height:       ${parentStyles.height} ⬅️ KEY VALUE`);
  console.log(`  display:      ${parentStyles.display}`);
  console.log(`  position:     ${parentStyles.position}`);
  console.log(`  overflow:     ${parentStyles.overflow}`);

  // Get grandparent (the div with h-[280px])
  const grandparent = parentContainer.parentElement;
  if (grandparent) {
    const gpStyles = window.getComputedStyle(grandparent);
    console.log('\n📦 GRANDPARENT (div.mb-6.h-[280px]):');
    console.log('─'.repeat(70));
    console.log(`  className:    ${grandparent.className}`);
    console.log(`  width:        ${gpStyles.width}`);
    console.log(`  height:       ${gpStyles.height} ⬅️ SHOULD BE 280px`);
  }

  // Traverse DOM hierarchy
  console.log('\n🔗 DOM HIERARCHY (ReactCompareSlider → images):');
  console.log('═'.repeat(70));
  
  let current = sliderRoot;
  let level = 0;
  const hierarchy = [];
  
  while (current && level < 15) {
    const styles = window.getComputedStyle(current);
    const hasExplicitHeight = 
      current.style.height || 
      current.classList.toString().includes('h-full') ||
      current.classList.toString().includes('h-[') ||
      current.classList.toString().includes('h-screen');
    
    const info = {
      level,
      tag: current.tagName,
      className: current.className.substring(0, 80),
      computedHeight: styles.height,
      explicitHeight: current.style.height || 'none',
      hasHeightClass: hasExplicitHeight,
      display: styles.display,
      position: styles.position,
      childrenCount: current.children.length,
    };
    
    hierarchy.push(info);
    
    console.log(`\nLevel ${level}: <${info.tag}>`);
    console.log(`  class:           ${info.className}`);
    console.log(`  computed height: ${info.computedHeight}`);
    console.log(`  explicit height: ${info.explicitHeight}`);
    console.log(`  has h-* class:   ${info.hasHeightClass ? '✅ YES' : '❌ NO'}`);
    console.log(`  display:         ${info.display}`);
    console.log(`  position:        ${info.position}`);

    // Stop at images
    if (current.tagName === 'IMG') break;
    
    // Go to first child
    const firstChild = current.children[0];
    if (!firstChild) break;
    
    current = firstChild;
    level++;
  }

  // Find all images
  console.log('\n🖼️ IMAGES IN SLIDER:');
  console.log('═'.repeat(70));
  const images = sliderRoot.querySelectorAll('img');
  const imageData = [];
  
  images.forEach((img, idx) => {
    const imgStyles = window.getComputedStyle(img);
    const naturalAspect = img.naturalWidth / img.naturalHeight;
    
    const data = {
      index: idx + 1,
      src: img.src.substring(img.src.lastIndexOf('/') + 1),
      alt: img.alt,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      naturalAspect: naturalAspect.toFixed(2),
      computedWidth: imgStyles.width,
      computedHeight: imgStyles.height,
      objectFit: imgStyles.objectFit,
      position: imgStyles.position,
      loaded: img.complete && img.naturalWidth > 0,
    };
    
    imageData.push(data);
    
    console.log(`\nImage ${idx + 1} (${data.alt}):`);
    console.log(`  src:            ${data.src}`);
    console.log(`  natural size:   ${data.naturalWidth}px × ${data.naturalHeight}px`);
    console.log(`  natural aspect: ${data.naturalAspect}`);
    console.log(`  computed size:  ${data.computedWidth} × ${data.computedHeight}`);
    console.log(`  object-fit:     ${data.objectFit}`);
    console.log(`  loaded:         ${data.loaded ? '✅ YES' : '❌ NO'}`);
  });

  // Analyze aspect ratios
  console.log('\n⚠️ ASPECT RATIO ANALYSIS:');
  console.log('═'.repeat(70));
  
  const sliderHeight = parseFloat(rootStyles.height);
  const sliderWidth = parseFloat(rootStyles.width);
  const sliderAspect = sliderWidth / sliderHeight;
  
  console.log(`\nSlider container: ${sliderWidth.toFixed(0)}px × ${sliderHeight.toFixed(0)}px`);
  console.log(`Slider aspect ratio: ${sliderAspect.toFixed(2)}`);
  
  if (isNaN(sliderAspect) || !isFinite(sliderAspect)) {
    console.error('❌ CRITICAL: Slider aspect ratio is invalid (NaN or Infinity)');
    console.error('   This means slider height is 0 or not computed correctly!');
  }
  
  imageData.forEach((img) => {
    const imgAspect = parseFloat(img.naturalAspect);
    const mismatch = Math.abs(sliderAspect - imgAspect);
    
    console.log(`\nImage ${img.index} aspect comparison:`);
    console.log(`  Image aspect:   ${img.naturalAspect}`);
    console.log(`  Slider aspect:  ${sliderAspect.toFixed(2)}`);
    console.log(`  Difference:     ${mismatch.toFixed(2)} ${mismatch > 0.1 ? '⚠️ SIGNIFICANT MISMATCH' : '✅ OK'}`);
  });

  // Check for missing heights
  console.log('\n⚠️ MISSING HEIGHT ANALYSIS:');
  console.log('═'.repeat(70));
  
  const missingHeights = hierarchy.filter(item => 
    !item.hasHeightClass && 
    (item.computedHeight === 'auto' || item.computedHeight === '0px')
  );
  
  if (missingHeights.length > 0) {
    console.warn(`\n❌ Found ${missingHeights.length} elements WITHOUT explicit height:\n`);
    missingHeights.forEach(item => {
      console.warn(`  Level ${item.level}: <${item.tag}>`);
      console.warn(`    class: ${item.className}`);
      console.warn(`    computed: ${item.computedHeight}`);
      console.warn('');
    });
  } else {
    console.log('✅ All elements in hierarchy have explicit heights');
  }

  // Final summary
  console.log('\n📋 SUMMARY:');
  console.log('═'.repeat(70));
  console.log(`ReactCompareSlider root height:  ${rootStyles.height} ⬅️`);
  console.log(`Parent container height:          ${parentStyles.height} ⬅️`);
  console.log(`Grandparent (h-[280px]) height:   ${grandparent ? window.getComputedStyle(grandparent).height : 'N/A'} ⬅️`);
  console.log(`Images count:                     ${images.length}`);
  console.log(`Elements without height:          ${missingHeights.length}`);
  console.log(`Slider aspect ratio:              ${sliderAspect.toFixed(2)}`);
  console.log('═'.repeat(70));

  // Store references
  window.problematicCard = problematicCard;
  window.sliderRoot = sliderRoot;
  window.sliderImages = images;
  window.inspectionData = {
    hierarchy,
    imageData,
    missingHeights,
    sliderHeight,
    sliderWidth,
    sliderAspect,
  };
  
  console.log('\n💾 Stored in window for manual inspection:');
  console.log('  window.problematicCard');
  console.log('  window.sliderRoot');
  console.log('  window.sliderImages');
  console.log('  window.inspectionData');
  
  console.log('\n✅ INSPECTION COMPLETE!');
  console.log('\n📸 Next steps:');
  console.log('  1. Take screenshot of the problematic card (Win+Shift+S)');
  console.log('  2. Copy ALL console output above');
  console.log('  3. Send to developer');

  return window.inspectionData;
})();
