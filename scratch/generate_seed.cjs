const fs = require('fs');

const code = fs.readFileSync('src/lib/catalog.ts', 'utf8');
const match = code.match(/const base: Array<[^>]+> = \[\s*([\s\S]*?)\s*\];/);
const lines = match[1].split('\n').filter(l => l.trim().startsWith('['));

const products = lines.map(l => {
  const parts = l.match(/\[\"([^\"]+)\",\s*\"([^\"]+)\",\s*\"([^\"]+)\",\s*(\d+),\s*(\d+),\s*([^,]+),\s*([\d\.]+),\s*\"([^\"]+)\"(?:,\s*\"([^\"]+)\")?\]/);
  if(!parts) return null;
  const name = parts[1];
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const categorySlug = parts[2];
  const categoryLabel = parts[3];
  const price = parseInt(parts[4]);
  const mrp = parseInt(parts[5]);
  const imageVar = parts[6].trim();
  const weight = parseFloat(parts[7]);
  const occasion = parts[8];
  const badge = parts[9] ? parts[9] : undefined;

  let imgPath = '';
  if(imageVar.startsWith('pRing')) imgPath = '/assets/p-rings-'+imageVar.replace('pRing','') + '.jpg';
  else if(imageVar.startsWith('pChain')) imgPath = '/assets/p-chains-'+imageVar.replace('pChain','') + '.jpg';
  else if(imageVar.startsWith('pBrac')) imgPath = '/assets/p-bracelets-'+imageVar.replace('pBrac','') + '.jpg';
  else if(imageVar.startsWith('pEar')) imgPath = '/assets/p-earrings-'+imageVar.replace('pEar','') + '.jpg';
  else if(imageVar.startsWith('pPen')) imgPath = '/assets/p-pendants-'+imageVar.replace('pPen','') + '.jpg';
  else if(imageVar.startsWith('pKada')) imgPath = '/assets/p-kada-'+imageVar.replace('pKada','') + '.jpg';
  else if(imageVar.startsWith('pPayal')) imgPath = '/assets/p-payal-'+imageVar.replace('pPayal','') + '.jpg';
  else imgPath = '/assets/cat-'+imageVar+'.jpg';

  let collection = occasion === 'Temple' ? 'Temple' : occasion === 'Wedding' ? 'Wedding' : 'Signature';
  
  return {
    name, slug, categorySlug, categoryLabel, price, mrp, image: imgPath, weight, occasion, collection, badge
  };
}).filter(Boolean);

fs.writeFileSync('backend/products.json', JSON.stringify(products, null, 2), 'utf8');
