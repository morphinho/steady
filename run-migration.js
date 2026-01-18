/**
 * Script para executar a migração do Supabase
 * Execute com: node run-migration.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Carregar variáveis de ambiente do .env
require('dotenv').config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente não encontradas!');
  console.error('Certifique-se de que NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY estão definidas no .env');
  process.exit(1);
}

// Ler o arquivo de migração
const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20260120000000_add_profile_columns.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

async function runMigration() {
  console.log('🚀 Iniciando migração...');
  console.log(`📡 Conectando ao Supabase: ${supabaseUrl}`);

  try {
    // Criar cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Executar a migração
    console.log('📝 Executando SQL...');
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      // Se o RPC não existir, tentar executar diretamente via REST API
      console.log('⚠️  RPC não disponível, tentando método alternativo...');
      console.log('📋 Por favor, execute o SQL manualmente no Supabase Dashboard:');
      console.log('\n' + '='.repeat(80));
      console.log(migrationSQL);
      console.log('='.repeat(80));
      console.log('\n📖 Instruções:');
      console.log('1. Acesse https://app.supabase.com');
      console.log('2. Selecione seu projeto');
      console.log('3. Vá em SQL Editor > New query');
      console.log('4. Cole o SQL acima e clique em Run');
      return;
    }

    console.log('✅ Migração executada com sucesso!');
    console.log('📊 Resultado:', data);
  } catch (error) {
    console.error('❌ Erro ao executar migração:', error.message);
    console.log('\n📋 Por favor, execute o SQL manualmente no Supabase Dashboard:');
    console.log('\n' + '='.repeat(80));
    console.log(migrationSQL);
    console.log('='.repeat(80));
  }
}

runMigration();

