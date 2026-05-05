const fs = require('fs');

const files = [
  'src/app/api/requests/[id]/respond/route.ts',
  'src/app/api/feed/[id]/comments/route.ts',
  'src/app/api/admin/users/[id]/shadowban/route.ts',
  'src/app/api/admin/users/[id]/boost/route.ts',
  'src/app/api/admin/reports/transcript/[matchId]/route.ts'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace GET/POST signature
  content = content.replace(
    /({ params }: { params: { ([a-zA-Z]+): string } })/g,
    "{ params }: { params: Promise<{ $2: string }> }"
  );

  // Replace variable assignment
  content = content.replace(
    /const { ([a-zA-Z]+) } = params;/g,
    "const { $1 } = await params;"
  );
  
  content = content.replace(
    /const ([a-zA-Z]+) = params\.([a-zA-Z]+);/g,
    "const { $2: $1 } = await params;"
  );

  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
});
