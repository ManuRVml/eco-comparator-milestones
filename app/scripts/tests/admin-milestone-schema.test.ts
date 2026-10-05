import { test } from "node:test";
import assert from "node:assert/strict";
import { copyFileSync,mkdtempSync,readFileSync,writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { is } from "drizzle-orm";
import { SQLiteTable,getTableConfig } from "drizzle-orm/sqlite-core";
import { migrate } from "drizzle-orm/libsql/migrator";
import * as schema from "../../src/db/schema";
import { createDb } from "../../src/db/client";
import { loadMilestoneContracts } from "../../src/lib/milestone-contract/load";
import { mutarContrato } from "../../src/lib/milestone-contract/mutations";
import { EMPTY_DEFINITION,contractAccepted,metricSatisfied,type MilestoneMetric,type MilestoneCriterion } from "../../src/lib/milestone-contract/domain";
async function fixture(legacy=false) {
 const folder=mkdtempSync(resolve("data/reconciliation/admin-schema-"));copyFileSync("data/reconciliation/preview.db",resolve(folder,"test.db"));
 const c=createDb(`file:${resolve(folder,"test.db")}`);
 let migrations=resolve("drizzle");
 if(legacy) { const journal=JSON.parse(readFileSync("drizzle/meta/_journal.json","utf8"));journal.entries=journal.entries.filter((e:{idx:number})=>e.idx<=4); const meta=resolve(folder,"meta");await import("node:fs").then(fs=>fs.mkdirSync(meta));writeFileSync(resolve(meta,"_journal.json"),JSON.stringify(journal));for(const e of journal.entries) copyFileSync(`drizzle/${e.tag}.sql`,resolve(folder,`${e.tag}.sql`));migrations=folder; }
 await migrate(c.db,{migrationsFolder:migrations});return c;
}
const metric:MilestoneMetric={id:"metric",milestoneId:"M-01",nombre:"Precisión",tipo:"Cuantitativa",unidad:"%",comparador:"Igual",objetivo:100,objetivoCualitativo:"",metodo:"Comparar muestra",tolerancia:0.2,muestraMinima:30,activa:true};
const criterion:MilestoneCriterion={id:"M-01-C01",milestoneId:"M-01",descripcion:"Comparación",obligatorio:true,evidenciaRequerida:"Acta de precisión",metricaId:"metric",resultadoMedido:99.9,resultadoCualitativo:"",muestraEvaluada:30,estado:"Verificado",evidencia:"Acta medida",aprobador:"Aprobador",fecha:"2026-10-05"};
test("migración 5 conserva todos los campos anteriores y transforma una ficha JSON existente sin inventar alcance",async()=>{
 const c=await fixture(true);try {
 const legacy={job:"Preparar análisis",outcome:"Precisión acordada",meta:"Meta original",fueraAlcance:"R2",responsable:"Responsable original",aprobador:"Aprobador",fechaPrevision:"2026-10-20",motivoPrevision:"Motivo original"};
 await c.client.execute({sql:"INSERT INTO fichas_milestone(milestone_id,contenido) VALUES (?,?)",args:["M-01",JSON.stringify(legacy)]});
 await c.client.execute("UPDATE criterios_milestone SET estado='Verificado',evidencia='Acta original',aprobador='Aprobador',fecha='2026-10-05' WHERE id='M-01-C01'");
 const names=(await c.client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name!='__drizzle_migrations'")).rows.map(r=>String(r.name));
 const before=await Promise.all(names.map(n=>c.client.execute(`SELECT * FROM "${n}" ORDER BY rowid`)));
 await migrate(c.db,{migrationsFolder:resolve("drizzle")});
 for(let i=0;i<names.length;i++) { const cols=before[i].columns.map(n=>'"'+n+'"').join(',');assert.deepEqual((await c.client.execute(`SELECT ${cols} FROM "${names[i]}" ORDER BY rowid`)).rows,before[i].rows,names[i]); }
 const contract=(await loadMilestoneContracts(c.db,[{id:"M-01",criterio:null}]))["M-01"];
 assert.deepEqual(contract.definicion,{...legacy,alcanceIncluido:""});assert.equal(contractAccepted(contract,"2026-10-05"),false);
 const after=(await c.client.execute("SELECT * FROM fichas_milestone")).rows;
 await migrate(c.db,{migrationsFolder:resolve("drizzle")});assert.deepEqual((await c.client.execute("SELECT * FROM fichas_milestone")).rows,after);
 assert.deepEqual((await c.client.execute("PRAGMA foreign_key_check")).rows,[]);
 }finally{c.client.close();}
});
test("todos los modelos de tablas coinciden con columnas, tipos, índices y claves foráneas de las migraciones",async()=>{
 const c=await fixture();try {
 for(const table of Object.values(schema).filter(v=>is(v,SQLiteTable))) {
  const expected=getTableConfig(table as SQLiteTable),actual=(await c.client.execute(`PRAGMA table_info("${expected.name}")`)).rows;
  assert.deepEqual(actual.map(r=>r.name).sort(),expected.columns.map(v=>v.name).sort(),expected.name);
  for(const col of expected.columns) assert.equal(String(actual.find(r=>r.name===col.name)?.type).toLowerCase(),col.getSQLType().toLowerCase(),`${expected.name}.${col.name}`);
  const fks=(await c.client.execute(`PRAGMA foreign_key_list("${expected.name}")`)).rows;
  for(const fk of expected.foreignKeys){const ref=fk.reference();for(let i=0;i<ref.columns.length;i++) assert.ok(fks.some(r=>r.from===ref.columns[i].name&&r.to===ref.foreignColumns[i].name&&r.table===getTableConfig(ref.foreignTable).name),`${expected.name}: FK`);}
  const indexes=(await c.client.execute(`PRAGMA index_list("${expected.name}")`)).rows;
  for(const index of expected.indexes) assert.ok(indexes.some(r=>r.name===index.config.name),`${expected.name}: índice`);
 }
 }finally{c.client.close();}
});
test("meta, tolerancia, muestra y resultado cualitativo gobiernan la aceptación",()=>{
 assert.equal(metricSatisfied(metric,criterion),true);
 assert.equal(metricSatisfied(metric,{...criterion,resultadoMedido:99.8}),true);
 assert.equal(metricSatisfied(metric,{...criterion,resultadoMedido:99.79}),false);
 assert.equal(metricSatisfied(metric,{...criterion,resultadoMedido:99}),false);
 assert.equal(metricSatisfied(metric,{...criterion,muestraEvaluada:29}),false);
 assert.equal(metricSatisfied(metric,{...criterion,resultadoMedido:null}),false);
 assert.equal(metricSatisfied({...metric,objetivo:0,tolerancia:null,muestraMinima:null},{...criterion,resultadoMedido:0,muestraEvaluada:null}),true);
 const qualitative={...metric,tipo:"Cualitativa" as const,objetivo:null,tolerancia:null,objetivoCualitativo:"Conforme"};
 assert.equal(metricSatisfied(qualitative,{...criterion,resultadoCualitativo:"Conforme"}),true);
 assert.equal(metricSatisfied(qualitative,{...criterion,resultadoCualitativo:"No conforme"}),false);
});
test("solo admin configura; se validan números, booleanos, FK y pertenencia de cada métrica",async()=>{
 const c=await fixture();try {
 const body={...metric,accion:"metrica",id:"M-01",metricaId:"metric"};
 for(const role of ["editor","cliente"] as const) for(const accion of ["ficha","metrica","criterio"]) await assert.rejects(mutarContrato(c.db,role,{id:"M-01",accion}),/Solo el administrador/);
 for(const patch of [{tolerancia:-1},{muestraMinima:1.5},{objetivo:Infinity},{activa:"true"},{tipo:"Cualitativa"}]) await assert.rejects(mutarContrato(c.db,"admin",{...body,...patch}));
 await mutarContrato(c.db,"admin",body);
 await assert.rejects(mutarContrato(c.db,"admin",{...body,id:"M-02"}),/otro milestone/);
 await assert.rejects(mutarContrato(c.db,"admin",{...criterion,id:"M-02",accion:"criterio",criterioId:"M-02-C01"}),/mismo milestone/);
 await c.client.execute("PRAGMA foreign_keys=ON");
 await assert.rejects(c.client.execute("INSERT INTO metricas_milestone(id,milestone_id,nombre,tipo) VALUES ('orphan','M-inexistente','Test','Cuantitativa')"));
 await assert.rejects(c.client.execute("UPDATE metricas_milestone SET tipo='Inválida' WHERE id='metric'"));
 await assert.rejects(c.client.execute("UPDATE metricas_milestone SET muestra_minima=0 WHERE id='metric'"));
 await assert.rejects(c.client.execute("UPDATE criterios_milestone SET obligatorio=2 WHERE id='M-01-C01'"));
 }finally{c.client.close();}
});
test("editar una métrica reabre aceptación sin borrar el JSON heredado ni la evidencia",async()=>{
 const c=await fixture();try {
 const definition={...EMPTY_DEFINITION,job:"Usuario",outcome:"Precisión",meta:"Meta",alcanceIncluido:"MVP",fueraAlcance:"R2",responsable:"Responsable",aprobador:"Aprobador"};
 await mutarContrato(c.db,"admin",{id:"M-01",accion:"ficha",...definition});
 await mutarContrato(c.db,"admin",{...metric,id:"M-01",metricaId:"metric",accion:"metrica"});
 await mutarContrato(c.db,"admin",{...criterion,id:"M-01",criterioId:criterion.id,accion:"criterio"});
 let contract=(await loadMilestoneContracts(c.db,[{id:"M-01",criterio:null}]))["M-01"];assert.equal(contractAccepted(contract,"2026-10-05"),true);
 await mutarContrato(c.db,"admin",{...metric,id:"M-01",metricaId:"metric",accion:"metrica",objetivo:101});
 contract=(await loadMilestoneContracts(c.db,[{id:"M-01",criterio:null}]))["M-01"];assert.equal(contractAccepted(contract,"2026-10-05"),false);assert.equal(contract.criterios[0].evidencia,"Acta medida");
 assert.equal((await c.client.execute("SELECT count(*) n FROM bitacora WHERE campo='contrato:metrica'")).rows[0].n,2);
 }finally{c.client.close();}
});
