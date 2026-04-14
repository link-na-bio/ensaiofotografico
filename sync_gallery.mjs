import { execSync } from 'child_process';
import process from 'process';

console.log("🔄 Iniciando sincronização da Galeria...\n");

try {
  // 1. Run migration
  console.log("1️⃣ Buscando novos estilos no banco de dados e processando imagens...");
  execSync('node migrate_gallery.mjs', { stdio: 'inherit' });

  // 2. Check for changes in git
  console.log("\n2️⃣ Verificando se há novos arquivos ou dados...");
  
  // Checking porcelain status specifically for the data file and images folder
  const statusBuffer = execSync('git status --porcelain public/images/galeria/ app/galeria/data.ts');
  const status = statusBuffer.toString().trim();

  if (!status) {
    console.log("✅ Nenhuma nova imagem ou alteração nos dados encontrada. Já está tudo sincronizado!");
    process.exit(0);
  }

  console.log("\n-> Novas alterações detectadas:\n" + status + "\n");

  // 3. Add, Commit and Push
  console.log("3️⃣ Preparando commit...");
  // Use "git add" using the shell
  execSync('git add public/images/galeria/ app/galeria/data.ts', { stdio: 'inherit' });
  
  // Adding user defined commit message
  execSync('git commit -m "🎨 UI: Sincronização automática de novos estilos da galeria"', { stdio: 'inherit' });
  
  console.log("\n4️⃣ Enviando para o GitHub...");
  execSync('git push', { stdio: 'inherit' });

  console.log("\n🎉 Galeria atualizada e deploy iniciado na Vercel com sucesso!");
} catch (error) {
  console.error("\n❌ Ocorreu um erro durante a sincronização:");
  console.error(error.message);
  process.exit(1);
}
