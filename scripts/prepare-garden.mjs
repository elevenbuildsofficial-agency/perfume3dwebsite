import sharp from 'sharp';
await sharp('assets/source/morrow-generated-garden-16x9.png').resize({width:1920,withoutEnlargement:true}).webp({quality:88,effort:6}).toFile('public/images/morrow-generated-garden.webp');
await sharp('assets/source/morrow-generated-garden-9x16.png').resize({width:1000,withoutEnlargement:true}).webp({quality:87,effort:6}).toFile('public/images/morrow-generated-garden-mobile.webp');
