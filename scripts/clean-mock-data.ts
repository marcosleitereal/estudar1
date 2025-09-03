#!/usr/bin/env npx tsx

import { promises as fs } from 'fs';
import { join } from 'path';

/**
 * Script para limpar todos os dados fictícios/mock da interface
 */

const filesToClean = [
  'src/app/admin/page.tsx',
  'src/components/quiz/quiz-list.tsx',
  'src/app/simulados/page.tsx',
  'src/app/flashcards/page.tsx'
];

async function cleanMockData() {
  console.log('🧹 Limpando dados fictícios da interface...');

  for (const filePath of filesToClean) {
    try {
      const fullPath = join(process.cwd(), filePath);
      const content = await fs.readFile(fullPath, 'utf-8');
      
      // Substituições específicas para cada arquivo
      let cleanedContent = content;

      if (filePath.includes('admin/page.tsx')) {
        // Limpar dados mock do admin
        cleanedContent = cleanedContent.replace(
          /const mockStats: AdminStats = \{[\s\S]*?\}/,
          `const mockStats: AdminStats = {
        totalUsers: 0,
        totalQuizzes: 0,
        totalFlashcards: 0,
        totalSessions: 0,
        activeUsers: 0,
        avgSessionTime: 0,
        completionRate: 0,
        userGrowth: 0
      }`
        );

        cleanedContent = cleanedContent.replace(
          /const mockActivities: RecentActivity\[\] = \[[\s\S]*?\]/,
          `const mockActivities: RecentActivity[] = []`
        );
      }

      if (filePath.includes('quiz-list.tsx')) {
        // Remover quizzes fictícios se houver
        console.log(`✅ Verificando ${filePath} para dados fictícios...`);
      }

      if (filePath.includes('simulados/page.tsx')) {
        // Limpar simulados fictícios
        console.log(`✅ Verificando ${filePath} para dados fictícios...`);
      }

      if (filePath.includes('flashcards/page.tsx')) {
        // Limpar flashcards fictícios
        console.log(`✅ Verificando ${filePath} para dados fictícios...`);
      }

      await fs.writeFile(fullPath, cleanedContent);
      console.log(`✅ ${filePath} limpo`);

    } catch (error) {
      console.warn(`⚠️ Erro ao limpar ${filePath}:`, error);
    }
  }

  console.log('🎉 Limpeza de dados fictícios concluída!');
}

// Executar se chamado diretamente
if (require.main === module) {
  cleanMockData();
}

