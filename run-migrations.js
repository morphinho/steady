/**
 * Script para executar todas as migrações do Supabase via REST API
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Credenciais do novo projeto
const supabaseUrl = 'https://mhrescjawktjoiypeica.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ocmVzY2phd2t0am9peXBlaWNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODcyMTI2NywiZXhwIjoyMDg0Mjk3MjY3fQ.MBsvxx8XESvmR2Rti44mOa0JqeTZYu40Qr5ez8i4R0w';

// Ordem das migrações
const migrations = [
  '20260118042349_create_financial_control_tables.sql',
  '20260118044634_allow_anonymous_access.sql',
  '20260118044708_allow_null_user_id.sql',
  '20260118045227_create_debts_table.sql',
  '20260118050000_expand_profiles_table.sql',
  '20260119000000_setup_avatars_storage.sql',
  '20260120000000_add_profile_columns.sql',
];

async function executeSQLViaREST(supabaseUrl, serviceKey, sql) {
  // Usar a REST API do Supabase para executar SQL
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }

  return await response.json();
}

async function runMigrations() {
  console.log('🚀 Iniciando execução das migrações...');
  console.log(`📡 Conectando ao Supabase: ${supabaseUrl}\n`);

  const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
  
  // Combinar todas as migrações em um único SQL
  let allSQL = '';
  
  for (const migrationFile of migrations) {
    const migrationPath = path.join(migrationsDir, migrationFile);
    
    if (!fs.existsSync(migrationPath)) {
      console.log(`⚠️  Arquivo não encontrado: ${migrationFile}`);
      continue;
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    allSQL += `\n-- Migração: ${migrationFile}\n`;
    allSQL += migrationSQL;
    allSQL += '\n';
    
    console.log(`✅ Carregado: ${migrationFile}`);
  }

  console.log(`\n📋 Total de migrações: ${migrations.length}`);
  console.log(`\n⚠️  O Supabase não permite executar SQL DDL via REST API diretamente.`);
  console.log(`\n📝 Por favor, execute manualmente no Supabase Dashboard:`);
  console.log(`   https://supabase.com/dashboard/project/mhrescjawktjoiypeica/sql/new\n`);
  console.log('='.repeat(80));
  console.log(allSQL);
  console.log('='.repeat(80));
  console.log(`\n💡 Dica: Copie todo o SQL acima e cole no SQL Editor do Supabase Dashboard`);
}

runMigrations().catch(console.error);
